# Cloudflare Worker 管理 API

`blog_test2` 的 Worker 与独立 KV 已于 2026-08-24 部署到 `https://blog-test2-admin-api.2799587522.workers.dev`。主页和管理台已接入健康检查及公共仓库状态；GitHub OAuth App 尚未配置，因此远程发布按钮继续关闭，不能将“状态服务可用”误写成“云端写入已启用”。

`wrangler.toml` 绑定 `blog-test2-SESSIONS` 独立 KV，`SESSION_SECRET` 已通过 Cloudflare Secret 配置，不进入仓库。GitHub OAuth Client ID/Secret 仍必须在正式启用写入前配置。

Worker 负责 GitHub OAuth 和管理台文章发布。GitHub OAuth token 加密后保存在 Worker KV，会话通过 HttpOnly Cookie 传递给本站管理台。

此外提供两个状态接口：

- `GET /health`：检测 Worker 配置和 KV 绑定，不要求登录，但要求合法 Origin。
- `GET /api/status`：使用当前 HttpOnly 会话读取目标仓库 `main` HEAD 和最近一次 `deploy.yml` 工作流状态。
- `GET /api/public-status`：首页匿名只读状态，不要求 Cookie 或 CSRF；返回脱敏后的仓库 HEAD 与 Pages 状态。

状态接口只返回展示所需的布尔状态、时间、公开 GitHub URL 和短期运行信息，不返回任何 Secret、OAuth token、CSRF token 或原始 GitHub 错误。

公共状态使用 KV 缓存 90 秒。GitHub 匿名 API 暂时失败但存在旧缓存时，接口返回旧数据并标记 `stale: true`；无缓存时返回安全的 503，不暴露上游错误。

## OAuth 配置

GitHub Developer Settings → OAuth Apps：

1. Homepage URL：`https://ice11123.github.io/blog_test2/`
2. Authorization callback URL：`https://YOUR_WORKER_DOMAIN/auth/callback`

## 部署

当前 Worker 已部署。首次部署或迁移账号时，先创建独立 KV namespace，并将真实 ID 写入 `wrangler.toml`。

在 `worker/` 目录执行：

```powershell
npx wrangler login
npx wrangler secret put GITHUB_OAUTH_CLIENT_ID
npx wrangler secret put GITHUB_OAUTH_CLIENT_SECRET
npx wrangler secret put SESSION_SECRET
npx wrangler deploy
```

不要把 OAuth Secret、Session Secret、GitHub Token 写入仓库。

## 运行约束

- 仅允许 Origin `https://ice11123.github.io`。
- 仅允许 GitHub 用户 `ice11123`。
- 未来仅写入 `ice11123/blog_test2/main`。
- `/api/sync` 需要 HttpOnly Cookie 和 `X-CSRF-Token`。
- `/api/delete` 使用同一套会话与 CSRF 校验删除正式文章。
- OAuth 回调固定到 `/blog_test2/admin/`，不接受任意 `returnTo`，不会把 session token 放进 URL。
- 文章新建、更新、移动和删除通过 Git Data API 单次提交；目标路径冲突返回 409，不覆盖其他文章。
- GitHub API 请求设置 15 秒超时；OAuth token 使用 `SESSION_SECRET` 派生密钥进行 AES-GCM 加密。

## Pages 配置

在仓库 Actions Variables 中配置：

```text
PUBLIC_ADMIN_SYNC_API_URL=https://YOUR_WORKER_DOMAIN
PUBLIC_CLOUD_PUBLISH_ENABLED=false
```

当前 Pages 工作流使用真实 Worker URL，并保持 `PUBLIC_CLOUD_PUBLISH_ENABLED=false`。只有完成 GitHub OAuth App 配置并验证授权回调后，才可把该值改为 `true`。
