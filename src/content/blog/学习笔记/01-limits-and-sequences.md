---
title: "高等数学第 1—2 章：函数极限与数列极限"
description: "由 13 页手写笔记整理而成，涵盖极限定义、计算方法、连续性、数列极限、递推数列与核心易错点。"
pubDate: "2026-09-24"
updatedDate: "2026-09-24"
author: "离子怪"
sourceUrl: "https://github.com/ice11123/blog_test2/blob/main/src/content/blog/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/01-limits-and-sequences.md"
dir1: "学习笔记"
dir2: "高等数学笔记"
tags: ["高等数学", "极限", "连续", "数列极限", "学习笔记"]
---

<span id="高等数学笔记函数极限与数列极限" class="article-top-anchor" aria-hidden="true"></span>

<a href="/blog_test2/blog/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/00-calculus-index/">← 返回高数笔记总索引</a>

> 来源：打开扫描 PDF
>
> 本文由 13 页手写扫描笔记转写而成。正文和常规公式已转换为可搜索的 Markdown/LaTeX；手绘图、涂改以及密集推导保留在对应原稿页图中。配色沿用原稿：蓝色用于章节、方法和补充，红色只用于订正、警示及重点图像，正文保持黑色。

> [!tip] Obsidian 导航
> 阅读视图中可直接单击本文链接；编辑或实时预览模式中请按住 `Ctrl` 再单击。

> [!note] 原稿星级
> <span class="priority-star">★</span>、<span class="priority-star">★★</span>、<span class="priority-star">★★★</span> 均按扫描原稿的位置和数量保留，红色仅用于显示原作者标出的重点层级。

## 目录

- <a href="#%E7%AC%AC%E4%B8%80%E7%AB%A0-%E5%87%BD%E6%95%B0%E6%9E%81%E9%99%90%E4%B8%8E%E8%BF%9E%E7%BB%AD">第一章 函数、极限与连续</a>
  - <a href="#page-01">极限定义与无穷小（第 1 页）</a>
  - <a href="#page-02">极限的性质（第 2 页）</a>
  - <a href="#page-03">左极限与右极限（第 3 页）</a>
  - <a href="#page-04">洛必达法则与幂指型（第 4 页）</a>
  - <a href="#page-05">泰勒展开（第 5 页）</a>
  - <a href="#page-06">重要极限与七种未定式（第 6 页）</a>
  - <a href="#page-07">常见极限不存在的情形（第 7 页）</a>
- <a href="#%E7%AC%AC%E4%BA%8C%E7%AB%A0-%E6%95%B0%E5%88%97%E6%9E%81%E9%99%90">第二章 数列极限</a>
  - <a href="#page-08">数列基础（第 8 页）</a>
  - <a href="#page-09">数列极限定义与性质（第 9 页）</a>
  - <a href="#page-10">夹逼与放缩（第 10 页）</a>
  - <a href="#page-11">常用不等式与压缩映射（第 11 页）</a>
  - <a href="#page-12">单调有界与 Stolz 定理（第 12 页）</a>
  - <a href="#page-13">收敛速度与计算路线（第 13 页）</a>
- <a href="#%E6%9E%81%E9%99%90%E8%AE%A1%E7%AE%97%E6%96%B9%E6%B3%95%E9%80%89%E6%8B%A9%E8%A1%A8">极限计算方法选择表</a>
- <a href="#%E6%A0%B8%E5%BF%83%E6%98%93%E9%94%99%E7%82%B9">核心易错点</a>
- <a href="#%E5%8E%9F%E7%A8%BF%E9%A1%B5%E5%9B%BE%E8%B6%85%E9%93%BE%E6%8E%A5">原稿页图超链接</a>

## 第一章 函数、极限与连续

> 本扫描件在本章中实际整理的是“函数极限”部分，未包含独立的连续性定义与性质。

### 一、极限的定义及性质

<!-- 原PDF第 1 页 -->

> [查看原稿第 1 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC01%E9%A1%B5.webp) · <a href="#%E7%9B%AE%E5%BD%95">返回目录</a>

<span id="page-01" class="source-page-anchor" aria-hidden="true"></span>

#### 1. 极限的定义

函数在点 $x_0$ 的去心邻域

$$
\mathring U(x_0,\delta)=\{x\mid 0<|x-x_0|<\delta\}.
$$

极限的 $\varepsilon$-$\delta$ 定义：

> **核心公式｜核心定义**
> $$
> \lim_{x\to x_0}f(x)=A
> \Longleftrightarrow
> \forall\varepsilon>0,\ \exists\delta>0,\
> 0<|x-x_0|<\delta\Rightarrow |f(x)-A|<\varepsilon.
> $$

#### 2. 无穷小与无穷大

- 无穷小量：$\displaystyle \lim_{x\to x_0}f(x)=0$。
- 无穷大量：$\displaystyle \lim_{x\to x_0}f(x)=\infty$。无穷大量的极限不是有限实数。

无穷小的比较（设 $\alpha(x)\to0$、$\beta(x)\to0$）：

$$
\lim\frac{\beta(x)}{\alpha(x)}=
\begin{cases}
0, & \beta\text{ 是 }\alpha\text{ 的高阶无穷小};\\
\infty, & \beta\text{ 是 }\alpha\text{ 的低阶无穷小};\\
A\ne0, & \beta\text{ 与 }\alpha\text{ 是同阶无穷小};\\
1, & \alpha\sim\beta\text{（等价无穷小）}.
\end{cases}
$$

