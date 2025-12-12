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

// 专有名词配置结构
type ProperNounsConfig struct {
	Description string   `json:"description"`
	ProperNouns []string `json:"properNouns"`
}

// 翻译缓存（内存）
var translationCache = make(map[string]string)

// 专有名词列表（从配置文件加载）
var properNouns []string

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

// 加载专有名词配置
func loadProperNounsConfig(configPath string) error {
	data, err := ioutil.ReadFile(configPath)
	if err != nil {
		// 如果文件不存在，使用默认的空列表
		fmt.Printf("⚠️  未找到专有名词配置文件: %s，将使用空列表\n", configPath)
		properNouns = []string{}
		return nil
	}

	var config ProperNounsConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return fmt.Errorf("解析专有名词配置失败: %v", err)
	}

	properNouns = config.ProperNouns
	fmt.Printf("✅ 成功加载 %d 个专有名词\n", len(properNouns))
	return nil
}

// 批量调用 DeepL API 翻译文本
func translateWithDeepLBatch(apiKey string, texts []string, targetLang string, fileCache map[string]CacheEntry) (map[string]string, error) {
	// 分离需要翻译和已缓存的文本
	toTranslate := []string{}
	toTranslateOriginals := []string{} // 保存原始文本（包含占位符）
	toTranslateProtectedMaps := []map[string]string{} // 保存每个文本的 keep 内容映射
	results := make(map[string]string)

	// 为这个批次创建占位符生成器
	placeholderGen := NewPlaceholderGenerator()

	for _, text := range texts {
		if len(text) == 0 {
			results[text] = text
			continue
		}

		// 如果是纯占位符（如 "{name}"），直接跳过翻译
		if isPlaceholder(text) {
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

		// 保存原始文本
		toTranslateOriginals = append(toTranslateOriginals, text)

		// 客户端处理：将占位符和专有名词替换为特殊标记，这样 DeepL 完全不会翻译它们
		textToTranslate, protectedMap := protectAllContentWithGenerator(text, placeholderGen)
		toTranslate = append(toTranslate, textToTranslate)
		toTranslateProtectedMaps = append(toTranslateProtectedMaps, protectedMap)
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
			// 获取原始文本和翻译后的文本
			originalText := toTranslateOriginals[i]
			translatedText := translation.Text
			protectedMap := toTranslateProtectedMaps[i]

			// 调试日志：显示翻译前后的状态（仅当有保护映射时）
			if len(protectedMap) > 0 {
				fmt.Printf("\n[#%d] ", i+1)
				fmt.Printf("原文: %s | ", originalText)
				fmt.Printf("映射: %d\n", len(protectedMap))
			}

			// 还原被保护的内容（占位符和专有名词）
			finalTranslation := restoreProtectedContent(translatedText, protectedMap)

			if len(protectedMap) > 0 {
				if finalTranslation != translatedText {
					fmt.Printf("     还原成功\n")
				} else {
					fmt.Printf("     ⚠️  警告: 没有还原任何内容！原文: %s | 翻译: %s\n", originalText, translatedText)
				}

				// 检测是否有未还原的占位符
				unrestoredPattern := regexp.MustCompile(`〈\d{4}〉`)
				if unrestoredPattern.MatchString(finalTranslation) {
					unrestoredMatches := unrestoredPattern.FindAllString(finalTranslation, -1)
					fmt.Printf("     ❌ 错误: 检测到 %d 个未还原的占位符: %v\n", len(unrestoredMatches), unrestoredMatches)
				}
			}

			// 使用原始文本作为键保存结果
			results[originalText] = finalTranslation
			translationCache[originalText] = finalTranslation
			fileCache[originalText] = CacheEntry{
				Translation: finalTranslation,
				Timestamp:   time.Now().Unix(),
			}
		}
	}

	cacheMisses += len(toTranslate)
	requestCount++
	fmt.Printf("🔄 批量翻译 %d 个文本 (缓存命中: %d)\n", len(toTranslate), len(texts)-len(toTranslate))
	return results, nil
}

