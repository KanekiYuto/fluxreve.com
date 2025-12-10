## 基础规则

- 所有对话与输出内容必须使用中文
- 所有代码中的注释必须使用中文
- 前端使用 `console` 输出的日志文本必须使用英文
- 站点名称（FluxReve）进行国际化时，必须使用配置占位符的方式进行设置，禁止硬编码
- json中的双引号必须使用反斜杠

## Sitemap 生成机制

项目使用两步流程动态生成 sitemap，将公开分享的任务链接自动添加到搜索引擎索引中：

1. **预生成阶段** (`pnpm generate:sitemap-tasks`)：
   - 从数据库获取所有公开的、非 NSFW 的、已完成的任务
   - 将任务列表保存到 `.next-sitemap-tasks.json`（已添加到 .gitignore）
   - 本地开发环境无数据库连接时会自动跳过，不影响构建流程

2. **Sitemap 生成阶段** (`next-sitemap`)：
   - 读取 `.next-sitemap-tasks.json` 中的任务列表
   - 与静态路由合并生成完整的 sitemap
   - 自动包含所有语言版本（en, zh-CN, zh-TW, ja）

**生产环境构建时**，`pnpm postbuild` 会自动按顺序执行这两个步骤。