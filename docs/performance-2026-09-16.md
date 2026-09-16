# 首页波浪持续重绘：定位与优化记录

## 问题与改动

桌面 Chrome / Edge 在加载完成后仍有滚动、壁纸交互卡顿。上一轮只减少了手势处理中的重复更新。本轮在生产预览中发现：波浪虽然被标记为加速图层，SVG 内部 `<use>` 的持续位移仍使主线程反复布局和绘制。

将运动移至三个 HTML 容器，各容器承载静态 SVG。沿用同一条路径、三层配色、0/6/12 的垂直错位、12/7/4 秒周期和原始负延迟。原坐标系宽 192、位移 96，映射为容器宽度的 50%。离屏、后台、壁纸运动期间和降低动态模式的暂停规则继续使用原有逻辑。

## 测量

环境：Windows、Edge 153.0.4234.32、RTX 4060 Laptop GPU，GPU 合成和栅格化开启，1440×900、DPR 1、headless。每轮采样约三秒，记录 DevTools trace；这些结果描述此环境中的工作量，不能直接转换为用户设备的帧率提升比例。

| 测量项 | 原实现 | 暂停波浪的诊断对照 | 新实现三轮 |
| --- | ---: | ---: | ---: |
| Layout 事件 | 543 | 0 | 0 / 0 / 0 |
| Paint 事件 | 1091 | 7 | 10 / 10 / 10 |
| Paint 累计耗时 | 73.79ms | 1.99ms | 2.17 / 1.84 / 1.86ms |
| 长任务 | 0 | 0 | 0 / 0 / 0 |

暂停波浪仅用于确认因果关系，正式实现保留动画。不能只凭 `LayerTree.layerPainted` 或“accelerated”标签判定没有重绘：本例这两项会漏掉 trace 中的主线程 Layout / Paint。

原始数据：

- [修改前](../artifacts/performance/baseline-smoke/home-motion-summary.json)
- [诊断对照](../artifacts/performance/h1-disable-waves/home-motion-summary.json)
- [修改后三轮](../artifacts/performance/wave-html-compositor/home-motion-summary.json)
- [固定相位截图比较](../artifacts/performance/wave-phase-comparison/comparison.json)

固定相位 2333ms、3999ms 的波浪区域像素完全一致；1000ms 的平均通道差为 0.1129/255，边缘有栅格化差异，人工检查波形、叠色和边界一致。原始 trace 和截图保存在本地 `artifacts/performance/`，不纳入 Git；精简 JSON 结果与测量脚本纳入版本控制。

## 壁纸抽屉合成路径

后续测量发现，壁纸展开仍通过全屏 `clip-path` 每帧改变裁切边界，并在首次输入时同时启动高清图请求。实现改为两个互逆的合成层：外层舞台以 `translate3d + scale3d` 连续扩展边界，内层视口执行逆变换保持图片坐标系稳定，图片本身继续在封面 `cover` 与全图 `contain` 取景间插值。拖动时间线在稳定态保留并复用，`will-change` 只在交互期间启用；高清资源在展开稳定后才请求和解码。

1440×900 的 Edge 153 轻量采样各运行三轮。CPU×4 下展开／收回 p95 均为 5.7ms，最大帧为 27.9–33.3ms；连续反向滚轮 p95 为 5.6–5.7ms，最大帧为 22.3ms；所有轮次 Long Task 为 0。未限速桌面除首轮浏览器唤醒出现一次 55.5ms 间隔外，其余展开／收回最大 5.8–11ms，连续反向最大 5.8ms。记录见 `artifacts/performance/motion-refactor-final/home-motion-summary.json`（本地验收产物，不纳入 Git）。

曾尝试把壁纸与波浪从根主题快照中分离；中间帧检查发现这会让主题图片先于圆形边界切换，并且 CPU×4 三轮最大帧 83.3–99.9ms，反而高于完整根快照的 66.6–72.2ms。因此撤销该实验，保留视觉正确且测量更快的完整圆形主题过渡。

## 回归验证

根项目 93 项与 Worker 30 项测试通过；Astro 检查无错误、警告和提示；22 页生产构建通过。构建仍有原有 Plot3D `eval` 提示，本轮不修改表达式执行机制。

独立 Edge 浏览器验收覆盖 1440×900、390×844（DPR 3）：顶栏区域的全局滚轮、手机下拉、固定顶栏及左栏、十次快速反向点击、主题切换、Escape、降低动态及路由清理均通过，无页面异常和横向溢出。见[交互验收结果](../artifacts/performance/review/verification.json)。

关闭详细 trace 后的桌面轻量采样结果如下。这是修改后的一轮观测值，不用于计算前后帧率提升比例；当前测试环境的帧调度约为 5.6ms，不能代表其他显示器或日常浏览器配置。

| 操作 | p95 帧间隔 | 最大帧间隔 | 长任务 |
| --- | ---: | ---: | ---: |
| 阅读区滚动 | 5.6ms | 16.7ms | 0 |
| 展开、收回两轮 | 5.6ms | 22.2ms | 0 |
| 连续反向滚轮 | 5.6ms | 5.7ms | 0 |

见[轻量采样记录](../artifacts/performance/light-sampling/home-motion-summary.json)。滚轮测试先把鼠标移到顶栏空白区，避免前一场景遗留的按钮悬停位置触发正常的控件手势保护。

## 复测方式

使用已有 Playwright 环境，无需增加项目依赖。先构建并在单独进程启动生产预览，再执行以下脚本。`PLAYWRIGHT_MODULE_ROOT` 指向包含 `playwright` 包的 `node_modules` 目录，也可传 `--playwright-root=绝对路径`。

```sh
pnpm build
pnpm preview --host 127.0.0.1 --port 4329
# 在另一个终端运行：
node scripts/perf/measure-home-motion.mjs --profiles=desktop --scenarios=idleWaves --runs=3
node scripts/perf/measure-home-motion.mjs --profiles=desktop --scenarios=pageScroll,toggleTwice,reverseWheel --trace=false --runs=1 --output=artifacts/performance/light-sampling
node scripts/perf/verify-home-motion.mjs
```

性能测量期间避免并行构建或启动其他浏览器测量。重型 trace 用于归因，关闭 trace 的轻量采样用于交互观察；最终体感仍需在用户日常浏览器配置中确认。
