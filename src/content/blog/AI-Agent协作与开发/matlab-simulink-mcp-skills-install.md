---
title: "MATLAB / Simulink MCP + Skills：安装、更新与禁用指南"
description: "核对 2026 年 9 月官方版本，纠正旧安装提示词，区分 MCP、skills、MATLAB Add-On 与会话启用。"
pubDate: "2026-09-12"
updatedDate: "2026-09-12"
author: "离子怪"
sourceUrl: "https://github.com/ice11123/matlab-simulink-agent-install-guide"
dir1: "AI/Agent协作与开发"
dir2: "Agent 工具链"
tags: ["MATLAB", "Simulink", "MCP", "Skills", "Codex"]
---

本文与提示词采用 MIT 许可证。

让 Agent 能操作 MATLAB，需要同时处理 MCP、skills 和 MATLAB 会话。三个环节的更新速度与启用方式不同，旧提示词容易把“下载完成”误当成“已经可以运行”。这份文档以固定官方版本核验安装流程，并提供默认不启用的更新模式。

完整开源项目：[MATLAB / Simulink MCP + Skills 安装指南](https://github.com/ice11123/matlab-simulink-agent-install-guide)。文末包含可复制执行提示词。

> 文档许可证：MIT；第三方软件遵循各自许可证
> 最后核验：2026-09-12
> 默认模式：只更新文件，保持未启用

本文先说明版本与配置依据，最后提供可直接复制给 Agent 的执行提示词。阅读、审阅或发布本文，不代表授权执行其中的安装命令。

## 一、版本核验与旧版勘误

| 组件 | 本次核验版本 | 官方发布页 |
| --- | --- | --- |
| MATLAB MCP Server | `v0.13.0` | [v0.13.0](https://github.com/matlab/matlab-mcp-server/releases/tag/v0.13.0) |
| MATLAB Agentic Toolkit | `MATK-2026.09.a` | [MATK-2026.09.a](https://github.com/matlab/matlab-agentic-toolkit/releases/tag/MATK-2026.09.a) |
| Simulink Agentic Toolkit | `SATK-2026.09.b` | [SATK-2026.09.b](https://github.com/matlab/simulink-agentic-toolkit/releases/tag/SATK-2026.09.b) |

每次执行前重新检查官方发布页。记录 tag、发布日期和下载摘要，不把本文日期之后的变化当作已验证。

| 旧文档问题 | 本版处理 |
| --- | --- |
| 固定使用 `matlab-mcp-core-server` | 官方仓库已经更名为 `matlab-mcp-server`；旧链接可能重定向，下载文件名必须读实际 Release assets |
| 一概写“R2020b 以上” | MCP 与 MATLAB Toolkit 当前要求 R2021a+；现有会话连接和 Simulink Toolkit 要求 R2023a+ |
| 没有 MATLAB 也按完整安装成功处理 | 无 MATLAB 可下载文件或安装所需 skills，但不能报告 MCP / Simulink 运行验证通过 |
| 默认把所有客户端当作 Claude Code | 分别检查 Codex、Claude Code 和 VS Code 的真实配置；不假设 eva-cli 与 Claude 配置兼容 |
| 固定“14 个 MATLAB 插件 + 7 个 Simulink skills” | 从固定 tag 的 `skills-catalog/` 和 marketplace 清单枚举，不维护永久固定清单 |
| 复制源码到临时目录，再注册另一个路径 | 下载、校验、安装和客户端引用必须指向同一份持久化内容 |
| 把下载、注册和初始化视为同一个动作 | 明确区分文件更新、客户端注册、MATLAB Add-On 安装、会话共享和运行验证 |

依据：[MCP v0.13.0 README](https://github.com/matlab/matlab-mcp-server/blob/v0.13.0/README.md)、[MATLAB Toolkit README](https://github.com/matlab/matlab-agentic-toolkit/blob/MATK-2026.09.a/README.md)、[Simulink Toolkit README](https://github.com/matlab/simulink-agentic-toolkit/blob/SATK-2026.09.b/README.md)。

## 二、开始前只读检查

1. 确认操作系统、CPU 架构和当前 Agent 客户端。
2. 查询 MATLAB 可执行文件位置、安装目录中的版本信息，并区分 PATH 选中的版本与工具箱历史配置中的版本。多版本时不能默默选择另一个安装。
3. 只读检查现有 MCP 条目、toolkit 安装目录、客户端 skills 目录及链接目标。
4. 检查 `startup.m` 中的 `satk_initialize`、`shareMATLABSession` 和相关路径注入。只检查已定位的用户启动文件，不遍历所有磁盘或改 MATLAB 自带文件。
5. 只输出必要路径、版本和开关；不要打印完整客户端配置或认证对象。

无 MATLAB、版本不足或 Simulink 未确认安装时，报告具体缺口。默认禁用模式下不得为了执行 `ver` 而启动 MATLAB；可把许可证和运行时工具箱列表标为待验证。

## 三、选择执行模式

### 模式 A：只更新文件，保持禁用（默认）

适合先把新版本准备好、以后再启用的情况。

1. 从官方固定 Release 下载当前平台的 MCP 二进制、两个 toolkit 源码快照、`MATLABMCPServerToolbox.mltbx` 和 `agenticToolkitInstaller.mltbx`；需要时也下载 Simulink `.mltbx`。
2. 对有官方 `digest` 的 Release asset 验证 SHA-256；源码 zip 若没有官方摘要，只能记录本地哈希和来源，不得写“官方摘要验证通过”。
3. 解压到持久化目录，先解析 `tools/tools.json`、marketplace 清单并检查 `SKILL.md`，再替换本机副本。先备份旧文件，保留第三方 LICENSE。
4. 新 skills 留在 toolkit 的 `skills-catalog/` 中，不自动复制或链接到客户端扫描目录。已有相关副本或链接先记录来源并禁用；不要覆盖无关的同名自定义 skill。
5. Codex 的相关 MCP 设置 `enabled = false`。其他客户端若没有核实过禁用语法，就把相关注册备份移出活动配置，不编造 `enabled` 字段。
6. 把用户 `startup.m` 中已确认的 toolkit 自动初始化块备份并停用，保留其他启动逻辑。
7. 只执行 MCP `--version` / `--help` 等不建立连接的检查。

此模式**不运行** `setupAgenticToolkit("install")`、`setupAgenticToolkit("update")`、`--setup-matlab`、`satk_initialize`、`shareMATLABSession()` 或 MCP 工具调用；这些步骤可能安装 Add-On、重新注册客户端或建立会话。`.mltbx` 下载成功不等于它已安装到 MATLAB。

交付必须分别列出：已更新的磁盘文件、已禁用的入口、待安装的 MATLAB Add-On，以及未进行的运行验证。当前已经打开的 Agent 可能仍缓存旧 skills；以新会话重新读取配置后的结果为准，不擅自终止现有 MATLAB 或 Agent 进程。

### 模式 B：完整安装或更新并启用

只在用户明确要求启用时使用。

安装或更新前先确认 MATLAB 版本、客户端与技能分组。官方安装器可同时处理两套 toolkit；不要默认选择全部领域。

```matlab
% 首次安装安装器；文件路径应替换为实际下载位置。
matlab.addons.toolbox.installToolbox("YOUR_INSTALLER_ABSOLUTE_PATH_HERE")

% 首次安装使用 install；已经安装则使用 update，两者不要连续盲目执行。
setupAgenticToolkit("install")
```

已有用户在安装最新版安装器后使用：

```matlab
setupAgenticToolkit("update")
```

`update` 会更新 skills、配置和 MCP 二进制，不能把它当作保证不启用的下载命令。离线部署可以使用官方的 `MCPServerLocation`、`MCPToolboxLocation`、`MATLABAgenticToolkitLocation`、`SimulinkAgenticToolkitLocation` 和 `Offline=true` 参数，具体组合以当前安装器帮助为准。

依据：[MATLAB Toolkit 配置与离线安装说明](https://github.com/matlab/matlab-agentic-toolkit/blob/MATK-2026.09.a/Configuration_and_Troubleshooting.md)。

## 四、手动配置参考

所有 `YOUR_..._HERE` 都是必须替换的占位符，不是已知本机路径；未确认真实值前不能直接写入活动配置。

### Codex

先读取有效的 `CODEX_HOME`；未设置时检查 `~/.codex/config.toml`，并检查项目级覆盖。对同名段做保留无关字段的修改，不追加重复 TOML 表。

以下示例为 Windows 的**已配置但禁用**状态：

```toml
[mcp_servers.matlab]
command = 'YOUR_MCP_EXE_ABSOLUTE_PATH_HERE'
args = ['--matlab-session-mode=existing', '--extension-file=YOUR_TOOLS_JSON_ABSOLUTE_PATH_HERE']
env_vars = ['WINDIR']
enabled = false
```

`WINDIR` 透传是官方特别指出的 Windows Codex 注意事项，不能概括成所有客户端都必须硬编码 `C:\Windows`。macOS / Linux 不照抄此项。

对已注册 skill 可使用官方开关，`path` 指向包含 `SKILL.md` 的目录：

```toml
[[skills.config]]
path = 'YOUR_SKILL_DIRECTORY_ABSOLUTE_PATH_HERE'
enabled = false
```

同一 skill 可能同时存在于 `.agents/skills`、旧 `.codex/skills` 或插件目录，必须排查重复来源。全客户端保持未加载时，可把已确认属于 toolkit 的旧副本或链接移入客户端扫描目录之外的备份目录。

依据：[OpenAI 配置参考](https://learn.chatgpt.com/docs/config-file/config-reference)、[MCP 的 Codex 配置说明](https://github.com/matlab/matlab-mcp-server/blob/v0.13.0/README.md#codex)。如 toolkit 模板与客户端文档冲突，以当前客户端文档和实际解析结果为准。

### Claude Code

只在启用模式中注册 MCP，并先核对本机 `claude mcp add --help` 与配置作用域。skills 的正文在 `SKILL.md` 中，`settings.json` 存放插件和 marketplace 设置，不是 skills 内容本身。

当前两个独立仓库的 marketplace 名称分别是 `matlab-agentic-toolkit` 和 `simulink-agentic-toolkit`。旧安装器可能生成名为 `matlab-agentic-toolkits` 的聚合 marketplace，不能将三者混用。

以下命令会注册 / 安装插件，**禁用模式不执行**：

```bash
claude plugin marketplace add https://github.com/matlab/matlab-agentic-toolkit
claude plugin install matlab-core@matlab-agentic-toolkit
claude plugin marketplace add https://github.com/matlab/simulink-agentic-toolkit
claude plugin install model-based-design-core@simulink-agentic-toolkit
```

组名与 marketplace 名以所选版本的 `.claude-plugin/marketplace.json` 为准。增量合并现有配置，不能用示例 JSON 覆盖整个用户文件。

### GitHub Copilot / 其他 Agent

VS Code 支持在项目 `.vscode/mcp.json` 的 `servers` 下配置 stdio server；用户配置还受当前 profile 影响，不能用 Claude 的 `mcpServers` 结构替代。Codex、Copilot 等客户端的 skills 发现机制要分别核对。

eva-cli 或其他兼容客户端必须先读它实际版本的官方帮助；没有证据时不声称支持，也不猜测配置键。

## 五、MATLAB 会话初始化

以下内容仅供**启用模式**使用。

基础 MATLAB 的新会话模式不依赖 Simulink 初始化。对于 R2023a+ 的现有会话，先安装 MCP Server Toolbox；手动方式可以使用已下载的二进制：

```powershell
& 'YOUR_MCP_EXE_ABSOLUTE_PATH_HERE' --setup-matlab --matlab-root='YOUR_MATLAB_ROOT_ABSOLUTE_PATH_HERE'
```

然后在目标 MATLAB 会话中运行：

```matlab
shareMATLABSession()
```

Simulink Toolkit 还需要加入路径并初始化，例如 Windows 下：

```matlab
addpath(fullfile(getenv('USERPROFILE'), '.matlab', 'agentic-toolkits', 'simulink'))
satk_initialize
```

这是假设安装在上述标准位置的示例；自定义位置应使用已经确认的实际路径。`satk_initialize` 会执行会话共享及安装检查，不只是加载 skills。不要默认添加到 `startup.m`。

`existing` 连接最近共享的 MATLAB 会话，不与 `--matlab-root`、`--initial-working-folder` 或 `--matlab-display-mode` 同时用于运行配置。前面安装 Add-On 的 `--setup-matlab --matlab-root` 命令与实际会话连接配置是两个不同步骤。`auto` 连接失败时可能启动新 MATLAB；严格禁止启动新会话时不能误用 `auto`。

## 六、Skills 与工具清单

本次对固定 tag 源码实际计数：MATLAB Toolkit 有 **25 个分组、152 个 `SKILL.md`**；Simulink Toolkit 有 **9 个分组、31 个 `SKILL.md`**。这是仓库清单数量，不表示客户端已加载，也不意味着本机拥有相应产品许可证。

MATLAB 建议以 `matlab-core` 为基础，再按项目选择信号处理、图像处理、机器人等领域。Simulink 当前分组为：

```text
model-based-design-core
model-based-system-engineering
verification-validation-and-test
simulink-simulation
simulink-modeling
control-systems
simulink-environment-fundamentals
signal-processing
code-generation
```

更新后应重新枚举目录，检查 `SKILL.md` 内的名称以及同名冲突，不按旧文件数判定安装是否完整。

MCP 基础工具为 `detect_matlab_toolboxes`、`check_matlab_code`、`evaluate_matlab_code`、`run_matlab_file`、`run_matlab_test_file`。Simulink 当前 `tools/tools.json` 声明：

| 工具 | 用途 |
| --- | --- |
| `model_overview` | 模型层次与接口概览 |
| `model_read` | 读取模型结构和算法 |
| `model_edit` | 修改模型结构与参数 |
| `model_query_params` | 查询参数 |
| `model_resolve_params` | 解析工作区变量值 |
| `model_check` | 检查结构问题 |
| `model_read_diagnostics` | 读取诊断信息 |
| `model_scan` | 搜索磁盘上的模型文件 |
| `model_test` | Gherkin 模型测试，需要 Simulink Test |

是否可调用以及准确输入参数，以实际 MCP `tools/list` 返回的 schema 为准。不要编造调用参数，也不要用“其他工具不受任何许可证限制”概括不同产品操作的前置条件。

依据：[MATLAB skills 目录](https://github.com/matlab/matlab-agentic-toolkit/tree/MATK-2026.09.a/skills-catalog)、[Simulink skills 目录](https://github.com/matlab/simulink-agentic-toolkit/tree/SATK-2026.09.b/skills-catalog)、[Simulink 工具定义](https://github.com/matlab/simulink-agentic-toolkit/blob/SATK-2026.09.b/tools/tools.json)。

## 七、验证与回滚

禁用模式只验文件：版本输出、摘要、JSON 格式、skills 数量、客户端禁用项、自动加载入口和备份。不能把这写成“已连接 MATLAB”。

启用模式先通过 `detect_matlab_toolboxes` 核对运行中的 MATLAB 版本与产品，再按真实 schema 对用户选定模型调用 `model_overview`。只读验证即可，不为证明连接而修改、保存或测试用户模型。

更新失败时，保留错误和下载记录；按备份恢复本次修改的文件与注册项，不覆盖其他会话的新配置。启用后如连接失败，分别检查路径、版本、MCP Add-On、会话共享、扩展定义和 MATLAB 许可，不把所有问题都归结为“重启 Agent”。

## 八、可复制执行提示词

把本节连同上面的参考内容交给 Agent。默认只更新并禁用，需要启用时由用户明确修改第一行要求。

```text
请为我核验并更新 MATLAB / Simulink MCP 与 skills。本次只更新文件，保持未启用。

先阅读当前官方 Release、README、tools/tools.json 和 skills marketplace 清单。本文中的版本只是 2026-09-12 的核验快照，不得把它永久当作 latest。不要执行文档中与本次禁用要求冲突的启用命令。

请按以下流程完成：
1. 只读识别操作系统、CPU、Agent 客户端、MATLAB 安装与版本、现有 toolkit、MCP 注册、skills 来源及 startup.m 自动初始化。多版本或关键信息无法唯一确定时，指出缺口，不猜测路径和配置。
2. 从官方 Release 获取匹配平台的二进制、toolkit 固定版本源码和所需 mltbx。核对官方 asset digest；没有官方摘要的源码归档只记录本地 SHA-256、URL 和 tag。
3. 在客户端自动扫描目录之外暂存并验证内容。先备份旧安装和将要修改的配置，再更新磁盘文件，保留第三方许可证。不要覆盖同名自定义 skills。
4. 新 skills 留在 toolkit 内不注册。已有相关 MCP 和 skills 入口设为禁用，或备份移出扫描目录。停用用户 startup.m 中已确认属于 toolkit 的自动初始化代码；保留其他代码。
5. 不运行 MATLAB，不安装会重新配置 Agent 的安装器，不执行 --setup-matlab、satk_initialize 或 shareMATLABSession，不调用 MCP 工具，不创建新的自动启动项。不终止正在运行的用户进程。
6. MCP 只用 --version / --help 做静态检查；解析 JSON、检查文件和禁用状态。长任务使用当前操作系统适用的后台方式、输出文件和有限超时，不把 Bash 后台语法照搬到 Windows。
7. 最后列出旧版与新版、实际路径、摘要验证结果、skills 分组与数量、备份位置、禁用入口，以及未安装的 MATLAB Add-On 和未执行的运行验证。严禁把已下载说成已安装，或把文件检查说成连接成功。

如果用户另行明确要求启用：先确定客户端、MATLAB 版本与技能分组；检查备份和当前官方说明，再使用对应安装器/手动注册流程，只启用所需功能，最后执行最小只读连接验证。
```

## 许可与来源

Copyright (c) 2026 离子怪。本文原创说明和提示词以 [MIT License](https://github.com/ice11123/matlab-simulink-agent-install-guide/blob/main/LICENSE) 开源。

MATLAB、Simulink、MCP Server、MathWorks toolkits 和 skills 均遵循各自许可证及使用条件。本仓库不重新授权或镜像分发这些组件。MIT 也不改变承载本文的博客代码或其他文章的授权。
