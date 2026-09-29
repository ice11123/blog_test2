---
title: "01｜静态架构与构建链：一次请求之前发生了什么"
description: "从 Astro 配置、依赖与 GitHub Pages 子路径出发，解释 blog_test2 的静态生成架构及其工程边界。"
pubDate: "2026-09-29"
author: "离子怪"
sourceUrl: "https://github.com/ice11123/blog_test2/blob/main/astro.config.mjs"
dir1: "AI/Agent协作与开发"
dir2: "网站开发与维护"
tags: ["Astro", "静态站点", "构建", "GitHub Pages"]
---

## 摘要

本站采用 Astro 的静态输出模式：文章和页面在部署前被生成成 HTML、CSS 与 JavaScript 文件，访问者不需要等待服务器现场渲染。本文从一个新手最容易忽略的问题开始——浏览器请求到来之前，仓库里已经发生了什么——依次分析配置、构建、子路径和客户端增强，并给出可复现的检查方法。

**关键词：** 静态站点生成；Astro；构建产物；基础路径；渐进增强

## 1. 问题定义：静态不等于没有程序

静态站点常被误解为“只有 HTML”。实际上，本站在构建阶段执行内容读取、Markdown 转换、图片优化、路由生成和类型检查；在浏览器阶段再执行主题切换、搜索、目录跟随与主页手势。区别只在于：首个页面主体可以由预先生成的文件直接返回。

```mermaid
flowchart LR
  A[Markdown / Astro / 图片] --> B[Astro 构建]
  B --> C[dist 静态文件]
  C --> D[GitHub Pages]
  D --> E[浏览器]
  E --> F[按需运行交互脚本]
```

## 2. 配置如何决定站点形态

根目录的 [`astro.config.mjs`](https://github.com/ice11123/blog_test2/blob/main/astro.config.mjs) 是构建入口。当前配置明确指定静态输出、站点域名和 `/blog_test2` 基础路径，并启用 MDX、站点地图、压缩以及 Markdown 处理插件。

基础路径不是装饰配置。例如页面逻辑上叫 `/blog/`，部署后实际地址需要位于 `/blog_test2/blog/`。本站通过 `src/lib/urls.ts` 等集中处理站内 URL，避免组件各自拼接路径。新手若把 `/src/assets/...` 或 `/blog/...` 直接写进生产链接，本地根路径预览可能正常，Pages 子路径却会失效。

## 3. 构建阶段的职责分解

### 3.1 依赖与脚本

[`package.json`](https://github.com/ice11123/blog_test2/blob/main/package.json) 将职责分为四类：

- `astro build` 生成生产文件；
- `astro check` 检查 Astro 与 TypeScript；
- `pnpm test` 串联根项目和 Worker 测试；
- `postbuild` 额外校验高数笔记的构建结果。

这里体现了一个维护原则：不能只验证“能编译”。内容型站点还需要验证关键文章、资源和链接确实进入产物。

### 3.2 页面生成

固定页面由 `src/pages` 的文件路径产生；动态文章页在构建时读取内容集合，并通过 `getStaticPaths()` 为每篇文章生成地址。也就是说，所谓“动态路由”在这里描述的是源码的参数化写法，而不是线上服务器每次执行数据库查询。

### 3.3 图片与样式

放在 `src/assets` 且经 Astro 图片组件处理的图片，会在构建期产生适合不同视口的格式和尺寸。样式则由全局基础、布局样式和组件局部样式共同组成。生产构建会做压缩，但压缩不能修复不合理的运行时结构，它只能缩小传输体积。

## 4. 浏览器端为何仍有 JavaScript

静态 HTML 负责可读的初始内容，JavaScript 只增强需要状态的部分：

- 主题按钮保存亮暗偏好；
- 搜索首次使用时动态加载 Fuse；
- 右侧目录根据滚动位置更新；
- 主页壁纸把滚轮、触摸输入映射为连续进度；
- 状态、语言和贡献数据在接近可见区域时请求。

这是一种“静态优先、按需增强”架构。维护时应问：没有脚本时内容是否仍可阅读？脚本是否只在对应页面初始化？路由切换后是否正确清理？

## 5. 本地复现实验

```bash
pnpm run check
pnpm run build
pnpm run preview
```

预览后重点检查网络请求路径是否带 `/blog_test2/`，并在 `dist` 中确认首页、博客列表和本文都生成了 HTML。不要直接双击 `dist/index.html` 判断成败；站点使用绝对基础路径，应由 HTTP 服务器按部署结构提供文件。

## 6. 局限与架构边界

静态输出擅长读取多、写入少的博客，但不适合把敏感令牌放进前端，也不能自行完成安全的 GitHub 写操作。本站因此把公开页面、状态 Worker 和未来写入能力分开；当前云发布开关仍关闭。静态托管也不等于性能自动优秀，大图片、昂贵动画和过早请求仍会拖慢浏览器。

## 7. 结论

本站的底层不是“GitHub Pages 上的一堆文件”，而是一条在部署前完成大部分工作的静态生成流水线。理解配置、基础路径与浏览器增强的分界，是继续学习内容系统和运行时维护的前提。

[下一篇：02｜内容模型、路由与发现机制](/blog_test2/blog/ai-agent协作与开发/网站开发与维护/02-content-routing-discovery/)
