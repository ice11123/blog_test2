---
title: "03｜页面布局、主题与响应式边界"
description: "拆解本站顶栏、个人侧栏、正文与文章目录的层次，以及亮暗双主题和移动抽屉的实现边界。"
pubDate: "2026-09-29"
author: "离子怪"
sourceUrl: "https://github.com/ice11123/blog_test2/blob/main/src/layouts/PublicLayout.astro"
dir1: "AI/Agent协作与开发"
dir2: "网站开发与维护"
tags: ["布局", "响应式", "主题", "无障碍"]
---

## 摘要

本站页面同时承载全局导航、个人信息、内容目录和正文。若只用“桌面缩小版”理解移动端，侧栏会遮挡正文、滚动区域会重复、主题切换也容易闪烁。本文从信息层级出发，分析公共布局、文章三栏、移动抽屉与亮暗双主题如何协作，并说明视觉层次背后的语义和可访问性要求。

**关键词：** 响应式布局；侧栏；主题；View Transitions；可访问性

## 1. 布局问题不是摆放问题

页面的四个主要区域具有不同生命周期：

- 顶栏提供全站导航，滚动时仍需稳定可达；
- 左栏提供个人、目录、标签三个上下文视图；
- 中栏承载当前页面或文章；
- 右栏只在文章页提供章节目录。

[`src/layouts/PublicLayout.astro`](https://github.com/ice11123/blog_test2/blob/main/src/layouts/PublicLayout.astro) 负责公共外壳，文章再由 [`BlogPost.astro`](https://github.com/ice11123/blog_test2/blob/main/src/layouts/BlogPost.astro) 组合正文与目录。将这些职责分开，可以避免每个页面复制断点和侧栏状态。

## 2. 桌面三栏的语义分工

桌面文章布局可以抽象为：

```text
┌────────────── 顶栏 ──────────────┐
│ 左：站点上下文 │ 中：文章 │ 右：本文目录 │
└─────────────────────────────────┘
```

左栏宽度相对稳定，中栏必须允许收缩，右栏宽度受控。CSS 中 `min-inline-size: 0` 很关键：网格或 flex 子项默认最小宽度可能由长代码、公式或标题撑开，导致移动端“看起来像页面被裁掉”。正文宽内容应在自己的容器内处理横向溢出，而不是让整个页面横向滚动。

## 3. 移动端不是把侧栏删掉

窄屏没有同时展示三栏的空间，但个人信息和文章目录仍有价值。本站通过 [`MobileSidebarControls.astro`](https://github.com/ice11123/blog_test2/blob/main/src/components/layout/MobileSidebarControls.astro) 提供左右入口，把两侧内容变成覆盖式抽屉。抽屉打开时需要同时管理：

1. 按钮的 `aria-expanded`；
2. 遮罩与面板的可见状态；
3. Escape 和点击遮罩关闭；
4. 页面切换后的状态清理；
5. 焦点与滚动不能落入隐藏内容。

这也是为什么“只写一个 `transform`”并不等于完成移动适配。交互状态必须和视觉状态一致。

## 4. 左侧三视图与右侧文章目录

[`PersistentSidebar.astro`](https://github.com/ice11123/blog_test2/blob/main/src/components/layout/PersistentSidebar.astro) 将左栏分成个人、目录、标签三个互斥视图。它回答的是站点级问题；右侧 [`ArticleTocSidebar.astro`](https://github.com/ice11123/blog_test2/blob/main/src/components/layout/ArticleTocSidebar.astro) 回答的是“当前文章读到哪里”。两者如果混在同一滚动区域，用户会无法区分站点导航与文章导航，也更容易出现双滚动条。

右侧目录的标题 ID 由 Markdown 管线生成，客户端目录脚本只读取并跟踪它们，而不是重新命名。这样外部深链接、标题自链接和高亮目录使用同一个锚点。

## 5. 亮暗双主题的状态模型

当前真实实现只有 `light` 与 `dark` 两种主题。主题模块会读取 `blog-test2-theme`，兼容旧值并回退到系统偏好；按钮显示太阳或月亮，并更新无障碍名称。

指针点击时，支持 View Transitions 的浏览器会以按钮为圆心做圆形过渡：亮到暗向外揭示，暗到亮反向收回。键盘操作、降低动态偏好或不支持该 API 时立即切换。这种分支不是“少做效果”，而是尊重输入方式：键盘高频操作不应被装饰动画延迟。

## 6. 视觉层次如何形成

本站使用背景、边界、阴影和间距区分层级，而不是给每块内容使用强烈颜色。维护时可按以下顺序检查：

1. 先看信息层级：标题、元数据、正文、辅助导航是否主次明确；
2. 再看空间层级：顶栏和侧栏是否与正文分离；
3. 最后看装饰：阴影、渐变和动画是否帮助理解状态。

若反过来先加动效，常会得到“很热闹但不知道哪里能点”的页面。

## 7. 验证方法

在至少 1440、1024、390 与 320 像素宽度检查：页面 `scrollWidth === clientWidth`；桌面栏不覆盖正文；移动抽屉能开关；Tab 不进入隐藏面板；长标题、代码块和公式不撑宽页面；降低动态模式没有大范围位移。

## 8. 局限与结论

三栏结构适合本站当前信息密度，但并非所有页面都需要右栏。新增组件时应先判断它属于全站、页面还是文章上下文。主题目前明确是亮暗双主题；历史文档中曾出现“六套主题”表述，那不是当前实现，维护说明必须以代码为准。

[上一篇：02｜内容模型、路由与发现机制](/blog_test2/blog/ai-agent协作与开发/网站开发与维护/02-content-routing-discovery/) · [下一篇：04｜主页壁纸动效状态机](/blog_test2/blog/ai-agent协作与开发/网站开发与维护/04-motion-state-machine/)