若

$$
\lim\frac{\beta}{\alpha^k}=A\ne0,
$$

则称 $\beta$ 是 $\alpha$ 的 $k$ 阶无穷小。

#### 3. 等价无穷小的基本思想

<span class="priority-star">★</span>

在极限计算中可忽略高阶无穷小。例如

$$
x+x^3\sim x\qquad(x\to0).
$$

也可由泰勒展开理解：

$$
\tan x=x+\frac{x^3}{3}+o(x^3),
$$

其中相对低阶主项而言，高阶余项可以忽略。

#### 4. 常见等价无穷小

<span class="priority-star">★★★</span>

以下均在 $x\to0$ 时成立：

| 等价式 | 等价式 |
| --- | --- |
| $\sin x\sim x$ | $\tan x\sim x$ |
| $\ln(1+x)\sim x$ | $e^x-1\sim x$ |
| $\arcsin x\sim x$ | $\arctan x\sim x$ |
| $\log_a(1+x)\sim\dfrac{x}{\ln a}$ | $x-\ln(1+x)\sim\dfrac{x^2}{2}$ |
| $1-\cos x\sim\dfrac{x^2}{2}$ | $\ln\!\left(x+\sqrt{1+x^2}\right)\sim x$ |
| $x-\sin x\sim\dfrac{x^3}{6}$ | $\tan x-x\sim\dfrac{x^3}{3}$ |
| $(1+x)^\alpha-1\sim\alpha x$ | $\arcsin x-x\sim\dfrac{x^3}{6}$ |
| $x-\arctan x\sim\dfrac{x^3}{3}$ | $\tan x-\sin x\sim\dfrac{x^3}{2}$ |

幂指型常写成

$$
u^v=e^{v\ln u}.
$$

当 $u\to1$ 时，应先计算 $v\ln u$ 的极限。虽然 $\ln u\sim u-1$，但当 $v$ 发散时，不能无条件把指数中的 $\ln u$ 替换为 $u-1$。只有在

$$
v\bigl[\ln u-(u-1)\bigr]\to0
$$

时，才有

$$
e^{v\ln u}\sim e^{v(u-1)}.
$$


<!-- 原PDF第 2 页 -->

> [查看原稿第 2 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC02%E9%A1%B5.webp) · <a href="#%E7%9B%AE%E5%BD%95">返回目录</a>

<span id="page-02" class="source-page-anchor" aria-hidden="true"></span>

#### 5. 无穷小相关运算提示

- 常数与不存在的极限或无穷大量做加减，结果一般仍可能不存在或为无穷。
- $0\cdot\infty$、$\infty-\infty$ 等不能直接判断，必须比较阶数或变形。
- <span class="priority-star">★</span> 若 $f$ 有界且 $\alpha\to0$，则 $\alpha f\to0$；等价地，有界量除以无穷大量趋于 $0$。
- 两个本身不存在的量相加减，结果可能存在，也可能不存在。
- $\infty\cdot\infty$ 仍表现为无穷大量，但符号需结合具体情形判断。

#### 6. 极限的性质

1. **唯一性**

   $$
   \lim_{x\to x_0}f(x)=A
   $$

   中的极限 $A$ 唯一。

2. **局部有界性**

   若 $\displaystyle\lim_{x\to x_0}f(x)=A$ 为有限值，则存在 $M>0$ 和 $\delta>0$，使得

   $$
   0<|x-x_0|<\delta\Rightarrow |f(x)|\le M.
   $$

3. <span class="priority-star">★★★</span> **局部保号性**

   - 若 $\displaystyle\lim_{x\to x_0}f(x)>0$，则在某个去心邻域内 $f(x)>0$。
   - 若在某个去心邻域内 $f(x)\ge0$ 且极限存在，则极限 $\ge0$。

4. **单调有界准则（函数形式）**

   单调递增且有上界，或单调递减且有下界时，相应的单侧极限存在。

5. **四则运算**

   设 $\displaystyle\lim f(x)=A$、$\displaystyle\lim g(x)=B$，则

   $$
   \lim c=c,
   $$

   $$
   \lim[f(x)\pm g(x)]=A\pm B,
   $$

   $$
   \lim[f(x)g(x)]=AB,
   $$

   $$
   \lim\frac{f(x)}{g(x)}=\frac AB\qquad(B\ne0).
   $$

6. <span class="priority-star">★★★</span> **夹逼准则**

   若在 $x_0$ 的某个去心邻域内

   $$
   g(x)\le f(x)\le h(x),
   $$

   且

   $$
   \lim_{x\to x_0}g(x)=\lim_{x\to x_0}h(x)=A,
   $$

   则

   $$
   \lim_{x\to x_0}f(x)=A.
   $$

7. **局部保序性**

   若在某个去心邻域内 $f(x)\le g(x)$，且两者极限分别为 $A$、$B$，则 $A\le B$。


<!-- 原PDF第 3 页 -->

> [查看原稿第 3 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC03%E9%A1%B5.webp) · <a href="#%E7%9B%AE%E5%BD%95">返回目录</a>

<span id="page-03" class="source-page-anchor" aria-hidden="true"></span>

#### 7. 左极限与右极限

