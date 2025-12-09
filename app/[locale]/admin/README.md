# 管理后台 Admin Panel

## 概述

管理后台用于管理平台的订阅、用户等数据。访问路径为 `/admin`。

## 功能模块

### 1. 订阅管理 (`/admin/subscriptions`)

管理所有用户的订阅信息，包括：

- **统计卡片**：显示总订阅数、活跃订阅、已取消、已过期、月度收入
- **订阅列表**：展示所有订阅的详细信息
- **搜索和过滤**：支持按用户邮箱、用户名、订阅 ID 搜索，按状态过滤
- **实时刷新**：手动刷新订阅数据

## 权限配置

### ⚠️ 重要：添加管理员权限验证

目前权限验证代码已预留但需要配置。请按以下步骤启用：

### 1. 数据库架构更新

在 User 模型中添加 `isAdmin` 字段：

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  isAdmin   Boolean  @default(false)  // 添加此字段
  // ... 其他字段
}
```

运行迁移：

```bash
npx prisma migrate dev --name add_user_admin_field
```

### 2. 启用布局权限检查

编辑 `app/[locale]/admin/layout.tsx`，取消注释以下代码：

```typescript
// 验证用户是否为管理员
const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { isAdmin: true },
});

if (!user?.isAdmin) {
  redirect(`/${locale}/`);
}
```

### 3. 启用 API 权限检查

编辑 `app/api/admin/subscriptions/route.ts`，取消注释以下代码：

```typescript
// 验证用户是否为管理员
const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { isAdmin: true },
});

if (!user?.isAdmin) {
  return NextResponse.json(
    { success: false, error: 'Forbidden - Admin access required' },
    { status: 403 }
  );
}
```

### 4. 设置管理员用户

使用 Prisma Studio 或数据库工具将特定用户设置为管理员：

```typescript
// 示例：使用 Prisma Client
await prisma.user.update({
  where: { email: 'admin@example.com' },
  data: { isAdmin: true },
});
```

或使用 Prisma Studio：

```bash
npx prisma studio
```

在界面中找到用户并将 `isAdmin` 设置为 `true`。

## API 接口

### GET /api/admin/subscriptions

获取所有订阅列表和统计数据。

**响应格式：**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "userId": "...",
      "userEmail": "user@example.com",
      "userName": "User Name",
      "paymentPlatform": "creem",
      "planType": "monthly_pro",
      "status": "active",
      "amount": 29.99,
      "currency": "USD",
      "startedAt": "2024-01-01T00:00:00.000Z",
      "nextBillingAt": "2024-02-01T00:00:00.000Z",
      // ... 其他字段
    }
  ],
  "stats": {
    "total": 150,
    "active": 120,
    "canceled": 20,
    "expired": 10,
    "monthlyRevenue": 3599.88
  }
}
```

## 安全注意事项

1. **必须启用权限验证**：在生产环境中，务必启用管理员权限检查
2. **限制管理员数量**：只将 `isAdmin` 权限授予受信任的用户
3. **审计日志**：建议添加管理员操作日志记录
4. **HTTPS**：确保在生产环境使用 HTTPS
5. **会话管理**：配置合理的会话超时时间

## 未来扩展

可以考虑添加以下功能：

- [ ] 用户管理模块
- [ ] 任务管理模块
- [ ] 系统设置模块
- [ ] 统计分析模块
- [ ] 操作日志模块
- [ ] 数据导出功能
- [ ] 批量操作功能

## 技术栈

- **前端框架**：Next.js 15 (App Router)
- **UI 组件**：React + TailwindCSS
- **状态管理**：React Hooks
- **数据获取**：Fetch API
- **权限验证**：NextAuth.js
- **数据库**：Prisma ORM
