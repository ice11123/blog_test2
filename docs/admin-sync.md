# 管理台同步到 GitHub（状态服务已接入，写入待 OAuth）

`blog_test2` 的独立 Worker 与 KV 已部署，主页和管理台使用其健康检查与公共仓库状态。GitHub OAuth App 尚未配置，所以管理台仍只支持本地草稿与导出，远程写入开关保持关闭。Worker 已固定目标为 `ice11123/blog_test2/main`，目标不匹配时写接口返回 503。

管理台通过 Cloudflare Worker 完成 GitHub OAuth 和文章提交：

```text
管理台 → GitHub OAuth → Worker HttpOnly Cookie 会话 → GitHub Git Data API 单次提交 → main → Pages Actions

管理台同时通过只读状态接口显示发布链路健康度：

```text
GET /health      → Worker 与 KV 基础状态（不要求登录）
GET /api/status  → GitHub 账号、仓库 main HEAD、最近一次 Pages Actions（要求登录）
GET /api/public-status → 首页公共仓库与部署状态（不要求登录）
```
```

## 安全边界

- 未来 OAuth 回调必须固定回到 `https://ice11123.github.io/blog_test2/admin/`，不接受外部 `returnTo`。
- GitHub session 只保存在 Worker KV，并通过 `blog_session` HttpOnly Cookie 使用。
- 前端不再保存 bearer session，也不会处理 `admin_token` URL 参数。
- `/auth/me` 返回短期 CSRF token；前端只在当前页面内存保存该 token。
- `/health` 和 `/api/status` 都要求精确的博客 Origin；状态响应不返回 OAuth token、Secret、CSRF token 或内部错误堆栈。
- `/api/public-status` 同样要求精确 Origin，但不读取管理员 Cookie；结果在 KV 中缓存 90 秒，上游失败时只以 `stale: true` 返回已有旧缓存。
- `/api/status` 是只读接口，不要求 CSRF token；`/api/sync` 与 `/api/delete` 等写接口仍必须校验 CSRF。
- `/api/sync` 必须带本站 Origin、有效 HttpOnly Cookie 和 `X-CSRF-Token`。
- 未来 Worker 只允许 GitHub 用户 `ice11123`，目标仓库为 `ice11123/blog_test2` 的 `main` 分支。
- 管理台状态采用事件触发刷新：页面打开、OAuth 恢复、发布、删除或手动点击“重新检测”时更新，不做固定轮询。
- OAuth token 使用 `SESSION_SECRET` 派生的 AES-GCM 密钥加密后再写入 KV。
- 文章改名、移动和删除通过 Git Tree 单次提交完成，不再产生中间的新旧双版本。
- 目标路径已存在且不属于当前文章时返回 409，避免覆盖其他文章。

## 部署配置

首次部署或迁移 Cloudflare 账号时，在 `worker/` 目录执行：

首先创建 `blog_test2` 独立 KV namespace，并将其真实 ID 替换到 `worker/wrangler.toml`；配置仍为占位符时禁止部署。

```powershell
npx wrangler login
npx wrangler secret put GITHUB_OAUTH_CLIENT_ID
npx wrangler secret put GITHUB_OAUTH_CLIENT_SECRET
npx wrangler secret put SESSION_SECRET
npx wrangler deploy
```

GitHub OAuth App 的 callback URL 必须是：

```text
https://YOUR_WORKER_DOMAIN/auth/callback
```

在仓库 Settings → Secrets and variables → Actions → Variables 中配置：

```text
PUBLIC_ADMIN_SYNC_API_URL=https://blog-test2-admin-api.2799587522.workers.dev
PUBLIC_CLOUD_PUBLISH_ENABLED=false
```

当前使用 `blog-test2-SESSIONS` 独立会话命名空间。完成 OAuth 回调验证前不得把 `PUBLIC_CLOUD_PUBLISH_ENABLED` 改为 `true`。

## 请求接口

前端请求必须使用 `credentials: "include"`。发布请求还必须带：

```http
Origin: https://ice11123.github.io
X-CSRF-Token: <来自 /auth/me 的 csrfToken>
```

发布接口 `/api/sync` 的请求体为 `{ "post": ... }`；删除接口 `/api/delete` 的请求体为 `{ "publishedPath": ..., "title": ... }`。成功响应包含 `commitSha`、`commitUrl` 和规范化后的 `path`。

## 验证

```powershell
curl.exe -i -X OPTIONS "https://YOUR_WORKER_DOMAIN/api/sync" `
  -H "Origin: https://ice11123.github.io" `
  -H "Access-Control-Request-Method: POST" `
  -H "Access-Control-Request-Headers: content-type,x-csrf-token"

curl.exe -i "https://YOUR_WORKER_DOMAIN/auth/me" `
  -H "Origin: https://ice11123.github.io"
```

OPTIONS 应返回 204，并包含精确的 `Access-Control-Allow-Origin`、`Access-Control-Allow-Credentials: true` 和 `X-CSRF-Token`。