> **核心公式｜双侧极限存在的充要条件**
> $$
> \lim_{x\to x_0}f(x)=A
> \Longleftrightarrow
> \lim_{x\to x_0^-}f(x)=A
> \ \text{且}\
> \lim_{x\to x_0^+}f(x)=A.
> $$


### 二、极限计算与方法

<!-- 原PDF第 4 页 -->

> [查看原稿第 4 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC04%E9%A1%B5.webp) · <a href="#%E7%9B%AE%E5%BD%95">返回目录</a>

<span id="page-04" class="source-page-anchor" aria-hidden="true"></span>

#### 1. 洛必达法则

<span class="priority-star">★★★</span>

适用于 $\dfrac00$ 型或 $\dfrac\infty\infty$ 型未定式。在满足相应条件时，

$$
\lim\frac{f(x)}{g(x)}
=\lim\frac{f'(x)}{g'(x)}
=\lim\frac{f''(x)}{g''(x)}
=\cdots.
$$

- 分子、分母求导后若仍为未定式，可以继续使用。
- 洛必达法则的逆命题一般不成立。
- 若反复求导仍不能简化，应改用其他方法。

若极限中含幂指结构，可先取对数或把变量从指数中提出，再处理所得极限。

#### 2. 无穷小的忽略与直接计算

<span class="priority-star">★</span> 常见增长速度（$n\to\infty$，$a>1$，$\alpha,\beta>0$）：

$$
(\ln n)^\alpha\ll n^\beta\ll a^n\ll n!\ll n^n.
$$

更一般地，

$$
(\ln x)^\alpha\ll x^\beta\ll a^x.
$$

若 $f(n)=o(g(n))$，则

$$
\lim_{n\to\infty}\frac{f(n)}{g(n)}=0,
\qquad
\lim_{n\to\infty}\frac{g(n)}{f(n)}=\infty
$$

（需同时考虑符号和分母非零条件）。

在和或差中，可以保留最高阶无穷大（或最低阶无穷小）并忽略低阶项；但不能不经变形就在任意乘除结构中直接删项。

例：

$$
\lim_{n\to\infty}\frac{n^{100}+2^n}{3^n+2^n}
=\lim_{n\to\infty}\left(\frac23\right)^n=0.
$$

利用泰勒展开：

$$
\tan x=x+\frac{x^3}{3}+\frac{2x^5}{15}+o(x^5),
$$

按所需精度保留到第一个不被抵消的项。

#### 3. 幂指型未定式

<span class="priority-star">★</span>

$0\cdot\infty$ 型先改写为商；$1^\infty$、$\infty^0$、$0^0$ 型使用

$$
u^v=e^{v\ln u}
$$

化为指数函数极限。

例如

$$
\lim_{n\to\infty}\sqrt[n]{n}
=\lim_{n\to\infty}e^{\frac{\ln n}{n}}
=1.
$$

> [!source-note] 原稿说明
> 本页末尾有一段被划去的“综合例题”演算。为避免把废弃步骤误写成结论，不将其并入正文；原始内容完整保留在原稿页图中。


<!-- 原PDF第 5 页 -->

> [查看原稿第 5 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC05%E9%A1%B5.webp) · <a href="#%E7%9B%AE%E5%BD%95">返回目录</a>

<span id="page-05" class="source-page-anchor" aria-hidden="true"></span>

#### 4. 泰勒展开

<span class="priority-star">★★★</span>

在 $x=0$ 处的泰勒展开：

$$
f(x)=f(0)+f'(0)x+\frac{f''(0)}{2!}x^2+\cdots+
\frac{f^{(n)}(0)}{n!}x^n+o(x^n).
$$

<span class="priority-star">★★★</span> 常用麦克劳林展开：

$$
\ln(1+x)=\sum_{k=1}^{\infty}\frac{(-1)^{k+1}}{k}x^k
=x-\frac{x^2}{2}+\frac{x^3}{3}-\cdots,
\qquad x\in(-1,1],
$$

$$
\frac1{1+x}=\sum_{k=0}^{\infty}(-1)^k x^k
=1-x+x^2-x^3+\cdots,
\qquad |x|<1,
$$

$$
\frac1{1-x}=\sum_{k=0}^{\infty}x^k
=1+x+x^2+x^3+\cdots,
\qquad |x|<1,
$$

$$
(1+x)^\alpha
=1+\alpha x+\frac{\alpha(\alpha-1)}{2!}x^2+
\frac{\alpha(\alpha-1)(\alpha-2)}{3!}x^3+\cdots,
\qquad x\in(-1,1),
$$

$$
e^x=1+x+\frac{x^2}{2!}+\frac{x^3}{3!}+\cdots+\frac{x^n}{n!}+\cdots,
$$

$$
\sin x=x-\frac{x^3}{3!}+\frac{x^5}{5!}-\cdots+
\frac{(-1)^n x^{2n+1}}{(2n+1)!}+\cdots,
$$

$$
\cos x=1-\frac{x^2}{2!}+\frac{x^4}{4!}-\cdots+
\frac{(-1)^n x^{2n}}{(2n)!}+\cdots,
$$

$$
\tan x=x+\frac{x^3}{3}+\frac{2x^5}{15}+\cdots,
$$

$$
\arcsin x=x+\frac{x^3}{6}+\frac{3x^5}{40}+\cdots+
\frac{(2n)!}{4^n(n!)^2(2n+1)}x^{2n+1}+\cdots,
$$

