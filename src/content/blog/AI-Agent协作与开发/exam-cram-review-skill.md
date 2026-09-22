---
title: "【分享】exam-cram-review：从真题反推的期末冲刺复习 Skill"
description: "介绍开源 exam-cram-review Skill：用复习重点和真题确定考试边界，再从教材、PPT 与作业反向追溯知识，生成结构化笔记与本地网页训练器。"
pubDate: "2026-09-22"
updatedDate: "2026-09-22"
author: "离子怪"
sourceUrl: "https://github.com/KoneFly/ai-dev-toolkit/tree/master/skills/exam-cram-review"
dir1: "AI/Agent协作与开发"
dir2: "Agent 工具链"
tags: ["Agent", "Skills", "Codex", "期末复习", "Obsidian"]
---

`exam-cram-review` 是一个面向期末冲刺场景的开源 Agent Skill。它不试图把整本教材重新讲一遍，而是先用老师划定的复习重点和历年真题确定考试边界，再回到教材、PPT 与作业中定点查找对应内容。

项目由 [KoneFly](https://github.com/KoneFly) 开源，采用 MIT License。本文核验的是 `KoneFly/ai-dev-toolkit` 仓库 `master` 分支中的 `skills/exam-cram-review`，核验日期为 2026 年 9 月 22 日。

[查看 Skill 源码与完整说明](https://github.com/KoneFly/ai-dev-toolkit/tree/master/skills/exam-cram-review)

## 它解决的不是“学完一门课”，而是“在有限时间内抓住考试目标”

这个 Skill 的核心判断很明确：**真题和作业是锚点，不是最后才使用的验证题。**

传统整理方式往往从教材第一页开始，先生成一份完整但很长的摘要，再尝试从中寻找重点。`exam-cram-review` 采用相反的路径：

1. 先读取老师的复习重点、考纲或划重点记录，确定会考与不考的范围。
2. 拆解真题和作业，给每道题标注题型、章节、考点与难度。
3. 统计重复出现的考点，得到复习优先级。
4. 只针对这些考点回查教材例题、PPT 页面和关键图示。
5. 按章节生成讲解、题库、速查表以及网页训练器需要的结构化数据。

这条路径很适合考试前 1–4 周、资料已经比较齐全但时间不足的情况。若目标是长期系统学习、日常学习规划或开放式研究，它反而不是合适工具。

## 输入资料如何分工

Skill 会把资料分成四个层级，而不是把所有文件等量塞进上下文：

| 层级 | 典型资料 | 作用 |
| --- | --- | --- |
| P0 考纲层 | 老师划重点、复习重点、考纲笔记 | 决定章节顺序、星级和排除项 |
| P0 题源层 | 历年真题、作业、习题截图 | 提取题型并统计考点频次 |
| P1 知识层 | 教材 PDF、课程 PPT | 仅在题源指向某个考点时定点读取 |
| P2 辅助层 | 大纲图、思维导图、章节摘要 | 检查结构是否遗漏 |

它要求至少有“考点提示”和一份历史真题。缺少真题时，Skill 不应假装能准确推断考试重点；缺少老师划定的范围时，也应先向用户确认，而不是直接开始通读教材。

## 最终会生成什么

默认输出以章节为单位，每章保留三类精简 Markdown，同时生成一个 `data.json`：

```text
ai复习/
├── 00_总索引.md
├── data.json
├── 01_第1章_章节名/
│   ├── 讲解.md
│   ├── 题库.md
│   ├── 速查.md
│   └── _figures/
└── _extracted/
```

- `讲解.md`：考点清单、重要程度与例题精讲。
- `题库.md`：真题映射、自测题和折叠答案。
- `速查.md`：公式、适用条件、含义和相关知识。
- `data.json`：供网页训练器直接读取的结构化主数据源。
- `00_总索引.md`：章节关系、考试信息和按剩余时间安排的冲刺建议。

这里使用 `data.json` 而不是完全依赖 Markdown 正则解析，是一个很实用的设计。公式中的 `$`、标题中的 `#` 和复杂排版都可能让字符串解析变得脆弱；结构化数据可以让训练器稳定取得考点、例题、公式、测验和章节依赖。

## 配套网页训练器

Skill 自带一个纯 Vanilla JavaScript 的静态训练器，不需要构建步骤或后端。完成资料生成后，可以在 Skill 的 `webapp` 目录启动本地静态服务器：

```powershell
cd "$env:USERPROFILE\.codex\skills\exam-cram-review\webapp"
python -m http.server 8000
```

然后访问 `http://localhost:8000`，选择生成的 `ai复习` 目录。训练器主要提供：

- 总览、章节掌握度、错题清单与知识地图；
- 考点、例题、真题和公式的集中阅读；
- 自测、例题练习、错题追踪和键盘操作；
- Anki 风格的公式翻转卡；
- 可选的 AI 出题与错题讲解。

练习进度、错题和 AI 配置保存在浏览器 LocalStorage。网页端依赖 KaTeX、marked.js、Cytoscape.js 和字体 CDN，因此直接双击 `index.html` 时可能遇到浏览器的 `file://` CORS 限制，使用本地 HTTP 服务更稳妥。

## 在 Codex 中安装与触发

这个仓库原本按 Claude Code Skill 的目录方式提供，但它的入口同样是标准 `SKILL.md`。在 Codex 中可以把整个目录安装到个人 Skills 目录：

```text
~/.codex/skills/exam-cram-review/
```

本机已通过 Codex 的 Skill 安装器从以下来源完成安装：

```text
仓库：KoneFly/ai-dev-toolkit
分支：master
路径：skills/exam-cram-review
```

安装后的新 Skill 会从下一轮任务起进入 Codex 的技能发现范围。可以用类似下面的请求触发：

> 使用 exam-cram-review 处理“模拟电路复习资料”文件夹。考试还有两周，请先盘点资料并告诉我缺少哪些锚点材料。

不要一开始就要求它“直接生成全部笔记”。按 Skill 的流程，资料盘点后还需要确认输出格式，并检查是否同时具备考点提示与真题。

## 运行依赖与格式边界

Skill 本体只是工作流和配套资源。要实际处理 PDF、PPT、DOCX 与旧版 Office 文件，还需要以下工具：

| 工具 | 用途 |
| --- | --- |
| PyMuPDF | 渲染 PDF 页面、提取图片 |
| markitdown | 将 PPTX、DOCX 等内容转成 Markdown |
| python-pptx | 提取 PPT 中的内嵌图片 |
| LibreOffice | 将旧版 `.ppt`、`.doc` 转换为可处理格式 |

Pandoc 与 TeX Live 只在额外生成 PDF 时需要，不是默认训练流程的必备项。扫描版教材还需要先确认 PDF 页码与书本页码之间的偏移；中文旧版 `.doc` 转换后也可能需要按 GB18030 检查编码。

## 使用时最值得保留的三条原则

### 1. 不要通读大型教材

数百页 PDF 不应一次进入 Agent 上下文。正确顺序是“真题考点 → 教材目录或索引 → 目标页附近”，必要时只渲染关键页和图示。

### 2. 不要把 AI 补充写成老师原话

真题、考纲、教材和 AI 推断应保持来源边界。资料没有支持的结论，应明确标为待确认，而不是为了笔记完整而补齐。

### 3. 不要误解“本地存储”

核心训练进度确实存于浏览器本地，但启用 AI 出题或错题讲解后，所选章节内容会由浏览器直接发送到你配置的模型服务商。API Key 不经过项目自建后端，并不等于输入资料从未离开本机；处理未公开课程资料前仍应检查服务商的数据政策。

## 适合谁

如果你手上已经有复习重点、真题、课件和教材，只是缺少一套能把它们组织成“先练什么、为什么、错在哪里”的流程，这个 Skill 很值得尝试。它最有价值的部分并不是自动写出很多内容，而是用题源约束范围、保留资料出处，并把阅读、速查和主动练习连接在一起。

如果你只有一本教材、没有考纲和真题，或者希望用几个月建立完整知识体系，那么更适合使用长期学习计划或课程型知识库，而不是让一个冲刺工具承担它并不擅长的任务。

## 开源与许可

`exam-cram-review` 由 KoneFly 开源，采用 [MIT License](https://github.com/KoneFly/ai-dev-toolkit/blob/master/skills/exam-cram-review/LICENSE)。Skill、网页训练器与第三方依赖分别遵循其各自许可证。
