# 离子怪的博客

基于 Astro 构建的静态个人博客，部署在 GitHub Pages：

<https://ice11123.github.io/blog_test2/>

## 本地开发

环境要求：Node.js 22.12 或更高版本、pnpm 11。

```bash
pnpm install
pnpm run dev
pnpm run check
pnpm run build
pnpm run preview
```

## 添加文章

在 `src/content/blog/` 下创建 Markdown 或 MDX 文件。文件夹会自动成为文章分类：

```md
---
title: '文章标题'
description: '文章摘要'
pubDate: '2026-08-11'
tags: ['标签']
---

正文内容
```

## DIY 入口

- `src/consts.ts`：站点名称、作者、GitHub 用户名和分类排序。
- `src/styles/themes/`：六套主题颜色。
- `src/components/`：布局、博客卡片、搜索和 MDX 组件。
- `src/content/blog/`：文章内容。
- `astro.config.mjs`：域名与 GitHub Pages 子路径。

## 功能

- 文件夹分类、标签和全文模糊搜索
- 三栏响应式布局及可折叠侧栏
- 六套明暗主题
- KaTeX 数学公式、Mermaid 图表和代码高亮
- RSS、Sitemap、robots.txt 和 JSON-LD
- GitHub 数据组件及站点统计
- Plot3D、Bilibili、MiniBrowser、Spoiler、FriendLinks 等 MDX 组件

## 管理台原型

站名支持在神秘操作后，触发输入密码，打开 `/admin/` 管理台原型。当前版本只把文章草稿保存到浏览器 `localStorage`，不写入 GitHub，也不具备真正的身份认证；页面会明确显示此安全边界。

这是独立的视觉实验版：管理台保留文章目录、本地草稿、实时预览和文件导出，但云端“发布到正式网站”按钮已明确禁用，不会请求 OAuth、Worker 或 GitHub 写接口。后续如要启用发布，需要为 `blog_test2` 单独配置 Worker、OAuth 回调和仓库权限。

## 本地一键发布文章（无需 API）

在 `/admin/` 编辑文章后点击“导出当前文件”，将下载的 `.md` 或 `.mdx` 文件保存到本仓库目录，然后运行：

```powershell
pnpm publish:article -- "C:\\Users\\你的用户名\\Downloads\\文章标题.mdx"
```

脚本会按 `dir1` / `dir2` 自动写入 `src/content/blog/`，执行检查和构建，创建提交并推送到 `origin/main`。GitHub Actions 会自动部署实验版网站。

仅本地检查、不推送：

```powershell
pnpm publish:article -- "文章文件.mdx" --no-push
```

如需启用前端原型密码门槛，请先在本地生成 SHA-256 哈希：

```powershell
node -e "const c=require('crypto'); process.stdout.write(c.createHash('sha256').update(process.argv[1]).digest('hex'))" "替换为你自己的密码"
```

将输出的哈希填入 `src/consts.ts` 的 `ADMIN_PASSWORD_HASH`。不要提交明文密码。前端哈希只能防止普通访客误入，不能替代服务端登录和 GitHub 仓库权限控制。

## 源码来源与授权

本项目基于众网友个人博客的优点借鉴与参考进行迁移和修改，感谢热心作者提供源码并授权使用、修改和发布。

原项目的文章、个人资料、联系方式、社交账号、友情链接、图片资源及 Git 历史均未迁移。

本仓库暂未提供面向第三方的开源许可证。除上述原作者授权外，未经许可请勿复制、修改或再发布本仓库代码。