$$
\arctan x=x-\frac{x^3}{3}+\frac{x^5}{5}-\cdots+
\frac{(-1)^n}{2n+1}x^{2n+1}+\cdots,
$$

$$
\operatorname{arsinh}x
=x-\frac{x^3}{6}+\frac{3x^5}{40}-\cdots
=\ln\left(x+\sqrt{1+x^2}\right).
$$

由展开式可得到更高阶的等价无穷小：

$$
x-\ln(1+x)\sim\frac{x^2}{2},
$$

$$
(1+x)^\alpha-1\sim\alpha x,
$$

$$
e^x-1\sim x,
$$

$$
x-\sin x\sim\frac{x^3}{6},
$$

$$
\tan x-x\sim\frac{x^3}{3},
$$

$$
1-\cos x\sim\frac{x^2}{2},
$$

$$
\arcsin x-x\sim\frac{x^3}{6},
$$

$$
x-\arctan x\sim\frac{x^3}{3},
$$

$$
\tan x-\sin x\sim\frac{x^3}{2}.
$$

> **图像记忆｜图像记忆**
> 原稿用红色曲线在同一坐标系比较了 $\tan x$、$\arcsin x$、$x$、$\sin x$、$\arctan x$ 等函数在 $0$ 附近的大小关系，并标注“相邻函数间存在对应的高阶差”。

<img src="/blog_test2/notes/calculus/images/chapters-1-2/%E5%9B%BE-%E7%AC%AC05%E9%A1%B5-%E5%87%BD%E6%95%B0%E9%AB%98%E9%98%B6%E5%85%B3%E7%B3%BB.webp" alt="函数在零点附近的高阶关系图" loading="lazy" decoding="async">

<!-- 原PDF第 6 页 -->

> [查看原稿第 6 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC06%E9%A1%B5.webp) · <a href="#%E7%9B%AE%E5%BD%95">返回目录</a>

<span id="page-06" class="source-page-anchor" aria-hidden="true"></span>

#### 5. 展开原则

1. **商 $A/B$ 型**：分子、分母展开到相同的有效阶数。

   例：

   $$
   \lim_{x\to0}\frac{x-\ln(1+x)}{x^2}
   =\lim_{x\to0}\frac{x-(x-\frac{x^2}{2}+o(x^2))}{x^2}
   =\frac12.
   $$

2. **差 $A-B$ 型**：分别展开，直到找到相减后第一个不抵消的非零项。

   例：

   $$
   \cos x-e^{-x^2/2}
   =\left(1-\frac{x^2}{2}+\frac{x^4}{24}+o(x^4)\right)
   -\left(1-\frac{x^2}{2}+\frac{x^4}{8}+o(x^4)\right)
   \sim-\frac{x^4}{12}.
   $$

#### 6. 两个重要极限

> **核心公式｜必须熟记**
> $$
> \lim_{x\to0}\frac{\sin x}{x}=1,
> $$
>
> $$
> \lim_{x\to\infty}\left(1+\frac1x\right)^x=e,
> $$
>
> $$
> \lim_{x\to0}(1+x)^{1/x}=e.
> $$

#### 7. 夹逼准则

若

$$
h(x)\le f(x)\le g(x),
$$

且两侧同趋于 $A$（或同趋于 $+\infty$），则中间函数也趋于 $A$（或 $+\infty$）。

#### 8. 七种未定式

| 类别 | 未定式 | 常用处理方式 |
| --- | --- | --- |
| 基本型 | $\dfrac00$、$\dfrac\infty\infty$ | 洛必达法则、等价无穷小、泰勒展开 |
| 转化型 | $0\cdot\infty$ | 改写为商，化成基本型 |
| 转化型 | $\infty-\infty$ | 通分、根式有理化、泰勒展开 |
| 幂指型 | $1^\infty$、$\infty^0$、$0^0$ | 写成 $u^v=e^{v\ln u}$，先求 $v\ln u$ |

幂指型中常见的指数判断：

- $v\ln u\to0$，则 $u^v\to1$；
- $v\ln u\to-\infty$，则 $u^v\to0$；
- $v\ln u\to+\infty$，则 $u^v\to+\infty$。


<!-- 原PDF第 7 页 -->

> [查看原稿第 7 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC07%E9%A1%B5.webp) · <a href="#%E7%9B%AE%E5%BD%95">返回目录</a>

<span id="page-07" class="source-page-anchor" aria-hidden="true"></span>

#### 9. 常见极限不存在的情形

1. **绝对值导致左右极限不同**

   例如

   $$
   \frac{|\sin x|}{x},\qquad
   \frac{\sin x}{|x|},\qquad
   \frac{x}{|x|},\qquad
   \frac{|x|}{x}
   $$

   在 $x\to0$ 时通常需要分别考察左右极限。

2. **三角函数在 $x\to\infty$ 时振荡**

   $\sin x$、$\cos x$、$\tan x$ 以及相应倒数函数通常没有极限。

3. **反正切函数的特殊情况**

   $$
   \lim_{x\to+\infty}\arctan x=\frac\pi2,
   \qquad
   \lim_{x\to-\infty}\arctan x=-\frac\pi2,
   $$

   $$
   \lim_{x\to0^+}\arctan\frac1x=\frac\pi2,
   \qquad
   \lim_{x\to0^-}\arctan\frac1x=-\frac\pi2.
   $$

   因而 $\displaystyle\lim_{x\to0}\arctan\frac1x$ 不存在；另一方面，

   $$
   \lim_{x\to0}\arctan x=0,
   \qquad
   \lim_{x\to\infty}\arctan\frac1x=0.
   $$

