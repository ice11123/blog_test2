# Skill Seekers MCP + 嵌入式项目文档助手：Agent 全自动安装指南

> 本文是一份可执行的 Agent 指令。把此 Markdown 文件交给具有本机终端与文件权限的 Codex 或其他编码 Agent，并明确说“按照文档完成安装”，即可复现本项目验证过的配置。

- 核验日期：2026-09-17
- Skill Seekers 固定版本：`3.9.1`
- MCP 注册名：`skill-seekers`
- 自定义 Skill：`embedded-project-documenter`
- 许可证：本文和自定义 Skill 使用 MIT；第三方软件遵循其自身许可证
- 适用目标：Codex CLI / Codex 桌面端的本地环境

## 安装后会得到什么

1. 一个隔离的 Python 虚拟环境，其中安装 `skill-seekers[mcp]==3.9.1`。
2. 一个名为 `skill-seekers` 的 stdio MCP 注册项，用于摄取文档站、GitHub 仓库、PDF、视频和本地代码库，并生成结构化知识或 Skill。
3. 一个全局 `embedded-project-documenter` Skill，用于把真实 MCU/固件工程转化为新生教程、作品介绍或技术参考。
4. 一套只读工程盘点脚本和证据规则，强制区分“发现文件、进入构建、实际调用、硬件实测”。

该组合不会自动上传项目、发布 Skill 或调用付费模型。Skill Seekers 中虽包含上传和发布工具，但只能在用户另行明确要求时使用。

## 交给 Agent 的完整任务

以下指令优先于后文中的命令示例。命令是实现参考，不应无条件照抄。

```text
请按照这份文档为当前用户安装 Skill Seekers MCP 3.9.1 和 embedded-project-documenter Skill，并完成真实验证。

执行要求：
1. 先只读识别操作系统、当前用户目录、CODEX_HOME、Codex CLI、Git 和所有可用 Python。Python 必须为 3.10 或更高版本。
2. 不得输出完整 config.toml、环境变量值、认证对象、Token、API Key 或私有仓库凭据。发现疑似明文凭据时只报告风险和文件位置。
3. 不覆盖现有同名 MCP 或 Skill。若它们与本指南完全一致则复用；若内容不同，先创建带时间戳的备份并报告冲突，再只替换本指南负责的条目或目录。不得覆盖其他配置。
4. 使用独立虚拟环境安装固定版本 skill-seekers[mcp]==3.9.1，不安装到系统 Python。
5. MCP 使用虚拟环境中的绝对 Python 路径，以 stdio 方式运行 skill_seekers.mcp.server_fastmcp；优先使用 codex mcp add，不直接重写整个 config.toml。
6. 从本指南所在开源目录复制 embedded-project-documenter 完整目录到官方用户级 skills 目录 $HOME/.agents/skills/。保留 SKILL.md、agents、references 和 scripts 的相对结构。
7. 安装后执行依赖检查、模块导入、真实 MCP initialize/tools/list 握手、Codex MCP 注册检查、Skill 结构检查和工程盘点脚本的成功/失败路径检查。
8. 不要为了测试而抓取用户代码、访问私有远程仓库、上传内容、调用付费 API 或修改任何嵌入式工程。
9. 当前 Codex 会话可能缓存工具和 Skill。验证磁盘配置后，明确提示用户新建任务或重启 Codex；不得把“文件安装成功”冒充“当前会话已热加载”。
10. 最终报告实际版本、安装路径、MCP 握手结果、工具数量、Skill 验证结果、备份位置、未执行事项以及是否需要重启。

如果缺少 Python 3.10+、Codex CLI、网络或写入用户目录的权限，停止在安全边界处并报告准确缺口；不要猜测可执行文件路径，也不要通过关闭安全软件绕过文件锁。
```

## Agent 实施规范

### 1. 识别路径和依赖

Agent 应通过命令实际查询，不假定用户名或盘符。

- `CODEX_HOME` 已定义时使用它；否则 Codex 配置根目录按 `$HOME/.codex` 处理。
- 工具目录：`<CODEX_HOME>/tools/skill-seekers`
- Python 虚拟环境：`<CODEX_HOME>/tools/skill-seekers/.venv`
- Skill 目录：`$HOME/.agents/skills/embedded-project-documenter`
- 本指南源码目录：包含此 README 的目录。

前置条件：

- Python `>=3.10`
- 可用的 `python -m venv` 和 `pip`
- Codex CLI，且 `codex mcp --help` 可运行
- Git 仅在通过仓库 URL获取本安装包时需要

