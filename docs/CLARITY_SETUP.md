# Microsoft Clarity 用户追踪设置指南

## 🎯 为什么使用 Microsoft Clarity？

Microsoft Clarity 是微软提供的免费网站分析工具，可以自动：
- ✅ 会话录制 - 完整记录用户操作
- ✅ 热力图 - 点击、滚动、区域热力图
- ✅ 用户行为分析 - 自动识别愤怒点击、死链接等
- ✅ 完全免费 - 无限流量、无限录制
- ✅ 隐私友好 - 符合 GDPR，自动过滤敏感数据

## 🚀 快速开始

### 1. 注册 Microsoft Clarity 账号

访问 [Microsoft Clarity](https://clarity.microsoft.com/)，使用 Microsoft 账号登录。

### 2. 创建项目

1. 点击 "Add new project"
2. 填写网站信息：
   - **Name**: FluxReve（或你的网站名称）
   - **Website URL**: https://fluxreve.com
   - **Category**: 选择合适的分类
3. 点击 "Add"

### 3. 获取 Project ID

创建项目后，你会看到一个 Project ID（格式类似：`abc123xyz456`）

### 4. 配置环境变量

编辑 `.env.local` 文件：

```bash
# Microsoft Clarity 配置
NEXT_PUBLIC_CLARITY_PROJECT_ID="abc123xyz456"
```

### 5. 重启开发服务器

```bash
pnpm dev
```

## 📊 功能说明

### 自动捕获的数据

#### 1. 会话录制
Clarity 会自动录制所有用户会话，包括：
- 鼠标移动轨迹
- 点击位置
- 滚动行为
- 页面跳转

#### 2. 用户识别
登录后，系统会自动识别用户：
```typescript
clarity.identify(userId, undefined, undefined, userName);
clarity.setTag('user_type', 'free' | 'basic' | 'pro');
clarity.setTag('email', userEmail);
```

#### 3. 热力图
自动生成三种热力图：
- **点击热力图** - 用户最常点击的区域
- **滚动热力图** - 用户滚动深度
- **区域热力图** - 页面不同区域的关注度

#### 4. 问题检测
自动识别用户体验问题：
- **愤怒点击** (Rage Clicks) - 快速重复点击
- **死链接** (Dead Clicks) - 点击无响应元素
- **过度滚动** (Excessive Scrolling) - 频繁来回滚动
- **快速返回** (Quick Backs) - 快速离开页面

### 同步到数据库

用户首次登录时，系统会：
1. **客户端**：从 URL 读取 UTM 参数
2. **服务器端**：从请求头获取真实 IP 地址和国家信息
3. 保存到数据库 `user` 表的追踪字段

**实现原理**：
- **UTM 参数**：从 URL 查询参数直接读取
- **IP 和地理位置**：由服务器端从请求头提取（`x-forwarded-for`、`cf-connecting-ip` 等）
- **Clarity 录制**：所有用户行为自动录制到 Clarity Dashboard

## 🔍 查看数据

### Clarity Dashboard

1. 访问 [Clarity Dashboard](https://clarity.microsoft.com/)
2. 选择你的项目
3. 查看以下功能：
   - **Dashboard** - 概览和关键指标
   - **Recordings** - 会话录制回放
   - **Heatmaps** - 热力图分析
   - **Insights** - 自动发现的问题

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

### 自定义标签

标记特定用户或会话：

```typescript
import { clarity } from '@microsoft/clarity';

// 标记付费用户
clarity.setTag('subscription', 'pro');

// 标记特定功能使用
clarity.setTag('feature', 'ai-generator');

// 标记 A/B 测试组
clarity.setTag('experiment', 'variant-a');
```

### 过滤敏感数据

Clarity 自动过滤密码、信用卡等敏感输入，你也可以手动标记：

```html
<!-- 添加 data-clarity-mask 属性 -->
<input type="text" data-clarity-mask="true" placeholder="手机号" />
<div data-clarity-unmask="false">敏感内容</div>
```

### 设置自定义事件

```typescript
// 升级为付费用户
clarity.upgrade();

// 注意：Clarity 主要通过录制和热力图工作，不需要手动发送事件
```

## 💡 最佳实践

### 1. 隐私保护
Clarity 默认遵守隐私法规：
- 自动屏蔽密码输入
- 自动屏蔽信用卡信息
- 可配置 Cookie 策略
- 支持用户数据删除

### 2. 性能优化
- 异步加载，不阻塞页面渲染
- 智能采样，不影响网站性能
- 录制数据压缩传输

### 3. 开发环境 vs 生产环境
建议只在生产环境启用：
```bash
# 只在生产环境配置
NEXT_PUBLIC_CLARITY_PROJECT_ID="abc123xyz456"  # 生产环境
# 开发环境不设置，Clarity 不会初始化
```

## 📖 相关文档

- [Clarity 官方文档](https://docs.microsoft.com/en-us/clarity/)
- [JavaScript SDK](https://www.npmjs.com/package/@microsoft/clarity)
- [隐私政策](https://clarity.microsoft.com/privacy)

## 🆘 常见问题

### Q: 为什么看不到录制？
A:
1. 确保 Project ID 正确配置
2. 检查浏览器控制台是否有错误
3. 录制数据处理需要几分钟时间

### Q: 如何测试是否工作？
A:
1. 打开浏览器开发者工具 → Network
2. 访问网站
3. 查找 `clarity.ms` 请求
4. 等待 2-5 分钟后在 Dashboard 查看

### Q: 会影响网站性能吗？
A: 不会。Clarity 使用异步加载和智能采样，对性能影响极小（< 1%）。

### Q: 免费版有限制吗？
A: 没有！Clarity 完全免费，无限流量、无限录制、无限项目。

### Q: 如何删除用户数据？
A: 在 Clarity Dashboard → Settings → Privacy → Data Deletion，输入 User ID 即可删除。
