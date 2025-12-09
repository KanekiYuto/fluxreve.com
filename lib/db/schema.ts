import { pgTable, text, timestamp, boolean, integer, uuid, jsonb } from 'drizzle-orm/pg-core';

// Better Auth 用户表
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  // 用户类型: free(免费), basic(基础版), pro(专业版)
  userType: text('user_type').notNull().default('free'),
  // 当前活跃的订阅ID (关联 subscription 表)
  currentSubscriptionId: uuid('current_subscription_id'),
  // 是否为管理员
  isAdmin: boolean('is_admin').notNull().default(false),
  // 注册时的 IP 地址
  registrationIp: text('registration_ip'),
  // 注册时的国家代码 (ISO 3166-1 alpha-2, 例如: US, CN, JP)
  registrationCountry: text('registration_country'),
  // UTM 来源参数
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  utmContent: text('utm_content'),
  utmTerm: text('utm_term'),
});

// Better Auth 会话表
export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

// Better Auth 账户表 (用于 OAuth)
export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

// Better Auth 验证表
export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
});

// 配额信息表
export const quota = pgTable('quota', {
  // UUID 主键,由数据库自动生成
  id: uuid('id').primaryKey().defaultRandom(),
  // 用户ID
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  // 关联的交易ID (可选,免费配额时为空)
  transactionId: uuid('transaction_id').references(() => transaction.id, { onDelete: 'cascade' }),
  // 配额类型: daily_free(免费配额-每日), monthly_basic(月度订阅-基础版), monthly_pro(月度订阅-专业版), yearly_basic(年度订阅-基础版), yearly_pro(年度订阅-专业版), quota_pack(配额包)
  type: text('type').notNull(),
  // 配额数量 (默认为 0)
  amount: integer('amount').notNull().default(0),
  // 已消耗配额数量
  consumed: integer('consumed').notNull().default(0),
  // 下发时间
  issuedAt: timestamp('issued_at').notNull(),
  // 过期时间 (null 表示永不过期)
  expiresAt: timestamp('expires_at'),
  // 创建时间
  createdAt: timestamp('created_at').notNull().defaultNow(),
  // 更新时间
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 订阅信息表
export const subscription = pgTable('subscription', {
  // UUID 主键,由数据库自动生成
  id: uuid('id').primaryKey().defaultRandom(),
  // 用户ID
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  // 支付平台: creem, stripe, paypal 等
  paymentPlatform: text('payment_platform').notNull(),
  // 支付平台的订阅ID
  paymentSubscriptionId: text('payment_subscription_id').notNull(),
  // 支付平台的客户ID
  paymentCustomerId: text('payment_customer_id'),
  // 订阅计划类型: monthly_basic, monthly_pro, yearly_basic, yearly_pro
  planType: text('plan_type').notNull(),
  // 下次计划类型: 用于计划升级/降级,在下次续费时生效
  nextPlanType: text('next_plan_type'),
  // 订阅状态: active(活跃), canceled(已取消), expired(已过期), pending(待支付)
  status: text('status').notNull().default('pending'),
  // 订阅金额(分/美分)
  amount: integer('amount').notNull(),
  // 货币类型: USD, CNY 等
  currency: text('currency').notNull().default('USD'),
  // 订阅开始时间
  startedAt: timestamp('started_at'),
  // 订阅结束时间
  expiresAt: timestamp('expires_at'),
  // 下次续费时间
  nextBillingAt: timestamp('next_billing_at'),
  // 取消时间
  canceledAt: timestamp('canceled_at'),
  // 创建时间
  createdAt: timestamp('created_at').notNull().defaultNow(),
  // 更新时间
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 交易记录表
export const transaction = pgTable('transaction', {
  // UUID 主键,由数据库自动生成
  id: uuid('id').primaryKey().defaultRandom(),
  // 用户ID
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  // 关联的订阅ID (可选,一次性支付时为空)
  subscriptionId: uuid('subscription_id').references(() => subscription.id, { onDelete: 'cascade' }),
  // 支付平台的交易ID
  paymentTransactionId: text('payment_transaction_id').notNull(),
  // 交易类型: subscription_payment(订阅支付), one_time_payment(一次性支付), refund(退款)
  type: text('type').notNull(),
  // 交易金额(分/美分)
  amount: integer('amount').notNull(),
  // 货币类型: USD, CNY 等
  currency: text('currency').notNull().default('USD'),
  // 创建时间
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// 媒体生成任务表
export const mediaGenerationTask = pgTable('media_generation_task', {
  // UUID 主键,由数据库自动生成
  id: uuid('id').primaryKey().defaultRandom(),
  // 任务ID (UUID格式,用于前端查询和 webhook 回调)
  taskId: uuid('task_id').notNull().unique(),
  // 分享ID (短ID,用于分享链接)
  shareId: text('share_id').notNull().unique(),
  // 用户ID
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  // 任务类型: text_to_image(文生图), image_to_image(图生图)
  taskType: text('task_type').notNull(),
  // 服务商: fal, wavespeed, replicate 等
  provider: text('provider').notNull(),
  // 服务商平台的请求ID (可选)
  providerRequestId: text('provider_request_id'),
  // 使用的模型: nano_banana_pro, flux_schnell, flux_dev 等
  model: text('model').notNull(),
  // 任务状态: pending(排队中), processing(生成中), completed(已完成), failed(失败), canceled(已取消)
  status: text('status').notNull().default('pending'),
  // 进度百分比 (0-100)
  progress: integer('progress').notNull().default(0),
  // 生成参数 (JSON 格式存储: prompt、negativePrompt、aspectRatio、numImages、seed、steps、guidanceScale 等)
  parameters: jsonb('parameters').notNull(),
  // 生成结果 (JSONB 格式存储媒体文件信息数组: [{url, filename, type, size}])
  results: jsonb('results'),
  // 消费的配额交易记录ID
  consumeTransactionId: uuid('consume_transaction_id')
    .notNull()
    .references(() => quotaTransaction.id, { onDelete: 'cascade' }),
  // 退款的配额交易记录ID (可选)
  refundTransactionId: uuid('refund_transaction_id').references(() => quotaTransaction.id, { onDelete: 'set null' }),
  // 错误信息 (JSONB 格式存储错误详情: {message, code, stack, details})
  errorMessage: jsonb('error_message'),
  // 任务开始时间
  startedAt: timestamp('started_at').notNull(),
  // 任务完成时间
  completedAt: timestamp('completed_at'),
  // 生成耗时 (毫秒)
  durationMs: integer('duration_ms'),
  // 创建时间
  createdAt: timestamp('created_at').notNull().defaultNow(),
  // 更新时间
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  // 删除时间 (软删除标记)
  deletedAt: timestamp('deleted_at'),
  // 是否私有 (私有任务不对外展示)
  isPrivate: boolean('is_private').notNull().default(false),
  // 是否包含 NSFW 内容
  isNsfw: boolean('is_nsfw').notNull().default(false),
  // NSFW 内容审核详情 (JSON 格式: {harassment, hate, sexual, sexual/minors, violence})
  nsfwDetails: jsonb('nsfw_details'),
});

// 配额交易记录表
export const quotaTransaction = pgTable('quota_transaction', {
  // UUID 主键,由数据库自动生成
  id: uuid('id').primaryKey().defaultRandom(),
  // 用户ID
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  // 关联的配额ID
  quotaId: uuid('quota_id')
    .notNull()
    .references(() => quota.id, { onDelete: 'cascade' }),
  // 交易类型: consume(消费), refund(退款)
  type: text('type').notNull(),
  // 变更数量 (正数为增加,负数为减少)
  amount: integer('amount').notNull(),
  // 交易前余额
  balanceBefore: integer('balance_before').notNull(),
  // 交易后余额
  balanceAfter: integer('balance_after').notNull(),
  // 关联的交易ID (用于退款时关联原始消费交易)
  relatedTransactionId: uuid('related_transaction_id'),
  // 备注说明
  note: text('note'),
  // 创建时间
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// LoRAs 信息表
export const lora = pgTable('loras', {
  // UUID 主键,由数据库自动生成
  id: uuid('id').primaryKey().defaultRandom(),
  // LoRA 文件的 URL
  url: text('url').notNull(),
  // 触发词
  triggerWord: text('trigger_word'),
  // 提示词 (扩展触发词的使用说明和示例)
  prompt: text('prompt').notNull(),
  // 标题
  title: text('title').notNull(),
  // 描述内容
  description: text('description'),
  // 用户ID (创建者)
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  // 适用的模型列表 (JSONB 格式存储数组: ["z-image", "z-image-lora", "nano-banana-pro"])
  compatibleModels: jsonb('compatible_models').notNull(),
  // 素材的 URL 地址列表 (JSONB 格式存储数组: ["https://example.com/asset1.jpg", "https://example.com/asset2.jpg"])
  assetUrls: jsonb('asset_urls').default([]),
  // 创建时间
  createdAt: timestamp('created_at').notNull().defaultNow(),
  // 更新时间
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
