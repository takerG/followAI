# Design System — Follow AI

## Product Context
- **What this is:** AI 编程最佳实践的沉浸式学习站——每个示例是一个独立的交互式网页，而非传统文字教程
- **Who it's for:** 中国开发者，想系统学习 AI 编程工具和工作流的人
- **Space/industry:** 开发者教育 / AI 编程工具
- **Project type:** 静态内容展示站 (Astro v6, GitHub Pages)

## Aesthetic Direction
- **Direction:** 暗色极简 (Brutally Minimal)
- **Decoration level:** minimal — 字体和留白做全部工作，装饰元素接近于零
- **Mood:** 精密仪器的控制面板。安静、克制、但一看就知道"这不是普通博客"。品牌色像仪器面板上的指示灯——只在关键位置亮起
- **Reference sites:** Vercel (monochromatic restraint), Linear (opacity-based depth), GitHub Dark

## Typography
- **Display/Hero:** Geist (weight 700-800) — Vercel 出品的几何无衬线，开发者工具领域最受认可的字体之一。中文 fallback: "PingFang SC", "Microsoft YaHei", system-ui
- **Body:** Geist (weight 400) — 同字族保持一致性，靠字重区分层级
- **UI/Labels:** Geist (weight 500-600) — section titles, button labels
- **Data/Tags:** Geist Mono (weight 400-500) — tag 标签、计数器、代码片段。monospace 立刻传递"技术内容"信号
- **Code:** Geist Mono
- **Loading:** Google Fonts CDN `https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap`
- **Scale:**
  - Hero: 3rem (48px), weight 800, letter-spacing: -0.02em
  - H1: 2.5rem (40px), weight 800
  - H2/Section: 1rem (16px), weight 600
  - Body: 0.95rem (15.2px), weight 400, line-height: 1.7
  - Small/Tags: 0.7rem (11.2px), weight 500, letter-spacing: 0.03em (Geist Mono)
  - Caption: 0.65rem (10.4px), weight 500

## Color

### Approach: Restrained
品牌色只在 CTA 按钮、hover 微光、focus 状态出现。正文区域完全靠灰度层级和 opacity 创造深度。

### Dark Mode (Primary)

| Token | Hex / Value | Usage |
|-------|-------------|-------|
| `--bg-base` | `#0a0a12` | 页面底色，近黑带微紫 |
| `--bg-surface-1` | `#12121e` | 卡片、弹窗、CTA 区域底色 |
| `--bg-surface-2` | `#1a1a2e` | 输入框、tag、hover 态底色 |
| `--bg-surface-hover` | `#1e1e32` | surface-2 的 hover 态 |
| `--text-primary` | `#e6edf3` | 标题、正文主色（非纯白——纯白刺眼） |
| `--text-secondary` | `rgba(230,237,243,0.7)` | 描述文字 |
| `--text-tertiary` | `rgba(230,237,243,0.4)` | 辅助文字、placeholder |
| `--text-disabled` | `rgba(230,237,243,0.25)` | 禁用态文字 |
| `--brand` | `#667eea` | 品牌强调色（单色使用，非渐变） |
| `--brand-glow` | `rgba(102,126,234,0.15)` | hover 微光、box-shadow |
| `--brand-subtle` | `rgba(102,126,234,0.08)` | focus ring、alert-info 背景 |
| `--border-default` | `rgba(255,255,255,0.06)` | 默认边框 |
| `--border-hover` | `rgba(255,255,255,0.12)` | hover 态边框 |
| `--border-brand` | `rgba(102,126,234,0.3)` | 品牌色边框（卡片 hover） |

### Light Mode

| Token | Hex / Value | Usage |
|-------|-------------|-------|
| `--bg-base` | `#fafbfe` | 页面底色 |
| `--bg-surface-1` | `#ffffff` | 卡片底色 |
| `--bg-surface-2` | `#f0f1f8` | 输入框、tag 底色 |
| `--bg-surface-hover` | `#e8e9f4` | hover 态 |
| `--text-primary` | `#0a0a12` | 标题、正文 |
| `--text-secondary` | `rgba(10,10,18,0.65)` | 描述文字 |
| `--text-tertiary` | `rgba(10,10,18,0.4)` | 辅助文字 |
| `--brand` | `#5a6fd6` | 品牌色（略暗于 dark mode 版本，保证对比度） |

