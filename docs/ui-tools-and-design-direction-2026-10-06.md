# UI 工具调研与设计方向补充（2026-10-06）

本报告由主代理整理，配合 [Astra 受限审查报告](./astra-ui-deep-review-2026-10-06.md)。本轮仅研究：没有安装 skill/MCP、修改产品源码、提交或部署。任务状态记录在 Beads `blog_test2-rot`，本文不是任务清单。

## 证据边界

源码基线为 `f140fc43421fd3668db5ca24e954e80fdccc98f0`。本轮读取线上首页得到 HTTP 200，并确认 `tag-filter`、`近期更新`、`全站目录` 新标记存在；这能排除把上一轮旧页面当成当前页面，但不是远端构建哈希的独立证明。GitHub Actions 公共 API 返回限流，未据此宣称工作流状态。

Astra 生成并查看了本轮桌面/移动静态渲染截图，主代理也查看了参考站桌面卡片、本站桌面卡片和本站移动卡片。浏览器交互接口创建/绑定页面及读取 DOM 连续超时；已停止重复尝试。真实点击、悬停反馈、触摸手势、返回状态、主题过渡和帧率均未完成本轮验证。详情及截图来源见 Astra 报告。

参考站仓库 `main` 源码与线上部署不保证是同一版本。下述源码推断不能升级成“已经在线点击验证”。旧本地参考仓库为 `61df25b`，本轮源码结论使用实时读取的 GitHub `main` 文件，而非把旧 checkout 当成最新。

## 重点不是增加效果，而是确定每一种效果的职责

当前静态截图没有证实立绘覆盖正文。本站已具备文字安全区、伪 3D、细指针 hover 限制、按压反馈、降低动态、标签筛选和键盘 tabs，不能再以“补齐这些功能”为主要改进宣称。

更明确的设计方向是“个人技术档案”：保留暖色基底、红色交互强调、五类主题的不同识别色及原素材，但统一信息结构。三层波浪、壁纸抽屉、主题圆形过渡、磨砂和伪 3D 保持；不改笔记内容、原文颜色、学习排序及分类语义。

| Before | After（建议，未实施） | Why |
| --- | --- | --- |
| 星图卡上半区用较高的最小高度，手机英文眉题被截断，空分类也有较长留白 | 标题、篇数、简介与素材舞台形成紧凑上半区；移动端以中文识别为主；空主题保留入口但使用明确短空态 | 减少的是无信息高度和层级竞争，不是动画或主题内容 |
| 卡外框、背景网格、彩色编号、英文眉题、立绘、分隔线、近期条目一起呈现 | 用“主题主入口 / 近期文章次入口”两层组织；主题颜色负责识别，红色交互色负责行动；网格只作为安静背景 | 统一颜色和构图的语义，避免每个装饰都像需要操作的控件 |
| AI 符号、真实小车抠图、书本线描各有不同视觉体积 | 原素材不换，统一舞台位置、占比、光影方向；保留不同主题的独特图案 | 不是强行统一为同款立绘，而是让素材与文字遵守同一空间规则 |
| 近期卡内 `post-tags` 是 `span`，其他页面相似药丸是链接 | 明确区分不可点击元数据和可点击标签；若改为可点击，必须放在主文章链接之外，避免嵌套链接 | 看上去能点却没有独立去向会造成错觉，不能只给所有元素加 hover |
| 全部标签页是居中药丸云；标签列表页沿用正文样式标题及构建日期 | 独立标签工作台：页名、总量、搜索、常用区、全部标签入口；结果页明确当前标签、文章数、返回全部标签入口 | 标签是发现/检索页面，不是具有发布日期的一篇文章 |

源码定位：`src/components/home/TopicAtlas.astro` 的 `.topic-intro`（约290行）、小屏规则（约638行）；`src/components/home/RecentPosts.astro` 的 `.post-tags`；`src/pages/blog/tags.astro:30` 与 `src/pages/blog/tag/[tag].astro` 的 `pubDate={new Date()}`，以及 `src/layouts/PublicContentLayout.astro:28` 默认 `showDate=true`。这些日期为构建时生成，不是标签内容真实发布日期。

## 可借鉴的参考站互动结构

