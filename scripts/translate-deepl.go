package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

// DeepL API 响应结构
type DeepLResponse struct {
	Translations []struct {
		Text string `json:"text"`
	} `json:"translations"`
}

// 缓存条目结构（包含时间戳）
type CacheEntry struct {
	Translation string    `json:"translation"`
	Timestamp   int64     `json:"timestamp"`
}

// 缓存元数据结构
type FileCacheMetadata struct {
	Entries map[string]CacheEntry `json:"entries"`
}

// 翻译缓存（内存）
var translationCache = make(map[string]string)

// 缓存根目录
var cacheRootDir = ""

var requestCount = 0
var lastRequestTime = time.Now()
var cacheHits = 0
var cacheMisses = 0

// 从磁盘加载文件的缓存
func loadFileCache(targetDir, fileName string) map[string]CacheEntry {
	// 缓存文件路径：.deepl_cache/it/admin.json (对应 messages/it/admin.json)
	cachePath := filepath.Join(cacheRootDir, filepath.Base(targetDir), fileName)
	data, err := ioutil.ReadFile(cachePath)
	if err != nil {
		return make(map[string]CacheEntry)
	}

	var metadata FileCacheMetadata
	if err := json.Unmarshal(data, &metadata); err != nil {
		return make(map[string]CacheEntry)
	}

	return metadata.Entries
}

// 保存文件的缓存到磁盘
func saveFileCache(targetDir, fileName string, cache map[string]CacheEntry) error {
	// 缓存文件路径：.deepl_cache/it/admin.json
	cacheSubDir := filepath.Join(cacheRootDir, filepath.Base(targetDir))
	if err := os.MkdirAll(cacheSubDir, 0755); err != nil {
		return fmt.Errorf("无法创建缓存目录: %v", err)
	}

	cachePath := filepath.Join(cacheSubDir, fileName)
	metadata := FileCacheMetadata{Entries: cache}

	data, err := json.MarshalIndent(metadata, "", "  ")
	if err != nil {
		return err
	}
	return ioutil.WriteFile(cachePath, data, 0644)
}

// 检查缓存条目是否过期（24小时）
func isCacheExpired(timestamp int64) bool {
	return time.Since(time.Unix(timestamp, 0)) > 24*time.Hour
}

