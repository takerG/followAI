# Follow AI

> 更直观、更易理解地掌握 AI 编程知识

## 为什么 Follow AI？

传统的编程教程困在文本编辑器里：代码块、截图、Markdown。但 AI 编程的很多最佳实践——工作流、思维模型、协作模式——用文字很难讲清楚。

Follow AI 用**沉浸式网页**代替传统教程。每个示例都是一个独立的、精心制作的交互式页面，让你通过视觉化的方式真正理解 AI 编程的核心理念。

**Follow AI 与传统博客的区别：**

- 传统博客 = Markdown + 代码块 + 截图
- Follow AI = 全屏沉浸式体验 + 交互动画 + 视觉叙事

## 特色

- **沉浸式体验** — 每个示例都是独立的 HTML 页面，不受模板限制
- **Vibe Coding 友好** — 示例本身就是用 AI 辅助编程创建的
- **学习路径** — 通过分类和精选推荐，按需学习
- **轻松贡献** — 创建一个目录 + `meta.json` + `index.html` 即可

## 快速开始

```bash
# 安装依赖
cd site && npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test

# 构建
npm run build
```

## 如何添加示例

1. 在 `examples/` 下新建子目录：

```bash
mkdir examples/my-example
```

2. 创建 `meta.json`（必须包含 `title` 和 `description`）：

```json
{
    "title": "示例标题",
    "description": "简短描述",
    "tags": ["tag1", "tag2"],
    "author": "作者名",
    "date": "2025-03-25"
}
```

3. 创建 `index.html`（独立的 HTML 页面，构建时自动注入返回按钮）。

4. （可选）添加封面图：放一个 `cover.svg`、`cover.png`、`cover.jpg`、`cover.jpeg` 或 `cover.webp` 文件在示例目录中，构建系统会自动检测并使用。也可以在 `meta.json` 中通过 `cover` 字段手动指定。

5. 重启开发服务器，首页将自动出现新卡片。

### meta.json 字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | ✅ | 示例标题（最长 200 字符） |
| description | string | ✅ | 简短描述（最长 1000 字符） |
| tags | string[] | ❌ | 标签列表 |
| author | string | ❌ | 作者 |
| date | string | ❌ | 日期（用于排序，YYYY-MM-DD） |
| cover | string | ❌ | 封面图文件名（自动检测优先级：cover.svg > cover.png > cover.jpg > cover.jpeg > cover.webp） |
| lang | string | ❌ | 语言代码 |
| chrome | boolean | ❌ | 是否显示返回按钮（默认 true） |

### 限制

- 每个示例目录不超过 5MB（CI 检查）/ 10MB（构建硬限制）
- 不支持符号链接
- slug（目录名）大小写不敏感不可重复

## 排序与分类

首页默认按日期降序排列。通过 `examples/order.json` 可以自定义精选推荐和分类：

```json
{
  "featured": ["slug-1", "slug-2"],
  "categories": [
    {
      "title": "分类名称",
      "icon": "🚀",
      "items": ["slug-1", "slug-2", "slug-3"]
    }
  ]
}
```

**规则：**
- `featured` — 出现在页面顶部的精选推荐区
- `categories` — 按分类分组展示，每个分类有标题和图标
- 去重：同一示例不会在多个分区中重复出现（featured 优先）
- 未被配置覆盖的示例自动出现在"更多内容"区
- `order.json` 是可选的 — 文件不存在时自动回退到按日期排序

## 项目结构

```
followAI/
├── site/                                          # Astro 主站
│   ├── src/
│   │   ├── integrations/                          # 核心扫描、复制、注入
│   │   ├── pages/                                 # 首页 + 404
│   │   ├── components/                            # 卡片网格组件
│   │   ├── layouts/                               # 基础布局
│   │   └── types/                                 # TypeScript 类型
│   ├── public/assets/                             # 注入脚本（返回按钮）
│   └── test/                                      # Vitest 单元测试
├── examples/                                      # 示例目录
│   ├── order.json                                 # 排序与分类配置（可选）
│   ├── cursor-tips/                               # Cursor 使用技巧
│   ├── prompt-engineering/                        # 提示工程实战
│   ├── claude-code-workflow/                      # Claude Code 工作流
│   ├── gstack-best-practices/                     # gstack 工作流最佳实践
│   ├── tdd-with-ai/                               # AI 驱动的测试开发
│   └── git-worktree-patterns/                     # Git Worktree 协作模式
└── .github/workflows/                             # GitHub Actions CI/CD
```

## 技术栈

- [Astro](https://astro.build/) — 静态站生成
- [Vitest](https://vitest.dev/) — 单元测试
- [GitHub Pages](https://pages.github.com/) — 部署

## License

MIT
