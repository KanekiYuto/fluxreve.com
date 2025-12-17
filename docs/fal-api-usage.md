# Fal AI API 使用说明

## 环境配置

在 `.env` 文件中添加 Fal AI API Key：

```bash
FAL_API_KEY="your_fal_api_key_here"
```

## API 端点

### GPT Image 1.5 文生图

**端点**: `POST /api/ai-generator/provider/fal/gpt-image-1.5/text-to-image`

**请求参数**:

```typescript
{
  prompt: string;                                    // 必填: 提示词
  negative_prompt?: string;                          // 可选: 负面提示词
  num_images?: number;                               // 可选: 生成图片数量（默认1）
  guidance_scale?: number;                           // 可选: 引导系数
  seed?: number;                                     // 可选: 随机种子
  quality?: 'low' | 'medium' | 'high';              // 可选: 生成质量（默认medium）
  size?: '1024x1024' | '1024x1536' | '1536x1024';   // 可选: 图片尺寸（默认1024x1024）
}
```

**请求示例**:

```bash
curl -X POST https://fluxreve.com/api/ai-generator/provider/fal/gpt-image-1.5/text-to-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt": "create a realistic image taken with iphone at these coordinates 41°43′32″N 49°56′49″W 15 April 1912",
    "quality": "medium",
    "size": "1024x1024"
  }'
```

**响应格式**:

```json
{
  "success": true,
  "taskId": "task_xxxxxxxxx",
  "status": "pending"
}
```

### GPT Image 1.5 图生图

**端点**: `POST /api/ai-generator/provider/fal/gpt-image-1.5/image-to-image`

**请求参数**:

```typescript
{
  prompt: string;                                    // 必填: 提示词
  image_urls: string[];                              // 必填: 输入图片 URL 数组
  negative_prompt?: string;                          // 可选: 负面提示词
  num_images?: number;                               // 可选: 生成图片数量（默认1）
  guidance_scale?: number;                           // 可选: 引导系数
  seed?: number;                                     // 可选: 随机种子
  quality?: 'low' | 'medium' | 'high';              // 可选: 生成质量（默认medium）
  size?: '1024x1024' | '1024x1536' | '1536x1024';   // 可选: 图片尺寸（默认1024x1024）
}
```

**请求示例**:

```bash
curl -X POST https://fluxreve.com/api/ai-generator/provider/fal/gpt-image-1.5/image-to-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt": "Same workers, same beam, same lunch boxes - but they are all on their phones now. One is taking a selfie. One is on a call looking annoyed. Same danger, new priorities. A hard hat has AirPods.",
    "image_urls": ["https://v3b.fal.media/files/b/0a8691af/9Se_1_VX1wzTjjTOpWbs9_bb39c2eb-1a41-4749-b1d0-cf134abc8bbf.png"]
  }'
```

**响应格式**:

```json
{
  "success": true,
  "taskId": "task_xxxxxxxxx",
  "status": "pending"
}
```

**积分消耗规则**:

根据图片质量和尺寸计算积分消耗（1美元 = 700积分，向上取整到5的倍数）：

| 质量 | 尺寸 | 价格/张 | 积分/张 |
|------|------|---------|---------|
| Low | 1024x1024 | $0.009 | 10 积分 |
| Low | 其他尺寸 | $0.013 | 10 积分 |
| Medium | 1024x1024 | $0.034 | 25 积分 |
| Medium | 1024x1536 | $0.051 | 40 积分 |
| Medium | 1536x1024 | $0.050 | 35 积分 |
| High | 1024x1024 | $0.133 | 95 积分 |
| High | 1024x1536 | $0.200 | 140 积分 |
| High | 1536x1024 | $0.199 | 140 积分 |

总积分消耗 = 单张图积分 × 生成图片数量（num_images）

## Webhook 回调

Fal AI 会在任务完成后自动调用 webhook 回调地址。系统会自动处理以下流程：

1. 接收 Fal AI 的回调
2. 转存图片到 Cloudflare R2
3. 生成带水印的图片
4. 更新数据库任务状态
5. 执行 NSFW 检查（如配置）

Webhook 端点格式：`/api/ai-generator/webhook/fal/{taskId}`

## 代码实现

### 核心文件

- `lib/ai-generator/handleFalRequest.ts` - Fal AI 请求处理器
- `app/api/ai-generator/provider/fal/gpt-image-1.5/image-to-image/route.ts` - API 路由
- `app/api/ai-generator/webhook/[provider]/[taskId]/route.ts` - Webhook 回调处理器

### 添加新的 Fal AI 模型

1. 在 `app/api/ai-generator/provider/fal/` 下创建新的模型目录
2. 创建 `route.ts` 文件，使用 `handleFalRequest` 处理请求
3. 配置正确的 endpoint 和参数处理逻辑

示例：

```typescript
import { handleFalRequest } from '@/lib/ai-generator/handleFalRequest';

export async function POST(request: NextRequest) {
  return handleFalRequest(request, {
    endpoint: 'fal-ai/your-model-name',
    taskType: 'text-to-image',
    model: 'your-model-name',
    processParams: (body) => {
      // 参数验证和处理逻辑
      return {
        creditsParams: { /* 积分计算参数 */ },
        apiParams: { /* API 请求参数 */ },
        dbParams: { /* 数据库存储参数 */ },
        description: '任务描述',
      };
    },
  });
}
```

## 注意事项

1. 确保环境变量 `FAL_API_KEY` 已正确配置
2. 确保环境变量 `NEXT_PUBLIC_WEBHOOK_URL` 已正确配置
3. Fal AI 的 webhook 回调已在现有的统一 webhook 处理器中支持
4. 图片 URL 必须是可公开访问的地址
5. Fal AI 使用异步队列模式，任务创建后会通过 webhook 返回结果