// 批量调用 DeepL API 翻译文本
func translateWithDeepLBatch(apiKey string, texts []string, targetLang string, fileCache map[string]CacheEntry) (map[string]string, error) {
	// 分离需要翻译和已缓存的文本
	toTranslate := []string{}
	toTranslateIndices := []int{}
	results := make(map[string]string)

	for i, text := range texts {
		if len(text) == 0 {
			results[text] = text
			continue
		}

		// 如果是完全占位符（如 "{name}"），直接跳过
		if isPlaceholder(text) && !strings.Contains(text, " ") {
			results[text] = text
			continue
		}

		// 检查内存缓存
		if cached, ok := translationCache[text]; ok {
			cacheHits++
			results[text] = cached
			continue
		}

		// 检查磁盘缓存（未过期）
		if entry, ok := fileCache[text]; ok && !isCacheExpired(entry.Timestamp) {
			cacheHits++
			translationCache[text] = entry.Translation
			results[text] = entry.Translation
			continue
		}

		toTranslate = append(toTranslate, text)
		toTranslateIndices = append(toTranslateIndices, i)
	}

	// 如果没有需要翻译的文本，直接返回
	if len(toTranslate) == 0 {
		return results, nil
	}

	// 速率限制
	elapsed := time.Since(lastRequestTime).Seconds()
	if elapsed < 0.5 {
		time.Sleep(time.Duration((0.5 - elapsed) * float64(time.Second)))
	}
	lastRequestTime = time.Now()

	// 确定 API 端点
	url := "https://api-free.deepl.com/v2/translate"
	if !strings.HasSuffix(apiKey, ":fx") {
		url = "https://api.deepl.com/v2/translate"
	}

	// 构建批量请求
	payload := map[string]interface{}{
		"text":        toTranslate,
		"target_lang": mapLanguageCode(targetLang),
	}

	jsonData, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("DeepL-Auth-Key %s", apiKey))
	req.Header.Set("User-Agent", "FluxReve-Translator/1.0")

	// 发送请求
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("网络错误: %v", err)
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)

	// 检查响应状态码
	if resp.StatusCode == 403 {
		return nil, fmt.Errorf("API 验证失败 (403): 检查 API 密钥是否正确")
	}
	if resp.StatusCode == 429 {
		// 速率限制，等待后重试
		fmt.Printf("⚠️  触发速率限制，等待 5 秒...\n")
		time.Sleep(5 * time.Second)
		return translateWithDeepLBatch(apiKey, texts, targetLang, fileCache)
	}
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("API 错误 (%d): %s", resp.StatusCode, string(body))
	}

	// 解析响应
	var result DeepLResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("响应解析失败: %v", err)
	}

	if len(result.Translations) == 0 {
		return nil, fmt.Errorf("没有返回翻译结果")
	}

	// 保存翻译结果
	for i, translation := range result.Translations {
		if i < len(toTranslate) {
			text := toTranslate[i]
			translated := translation.Text

			// 如果原文包含占位符，需要还原它们
			if strings.Contains(text, "{") && strings.Contains(text, "}") {
				translated = restorePlaceholders(translated, text)
			}

			results[text] = translated
			translationCache[text] = translated
			fileCache[text] = CacheEntry{
				Translation: translated,
				Timestamp:   time.Now().Unix(),
			}
		}
	}

	cacheMisses += len(toTranslate)
	requestCount++
	fmt.Printf("🔄 批量翻译 %d 个文本 (缓存命中: %d)\n", len(toTranslate), len(texts)-len(toTranslate))
	return results, nil
}

// 将语言代码映射到 DeepL 格式
func mapLanguageCode(code string) string {
	mapping := map[string]string{
		"EN": "EN",
		"ZH": "ZH",
		"DE": "DE",
		"FR": "FR",
		"IT": "IT",
		"ES": "ES",
		"PT": "PT-BR",
		"RU": "RU",
		"JA": "JA",
		"KO": "KO",
		"AR": "AR",
		"NL": "NL",
		"SV": "SV",
		"DA": "DA",
		"PL": "PL",
		"TR": "TR",
	}
	if val, ok := mapping[strings.ToUpper(code)]; ok {
		return val
	}
	return "EN" // 默认英文
}

// 检查是否为占位符 - 自动检测 {xxx} 格式的占位符
func isPlaceholder(text string) bool {
	// 如果文本完全由占位符组成，跳过翻译
	// 例如："{name}", "{count}", "{progress}" 等

	// 检查是否包含花括号占位符 {xxx}
	if strings.Contains(text, "{") && strings.Contains(text, "}") {
		// 使用正则表达式检测 {xxx} 模式
		re := regexp.MustCompile(`\{[a-zA-Z0-9_]+\}`)
		return re.MatchString(text)
	}
	return false
}

// 提取文本中的占位符和实际文本
func extractPlaceholdersAndText(text string) (string, []string) {
	// 使用正则表达式提取所有占位符
	re := regexp.MustCompile(`\{[a-zA-Z0-9_]+\}`)
	placeholders := re.FindAllString(text, -1)

	// 删除占位符，获取实际要翻译的文本
	contentWithoutPlaceholders := re.ReplaceAllString(text, "")

	return strings.TrimSpace(contentWithoutPlaceholders), placeholders
}

