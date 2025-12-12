# DeepL 自动翻译脚本

使用 DeepL API 自动将英文翻译文件翻译成其他语言。

## 功能特性

- ✅ 支持批量翻译整个目录
- ✅ 支持单个文件翻译
- ✅ 智能跳过占位符（`{siteName}`, `{count}` 等）
- ✅ 支持递归 JSON 结构翻译
- ✅ 翻译缓存，避免重复调用 API
- ✅ 速率限制，防止 API 限流
- ✅ 保持原始 JSON 格式和缩进

## 前置要求

1. **Go 1.16+** - [下载 Go](https://golang.org/dl/)
2. **DeepL API 密钥** - [注册 DeepL API](https://www.deepl.com/pro-api)

> 注：DeepL 提供免费计划，包含每月 50 万字符的翻译额度

## 安装

### 1. 获取 DeepL API 密钥

访问 [DeepL API 控制面板](https://www.deepl.com/account/keys) 获取你的 API 密钥。

DeepL 提供两种 API：
- **Free API** - 免费计划，每月 50 万字符
- **Pro API** - 付费计划，无限使用

### 2. 设置环境变量

#### Windows (PowerShell)
```powershell
$env:DEEPL_API_KEY = "your-deepl-api-key"
```

#### macOS/Linux (Bash/Zsh)
```bash
export DEEPL_API_KEY="your-deepl-api-key"
```

## 使用方法

### 批量翻译整个目录

#### Windows (PowerShell)
```powershell
cd scripts
.\run-translate.ps1
```

#### macOS/Linux
```bash
cd scripts
chmod +x run-translate.sh
./run-translate.sh
```

### 直接使用 Go 命令

#### 批量翻译（英文到意大利文）
```bash
cd scripts
go run translate-deepl.go -key "YOUR_API_KEY"
```

#### 翻译到其他语言

```bash
# 翻译到德文 (DE)
go run translate-deepl.go -key "YOUR_API_KEY" -lang "DE"

# 翻译到法文 (FR)
go run translate-deepl.go -key "YOUR_API_KEY" -lang "FR"

# 翻译到西班牙文 (ES)
go run translate-deepl.go -key "YOUR_API_KEY" -lang "ES"
```

#### 翻译单个文件
```bash
go run translate-deepl.go -key "YOUR_API_KEY" -file ../messages/en/common.json
```

#### 自定义源和目标目录
```bash
go run translate-deepl.go \
  -key "YOUR_API_KEY" \
  -source ../messages/en \
  -target ../messages/fr \
  -lang "FR"
```

## 支持的语言代码

| 语言 | 代码 |
|------|------|
| 英文 | EN |
| 简体中文 | ZH |
| 繁体中文 | ZH |
| 日本语 | JA |
| 德文 | DE |
| 法文 | FR |
| 西班牙文 | ES |
| 意大利文 | IT |
| 葡萄牙文 | PT |
| 俄文 | RU |
| 韩文 | KO |
| 阿拉伯文 | AR |

更多语言详见 [DeepL 文档](https://developers.deepl.com/docs/api-reference/translate)

## 参数说明

```
-key string
    DeepL API 密钥 (必需)

-source string
    源文件目录 (默认: ./messages/en)

-target string
    目标文件目录 (默认: ./messages/it)

-lang string
    目标语言代码 (默认: IT)
    示例: DE, FR, ES, IT, etc.

-file string
    单个文件模式: 要翻译的文件路径
    示例: ../messages/en/common.json
```

## 工作流程

1. 读取源目录中的所有 JSON 文件
2. 解析 JSON 结构
3. 递归遍历所有文本字段
4. 跳过占位符（如 `{siteName}`, `{count}` 等）
5. 调用 DeepL API 翻译文本
6. 合并翻译后的内容
7. 保存到目标目录

## 示例

### 示例 1：翻译 common.json 到意大利文

```bash
go run translate-deepl.go \
  -key "YOUR_API_KEY" \
  -file ../messages/en/common.json \
  -target ../messages/it \
  -lang "IT"
```

输出：
```
==============================
DeepL 翻译脚本
源目录: ../messages/en/common.json
目标目录: ../messages/it
目标语言: IT
==============================

处理文件: common.json
翻译: Language -> Lingua
翻译: Loading... -> Caricamento in corso...
...
✓ 已保存: ../messages/it/common.json
```

### 示例 2：批量翻译所有文件到法文

```bash
go run translate-deepl.go \
  -key "YOUR_API_KEY" \
  -source ../messages/en \
  -target ../messages/fr \
  -lang "FR"
```

## 费用估算

### DeepL Free API
- 免费额度：每月 50 万字符
- 项目文件总字符数：约 30,000 字符
- **足以翻译至少 16 种语言**

### DeepL Pro API
- 起价：每月 $5.99
- 字符费率：更便宜，适合大规模翻译

## 故障排除

### 问题 1：API Key 错误
```
Error: DeepL API error: 403 - Unauthorized
```
**解决方案**：检查 API 密钥是否正确，确保环境变量设置正确。

### 问题 2：网络超时
```
Error: context deadline exceeded
```
**解决方案**：检查网络连接，DeepL API 可能暂时不可用。

### 问题 3：配额超出
```
Error: DeepL API error: 429 - Too Many Requests
```
**解决方案**：等待一段时间，或考虑升级 DeepL 订阅。

### 问题 4：目标目录不存在
脚本会自动创建目标目录，无需手动创建。

## 代码集成

如果你想在 Node.js 中使用翻译脚本，可以调用 Go 二进制文件：

```javascript
const { exec } = require('child_process');

exec('go run translate-deepl.go -key YOUR_API_KEY', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  console.log(stdout);
});
```

## 项目中的 i18n 集成

脚本生成的翻译文件会自动被项目识别：

1. ✅ `i18n/config.ts` - 已添加 `it` 到 `locales` 数组
2. ✅ `i18n/request.ts` - 自动加载 `messages/it/` 下的所有文件
3. ✅ 无需其他配置修改

生成文件后，重新构建项目即可：
```bash
pnpm build
```

## 高级用法

### 翻译多种语言

创建脚本批量翻译：

```bash
#!/bin/bash
API_KEY="your-deepl-api-key"

for lang in DE FR ES IT PT; do
  DIR_CODE=$(echo $lang | tr '[:upper:]' '[:lower:]')
  echo "翻译到 $lang..."
  go run translate-deepl.go -key "$API_KEY" -lang "$lang" -target "../messages/$DIR_CODE"
done
```

### 仅翻译特定文件

```bash
for file in common.json home.json auth.json; do
  go run translate-deepl.go \
    -key "YOUR_API_KEY" \
    -file "../messages/en/$file" \
    -target "../messages/it"
done
```

## 注意事项

- ⚠️ **保护 API 密钥**：不要将 API 密钥提交到版本控制
- ⚠️ **配额管理**：监控 DeepL API 的使用情况
- ⚠️ **手动审核**：AI 翻译可能不完美，建议人工审核重要文本
- ⚠️ **占位符保护**：脚本自动保护 `{...}` 占位符，但可以手动修改

## 许可证

MIT