> **编辑说明｜转写校正说明**
> 原稿标题处疑似把“$\arctan$”写成“$\arcsin$”，但紧随其后的公式和图像全部是反正切函数。正文按公式所表达的 $\arctan$ 转写，原写法保留在页图中。


## 第二章 数列极限

### 一、数列及其极限

<!-- 原PDF第 8 页 -->

> [查看原稿第 8 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC08%E9%A1%B5.webp) · <a href="#%E7%9B%AE%E5%BD%95">返回目录</a>

<span id="page-08" class="source-page-anchor" aria-hidden="true"></span>

#### 1. 数列

**等差数列**：

$$
a_n=a_1+(n-1)d,
$$

$$
S_n=\frac{(a_1+a_n)n}{2}
=\frac{[2a_1+(n-1)d]n}{2}.
$$

**等比数列**：

$$
a_n=a_1q^{n-1},
$$

$$
S_n=
\begin{cases}
na_1, & q=1,\\
\dfrac{a_1(1-q^n)}{1-q}, & q\ne1.
\end{cases}
$$

并且

$$
1+q+q^2+\cdots+q^{n-1}=\frac{1-q^n}{1-q}\qquad(q\ne1).
$$

#### 2. 单调数列与有界数列

- 若对任意 $n\in\mathbb N^*$，$a_{n+1}\ge a_n$，则数列单调不减；若 $a_{n+1}\le a_n$，则单调不增。
- 若存在 $M>0$，使任意 $n\in\mathbb N^*$ 都有 $|a_n|\le M$，则数列有界。

证明有界性的常见方法：

1. 直接寻找 $M$；
2. 缩放法；
3. 求最值；
4. 数学归纳法。

#### 3. 常见前 $n$ 项和

$$
\sum_{k=1}^n k=1+2+\cdots+n=\frac{n(n+1)}2,
$$

$$
\sum_{k=1}^n k^2=1^2+2^2+\cdots+n^2
=\frac{n(n+1)(2n+1)}6,
$$

$$
\sum_{k=1}^n\frac1{k(k+1)}
=\frac12+\frac1{2\cdot3}+\cdots+\frac1{n(n+1)}
=\frac n{n+1}.
$$

#### 4. 两个重要数列

$$
\left\{\left(1+\frac1n\right)^n\right\}
\text{ 单调递增，且 }
\lim_{n\to\infty}\left(1+\frac1n\right)^n=e,
$$

$$
\left\{(1+n)^{1/n}\right\}
\text{ 单调递减，且 }
\lim_{n\to\infty}(1+n)^{1/n}=1.
$$

<img src="/blog_test2/notes/calculus/images/chapters-1-2/%E5%9B%BE-%E7%AC%AC08%E9%A1%B5-%E9%87%8D%E8%A6%81%E6%95%B0%E5%88%97.webp" alt="两个重要数列的单调性与极限" loading="lazy" decoding="async">

<!-- 原PDF第 9 页 -->

> [查看原稿第 9 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC09%E9%A1%B5.webp) · <a href="#%E7%9B%AE%E5%BD%95">返回目录</a>

<span id="page-09" class="source-page-anchor" aria-hidden="true"></span>

#### 5. 数列极限的定义

<span class="priority-star">★★★</span>

> **核心公式｜核心定义**
> $$
> \forall\varepsilon>0,\ \exists N\in\mathbb N^*,\
> n>N\Rightarrow |x_n-a|<\varepsilon
> \Longleftrightarrow
> \lim_{n\to\infty}x_n=a.
> $$

数列是自变量为离散整数的函数，而函数极限中的自变量可以连续变化。

几何意义：无论 $\varepsilon>0$ 多小，从数列某一项开始，其后所有项都落在区间

$$
(a-\varepsilon,a+\varepsilon)
$$

内；区间长度为 $2\varepsilon$，区间外只有有限项。

#### 6. 数列极限的性质

1. **唯一性**：若 $\lim x_n=a$，则 $a$ 唯一。
2. **有界性**：收敛数列必有界。
3. **保号性与保序性**：
   - 若 $\displaystyle\lim_{n\to\infty}x_n=L>a$（或 $L<a$），则充分靠后的项满足 $x_n>a$（或 $x_n<a$）；
   - 若充分靠后的项满足 $x_n\ge a$（或 $\le a$），且极限存在，则极限 $\ge a$（或 $\le a$）。
4. **子列性质**：原数列收敛，则任意子列收敛于同一极限；若有两个子列极限不同，则原数列发散。
5. **四则运算**：若 $\lim x_n=a$、$\lim y_n=b$，则

   $$
   \lim(x_n\pm y_n)=a\pm b,
   $$

   $$
   \lim(x_ny_n)=ab,
   $$

   $$
   \lim\frac{x_n}{y_n}=\frac ab\qquad(b\ne0).
   $$

6. <span class="priority-star">★★★</span> **绝对值**：

   $$
   \lim a_n=0\Longleftrightarrow\lim|a_n|=0.
   $$

   一般地，若 $\lim f(x)=A$，则 $\lim|f(x)|=|A|$；反向推断只有在极限为 $0$ 等附加条件下才能成立。