// 将占位符还原到翻译后的文本
func restorePlaceholders(translatedText string, originalText string) string {
	// 如果原文和翻译文本都不为空，直接替换占位符
	// 这确保占位符不会被翻译
	re := regexp.MustCompile(`\{[a-zA-Z0-9_]+\}`)

	// 从原文中提取占位符
	originalPlaceholders := re.FindAllString(originalText, -1)
	translatedPlaceholders := re.FindAllString(translatedText, -1)

	// 如果翻译后的文本中没有占位符，但原文有，需要还原
	if len(originalPlaceholders) > 0 && len(translatedPlaceholders) == 0 {
		// 使用原文的占位符替换翻译文本中对应位置的内容
		// 这是一个简单的策略：将翻译后的文本与原文的占位符组合
		result := translatedText
		for _, ph := range originalPlaceholders {
			result += " " + ph
		}
		return result
	}

	return translatedText
}

// 第一步：收集所有需要翻译的文本
func collectTexts(data interface{}, texts map[string]bool) {
	switch v := data.(type) {
	case map[string]interface{}:
		for _, value := range v {
			collectTexts(value, texts)
		}
	case []interface{}:
		for _, value := range v {
			collectTexts(value, texts)
		}
	case string:
		if len(v) > 0 && !isPlaceholder(v) {
			texts[v] = true
		}
	}
}

// 第二步：递归替换翻译后的文本
func translateJSON(data interface{}, translations map[string]string) interface{} {
	switch v := data.(type) {
	case map[string]interface{}:
		result := make(map[string]interface{})
		for key, value := range v {
			result[key] = translateJSON(value, translations)
		}
		return result
	case []interface{}:
		result := make([]interface{}, len(v))
		for i, value := range v {
			result[i] = translateJSON(value, translations)
		}
		return result
	case string:
		if len(v) == 0 || isPlaceholder(v) {
			return v
		}
		if translated, ok := translations[v]; ok {
			return translated
		}
		return v
	default:
		return v
	}
}

// 处理单个文件
func processFile(sourceFile, targetDir, apiKey, targetLang string) error {
	fileName := filepath.Base(sourceFile)
	fmt.Printf("\n📄 处理文件: %s\n", fileName)

	// 加载该文件的缓存
	fileCache := loadFileCache(targetDir, fileName)

	// 读取源文件
	data, err := ioutil.ReadFile(sourceFile)
	if err != nil {
		return fmt.Errorf("读取文件失败: %v", err)
	}

	// 解析 JSON
	var jsonData interface{}
	if err := json.Unmarshal(data, &jsonData); err != nil {
		return fmt.Errorf("解析 JSON 失败: %v", err)
	}

	// 第一步：收集所有需要翻译的文本
	textsToTranslate := make(map[string]bool)
	collectTexts(jsonData, textsToTranslate)

	// 转换为数组
	textArray := make([]string, 0, len(textsToTranslate))
	for text := range textsToTranslate {
		textArray = append(textArray, text)
	}

	// 第二步：批量翻译
	translations, err := translateWithDeepLBatch(apiKey, textArray, targetLang, fileCache)
	if err != nil {
		return fmt.Errorf("翻译失败: %v", err)
	}

	// 第三步：递归替换翻译后的文本
	translatedData := translateJSON(jsonData, translations)

	// 转换回 JSON（带缩进）
	translated, err := json.MarshalIndent(translatedData, "", "  ")
	if err != nil {
		return fmt.Errorf("序列化 JSON 失败: %v", err)
	}

	// 确保目标目录存在
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return fmt.Errorf("创建目录失败: %v", err)
	}

	// 写入目标文件
	targetFile := filepath.Join(targetDir, fileName)
	if err := ioutil.WriteFile(targetFile, translated, 0644); err != nil {
		return fmt.Errorf("写入文件失败: %v", err)
	}

	fmt.Printf("✅ 已保存: %s\n", targetFile)

	// 保存该文件的缓存
	if err := saveFileCache(targetDir, fileName, fileCache); err != nil {
		fmt.Printf("⚠️  缓存保存失败: %v\n", err)
	}

	return nil
}