// 根据目录名推断目标语言代码
func inferLanguageFromDir(dirPath string) string {
	// 从路径中提取目录名 (例如 "messages/zh-CN" -> "zh-CN")
	dirName := filepath.Base(dirPath)

	// 映射目录名到 DeepL 语言代码
	dirMapping := map[string]string{
		"en":     "EN",
		"zh-cn":  "ZH",
		"zh-tw":  "ZH",
		"ja":     "JA",
		"ko":     "KO",
		"ar":     "AR",
		"fr":     "FR",
		"de":     "DE",
		"it":     "IT",
		"es":     "ES",
		"pt":     "PT-BR",
		"pt-br":  "PT-BR",
		"ru":     "RU",
		"nl":     "NL",
		"sv":     "SV",
		"da":     "DA",
		"pl":     "PL",
		"tr":     "TR",
	}

	// 统一转小写并去除连字符变体，查询映射表
	normalized := strings.ToLower(dirName)
	if val, ok := dirMapping[normalized]; ok {
		return val
	}

	// 如果精确匹配失败，尝试只用前两个字母匹配 (例如 "zh-CN" -> "zh")
	parts := strings.Split(normalized, "-")
	if len(parts) > 0 {
		if val, ok := dirMapping[parts[0]]; ok {
			return val
		}
	}

	return "IT" // 默认语言（保持原逻辑）
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

// 检查是否为纯占位符 - 只有占位符，没有其他文本
func isPlaceholder(text string) bool {
	// 如果文本完全由占位符组成，跳过翻译
	// 例如："{name}", "{count}", "{progress}" 等
	// 但 "Welcome back, {name}" 包含实际文本，应该被翻译

	// 使用正则表达式检测纯占位符模式（只能是 {xxx}）
	re := regexp.MustCompile(`^\{[a-zA-Z0-9_]+\}$`)
	return re.MatchString(text)
}

// 用于在单个翻译批次中生成唯一的占位符
type PlaceholderGenerator struct {
	counter int64
}

// 创建新的占位符生成器
func NewPlaceholderGenerator() *PlaceholderGenerator {
	return &PlaceholderGenerator{counter: 0}
}

// 生成特殊占位符 - 使用不可翻译的格式
// 格式：##XXXX##（四位数字）
// 例如：##0001##、##0002##等
// 双井号 + 数字的组合 DeepL 不会修改
func (pg *PlaceholderGenerator) Generate() string {
	pg.counter++
	return fmt.Sprintf("##%04d##", pg.counter)
}

// 客户端保护：将占位符和专有名词替换为特殊标记，这样 DeepL 不会翻译它们
func protectAllContentWithGenerator(text string, placeholderGen *PlaceholderGenerator) (string, map[string]string) {
	result := text
	protected := make(map[string]string)

	// 第一步：保护专有名词（先处理长的，避免部分替换）
	// 按长度降序排列专有名词
	type nounLen struct {
		noun string
		len  int
	}
	nouns := make([]nounLen, len(properNouns))
	for i, noun := range properNouns {
		nouns[i] = nounLen{noun, len(noun)}
	}
	// 简单的降序排序（按长度）
	for i := 0; i < len(nouns); i++ {
		for j := i + 1; j < len(nouns); j++ {
			if nouns[j].len > nouns[i].len {
				nouns[i], nouns[j] = nouns[j], nouns[i]
			}
		}
	}

	for _, nl := range nouns {
		if strings.Contains(result, nl.noun) {
			placeholder := placeholderGen.Generate()
			protected[placeholder] = nl.noun
			result = strings.ReplaceAll(result, nl.noun, placeholder)
		}
	}

	// 第二步：保护占位符（如 {name}, {count} 等）
	// 只匹配原始占位符（包含字母下划线的），不匹配已生成的数字占位符
	originalPlaceholderRegex := regexp.MustCompile(`\{[a-zA-Z_][a-zA-Z0-9_]*\}`)
	result = originalPlaceholderRegex.ReplaceAllStringFunc(result, func(match string) string {
		placeholder := placeholderGen.Generate()
		protected[placeholder] = match
		return placeholder
	})

	return result, protected
}

// 还原被保护的内容
// 占位符格式：##XXXX##（四位数字）
// 还原步骤：
// 1. 从 protected map 中提取所有数字 ID
// 2. 先删除所有 # 字符
// 3. 用纯数字去匹配并替换
func restoreProtectedContent(text string, protected map[string]string) string {
	// 构建数字ID到内容的映射
	// 从 protected map 中提取数字 ID
	idMap := make(map[string]string)
	for placeholder, content := range protected {
		// 从 ##0001## 中提取 0001（删除所有 #）
		numID := strings.Trim(placeholder, "#")
		idMap[numID] = content
	}

	// 第一步：删除所有的 # 字符
	result := strings.ReplaceAll(text, "#", "")

	// 第二步：用正则表达式匹配所有 4 位数字，检查是否在 idMap 中
	// 只替换那些在 idMap 中的数字
	digitPattern := regexp.MustCompile(`\d{4}`)
	result = digitPattern.ReplaceAllStringFunc(result, func(match string) string {
		if originalContent, ok := idMap[match]; ok {
			return originalContent
		}
		return match
	})

	return result
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
	// 使用自定义 encoder 来避免 HTML 转义
	var buf bytes.Buffer
	encoder := json.NewEncoder(&buf)
	encoder.SetEscapeHTML(false)  // 禁用 HTML 转义，保持原样输出
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(translatedData); err != nil {
		return fmt.Errorf("序列化 JSON 失败: %v", err)
	}
	translated := buf.Bytes()
	// 移除末尾的换行符（Encode 会添加一个）
	translated = bytes.TrimSuffix(translated, []byte("\n"))

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
	targetLang := flag.String("lang", "", "目标语言代码 (可选，默认从目标目录名自动推断)")
	singleFile := flag.String("file", "", "单个文件模式: 要翻译的文件路径")

	flag.Parse()

	// 初始化缓存根目录 - .deepl_cache
	cacheRootDir = ".deepl_cache"

	// 加载专有名词配置
	if err := loadProperNounsConfig("./config/proper-nouns.json"); err != nil {
		fmt.Printf("⚠️  警告: 加载专有名词配置失败: %v\n", err)
	}

	if *apiKey == "" {
		fmt.Println("❌ 错误: 必须提供 -key 参数（DeepL API 密钥）")
		fmt.Println("\n📖 使用方法:")
		fmt.Println("  批量翻译 (自动推断语言):  go run translate-deepl.go -key YOUR_API_KEY -target ./messages/zh-CN")
		fmt.Println("  单个文件 (自动推断语言):  go run translate-deepl.go -key YOUR_API_KEY -file ./messages/en/common.json -target ./messages/it")
		fmt.Println("  指定语言 (手动覆盖):    go run translate-deepl.go -key YOUR_API_KEY -target ./messages/fr -lang FR")
		fmt.Println("\n💡 获取 API 密钥: https://www.deepl.com/pro-api")
		os.Exit(1)
	}

	// 如果未提供 -lang 参数，根据目标目录自动推断语言代码
	if *targetLang == "" {
		*targetLang = inferLanguageFromDir(*targetDir)
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
