---
title: "Skill Seekers MCP + 嵌入式项目文档助手：Agent 全自动安装指南"
description: "一份可直接交给 Agent 执行的开源安装方案：隔离安装 Skill Seekers MCP，并配置面向 MCU 工程的新生教程、作品介绍与技术文档 Skill。"
pubDate: "2026-09-17"
updatedDate: "2026-09-17"
author: "离子怪"
sourceUrl: "https://github.com/ice11123/embedded-project-documenter-agent-setup"
dir1: "AI/Agent协作与开发"
dir2: ""
tags: ["Codex", "MCP", "Skills", "嵌入式", "文档工程"]
---

本文与配套的 `embedded-project-documenter` Skill 采用 MIT 许可证。

我需要的不是一个泛用的“把代码复述成 README”工具，而是一套能理解嵌入式工程证据边界的文档工作流：文件存在不等于进入构建，函数定义不等于实际调用，代码实现也不等于已经上板验证。

这套开源配置由两部分组成：

1. **Skill Seekers MCP 3.9.1**：负责摄取文档站、GitHub 仓库、PDF、视频和本地代码库。
2. **嵌入式项目文档助手 Skill**：负责证据分级、硬件安全边界和教程结构，把工程材料转化为新生教程、作品介绍或技术参考。

完整安装包、Skill 源文件和验证脚本已经放在 GitHub：