// 批量处理目录
func processDirectory(sourceDir, targetDir, apiKey, targetLang string) error {
	files, err := ioutil.ReadDir(sourceDir)
	if err != nil {
		return fmt.Errorf("读取目录失败: %v", err)
	}

	fmt.Printf("📂 找到 %d 个文件\n\n", countJSONFiles(files))

	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".json") {
			sourcePath := filepath.Join(sourceDir, file.Name())
			if err := processFile(sourcePath, targetDir, apiKey, targetLang); err != nil {
				fmt.Printf("❌ 错误: %v\n", err)
				// 继续处理其他文件
			}
		}
	}

	return nil
}

// 统计 JSON 文件数量
func countJSONFiles(files []os.FileInfo) int {
	count := 0
	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".json") {
			count++
		}
	}
	return count
}

func main() {
	apiKey := flag.String("key", "", "DeepL API 密钥 (必需)")
	sourceDir := flag.String("source", "./messages/en", "源文件目录")
	targetDir := flag.String("target", "./messages/it", "目标文件目录")
	targetLang := flag.String("lang", "IT", "目标语言代码 (默认: IT)")
	singleFile := flag.String("file", "", "单个文件模式: 要翻译的文件路径")

	flag.Parse()

	// 初始化缓存根目录 - .deepl_cache
	cacheRootDir = ".deepl_cache"

	if *apiKey == "" {
		fmt.Println("❌ 错误: 必须提供 -key 参数（DeepL API 密钥）")
		fmt.Println("\n📖 使用方法:")
		fmt.Println("  批量翻译:    go run translate-deepl.go -key YOUR_API_KEY")
		fmt.Println("  单个文件:    go run translate-deepl.go -key YOUR_API_KEY -file ./messages/en/common.json")
		fmt.Println("  其他语言:    go run translate-deepl.go -key YOUR_API_KEY -lang FR")
		fmt.Println("  自定义缓存:  go run translate-deepl.go -key YOUR_API_KEY -cache ./my_cache")
		fmt.Println("\n💡 获取 API 密钥: https://www.deepl.com/pro-api")
		os.Exit(1)
	}

	fmt.Printf("\n%s\n", strings.Repeat("=", 60))
	fmt.Printf("🌐 DeepL 翻译脚本 (带缓存机制)\n")
	fmt.Printf("%s\n", strings.Repeat("=", 60))
	fmt.Printf("📍 源目录:   %s\n", *sourceDir)
	fmt.Printf("📍 目标目录: %s\n", *targetDir)
	fmt.Printf("🔤 目标语言: %s\n", *targetLang)
	fmt.Printf("💾 缓存根目录: %s\n", cacheRootDir)
	fmt.Printf("⏱️  缓存有效期: 24 小时\n")
	fmt.Printf("%s\n\n", strings.Repeat("=", 60))

	startTime := time.Now()

	if *singleFile != "" {
		// 单文件模式
		if err := processFile(*singleFile, *targetDir, *apiKey, *targetLang); err != nil {
			fmt.Printf("❌ 错误: %v\n", err)
			os.Exit(1)
		}
	} else {
		// 批量模式
		if err := processDirectory(*sourceDir, *targetDir, *apiKey, *targetLang); err != nil {
			fmt.Printf("❌ 错误: %v\n", err)
			os.Exit(1)
		}
	}

	elapsed := time.Since(startTime)
	fmt.Printf("\n%s\n", strings.Repeat("=", 60))
	fmt.Printf("✅ 翻译完成！\n")
	fmt.Printf("📊 API 请求: %d | 缓存命中: %d | 缓存未命中: %d\n", requestCount, cacheHits, cacheMisses)
	if requestCount > 0 {
		hitRate := float64(cacheHits) / float64(cacheHits+cacheMisses) * 100
		fmt.Printf("💾 缓存命中率: %.1f%%\n", hitRate)
	}
	fmt.Printf("⏱️  耗时: %.2f 秒\n", elapsed.Seconds())
	fmt.Printf("%s\n\n", strings.Repeat("=", 60))
}