7. **收敛与有界**：收敛数列必有界；有界数列不一定收敛。单调有界数列必收敛。

8. <span class="priority-star">★</span> **根式与最大项思想**：处理 $n$ 次根、若干正项之和时，可以比较最大项并使用夹逼；原稿的具体演算见页图。


### 二、数列极限的法则与计算

<!-- 原PDF第 10 页 -->

> [查看原稿第 10 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC10%E9%A1%B5.webp) · <a href="#%E7%9B%AE%E5%BD%95">返回目录</a>

<span id="page-10" class="source-page-anchor" aria-hidden="true"></span>

#### 1. 海涅（归结）定理

<span class="priority-star">★★★</span>

函数极限可以转化为相应数列极限：若 $f(x)$ 在 $x_0$ 的某个去心邻域有定义，则

$$
\lim_{x\to x_0}f(x)=A
$$

等价于：对任何满足 $x_n\to x_0$ 且 $x_n\ne x_0$ 的数列，都有

$$
\lim_{n\to\infty}f(x_n)=A.
$$

该定理可用于把函数极限的洛必达法、泰勒展开、左右极限等方法迁移到数列问题。

#### 2. 数列夹逼准则

<span class="priority-star">★★</span>

若存在 $n_0$，当 $n>n_0$ 时

$$
y_n\le x_n\le z_n,
$$

且

$$
\lim_{n\to\infty}y_n
=\lim_{n\to\infty}z_n=a,
$$

则

$$
\lim_{n\to\infty}x_n=a.
$$

证明夹逼关系时常用放缩、函数性质及常见数列估计。

#### 3. 常用放缩方法

<span class="priority-star">★★★</span>

1. **最小项与最大项**

   若 $u_{\min}\le u_i\le u_{\max}$，则

   $$
   n u_{\min}\le u_1+u_2+\cdots+u_n\le n u_{\max}.
   $$

   若所有 $u_i\ge0$，还可写成

   $$
   u_{\max}\le u_1+u_2+\cdots+u_n\le n u_{\max}.
   $$

2. <span class="priority-star">★</span> **绝对值与三角不等式**

   $$
   |a\pm b|\le |a|+|b|,
   \qquad
   \bigl||a|-|b|\bigr|\le |a-b|,
   $$

   $$
   |a_1\pm a_2\pm\cdots\pm a_n|
   \le |a_1|+|a_2|+\cdots+|a_n|.
   $$

3. **算术平均、几何平均与均方根（正数）**

   $$
   \sqrt{ab}\le\frac{a+b}{2}
   \le\sqrt{\frac{a^2+b^2}{2}},
   $$

   $$
   \sqrt[3]{abc}\le\frac{a+b+c}{3}
   \le\sqrt{\frac{a^2+b^2+c^2}{3}}.
   $$

4. <span class="priority-star">★</span> **比值放缩**

   在正数并满足相应大小关系时，可通过分子、分母分别放缩得到比值的上下界；原稿给出的示意见页图。


<!-- 原PDF第 11 页 -->

> [查看原稿第 11 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC11%E9%A1%B5.webp) · <a href="#%E7%9B%AE%E5%BD%95">返回目录</a>

<span id="page-11" class="source-page-anchor" aria-hidden="true"></span>

#### 4. 常见函数性质与不等式

幂函数比较需要区分指数符号：

$$
a\ge b\ge0,\ m>0\Rightarrow a^m\ge b^m,
$$

$$
a\ge b>0,\ m<0\Rightarrow a^m\le b^m.
$$

常用三角函数不等式：

$$
\sin x<x\qquad(x>0),
$$

$$
\sin x<x<\tan x\qquad\left(0<x<\frac\pi2\right),
$$

$$
x<\tan x<\frac4\pi x
\qquad\left(0<x<\frac\pi4\right),
$$

$$
\sin x>\frac2\pi x
\qquad\left(0<x<\frac\pi2\right),
$$

$$
\arctan x\le x\le\arcsin x
\qquad(0\le x\le1).
$$

<span class="priority-star">★</span> 常用指数、对数不等式：

$$
e^x\ge x+1\qquad(x\in\mathbb R),
$$

$$
x-1\ge\ln x\qquad(x>0),
$$

$$
\frac{x}{1+x}<\ln(1+x)<x\qquad(x>0).
$$

#### 5. 压缩映射思想

<span class="priority-star">★★★</span>

若存在 $k\in(0,1)$，使数列满足

$$
|x_{n+1}-a|\le k|x_n-a|,
$$

则

$$
0\le|x_{n+1}-a|le k|x_n-a|le\cdots
\le k^n|x_1-a|\to0,
$$

所以 $x_n\to a$。

对递推数列

$$
x_{n+1}=f(x_n),
$$

若 $f(a)=a$，且在相关区间内 $|f'(x)|\le k<1$，则由拉格朗日中值定理

$$
|x_{n+1}-a|
=|f(x_n)-f(a)|
=|f'(\xi_n)|\,|x_n-a|
\le k|x_n-a|,
$$

从而 $x_n\to a$。

<img src="/blog_test2/notes/calculus/images/chapters-1-2/%E5%9B%BE-%E7%AC%AC11%E9%A1%B5-%E5%87%BD%E6%95%B0%E6%AF%94%E8%BE%83.webp" alt="三角函数、反三角函数及指数对数函数比较图" loading="lazy" decoding="async">