[打开独立开源仓库](https://github.com/ice11123/embedded-project-documenter-agent-setup)

其中的 `README.md` 是一份可执行的 Agent 指令。把它交给具有本机终端和文件权限的 Agent，并说“按照文档完成安装”，即可开始自动安装。

> 核验日期：2026-09-17
>
> 固定版本：`skill-seekers[mcp]==3.9.1`
>
> MCP 注册名：`skill-seekers`
>
> Skill 名称：`embedded-project-documenter`

## 为什么不是只安装一个代码分析工具

Skill Seekers 擅长把多种资料转化成结构化知识，但“资料摄取”和“嵌入式教学写作”是两个不同问题。

只做代码扫描容易出现几类错误：

- 仓库有某个驱动文件，就写成项目正在使用该器件。
- 头文件定义了频率，就写成真实硬件已经按该频率运行。
- README 写有某块开发板，就忽略当前实物的板卡版本。
- 代码能够编译，就写成闭环控制已经在负载下稳定。
- 面向新生的第一篇文章先介绍数百个文件的工程架构。

因此，这套配置把职责拆开：MCP 负责取得资料，自定义 Skill 负责判断证据强度、选择文档类型和组织教学路径。

## 安装后的能力

### 资料摄取

Skill Seekers 官方包提供文档站、GitHub、PDF、视频、本地代码库等来源的处理能力，并通过 stdio MCP 暴露工具。固定版本在本机真实握手中返回 40 个工具；安装脚本不只检查“进程能启动”，还执行 MCP `initialize` 和 `tools/list`。

核心检查至少覆盖：

- `scrape_docs`
- `scrape_github`
- `scrape_pdf`
- `scrape_codebase`
- `package_skill`

工具数量可能随版本变化，因此验证脚本同时检查核心工具集合，而不是只认一个数字。

### 嵌入式证据分级

自定义 Skill 使用五种状态记录文档断言：

| 状态 | 含义 |
| --- | --- |
| 已由配置确认 | 活动构建配置、链接脚本或生成配置明确支持 |
| 已由代码确认 | 初始化路径或实际调用链明确启用 |
| 仅发现文件 | 文件存在，但未证明参与当前构建或运行 |
| 已由实测确认 | 有日志、测量、波形、视频或验收记录 |
| 待确认 | 当前证据不足，不能写成确定事实 |

工程构建、硬件连接和运行行为分别使用不同的证据优先级。例如电压、电流、逻辑电平和引脚映射必须以对应板卡版本的原理图、BOM、数据手册或生成配置为依据，不能依靠常见开发板经验补齐。

### 三种文档模式

**新生教程**从一个可观察的最小实验开始，依次解释概念、步骤、预期现象和排错方法，最后以“本篇总结”结束。默认不添加“动手练习”“读完后应该能回答”或验收清单。

**作品介绍**聚焦问题、能力、硬件构成、数据与控制链路、演示证据和当前局限。

**技术参考**记录工具链版本、构建配置、启动链路、任务与中断、接口映射、诊断入口和待验证项。

目前内置了 TI Code Composer Studio / SysConfig、STM32CubeIDE / CubeMX、Keil MDK、PlatformIO、CMake 和 Make 等常见工具链的证据入口。

## 安装策略

开源指南要求 Agent 先只读检查，再实施安装：

1. 识别操作系统、`CODEX_HOME`、Codex CLI、Git 和 Python 版本。
2. 在 `<CODEX_HOME>/tools/skill-seekers/.venv` 建立隔离虚拟环境。
3. 安装固定版本 `skill-seekers[mcp]==3.9.1` 并执行 `pip check`。
4. 完成真实 MCP 握手后，使用 `codex mcp add` 注册绝对解释器路径。
5. 把 Skill 安装到当前 OpenAI 文档规定的用户级目录 `$HOME/.agents/skills/embedded-project-documenter`。
6. 检查 Skill YAML、目录结构以及只读工程盘点脚本。
7. 提示用户新建任务或重启 Codex，让工具和 Skill 清单重新加载。

不会把示例中的用户名、盘符或 Python 位置写死到其他人的配置中。已有同名 MCP 或 Skill 时，Agent 必须先比较内容：一致则复用，不一致则备份并报告，不能静默覆盖。

## 可直接交给 Agent 的提示词

如果已经打开 GitHub 安装包，把其中的 `README.md` 连同下面这句话交给 Agent 即可：

```text
请严格按照这份 README 完成安装和真实验证。不要只给我命令，也不要把“文件下载成功”说成“当前会话已经加载”。不得输出完整配置或任何凭据；已有同名配置先比较并备份，完成后按文档模板报告版本、路径、MCP 握手、核心工具、Skill 校验、备份和重启要求。
```

如果只把本文链接发给 Agent，应让它先打开开源安装包中的 `README.md`，因为 GitHub 版本还包含完整 Skill 文件和可直接运行的 MCP 验证脚本。

## 验证过的结果

本配置在 Windows 上使用 Python 3.12 和 Codex CLI 完成过以下验证：

- `skill-seekers 3.9.1` 安装成功。
- `pip check` 无损坏依赖。
- Skill Seekers 和 MCP SDK 模块导入成功。
- stdio MCP `initialize` / `tools/list` 成功，共发现 40 个工具。
- Codex MCP 注册项使用隔离虚拟环境中的绝对 Python 路径。
- 自定义 Skill 结构校验和 Python 编译检查通过。
- 对真实 TI CCS 小车资料目录的只读盘点成功识别 `.project`、`.cproject` 和 `.syscfg` 等证据入口。
- 不存在目录能够返回结构化错误和非零退出状态。

这些结果说明安装链路可用，不代表任何其他用户的嵌入式工程已经完成构建或上板验证。

## 安全边界

- 基础安装不要求把 API Key 写进 Codex 配置。
- 不打印完整 `config.toml`、环境变量或认证对象。
- 不抓取、上传或发布用户代码来证明 MCP 可用。
- 不关闭安全软件来绕过 Windows 文件锁。
- 不杀死无法确认归属的 Python 进程。
- 卸载时只处理本指南创建的精确 MCP 条目和目录，不用整个配置文件覆盖回滚。
- Skill Seekers 中的上传、发布和外部模型功能需要用户另行明确授权。

## 官方依据

- [OpenAI：Codex MCP 配置](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)
- [OpenAI：构建与安装 Skills](https://learn.chatgpt.com/docs/build-skills)
- [Skill Seekers 官方仓库](https://github.com/yusufkaraaslan/Skill_Seekers)
- [Skill Seekers MCP 指南](https://github.com/yusufkaraaslan/Skill_Seekers/blob/development/docs/guides/MCP_SETUP.md)
- [Skill Seekers 3.9.1](https://pypi.org/project/skill-seekers/3.9.1/)

OpenAI 官方文档说明可以通过 `codex mcp add` 注册 stdio MCP，并通过 `codex mcp list` 检查；用户级 Skill 由包含 `SKILL.md` 的目录组成，当前文档列出的个人安装位置为 `$HOME/.agents/skills`。配置变化后应重启 Codex。

## 开源与许可

Copyright (c) 2026 离子怪。

本文、自动安装指南、验证脚本和 `embedded-project-documenter` 自定义 Skill 使用 [MIT License](https://github.com/ice11123/embedded-project-documenter-agent-setup/blob/main/LICENSE)。Skill Seekers、OpenAI Codex 和其他第三方组件遵循各自许可证；本项目不镜像或重新授权第三方软件。