### Semantic Colors

| State | Hex | Usage |
|-------|-----|-------|
| Success | `#34d399` | 成功提示、通过状态 |
| Warning | `#fbbf24` | 警告提示 |
| Error | `#f87171` | 错误提示 |
| Info | `var(--brand)` | 信息提示，复用品牌色 |

### Shadows

| Token | Value |
|-------|-------|
| `--shadow-card` | `0 1px 2px rgba(0,0,0,0.3)` |
| `--shadow-card-hover` | `0 8px 30px rgba(0,0,0,0.4), 0 0 20px var(--brand-glow)` |

### Background Glow
顶部品牌色径向光晕：
```css
background-image: radial-gradient(
  ellipse 60% 40% at 50% 0%,
  rgba(102, 126, 234, 0.06) 0%,
  transparent 60%
);
background-size: 100% 600px;
background-repeat: no-repeat;
```

## Spacing
- **Base unit:** 8px
- **Density:** comfortable
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px)

## Layout
- **Approach:** grid-disciplined — 严格的列对齐，可预测的间距
- **Grid:** `grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))` with 24px gap
- **Max content width:** 1200px
- **Border radius:**
  - sm: 6px (tags, small elements)
  - md: 10px (buttons, inputs)
  - lg: 14px (cards, panels)
  - full: 9999px (pills, badges)

## Motion
- **Approach:** minimal-functional — 只有帮助理解空间关系的过渡动画
- **Easing:** enter: ease-out, exit: ease-in, move: ease-in-out
- **Duration:**
  - micro: 100ms (color transitions)
  - short: 200ms (hover transforms, border-color)
  - medium: 300ms (layout shifts)
- **Card hover:** `translateY(-4px)` + border-color transition + brand glow shadow
- **No decorative animations.** 没有入场动画、没有滚动触发动画、没有 loading skeleton shimmer

## Card Cover Gradients
保留现有的 8 个封面渐变色——这些在暗色底上反而更有冲击力：
```
#667eea → #764ba2 (brand indigo→purple)
#f093fb → #f5576c (pink→coral)
#4facfe → #00f2fe (blue→cyan)
#43e97b → #38f9d7 (green→teal)
#fa709a → #fee140 (rose→yellow)
#a18cd1 → #fbc2eb (lavender→pink)
#fccb90 → #d57eeb (peach→purple)
#0c3483 → #a2b6df (navy→sky)
```

## Anti-Patterns — 明确禁止
- ❌ 品牌色渐变用作文字 clip（这是 AI slop 标志）
- ❌ 3 列图标网格作为首屏内容
- ❌ 所有内容居中对齐（section header 用 flex left-align）
- ❌ 装饰性色块、blobs、背景图案
- ❌ 纯白文字（用 #e6edf3 代替）
- ❌ 纯黑底色（用 #0a0a12 带微紫调）
- ❌ `!important` 的使用

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-27 | 选择暗色极简方向 | 在中文 AI 编程教育领域最具辨识度，传递"这不是普通博客"的信号 |
| 2026-03-27 | Geist + Geist Mono 字体组合 | 开发者工具领域最受认可的字体，几何感现代无衬线 |
| 2026-03-27 | 品牌色从渐变改为单色 #667eea | 克制使用创造高价值感知，渐变 clip 是 AI slop 标志 |
| 2026-03-27 | Tag 使用 Geist Mono | 立刻传递"技术内容"信号，暗色 UI 中 monospace 标签是经典做法 |
| 2026-03-27 | 暗色底 #0a0a12 带微紫调 | 纯黑太扁平，微紫调与品牌色 #667eea 呼应，创造空间深度 |
| 2026-03-27 | 卡片靠表面色差浮起，非阴影 | 暗色 UI 中阴影几乎不可见，表面色差是正确的深度信号 |
| 2026-03-27 | 保留封面渐变色 | 8 种渐变色在暗色底上更有冲击力，是卡片的视觉锚点 |