如果系统存在多个 Python，选择满足版本要求的真实解释器并记录绝对路径。不要只根据 `python` 命令名推断版本。

### 2. 获取经过公开审阅的安装包

开源目录：

```text
https://github.com/ice11123/blog_test2/tree/main/docs/embedded-project-documenter-agent-setup
```

如果用户只提供了本 Markdown 文件，Agent 可以从上面的公开目录读取以下内容：

```text
skill/embedded-project-documenter/SKILL.md
skill/embedded-project-documenter/agents/openai.yaml
skill/embedded-project-documenter/references/deliverable-modes.md
skill/embedded-project-documenter/references/evidence-and-safety.md
skill/embedded-project-documenter/references/toolchains.md
skill/embedded-project-documenter/scripts/inventory_embedded_project.py
scripts/verify_skill_seekers_mcp.py
```

只接受 HTTPS GitHub 地址。记录实际获取的提交 SHA；不要从搜索结果中的同名第三方镜像下载。

### 3. 安装隔离环境

伪代码流程：

```text
tool_root = CODEX_HOME/tools/skill-seekers
venv = tool_root/.venv

确认 tool_root 是预期用户目录内的精确路径
若 venv 已存在：检查解释器、版本与 pip 状态；健康且版本一致则复用
若 venv 损坏：先把精确 venv 目录移动到带时间戳的备份，再新建

<selected_python> -m venv <venv>
<venv_python> -m pip install --upgrade pip
<venv_python> -m pip install "skill-seekers[mcp]==3.9.1"
<venv_python> -m pip check
```

Windows 的虚拟环境解释器通常位于：

```text
<venv>\Scripts\python.exe
```

macOS / Linux 通常位于：

```text
<venv>/bin/python
```

这些只是平台规律，Agent 必须用文件存在检查确认最终路径。

如果安装发生文件占用：检查是否有仍在运行且命令行明确指向该虚拟环境的 `pip`/Python 进程。不要杀死无法确认归属的进程；等待残留进程退出后重新运行 `pip check` 和导入检查，避免把重复安装阶段的文件锁误判为安装失败。

### 4. 验证 Skill Seekers 本体

至少执行：

```text
<venv_python> -m pip show skill-seekers
<venv_python> -m pip check
<venv_python> -c "import skill_seekers.mcp.server_fastmcp, mcp; print('imports=ok')"
```

随后使用虚拟环境运行本仓库的验证脚本：

```text
<venv_python> scripts/verify_skill_seekers_mcp.py
```

脚本必须成功完成 MCP `initialize` 和 `tools/list`，并至少发现：

- `scrape_docs`
- `scrape_github`
- `scrape_pdf`
- `scrape_codebase`
- `package_skill`

固定版本在本项目的 2026-09-17 验证中返回 40 个工具。以后若工具数量不同，不应单凭数字判断成功；应同时核对版本、核心工具集合和实际握手结果。

### 5. 注册 Codex MCP

先运行：

```text
codex mcp get skill-seekers
```

处理规则：

- 不存在：注册。
- 已存在且 `command` 是当前虚拟环境解释器、`args` 为下述模块：复用。
- 已存在但配置不同：备份 Codex 配置，报告差异；只在确认该条目属于本指南的旧安装后替换，不能覆盖无关的同名用户服务。

注册命令结构：

```text
codex mcp add skill-seekers -- <venv_python_absolute_path> -m skill_seekers.mcp.server_fastmcp
```

注册后执行：

```text
codex mcp get skill-seekers
codex mcp list
```

不要把 API Key 写进命令、`config.toml` 或本文。本配置的本地代码盘点和基本抓取不要求预先写入第三方模型密钥。

### 6. 安装嵌入式文档 Skill

将开源包中的：

```text
skill/embedded-project-documenter
```

完整复制到：

```text
$HOME/.agents/skills/embedded-project-documenter
```

必须保留目录结构。若目标已存在：

1. 比较所有受管文本文件。
2. 完全相同则不重复复制。
3. 不同则将旧目录移动到同级、带时间戳的备份目录。
4. 不删除用户未确认来源的同名 Skill。

检查 `SKILL.md` 的 YAML 头至少含 `name` 和 `description`。如果本机有官方 Skill 校验器，可以运行；没有时执行 YAML/文件结构检查，不编造校验成功。

验证盘点脚本：

