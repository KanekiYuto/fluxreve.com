# PostHog 用户追踪设置指南

## 🎯 为什么使用 PostHog？

PostHog 是一个开源的产品分析工具，可以自动：
- ✅ 捕获 UTM 参数（utm_source, utm_medium, utm_campaign 等）
- ✅ 追踪用户行为和页面浏览
- ✅ 提供用户画像和漏斗分析
- ✅ 自托管或云端部署
- ✅ 免费额度：每月 100 万事件

## 🚀 快速开始

### 1. 注册 PostHog 账号

访问 [PostHog Cloud](https://app.posthog.com/signup) 或自托管：

```bash
# Docker 自托管（可选）
docker run -d --name posthog \
  -p 8000:8000 \
  -e SECRET_KEY=your-secret-key \
  posthog/posthog:latest
```

### 2. 获取 API Key

1. 登录 PostHog
2. 进入 Project Settings → API Keys
3. 复制 **Project API Key**（以 `phc_` 开头）

### 3. 配置环境变量

编辑 `.env.local` 文件：

```bash
# PostHog 配置
NEXT_PUBLIC_POSTHOG_KEY="phc_your_key_here"

# 如果使用自托管，修改 host
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"  # 或自己的域名
```

### 4. 重启开发服务器

```bash
pnpm dev
```

## 📊 功能说明

### 自动捕获的数据

#### 1. UTM 参数
当用户访问带 UTM 的链接时，PostHog 自动保存：
- `$initial_utm_source` - 来源（如 google, facebook）
- `$initial_utm_medium` - 媒介（如 cpc, email）
- `$initial_utm_campaign` - 活动名称
- `$initial_utm_content` - 内容标识
- `$initial_utm_term` - 关键词

#### 2. 用户识别
登录后，自动关联用户 ID 和邮箱：
```typescript
posthog.identify(userId, {
  email: user.email,
  name: user.name,
  userType: 'free' | 'basic' | 'pro',
});
```

#### 3. 页面浏览
自动追踪所有页面访问和导航事件。

#### 4. 点击事件
自动捕获按钮点击、链接点击等交互行为。

### 同步到数据库

用户首次登录时，系统会：
1. **客户端**：从 URL 或 PostHog localStorage 读取 UTM 参数
2. **服务器端**：从请求头获取真实 IP 地址和国家信息
3. 保存到数据库 `user` 表的追踪字段

**实现原理**：
- **UTM 参数**：PostHog 自动保存初始 UTM 到 localStorage，客户端读取后发送给 API
- **IP 和地理位置**：由服务器端从请求头提取（`x-forwarded-for`、`cf-connecting-ip` 等）
- **为什么不用 PostHog 的 IP/Country**：这些属性只在 PostHog 服务器端处理，客户端 JavaScript 无法直接访问

## 🔍 查看数据

### PostHog Dashboard

1. 访问 PostHog → Events
2. 查看实时事件流
3. 创建漏斗分析、留存率等报表

### 数据库查询

```sql
-- 查看用户来源分布
SELECT
  utm_source,
  COUNT(*) as user_count
FROM "user"
WHERE utm_source IS NOT NULL
GROUP BY utm_source;

-- 查看营销活动效果
SELECT
  utm_campaign,
  COUNT(*) as conversions,
  COUNT(DISTINCT registration_country) as countries
FROM "user"
WHERE utm_campaign IS NOT NULL
GROUP BY utm_campaign;
```

## 🛠️ 高级功能

### 自定义事件

在代码中追踪特定事件：

```typescript
import posthog from 'posthog-js';

// 追踪订阅购买
posthog.capture('subscription_purchased', {
  plan: 'pro',
  price: 29.99,
  billing_cycle: 'monthly',
});

// 追踪功能使用
posthog.capture('image_generated', {
  model: 'flux-pro',
  prompt_length: prompt.length,
});
```

### Feature Flags

控制功能发布：

```typescript
if (posthog.isFeatureEnabled('new-ui-design')) {
  // 显示新 UI
}
```

### A/B Testing

测试不同方案：

```typescript
const variant = posthog.getFeatureFlag('pricing-experiment');
if (variant === 'control') {
  // 原价格
} else if (variant === 'test') {
  // 优惠价格
}
```

## 💡 最佳实践

### 1. 隐私保护
PostHog 默认遵守 GDPR：
- 自动匿名化 IP
- 支持用户数据删除
- 可配置数据保留期

### 2. 性能优化
- 使用 `requestIdleCallback` 延迟初始化
- 批量发送事件（自动）
- 本地缓存减少网络请求

### 3. 测试环境隔离
```bash
# 开发环境使用不同的 project
NEXT_PUBLIC_POSTHOG_KEY_DEV="phc_dev_key"
NEXT_PUBLIC_POSTHOG_KEY_PROD="phc_prod_key"
```

## 📖 相关文档

- [PostHog 官方文档](https://posthog.com/docs)
- [JavaScript SDK](https://posthog.com/docs/libraries/js)
- [UTM 追踪指南](https://posthog.com/docs/data/utm-segmentation)

## 🆘 常见问题

### Q: 为什么看不到 UTM 数据？
A: 确保访问 URL 包含 UTM 参数，例如：
```
https://fluxreve.com?utm_source=google&utm_campaign=summer
```

### Q: 如何测试追踪是否工作？
A:
1. 打开浏览器开发者工具 → Network
2. 访问带 UTM 的链接
3. 查找 `posthog.com/decide` 或 `/e/` 请求
4. 检查 PostHog Dashboard → Events

### Q: 是否支持自托管？
A: 是的！PostHog 完全开源，可以部署到自己的服务器。

### Q: 会影响网站性能吗？
A: 不会。PostHog 使用异步加载和批量发送，对性能影响极小（< 50ms）。
