# TODOS.md

## P1: 示例安全隔离（iframe sandbox）
**What:** 将示例页面从同 origin 直接提供改为 iframe sandbox 隔离
**Why:** 当前架构下，任何示例的 JS 可以读取主站 cookies/localStorage，是 XSS 风险。Outside voice 评审明确指出这是"shipping an XSS vector as a feature"
**Pros:** 消除跨示例和示例-主站的安全风险，为社区贡献开路
**Cons:** 增加路由复杂度，iframe 通信需要 postMessage；部分示例功能（如 localStorage）可能受限
**Context:** 当前 hackathon 阶段由作者本人创建所有示例，PR 审查足够。但在接受任何外部贡献之前必须实现。两种方案：1) iframe sandbox="allow-scripts" 在主站内嵌套；2) 部署到子域名 examples.all-in-ai.dev。方案 1 更快，方案 2 更彻底。
**Effort:** M (human) → S (CC)
**Priority:** P1
**Depends on:** 基础平台完成
**Added by:** /plan-eng-review 2026-03-25（outside voice 发现）

## P2: Playwright E2E 测试
**What:** 添加端到端测试覆盖核心用户流程
**Why:** 单元测试覆盖 integration 逻辑，但卡片点击→示例页面→返回按钮的完整流程需要浏览器环境验证
**Pros:** 捕获 build 产物在真实浏览器中的渲染问题；防止回退按钮注入的回归
**Cons:** Playwright 增加 CI 时间约 30s；需要额外 devDependency
**Context:** 核心测试：1) 首页卡片渲染数量 = examples/ 下有效示例数 2) 点击卡片跳转到 /examples/<name>/ 3) 示例页面有返回按钮 4) chrome=false 的示例无返回按钮。在 Vitest 单元/集成测试稳定后再添加。
**Effort:** S (human) → S (CC)
**Priority:** P2
**Depends on:** Vitest 单元测试完成

## P2: 示例搜索和过滤
**What:** 首页添加按 tag/关键词搜索和过滤功能
**Why:** 当示例超过 10 个时，纯卡片网格无法高效浏览
**Pros:** 提升内容发现效率
**Cons:** 需要引入客户端 JS（Astro 默认零 JS）
**Context:** 可用 Astro 的 client:load 指令加载一个轻量 React/Preact 过滤组件。或用纯 CSS+HTML details/summary hack 实现无 JS 过滤（但功能受限）。建议 10+ 示例时实现。
**Effort:** S (human) → S (CC)
**Priority:** P2
**Depends on:** 示例数量 > 10

## P3: 隐私友好的访客分析
**What:** 添加 Plausible 或 Umami 分析脚本
**Why:** 了解哪些示例最受欢迎，指导未来创作方向
**Pros:** 数据驱动的内容策略
**Cons:** 额外的第三方依赖（虽然是隐私友好的）
**Context:** 部署到 Vercel 后添加。Plausible 有免费自托管版，Umami 完全开源。在 site/src/layouts/ 的 base layout 中添加 script 标签即可。
**Effort:** S (human) → S (CC)
**Priority:** P3
**Depends on:** Vercel 部署完成