```text
<venv_python> <skill_dir>/scripts/inventory_embedded_project.py --help
<venv_python> -m py_compile <skill_dir>/scripts/inventory_embedded_project.py
```

再传入一个确定不存在的目录，确认脚本以非零状态退出并返回结构化错误。除非用户明确提供测试工程，不扫描用户目录。

### 7. 重启与使用

OpenAI 官方文档要求在用户级 Skill 或 Codex 配置变化后重启 Codex。磁盘验证完成后，应提示用户重启或新建任务。

推荐调用：

```text
使用 $embedded-project-documenter 审查这个嵌入式工程。先建立证据账本，再为新生编写教程；不要把文件存在当成功能已启用，也不要猜测硬件参数。
```

Skill 的默认写作模式为：

- 新生教程：最小可观察实验 → 原理 → 步骤 → 现象 → 排错 → 本篇总结。
- 作品介绍：问题、能力、硬件、数据/控制链路、演示证据、局限。
- 技术参考：版本、构建配置、启动链路、接口映射、诊断与待验证项。

除非用户明确要求，新生文章结尾不添加“动手练习”“读完后应该能回答”或验收清单。

## 完成标准

只有以下项目均有实际结果，才可以报告安装成功：

- `skill-seekers` 版本为 `3.9.1`。
- `pip check` 无损坏依赖。
- 模块导入成功。
- MCP `initialize` 和 `tools/list` 成功，核心工具齐全。
- `codex mcp get skill-seekers` 指向隔离环境的绝对解释器。
- Skill 目录结构完整，YAML 头合法。
- 工程盘点脚本可编译，正常/错误路径行为符合预期。
- 没有输出或写入任何凭据。
- 已说明新会话/重启要求。

最终报告格式：

```text
安装结果：成功 / 部分完成 / 失败

- 操作系统：
- Codex CLI：
- Python：
- Skill Seekers：
- 虚拟环境：
- MCP 注册：
- MCP 握手与工具数：
- embedded-project-documenter：
- 验证脚本：
- 备份：
- 未执行事项：
- 后续动作：
```

## 回滚与卸载

只有用户明确要求卸载时才执行：

1. `codex mcp remove skill-seekers`
2. 精确确认工具目录位于预期 `CODEX_HOME/tools/skill-seekers` 后，删除或移入回收站。
3. 精确确认 Skill 目录为 `$HOME/.agents/skills/embedded-project-documenter` 后，删除或移入回收站。
4. 如果安装时替换过旧版本，恢复对应备份；不要恢复整个 `config.toml` 来覆盖其他新变化。
5. 重启 Codex，并再次确认 MCP/Skill 已不再加载。

## 故障排查

### `codex` 命令不存在

停止 MCP 注册步骤，报告 Codex CLI 缺失。不要通过猜测配置文件格式代替实际客户端检查。

### `ModuleNotFoundError`

确认执行的是虚拟环境的绝对 Python，而不是系统 Python；运行 `pip show skill-seekers` 和 `pip check`。

### Windows 出现文件占用

检查残留安装进程是否明确属于该虚拟环境。不要删除正在使用的环境，也不要关闭杀毒软件。进程结束后先复查包、导入和握手；安装可能已经成功，只是重复安装阶段失败。

### MCP 已注册但当前任务没有工具

先确认 `codex mcp get skill-seekers`、绝对解释器和真实握手，然后新建任务或重启 Codex。当前会话可能缓存启动时的工具清单。

### Skill 没有触发

确认目录为 `$HOME/.agents/skills/embedded-project-documenter`，`SKILL.md` 名称大小写正确，并在新任务中显式使用 `$embedded-project-documenter`。

## 来源与许可

- [OpenAI：Codex MCP 配置](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)
- [OpenAI：构建与安装 Skills](https://learn.chatgpt.com/docs/build-skills)
- [Skill Seekers 官方仓库](https://github.com/yusufkaraaslan/Skill_Seekers)
- [Skill Seekers MCP 指南](https://github.com/yusufkaraaslan/Skill_Seekers/blob/development/docs/guides/MCP_SETUP.md)
- [Skill Seekers 3.9.1](https://pypi.org/project/skill-seekers/3.9.1/)

Copyright (c) 2026 离子怪。本指南和 `embedded-project-documenter` 自定义 Skill 使用 MIT License。Skill Seekers、OpenAI Codex 及其他第三方组件仍遵循各自许可证；本仓库不重新授权第三方软件。
