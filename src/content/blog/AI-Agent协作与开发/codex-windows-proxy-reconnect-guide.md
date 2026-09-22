---
title: "Codex 反复重连怎么办：开源 Windows 代理排障 Agent 执行方案"
description: "一份先诊断、再配置、可验证也可回滚的 Windows Codex 代理排障方案，帮助 Agent 正确处理 reconnect/retry，而不是盲猜端口或修改安装文件。"
pubDate: "2026-09-22"
updatedDate: "2026-09-22"
author: "离子怪"
sourceUrl: "https://github.com/ice11123/codex-windows-proxy-reconnect-guide"
dir1: "AI/Agent协作与开发"
dir2: "Codex 故障排查"
tags: ["Codex", "Windows", "代理", "故障排查", "Agent"]
---

Codex 桌面端或 CLI 反复出现 `reconnect`、`retry` 时，最容易犯的错误是立即认定“代理没配好”，然后凭印象写入一个端口。这样做可能暂时绕过现象，也可能把 SOCKS 端口当成 HTTP 代理、污染用户环境，甚至掩盖真正的认证或服务端问题。

我把一套可交给 Agent 直接执行的 Windows 排障流程整理成了独立开源仓库：

[打开 codex-windows-proxy-reconnect-guide](https://github.com/ice11123/codex-windows-proxy-reconnect-guide)

它的重点不是某一条“万能代理命令”，而是建立一条可以重复验证、失败后能够回滚的证据链。

## 重连是症状，不是原因

连续重连可能来自多个层面：本地代理端口没有监听、HTTP 与 SOCKS 协议混用、代理节点抖动、WebSocket 断开、认证过期、服务端限流，或者第三方启动器与注入工具影响连接。

因此，执行方案把“发现事实”和“修改配置”分开。只有系统代理、端口监听与实际请求共同证明代理链路有效后，Agent 才能进入写入阶段。

这也意味着：如果没有查到明确地址，或者候选端口并未监听，正确行为是停止并询问用户，而不是继续尝试常见的 `7890`、`7897` 或其他猜测值。

## 六步执行流程

### 1. 读取系统代理并检查监听端口

方案首先读取 Windows 当前用户的 Internet Settings，再列出本机回环地址上的监听端口。系统设置只能提供候选值，端口处于监听状态才说明本地确实有服务接收连接。

### 2. 用无凭据请求验证网络路径

确认 HTTP 代理地址后，分别请求 `chatgpt.com` 与 OpenAI API。这里不需要把 API Key 写进命令：网页返回成功、跳转或拒绝状态，API 返回 `401`，都足以证明 DNS、TLS 和代理链路已经建立。

如果结果是 `000`、连接超时或无法连接代理，才应继续检查代理软件和端口。HTTP 状态码不是“业务调用成功”的证明，但能帮助我们把网络问题与身份验证问题分开。

### 3. 把 `.env` 当作记录，而不是唯一生效来源

指南提供了 `HTTP_PROXY`、`HTTPS_PROXY`、`ALL_PROXY` 与 `NO_PROXY` 的 `.env` 模板，同时明确提醒：不能假设 Codex 桌面端一定自动读取 `~/.codex/.env`。

官方文档把 `~/.codex/config.toml` 列为 Codex 的用户配置入口，但没有把 `.env` 描述为桌面端必然加载的持久配置。因此，只创建文件后看到内容正确，还不能宣称问题已经修复。

### 4. 设置 Windows 用户级环境变量

用户级环境变量可以由新启动的 Codex、终端及其子进程继承。方案只写入已经验证的代理地址，并保留 `localhost`、`127.0.0.1` 与 `::1` 的直连例外。

如果代理 URL 含用户名、密码或其他凭据，不应通过容易进入历史记录和日志的命令传播。仓库示例使用无认证的本机回环代理，不包含任何真实账号或令牌。

### 5. 通过新进程让配置生效

修改用户环境变量不会可靠地改变已经运行的 Codex 进程。用户需要先保存工作，再完全退出 Codex 与相关启动器，随后从新的进程重新打开。

Agent 不应为了“自动化到底”而强行终止自己正在服务的 Codex 会话。这个动作会切断当前任务，也可能让用户误以为配置失败。

### 6. 同时验证用户值、进程值与真实使用

回归阶段会同时读取用户级和进程级的四个代理变量，重新执行代理请求，并观察实际使用中是否还会连续重连。

只有这三层结果一致，才能把问题标记为已解决。若重连仍然存在，就应该收集精确错误、时间戳和日志，继续区分 WebSocket、限流、认证、节点与第三方启动器问题。

## 一个经常被误用的配置项

`permissions.<name>.network.proxy_url` 看起来像“代理地址”，但它描述的是 Codex 网络沙箱用于注入代理环境变量的本地 HTTP 监听器。官方权限文档给出的默认值也是 `http://127.0.0.1:3128`。

它不是 Clash、Mihomo 或公司代理的上游地址。若要让沙箱代理遵循外部上游代理，应理解 `allow_upstream_proxy` 与进程环境变量之间的关系，而不是把上游地址直接覆盖到监听器字段。

这一区分很重要：一个负责“本地工具连接到哪里”，另一个负责“本地代理再从哪里出网”。把二者混为一谈会让排障结果更加不可预测。

## 如何交给 Agent 执行

可以把仓库 README 提供给具备 PowerShell 和本机文件权限的 Agent，并使用下面的要求：

> 按照仓库中的执行方案诊断 Codex 反复重连。先只读检查系统代理和端口监听，再做无凭据网络测试。没有确认真实 HTTP 代理地址前不要修改任何配置；每次写入都要给出验证结果和回滚方法。

这句话刻意限制了 Agent 的权限边界。它允许 Agent 收集证据和执行必要配置，但不允许猜测端口、修改 Codex 安装包，或把“文件已经写入”当成“连接已经恢复”。

## 回滚也是方案的一部分

仓库提供了用户级环境变量的清理命令，并提醒在删除配置后重新启动 Codex。`.env` 中对应行也可以单独移除，不需要删除整个 Codex 配置目录。

排障文档如果只讲“如何写入”，却没有说明“如何撤销”，就不适合交给自动化 Agent。可逆性不仅降低误配置成本，也能通过对照实验判断某项设置是否真的影响故障。

## 开源仓库与依据

完整 PowerShell 命令、状态码判定、回归检查和回滚步骤都在 GitHub 仓库中：

[ice11123/codex-windows-proxy-reconnect-guide](https://github.com/ice11123/codex-windows-proxy-reconnect-guide)

项目采用 MIT License，由离子怪维护。它是社区排障指南，不是 OpenAI 官方项目；涉及 Codex 配置和网络权限语义时，应以仓库链接的官方文档为准。

- [Codex 环境变量文档](https://learn.chatgpt.com/docs/config-file/environment-variables)
- [Codex 高级配置文档](https://learn.chatgpt.com/docs/config-file/config-advanced)
- [Codex 权限与网络代理文档](https://learn.chatgpt.com/docs/permissions)
