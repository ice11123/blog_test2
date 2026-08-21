# Cloudflare Worker 管理 API（当前实验版未部署）

`blog_test2` 本轮仅做首页视觉实验，Pages 构建不会部署此 Worker，管理台发布按钮也保持禁用。代码中的仓库目标和回跳路径已经统一为 `blog_test2`，写接口也会拒绝非 `ice11123/blog_test2/main` 的配置，但此目录仍只是未来接入参考，不能用于当前站点的发布链路。

`wrangler.toml` 中的 KV namespace 使用明确占位符。未来启用前必须创建 `blog_test2` 独立 KV、替换真实 ID，并完成 Secret 配置；在此之前不要执行部署。

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

以下步骤仅供未来启用时使用，当前版本不要执行。先创建独立 KV namespace，并将真实 ID 写入 `wrangler.toml`。

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
```
