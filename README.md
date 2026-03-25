# followAI

> AI Coding 最佳实践展示平台

本项目是一个静态站点，在 `examples/` 中展示独立的交互式内容。

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
│   ├── cursor-tips/                               # Cursor 使用技巧
│   ├── prompt-engineering/                         # 提示工程实战
│   ├── claude-code-workflow/                       # Claude Code 工作流
│   ├── gstack-best-practices/                     # gstack 工作流最佳实践
│   ├── tdd-with-ai/                               # AI 驱动的测试开发
│   └── git-worktree-patterns/                     # Git Worktree 协作模式
└── vercel.json                                    # 部署配置
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

## 部署

项目部署到 Vercel。Push 到 main 分支自动部署。

## 技术栈

- [Astro](https://astro.build/) — 静态站生成
- [Vitest](https://vitest.dev/) — 单元测试
- [Vercel](https://vercel.com/) — 部署

## License

MIT