<!-- 原PDF第 12 页 -->

> [查看原稿第 12 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC12%E9%A1%B5.webp) · <a href="#%E7%9B%AE%E5%BD%95">返回目录</a>

<span id="page-12" class="source-page-anchor" aria-hidden="true"></span>

#### 6. 单调有界准则

> **核心公式｜判定结论**
> 单调有界数列必收敛：
>
> - 单调递增且有上界 $\Rightarrow$ 收敛；
> - 单调递减且有下界 $\Rightarrow$ 收敛。

若

$$
x_n\le x_{n+1}\le a,
$$

则 $x_n$ 单调递增且以 $a$ 为上界；若

$$
a\le x_{n+1}\le x_n,
$$

则 $x_n$ 单调递减且以 $a$ 为下界。

<span class="priority-star">★</span> 证明单调性的常见方法：

1. 数学归纳法；
2. <span class="priority-star">★</span> 对递推式 $x_{n+1}=f(x_n)$ 使用函数的单调性；
3. 作差：判断 $x_{n+1}-x_n$ 的符号；
4. 正项数列可作商：比较 $\dfrac{x_{n+1}}{x_n}$ 与 $1$；
5. 必要时利用基本不等式。

#### 7. 斯托尔茨定理（Stolz-Cesàro）

<span class="priority-star">★</span>

用于数列的 $\dfrac00$ 型或 $\dfrac\infty\infty$ 型。常用条件分别为：

- $\dfrac\infty\infty$ 型：$y_n$ 严格递增且 $y_n\to+\infty$；
- $\dfrac00$ 型：$x_n\to0$，$y_n>0$ 严格递减且 $y_n\to0$。

在相应条件成立、差分分母非零，并且

$$
\lim_{n\to\infty}\frac{x_{n+1}-x_n}{y_{n+1}-y_n}=L,
$$

则

$$
\lim_{n\to\infty}\frac{x_n}{y_n}=L,
$$

其中 $L$ 可以为有限数或无穷。

<span class="priority-star">★★★</span> 例：求

$$
\lim_{n\to\infty}
\frac{\displaystyle\sum_{k=n}^{\infty}\frac1{k^3}}
{\dfrac1{n^2}}.
$$

令

$$
x_n=\sum_{k=n}^{\infty}\frac1{k^3},
\qquad
y_n=\frac1{n^2},
$$

则

$$
x_{n+1}-x_n=-\frac1{n^3},
$$

$$
y_{n+1}-y_n
=\frac1{(n+1)^2}-\frac1{n^2},
$$

代入差商可得原极限为

$$
\frac12.
$$

对 $\infty/\infty$ 型，原稿还给出了

$$
\lim_{n\to\infty}
\frac{1^k+2^k+\cdots+n^k}{n^{k+1}}
=\frac1{k+1}
\qquad(k\in\mathbb N^*)
$$

的 Stolz 推导。

> **重点订正｜红笔订正**
> 使用 Stolz 定理时必须核对分母数列的严格单调性及对应条件。差商极限不存在时，不能简单据此断定原比值极限不存在；Stolz 定理在这里不能反向使用。


<!-- 原PDF第 13 页 -->

> [查看原稿第 13 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC13%E9%A1%B5.webp) · <a href="#%E7%9B%AE%E5%BD%95">返回目录</a>

<span id="page-13" class="source-page-anchor" aria-hidden="true"></span>

#### 8. 两个趋于同一极限的数列：收敛速度

若

$$
\lim_{n\to\infty}x_n=a,
\qquad
\lim_{n\to\infty}y_n=a,
$$

记误差

$$
u_n=|x_n-a|,
\qquad
v_n=|y_n-a|.
$$

若

$$
L=\lim_{n\to\infty}\frac{u_n}{v_n},
$$

则：

- $L=0$：$x_n$ 比 $y_n$ 收敛快；
- $L=b>0$：二者同阶，$x_n$ 的误差渐近为 $y_n$ 误差的 $b$ 倍；
- $L=\infty$：$x_n$ 比 $y_n$ 收敛慢。

计算时的增长速度顺序：

> **核心公式｜增长速度**
> $$
> (\ln n)^\alpha\ll n^\beta\ll a^n\ll n!\ll n^n
> \qquad(a>1,\ \alpha>0,\ \beta>0).
> $$

<span class="priority-star">★</span> 在和、差及根式比较中保留足以决定极限的主导项；在其他结构中先进行合法变形，不能直接删项。

#### 9. 数列极限计算的识别路径

##### 9.1 先识别通项或代数结构

1. **显式初等函数型**：通项只含 $n$ 的有理式、幂、指数、对数、三角函数、常数 $\pi$、阶乘 $n!$ 等。
2. **无穷项累加型**：包含关于 $n$ 的求和符号 $\sum$。
3. **连续乘积或根式型**：包含乘积符号 $\prod$，或根式中包含 $n$。
4. **阶乘、指数混合型**：同时含 $n!$、$a^n$、$n^n$ 等不同增长速度的项。
5. **递推关系型**：形如 $x_{n+1}=f(x_n)$，不能直接得到通项。

##### 9.2 对应方法