[PostItemCard](https://github.com/Symb0x76/astro-koharu/blob/main/src/components/post/PostItemCard.astro) 将封面和标题作为文章入口，分类和标签具有独立链接；封面裁切在自己的区域，图片 scale/rotate 与外层阴影反馈分工。可借鉴的是点击对象与反馈对象一致，而不是逐项复制其 class、300/500ms 参数或 `transition-all`。

[标签首页](https://github.com/Symb0x76/astro-koharu/blob/main/src/pages/tags/index.astro) 按出现频次区分重复标签与仅出现一次的标签；[CollapsibleTags](https://github.com/Symb0x76/astro-koharu/blob/main/src/components/tag/CollapsibleTags.tsx) 用按钮、数量、箭头和 `aria-expanded` 披露长尾。这比“把所有标签摆得五颜六色”更值得学习。本站151个标签应保留完整检索与深链接，可评估常用/全部两层，不改标签名称、不隐藏不可恢复的内容。它的 `grid-template-rows` 动画也不能直接视为没有布局成本。

[HomeSiderSegmented](https://github.com/Symb0x76/astro-koharu/blob/main/src/components/ui/segmented/HomeSiderSegmented.tsx) 的选项是概览、本文目录、系列文章。本站用户确认的选项是个人、全站目录、标签目录，本文 TOC 在最右侧；只参考选择状态的连续性，不擅自改回参考站语义。

以上来源属于参考仓库公开源码。本轮未复制实现；借鉴设计关系与信息组织不要求把本站改成 React islands。

## GitHub 工具候选

下面数值是本轮浏览公开 GitHub 页面时显示的约数，不是下载量、活跃使用量或全 GitHub 排名。公共 API 限流，未核实精确星数或最新提交日期。尤其 `anthropics/skills` 的星数属于整个技能仓库，不能归给其中一个 skill。

| 候选 | 页面显示热度 | 本站用途 | 许可与限制 | 建议 |
| --- | --- | --- | --- | --- |
| [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 约133.4k stars | 查询布局、色彩、类型层级和 Astro 相关指导，形成跨页面规范 | MIT；设计检索需 Python；它的默认建议不能覆盖本站用户要求 | 适合作为新增设计规范辅助，不全量执行安装脚本 |
| [frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | 所属仓库约179.8k stars；无单技能统计 | 明确本站自己的视觉方向，减少无意义英文眉题、模板化装饰和同款卡片 | 此 skill 的 [LICENSE.txt](https://github.com/anthropics/skills/blob/main/skills/frontend-design/LICENSE.txt) 为 Apache-2.0，不代表该仓库所有 skills 同许可 | 与现有 Emil 技能互补；不能为追求个性重新引入阻塞字体 |
| [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) | 约53.0k stars | 查看真实浏览器截图、网络、console 和性能 trace | Apache-2.0；官方支持 Chrome/Chrome for Testing；默认有使用统计，性能工具可能查询 CrUX | 若增加一个 MCP，优先考虑它补足渲染与性能闭环；安装前明确浏览器和数据选项 |
| [Playwright MCP](https://github.com/microsoft/playwright-mcp) | 约37.8k stars | 自动验证点击目标、标签筛选、回退及多视口路径 | Apache-2.0；结构化快照不能替代实际看图；我们已具备 Playwright 运行库 | 作为替代而非与现有浏览器重复堆叠；当前官方也提供 CLI+skills 路线 |

候选功能依据均来自其官方仓库 README。安装 skill 是增强代理知识，安装 MCP 是增强观察/操作能力；两者都不是给网站加运行时包。本轮没有安装、修改代理配置或授权新的浏览器访问范围。

**最小组合建议：** 当前已有 `emil-design-eng` 负责细节和动效审查；若后续授权，可补 `frontend-design` 负责统一艺术方向、`ui-ux-pro-max` 负责设计规范。浏览器能力恢复后复用现有工具；仍缺少性能观察能力时再考虑 Chrome DevTools MCP。无需引入整个 React/shadcn 栈来解决 Astro 博客视觉问题。

## 下一次改版怎样避免“看不出区别”

先提供两张可见样稿：一张首页技术星图（桌面与手机），一张标签工作台。以真实文章和151个现有标签制作；不先推全站几十处细微调整。样稿确认后再抽取统一卡片、标签、导航状态规范，应用到分类目录、近期更新和其他模块。

验收不是“用了多少 skills”，而是用户能否一眼判断分类、文章、标签的去向，并完成“进入分类→文章→TOC跳转→返回→筛选标签→进入结果”的连续路径。需记录 default / hover / pressed / focus / selected / empty 各状态，并验证快速反向、窄屏、明暗主题和降低动态。真实浏览器交互与性能补验仍待工具恢复，不能从本轮静态截图得出“已顺滑”结论。