- **第 1 类**：使用等价无穷小、泰勒展开、最高阶项比较等函数极限方法。
- **第 2 类**：
  - 若可写成
    $$
    \frac1n\sum_{k=1}^n f\!\left(\frac kn\right),
    $$
    则识别为黎曼和：
    $$
    \lim_{n\to\infty}\frac1n\sum_{k=1}^n f\!\left(\frac kn\right)
    =\int_0^1 f(x)\,dx.
    $$
  - 也可使用夹逼、放缩或 Stolz 定理。
- **第 3 类**：对乘积或幂取对数，把乘法转化为加法；幂指型写成 $u_n^{v_n}=e^{v_n\ln u_n}$。
- **第 4 类**：比较收敛或增长速度，保留最高阶项、忽略低阶项，再进行因式分解。
- **第 5 类（递推数列）**：
  1. 证明单调有界；
  2. 设极限为 $A$，由递推关系求解 $A=f(A)$；
  3. 用数学归纳法证明有界性和单调性；
  4. 若出现 $(-1)^n$ 等正负交替，应额外检查振荡与子列极限，不能直接设极限。

> **蓝笔补充｜蓝笔补充**
> 对 $n$ 求导不是处理数列极限的通用合法步骤；应把表达式转化为函数问题后再使用相应定理，或直接采用数列方法。

---

## 极限计算方法选择表

| 观察到的结构 | 优先考虑的方法 | 使用前检查 |
| --- | --- | --- |
| $0/0$、$\infty/\infty$ | 因式分解、等价无穷小、泰勒展开、洛必达法则 | 洛必达法则的适用条件是否成立 |
| $0\cdot\infty$ | 改写为商 | 变形后是否成为基本未定式 |
| $\infty-\infty$ | 通分、有理化、提取主导项、泰勒展开 | 相减后首个不抵消项 |
| $1^\infty$、$0^0$、$\infty^0$ | 写成 $e^{v\ln u}$ | 先求 $v\ln u$，不能随意替换指数中的等价无穷小 |
| 含 $\sum$ 的数列 | 裂项、夹逼、黎曼和、Stolz 定理 | 项数、步长和积分区间是否匹配 |
| 递推数列 $x_{n+1}=f(x_n)$ | 单调有界、压缩映射、不动点方程 | 先证明收敛，再令极限满足 $A=f(A)$ |
| 多种增长速度混合 | 提取最高阶项或比较阶数 | 只在合法的和差或因式分解后忽略低阶项 |

<a href="#%E7%9B%AE%E5%BD%95">返回目录</a> · <a href="#%E9%AB%98%E7%AD%89%E6%95%B0%E5%AD%A6%E7%AC%94%E8%AE%B0%E5%87%BD%E6%95%B0%E6%9E%81%E9%99%90%E4%B8%8E%E6%95%B0%E5%88%97%E6%9E%81%E9%99%90">返回顶部</a>

## 核心易错点

> **易错警示｜易错清单**
> 1. 等价无穷小通常用于乘积、商或经过合法变形的表达式，不能在任意加减式中直接替换。
> 2. $\infty$ 不是普通实数；$0\cdot\infty$、$\infty-\infty$ 等都是未定式。
> 3. 使用洛必达法则前必须确认极限类型及定理条件；反复求导不能简化时应更换方法。
> 4. 在幂指型中，即使 $\ln u\sim u-1$，也要检查外部因子是否会放大替换误差。
> 5. 收敛数列必有界，但有界数列未必收敛；单调与有界两个条件缺一不可。
> 6. Stolz 定理不能反向使用；差商极限不存在，不能直接推出原比值极限不存在。
> 7. 对递推数列，直接解 $A=f(A)$ 只能得到候选极限，不能替代收敛性证明。

<a href="#%E7%9B%AE%E5%BD%95">返回目录</a> · <a href="#%E9%AB%98%E7%AD%89%E6%95%B0%E5%AD%A6%E7%AC%94%E8%AE%B0%E5%87%BD%E6%95%B0%E6%9E%81%E9%99%90%E4%B8%8E%E6%95%B0%E5%88%97%E6%9E%81%E9%99%90">返回顶部</a>

---

## 原稿页图超链接

如需逐字核对颜色、箭头、涂改或空间布局，可查看以下原稿图：

1. [第 1 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC01%E9%A1%B5.webp)
2. [第 2 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC02%E9%A1%B5.webp)
3. [第 3 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC03%E9%A1%B5.webp)
4. [第 4 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC04%E9%A1%B5.webp)
5. [第 5 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC05%E9%A1%B5.webp)
6. [第 6 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC06%E9%A1%B5.webp)
7. [第 7 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC07%E9%A1%B5.webp)
8. [第 8 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC08%E9%A1%B5.webp)
9. [第 9 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC09%E9%A1%B5.webp)
10. [第 10 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC10%E9%A1%B5.webp)
11. [第 11 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC11%E9%A1%B5.webp)
12. [第 12 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC12%E9%A1%B5.webp)
13. [第 13 页](/blog_test2/notes/calculus/images/chapters-1-2/%E5%8E%9F%E7%A8%BF-%E7%AC%AC13%E9%A1%B5.webp)

<a href="#%E7%9B%AE%E5%BD%95">返回目录</a> · <a href="#%E9%AB%98%E7%AD%89%E6%95%B0%E5%AD%A6%E7%AC%94%E8%AE%B0%E5%87%BD%E6%95%B0%E6%9E%81%E9%99%90%E4%B8%8E%E6%95%B0%E5%88%97%E6%9E%81%E9%99%90">返回顶部</a>
