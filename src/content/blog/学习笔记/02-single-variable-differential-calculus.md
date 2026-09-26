---
title: "高等数学第 3—7 章：一元函数微分学"
description: "由 26 页手写笔记整理而成，系统梳理导数、微分、函数性态、中值定理、泰勒公式与证明方法。"
pubDate: "2026-09-24"
updatedDate: "2026-09-24"
author: "离子怪"
sourceUrl: "https://github.com/ice11123/blog_test2/blob/main/src/content/blog/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/02-single-variable-differential-calculus.md"
dir1: "学习笔记"
dir2: "高等数学笔记"
tags: ["高等数学", "导数", "微分", "中值定理", "泰勒公式"]
---

<span id="高数第-37-章一元微分学" class="article-top-anchor" aria-hidden="true"></span>

<a href="/blog_test2/blog/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/00-calculus-index/">← 返回高数笔记总索引</a>

> **蓝笔补充｜使用说明**
> 这是本组扫描笔记的**唯一主入口**。正文按知识结构重排，蓝色用于概念、公式和补充，红色用于易错点与警示；需要核对笔迹时，点击各节末尾的“打开原稿第 N 页”。

> [!note] 原稿星级
> <span class="priority-star">★</span>、<span class="priority-star">★★</span>、<span class="priority-star">★★★</span> 均按扫描原稿的位置和数量保留，红色仅用于显示原作者标出的重点层级。

> **编辑说明｜章节说明**
> 原稿明确标出第 3、4、5、6 章；最后两页继续整理“微分不等式与高阶导证明”，但没有再次写出“第七章”。为方便检索，本笔记将其归入“第 7 章（编辑归类）”，这不是对原稿标题的补写。

原 PDF：打开扫描 PDF

## 总导航

| 章节 | 核心内容 | 直接进入 |
|---|---|---|
| 第 3 章 | 导数、微分、切线与法线、高阶导数 | <a href="#%E7%AC%AC-3-%E7%AB%A0%E4%B8%80%E5%85%83%E5%87%BD%E6%95%B0%E5%BE%AE%E5%88%86%E5%AD%A6%E7%9A%84%E6%A6%82%E5%BF%B5">进入第 3 章</a> |
| 第 4 章 | 复合、分段、反函数、隐函数、参数方程、对数求导 | <a href="#%E7%AC%AC-4-%E7%AB%A0%E4%B8%80%E5%85%83%E5%BE%AE%E5%88%86%E7%9A%84%E8%AE%A1%E7%AE%97%E5%9F%BA%E7%A1%80">进入第 4 章</a> |
| 第 5 章 | 单调、极值、凹凸、拐点、最值、渐近线、作图、曲率 | <a href="#%E7%AC%AC-5-%E7%AB%A0%E5%BE%AE%E5%88%86%E7%9A%84%E5%87%A0%E4%BD%95%E5%BA%94%E7%94%A8%E4%B8%8E%E5%87%BD%E6%95%B0%E6%80%A7%E6%80%81">进入第 5 章</a> |
| 第 6 章 | 零点定理、三大中值定理、泰勒公式、等式证明 | <a href="#%E7%AC%AC-6-%E7%AB%A0%E4%B8%80%E5%85%83%E5%BE%AE%E5%88%86%E4%B8%89%E5%A4%A7%E8%AF%81%E6%98%8E%E9%A2%98">进入第 6 章</a> |
| 第 7 章 | 微分不等式、两变量不等式、高阶导数存在性 | <a href="#%E7%AC%AC-7-%E7%AB%A0%E5%BE%AE%E5%88%86%E4%B8%8D%E7%AD%89%E5%BC%8F%E4%B8%8E%E9%AB%98%E9%98%B6%E5%AF%BC%E8%AF%81%E6%98%8E%E7%BC%96%E8%BE%91%E5%BD%92%E7%B1%BB">进入第 7 章</a> |

### 按问题查找

| 我想找…… | 跳转 |
|---|---|
| 导数定义、左右导数、可导与连续 | <a href="#31-%E5%AF%BC%E6%95%B0%E7%9A%84%E5%AE%9A%E4%B9%89%E4%B8%8E%E6%80%A7%E8%B4%A8">3.1 导数的定义与性质</a> |
| 切线、法线、微分 | <a href="#33-%E5%AF%BC%E6%95%B0%E7%9A%84%E5%87%A0%E4%BD%95%E6%84%8F%E4%B9%89%E4%B8%8E%E5%BE%AE%E5%88%86">3.3 导数的几何意义与微分</a> |
| 常用求导公式 | <a href="#41-%E5%9F%BA%E6%9C%AC%E6%B1%82%E5%AF%BC%E5%85%AC%E5%BC%8F">4.1 基本求导公式</a> |
| 复合函数、分段函数、反函数 | <a href="#42-%E5%A4%8D%E5%90%88%E5%88%86%E6%AE%B5%E4%B8%8E%E5%8F%8D%E5%87%BD%E6%95%B0%E6%B1%82%E5%AF%BC">4.2 复合、分段与反函数求导</a> |
| 隐函数、参数方程、幂指函数 | <a href="#43-%E9%9A%90%E5%87%BD%E6%95%B0%E5%8F%82%E6%95%B0%E6%96%B9%E7%A8%8B%E4%B8%8E%E5%AF%B9%E6%95%B0%E6%B1%82%E5%AF%BC">4.3 隐函数、参数方程与对数求导</a> |
| 高阶导数、莱布尼茨公式 | <a href="#44-%E9%AB%98%E9%98%B6%E5%AF%BC%E6%95%B0%E7%9A%84%E8%AE%A1%E7%AE%97">4.4 高阶导数的计算</a> |
| 极值判定 | <a href="#52-%E6%9E%81%E5%80%BC%E5%8F%8A%E5%85%B6%E5%88%A4%E5%AE%9A">5.2 极值及其判定</a> |
| 凹凸性与拐点 | <a href="#53-%E5%87%B9%E5%87%B8%E6%80%A7%E4%B8%8E%E6%8B%90%E7%82%B9">5.3 凹凸性与拐点</a> |
| 最大值、最小值 | <a href="#55-%E6%9C%80%E5%80%BC">5.5 最值</a> |
| 水平、铅直、斜渐近线 | <a href="#56-%E6%B8%90%E8%BF%91%E7%BA%BF">5.6 渐近线</a> |
| 函数作图流程与常见图像 | <a href="#57-%E5%87%BD%E6%95%B0%E4%BD%9C%E5%9B%BE">5.7 函数作图</a> |
| 曲率与曲率半径 | <a href="#58-%E6%9B%B2%E7%8E%87">5.8 曲率</a> |
| Rolle、Lagrange、Cauchy 中值定理 | <a href="#62-%E4%B8%89%E5%A4%A7%E5%BE%AE%E5%88%86%E4%B8%AD%E5%80%BC%E5%AE%9A%E7%90%86">6.2 三大微分中值定理</a> |
| Taylor 公式 | <a href="#63-taylor-%E5%85%AC%E5%BC%8F">6.3 Taylor 公式</a> |
| 等式、零点、根的个数证明 | <a href="#65-%E7%AD%89%E5%BC%8F%E9%9B%B6%E7%82%B9%E4%B8%8E%E6%A0%B9%E7%9A%84%E8%AF%81%E6%98%8E%E5%A5%97%E8%B7%AF">6.5 等式、零点与根的证明套路</a> |
| 不等式证明 | <a href="#%E7%AC%AC-7-%E7%AB%A0%E5%BE%AE%E5%88%86%E4%B8%8D%E7%AD%89%E5%BC%8F%E4%B8%8E%E9%AB%98%E9%98%B6%E5%AF%BC%E8%AF%81%E6%98%8E%E7%BC%96%E8%BE%91%E5%BD%92%E7%B1%BB">第 7 章：微分不等式与高阶导证明（编辑归类）</a> |

### 原稿逐页入口

<a href="#page-01">01</a> · <a href="#page-02">02</a> · <a href="#page-03">03</a> · <a href="#page-04">04</a> · <a href="#page-05">05</a> · <a href="#page-06">06</a> · <a href="#page-07">07</a> · <a href="#page-08">08</a> · <a href="#page-09">09</a> · <a href="#page-10">10</a> · <a href="#page-11">11</a> · <a href="#page-12">12</a> · <a href="#page-13">13</a> · <a href="#page-14">14</a> · <a href="#page-15">15</a> · <a href="#page-16">16</a> · <a href="#page-17">17</a> · <a href="#page-18">18</a> · <a href="#page-19">19</a> · <a href="#page-20">20</a> · <a href="#page-21">21</a> · <a href="#page-22">22</a> · <a href="#page-23">23</a> · <a href="#page-24">24</a> · <a href="#page-25">25</a> · <a href="#page-26">26</a>

---

# 第 3 章：一元函数微分学的概念

## 3.1 导数的定义与性质

设 $y=f(x)$，当自变量从 $x_0$ 变到 $x_0+\Delta x$ 时，函数增量为

$$
\Delta y=f(x_0+\Delta x)-f(x_0).
$$

若下列极限存在，则称 $f$ 在 $x_0$ 处可导：

> **核心公式｜导数定义**
> $$
> f'(x_0)
> =\lim_{\Delta x\to0}\frac{f(x_0+\Delta x)-f(x_0)}{\Delta x}
> =\lim_{x\to x_0}\frac{f(x)-f(x_0)}{x-x_0}.
> $$

左右导数分别为

$$
f'_-(x_0)=\lim_{x\to x_0^-}\frac{f(x)-f(x_0)}{x-x_0},\qquad
f'_+(x_0)=\lim_{x\to x_0^+}\frac{f(x)-f(x_0)}{x-x_0}.
$$

$$
f'(x_0)\text{ 存在}\iff f'_-(x_0)=f'_+(x_0)\text{ 且二者均存在}.
$$

> **重点订正｜<span class="priority-star">★</span> 关系链**
> **可导 $\Rightarrow$ 连续 $\Rightarrow$ 局部有界、局部可积**。反向一般不成立；特别是“连续”不能推出“可导”。

常用运算法则：

$$
(u\pm v)'=u'\pm v',\qquad (uv)'=u'v+uv',
$$

$$
\left(\frac uv\right)'=\frac{u'v-uv'}{v^2}\quad(v\ne0),\qquad
[f(g(x))]'=f'(g(x))g'(x).
$$

若 $y=f(x)$ 存在反函数 $x=\varphi(y)$，且 $f'(x)\ne0$，则

$$
\varphi'(y)=\frac1{f'(x)},\qquad
\varphi''(y)=-\frac{f''(x)}{[f'(x)]^3}.
$$

> [!source-note]- 原稿第 1 页
> [打开原稿第 1 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC01%E9%A1%B5.webp)

<span id="page-01" class="source-page-anchor" aria-hidden="true"></span>

## 3.2 奇偶性、绝对值与不可导点

### 导数的奇偶性

- $f$ 为偶函数 $\Rightarrow f'$ 为奇函数；
- $f$ 为奇函数 $\Rightarrow f'$ 为偶函数；
- 继续求导时奇偶性交替，因此可按导数阶数判断 $f^{(n)}$ 的奇偶性。

### 含绝对值函数在连接点处的可导性

若 $f$ 在 $a$ 处可导，则

- $F(x)=f(x)|x-a|$ 在 $a$ 处可导的关键条件是 $f(a)=0$；
- 若 $f(a)=0$，则 $|f(x)|$ 在 $a$ 处可导当且仅当 $f'(a)=0$；
- 若 $f(a)\ne0$，则 $f$ 在 $a$ 附近不变号，$|f|$ 的可导性与 $f$ 相同。

> **重点订正｜常见不可导点**
> 1. 函数在该点无定义；
> 2. 函数在该点不连续；
> 3. 左、右导数不同，例如 $|x|$ 在 $0$ 处形成角点；
> 4. 导数趋于无穷，出现铅直切线；
> 5. 尖点、振荡等使差商极限不存在。

若 $f^{(n)}(x_0)$ 存在，则 $f,f',\dots,f^{(n-1)}$ 在相应点具有前一阶可导所带来的连续性；不能把“高阶导数存在”误写成“高阶导数必在邻域连续”。

> [!source-note]- 原稿第 2 页
> [打开原稿第 2 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC02%E9%A1%B5.webp)

<span id="page-02" class="source-page-anchor" aria-hidden="true"></span>

## 3.3 导数的几何意义与微分

导数 $f'(x_0)$ 是曲线 $y=f(x)$ 在点 $(x_0,y_0)$ 处的切线斜率。

$$
\text{切线：}\quad y-y_0=f'(x_0)(x-x_0).
$$

当 $f'(x_0)\ne0$ 时，法线斜率为 $-1/f'(x_0)$：

$$
\text{法线：}\quad y-y_0=-\frac{x-x_0}{f'(x_0)}.
$$

若

$$
\Delta y=A\Delta x+o(\!\Delta x),
$$

则称函数在该点可微，并定义

$$
dy=A\,dx=f'(x_0)\,dx.
$$

<span class="priority-star">★</span> 一元函数中，**可导与可微等价**。

高阶导数递推定义为

$$
f^{(n)}(x)=\left[f^{(n-1)}(x)\right]'.
$$

> [!source-note]- 原稿第 3 页
> [打开原稿第 3 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC03%E9%A1%B5.webp)

<span id="page-03" class="source-page-anchor" aria-hidden="true"></span>

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

# 第 4 章：一元微分的计算基础

## 4.1 基本求导公式

<span class="priority-star">★★★</span>

### 幂、指数与对数

$$
(x^\alpha)'=\alpha x^{\alpha-1},\qquad
(a^x)'=a^x\ln a,\qquad
(e^x)'=e^x,
$$

$$
(\log_a x)'=\frac1{x\ln a},\qquad
(\ln x)'=\frac1x.
$$

### 三角与反三角函数

$$
(\sin x)'=\cos x,\qquad
(\cos x)'=-\sin x,
$$

$$
(\tan x)'=\sec^2x,\qquad
(\cot x)'=-\csc^2x,
$$

$$
(\arcsin x)'=\frac1{\sqrt{1-x^2}},\qquad
(\arccos x)'=-\frac1{\sqrt{1-x^2}},
$$

$$
(\arctan x)'=\frac1{1+x^2},\qquad
(\operatorname{arccot}x)'=-\frac1{1+x^2}.
$$

### 常见对数型

<span class="priority-star">★</span>

$$
\left[\ln\left(x+\sqrt{x^2+1}\right)\right]'=\frac1{\sqrt{x^2+1}},
$$

$$
\left[\ln\left(x+\sqrt{x^2-1}\right)\right]'=\frac1{\sqrt{x^2-1}}
$$

（第二式需在表达式有定义的区间内使用。）

> [!source-note]- 原稿第 4 页
> [打开原稿第 4 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC04%E9%A1%B5.webp)

<span id="page-04" class="source-page-anchor" aria-hidden="true"></span>

## 4.2 复合、分段与反函数求导

### 复合函数

若 $y=f(u)$，$u=g(x)$，则

$$
\frac{dy}{dx}=\frac{dy}{du}\frac{du}{dx}=f'(g(x))g'(x).
$$

多层复合函数应从最外层向内逐层求导，并把每层导数相乘。

### 分段函数

1. 在各开区间内分别按相应解析式求导；
2. 在分界点处必须回到导数定义，分别计算左右导数；
3. 只有左右导数相等，分界点才可导。

### 反函数

若 $y=f(x)$ 单调且 $f'(x)\ne0$，其反函数为 $x=\varphi(y)$，则

$$
\frac{dx}{dy}=\frac1{dy/dx}.
$$

> **重点订正｜易错点**
> 反函数导数最终应写成题目所需自变量的函数；不要只写 $1/f'(x)$ 后忘记代回 $x=\varphi(y)$。

> [!source-note]- 原稿第 5 页
> [打开原稿第 5 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC05%E9%A1%B5.webp)

<span id="page-05" class="source-page-anchor" aria-hidden="true"></span>

## 4.3 隐函数、参数方程与对数求导

### 隐函数求导

对方程 $F(x,y)=0$ 两边同时关于 $x$ 求导，把 $y$ 看作 $y(x)$：

$$
F_x+F_y\,y'=0
\quad\Longrightarrow\quad
y'=-\frac{F_x}{F_y}\quad(F_y\ne0).
$$

求二阶导数时，再对一阶导数关系整体求导，并继续使用链式法则。

### 参数方程求导

若

$$
x=\varphi(t),\qquad y=\psi(t),
$$

则

$$
\frac{dy}{dx}=\frac{\psi'(t)}{\varphi'(t)}\quad(\varphi'(t)\ne0),
$$

$$
\frac{d^2y}{dx^2}
=\frac{d}{dt}\left(\frac{dy}{dx}\right)\Big/\frac{dx}{dt}.
$$

### 对数求导与幂指函数

对 $y=u(x)^{v(x)}$（在实数范围通常要求 $u(x)>0$）取对数：

$$
\ln y=v(x)\ln u(x),
$$

从而

$$
\frac{y'}y=v'\ln u+v\frac{u'}u,
$$

$$
y'=u^v\left(v'\ln u+v\frac{u'}u\right).
$$

典型对象包括 $x^x$、$x^{1/x}$ 和多个因式的乘除幂组合。

> [!source-note]- 原稿第 6 页
> [打开原稿第 6 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC06%E9%A1%B5.webp)

<span id="page-06" class="source-page-anchor" aria-hidden="true"></span>

## 4.4 高阶导数的计算

<span class="priority-star">★★★</span>

### 可直接记忆的模式

$$
(e^{ax+b})^{(n)}=a^n e^{ax+b},
$$

$$
(\sin ax)^{(n)}=a^n\sin\left(ax+\frac{n\pi}{2}\right),
$$

$$
(\cos ax)^{(n)}=a^n\cos\left(ax+\frac{n\pi}{2}\right),
$$

$$
(\ln x)^{(n)}=(-1)^{n-1}\frac{(n-1)!}{x^n},
$$

$$
\left(\frac1x\right)^{(n)}=(-1)^n\frac{n!}{x^{n+1}}.
$$

### Leibniz 公式

$$
(uv)^{(n)}=\sum_{k=0}^{n}\binom nk u^{(k)}v^{(n-k)}.
$$

### 用 Taylor 展开取高阶导数

若在 $x_0$ 附近

$$
f(x)=\sum_{n=0}^{\infty}a_n(x-x_0)^n,
$$

则

$$
f^{(n)}(x_0)=n!a_n.
$$

该方法尤其适合直接连求多次导数很繁琐、而函数又容易展开的题。

> [!source-note]- 原稿第 7 页
> [打开原稿第 7 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC07%E9%A1%B5.webp)

<span id="page-07" class="source-page-anchor" aria-hidden="true"></span>

## 4.5 含绝对值函数的求导

当 $f(x)\ne0$ 时，

$$
\bigl|f(x)\bigr|'=\frac{f(x)}{|f(x)|}f'(x)
=\operatorname{sgn}(f(x))f'(x).
$$

标准处理流程：

1. 先求 $f(x)=0$ 的点；
2. 按这些点划分区间并去绝对值；
3. 各区间分别求导；
4. 对零点单独用左右导数或导数定义检查。

> **重点订正｜不要机械套公式**
> $f(x)=0$ 时，$f/|f|$ 无定义，必须单独判断；这正是含绝对值函数最容易出现不可导点的位置。

> [!source-note]- 原稿第 8 页
> [打开原稿第 8 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC08%E9%A1%B5.webp)

<span id="page-08" class="source-page-anchor" aria-hidden="true"></span>

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

# 第 5 章：微分的几何应用与函数性态

## 5.1 本章分析框架

研究函数图像通常围绕三类“点”、两类“区间”和三类渐近线：

- 点：极值点、拐点、不可导/间断点；
- 区间：单调区间、凹凸区间；
- 渐近线：水平、铅直、斜渐近线。

本章顺序：极值 → 凹凸与拐点 → 两者关系 → 最值 → 渐近线 → 函数作图 → 曲率。

> [!source-note]- 原稿第 9 页
> [打开原稿第 9 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC09%E9%A1%B5.webp)

<span id="page-09" class="source-page-anchor" aria-hidden="true"></span>

## 5.2 极值及其判定

<span class="priority-star">★</span>

### 定义与必要条件

<span class="priority-star">★</span> 若 $x_0$ 的某邻域内总有 $f(x)\le f(x_0)$，则 $f(x_0)$ 为局部极大值；若总有 $f(x)\ge f(x_0)$，则为局部极小值。

<span class="priority-star">★</span> 若 $f$ 在 $x_0$ 可导且在 $x_0$ 取极值，则

$$
f'(x_0)=0.
$$

满足 $f'(x_0)=0$ 的点称为驻点。

> **重点订正｜必要不充分**
> 驻点不一定是极值点，例如 $f(x)=x^3$ 在 $0$ 处有 $f'(0)=0$，但没有极值。不可导点也可能是极值点，因此找候选点时不能只解 $f'(x)=0$。

间断或异常行为可形成跳跃、无穷、振荡等形态；这些点应先从定义域与极限入手分析。

<img src="/blog_test2/notes/calculus/images/chapters-3-7/%E7%AC%AC5%E7%AB%A0-%E9%97%B4%E6%96%AD%E7%82%B9%E7%A4%BA%E6%84%8F.webp" alt="第5章-间断点示意" width="520" loading="lazy" decoding="async">

> [!source-note]- 原稿第 10 页
> [打开原稿第 10 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC10%E9%A1%B5.webp)

<span id="page-10" class="source-page-anchor" aria-hidden="true"></span>

### 三种充分判据

#### 第一充分条件：一阶导数变号

- $f'$ 由正变负：$x_0$ 为极大值点；
- $f'$ 由负变正：$x_0$ 为极小值点；
- $f'$ 不变号：通常不是极值点。

#### 第二充分条件：二阶导数

若 $f'(x_0)=0$ 且 $f''(x_0)\ne0$，则

$$
f''(x_0)<0\Rightarrow\text{极大值},\qquad
f''(x_0)>0\Rightarrow\text{极小值}.
$$

#### 高阶导数判据

若

$$
f'(x_0)=f''(x_0)=\cdots=f^{(n-1)}(x_0)=0,
\qquad f^{(n)}(x_0)\ne0,
$$

则：

- $n$ 为偶数时有极值，$f^{(n)}(x_0)>0$ 为极小，$<0$ 为极大；
- $n$ 为奇数时不是极值点，通常对应拐点。

### 极值题标准步骤

1. 写定义域；
2. 求 $f'$；
3. 找 $f'=0$ 的点和不可导点；
4. 作符号表；
5. 根据变号判断极值并计算极值。

> [!source-note]- 原稿第 11 页
> [打开原稿第 11 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC11%E9%A1%B5.webp)

<span id="page-11" class="source-page-anchor" aria-hidden="true"></span>

## 5.3 凹凸性与拐点

### 用中点、弦与切线描述

<span class="priority-star">★</span>

对区间内任意 $x_1,x_2$，比较

$$
f\left(\frac{x_1+x_2}{2}\right)
\quad\text{与}\quad
\frac{f(x_1)+f(x_2)}2.
$$

- 若前者小于后者，图像位于弦的下方；
- 若前者大于后者，图像位于弦的上方。

也可比较曲线与其切线的位置。不同教材对“凹/凸”中文命名可能相反，考试时应以**不等式、弦的位置和 $f''$ 的符号**为准。

<img src="/blog_test2/notes/calculus/images/chapters-3-7/%E7%AC%AC5%E7%AB%A0-%E5%87%B9%E5%87%B8%E6%80%A7%E4%B8%8E%E6%8B%90%E7%82%B9%E7%A4%BA%E6%84%8F.webp" alt="第5章-凹凸性与拐点示意" width="720" loading="lazy" decoding="async">

### 拐点

拐点是曲线凹凸性发生改变的点 $(x_0,f(x_0))$。

若 $f''(x_0)$ 存在，则拐点的必要候选通常满足

$$
f''(x_0)=0;
$$

此外，$f''$ 不存在的点也可能是拐点。

> [!source-note]- 原稿第 12 页
> [打开原稿第 12 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC12%E9%A1%B5.webp)

<span id="page-12" class="source-page-anchor" aria-hidden="true"></span>

### 二阶导数判别

- $f''(x)>0$：$f'$ 递增，图像呈“开口向上”型；
- $f''(x)<0$：$f'$ 递减，图像呈“开口向下”型；
- 若 $f''$ 在 $x_0$ 两侧变号，则 $(x_0,f(x_0))$ 是拐点；
- 只有 $f''(x_0)=0$ 而不变号，不能判为拐点。

若前若干阶导数为零，而第一个非零的高阶导数为 $f^{(n)}(x_0)$，则 $n$ 为奇数时通常发生凹凸性改变。

### 拐点题标准步骤

1. 求 $f''$；
2. 找 $f''=0$ 和 $f''$ 不存在的点；
3. 作 $f''$ 符号表；
4. 只有发生变号的候选点才是拐点。

> [!source-note]- 原稿第 13 页
> [打开原稿第 13 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC13%E9%A1%B5.webp)

<span id="page-13" class="source-page-anchor" aria-hidden="true"></span>

## 5.4 极值点与拐点的联系

<span class="priority-star">★★★</span>

- <span class="priority-star">★</span> 在可导且足够光滑的普通情形下，同一点一般不能同时是极值点和拐点；
- 在不可导点处，特殊曲线可能同时表现出极值和凹凸改变，必须按定义判断；
- 对

$$
f(x)=(x-a)^n g(x),\qquad g(a)\ne0,
$$

根的重数奇偶性决定局部穿越方式：偶重根通常“接触后返回”，奇重根通常“穿过横轴”；结合导数变号可判断极值或拐点。

> **蓝笔补充｜多项式快速观察**
> 因式分解后先看每个根的重数，再看相邻区间符号。它比直接展开再反复求导更快，也更不容易丢掉重复根。

> [!source-note]- 原稿第 14 页
> [打开原稿第 14 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC14%E9%A1%B5.webp)

<span id="page-14" class="source-page-anchor" aria-hidden="true"></span>

## 5.5 最值

<span class="priority-star">★★★</span>

连续函数在闭区间 $[a,b]$ 上必能取得最大值和最小值。

### 闭区间最值算法

1. 找区间内部所有驻点和不可导点；
2. 计算这些点以及端点 $a,b$ 的函数值；
3. 比较全部数值，最大者为最大值，最小者为最小值。

在开区间或无界区间上，还要计算端点单侧极限与无穷远处极限；此时可能只有上确界或下确界，而没有真正取到最大、最小值。

## 5.6 渐近线

### 水平渐近线

若

$$
\lim_{x\to+\infty}f(x)=A
\quad\text{或}\quad
\lim_{x\to-\infty}f(x)=A,
$$

则 $y=A$ 是相应方向的水平渐近线。

### 铅直渐近线

若对某个 $x_0$，至少一个单侧极限为无穷：

$$
\lim_{x\to x_0^\pm}f(x)=\infty,
$$

则 $x=x_0$ 为铅直渐近线。

### 斜渐近线

设渐近线为 $y=ax+b$，则

$$
a=\lim_{x\to\pm\infty}\frac{f(x)}x,
\qquad
b=\lim_{x\to\pm\infty}[f(x)-ax].
$$

两个极限都存在且 $a\ne0$ 时，得到斜渐近线。

> [!source-note]- 原稿第 15 页
> [打开原稿第 15 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC15%E9%A1%B5.webp)

<span id="page-15" class="source-page-anchor" aria-hidden="true"></span>

## 5.7 函数作图

<span class="priority-star">★</span>

### 完整流程

<span class="priority-star">★★★</span>

1. 定义域、值域及间断点；
2. 奇偶性、周期性、对称性与图像变换；
3. 求 $f'$：单调区间、驻点、极值、不可导点；
4. 求 $f''$：凹凸区间与拐点；
5. 求渐近线；
6. 列变化表，补充特殊点后作图。

### 原稿例题：隐式曲线

$$
y^2=(1-x^2)^3.
$$

曲线关于 $x$ 轴、$y$ 轴均对称，只需先研究第一象限：

$$
y=(1-x^2)^{3/2},\qquad x\in[0,1].
$$

$$
y'=-3x\sqrt{1-x^2},
$$

$$
y''=\frac{3(2x^2-1)}{\sqrt{1-x^2}}.
$$

由此得到驻点、单调性，以及 $x=1/\sqrt2$ 对应的凹凸变化，再利用对称性补全图像。

<img src="/blog_test2/notes/calculus/images/chapters-3-7/%E7%AC%AC5%E7%AB%A0-%E5%87%BD%E6%95%B0%E4%BD%9C%E5%9B%BE%E4%BE%8B%E9%A2%98.webp" alt="第5章-函数作图例题" width="650" loading="lazy" decoding="async">

> [!source-note]- 原稿第 16 页
> [打开原稿第 16 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC16%E9%A1%B5.webp)

<span id="page-16" class="source-page-anchor" aria-hidden="true"></span>

### 需要熟悉的函数图像

#### $y=x^x\;(x>0)$

$$
y'=x^x(\ln x+1).
$$

在 $x=1/e$ 处取得极小值

$$
y_{\min}=e^{-1/e}.
$$

#### $y=e^x/x\;(x\ne0)$

正半轴上在 $x=1$ 处取极小值 $e$；同时要保留负半轴分支以及 $x=0$ 的铅直渐近行为。

#### 两个趋向 $e$ 的函数

$$
y=(1+x)^{1/x},\qquad
y=\left(1+\frac1x\right)^x
$$

应结合定义域、单调性及 $x\to0$ 或 $x\to\infty$ 时的极限记忆图像。

<img src="/blog_test2/notes/calculus/images/chapters-3-7/%E7%AC%AC5%E7%AB%A0-%E5%B8%B8%E8%A7%81%E5%87%BD%E6%95%B0%E5%9B%BE%E5%83%8F.webp" alt="第5章-常见函数图像" width="760" loading="lazy" decoding="async">

#### 极坐标与参数曲线

- 心形线：$r=a(1\pm\cos\theta)$、$r=a(1\pm\sin\theta)$；
- 摆线：$x=a(t-\sin t),\;y=a(1-\cos t)$；
- 星形线：$x^{2/3}+y^{2/3}=a^{2/3}$。

<img src="/blog_test2/notes/calculus/images/chapters-3-7/%E7%AC%AC5%E7%AB%A0-%E6%9E%81%E5%9D%90%E6%A0%87%E4%B8%8E%E5%8F%82%E6%95%B0%E6%9B%B2%E7%BA%BF.webp" alt="第5章-极坐标与参数曲线" width="760" loading="lazy" decoding="async">

> [!source-note]- 原稿第 17 页
> [打开原稿第 17 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC17%E9%A1%B5.webp)

<span id="page-17" class="source-page-anchor" aria-hidden="true"></span>

## 5.8 曲率

对显函数 $y=f(x)$，曲率为

> **核心公式｜曲率与曲率半径**
> $$
> K=\frac{|y''|}{[1+(y')^2]^{3/2}},
> \qquad
> R=\frac1K=\frac{[1+(y')^2]^{3/2}}{|y''|}.
> $$

曲率越大，曲线弯曲得越厉害；曲率半径越大，曲线在该点越平缓。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

# 第 6 章：一元微分三大证明题

## 6.1 证明题工具总览

连续函数可用：有界性与最值定理、介值定理、零点定理、平均值性质。

可导函数可用：Fermat 引理、Rolle 定理、<span class="priority-star">★</span> Lagrange 中值定理、Cauchy 中值定理、Taylor 公式。

常见目标分三类：

1. 证明等式或存在某个 $\xi$；
2. <span class="priority-star">★★★</span> 证明方程有根、根唯一或根的个数；
3. <span class="priority-star">★</span> 证明微分不等式。

<span class="priority-star">★★★</span> 原稿特别强调：证明题中优先判断能否使用微分中值定理。

> [!source-note]- 原稿第 18 页
> [打开原稿第 18 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC18%E9%A1%B5.webp)

<span id="page-18" class="source-page-anchor" aria-hidden="true"></span>

### 连续函数的几个定理

#### 有界性与最值定理

连续函数在闭区间 $[a,b]$ 上有界，并能取得最大值和最小值。

#### 介值定理

若 $f$ 在 $[a,b]$ 连续，则 $f(a)$ 与 $f(b)$ 之间的任意值都能被函数取到。

#### 零点定理

若 $f$ 在 $[a,b]$ 连续且

$$
f(a)f(b)<0,
$$

则至少存在 $\xi\in(a,b)$ 使 $f(\xi)=0$。

#### 平均值性质

对若干个函数值，其算术平均数仍处于最小值与最大值之间；结合介值定理，可找到某个 $\xi$ 使 $f(\xi)$ 等于该平均值。

> [!source-note]- 原稿第 19 页
> [打开原稿第 19 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC19%E9%A1%B5.webp)

<span id="page-19" class="source-page-anchor" aria-hidden="true"></span>

## 6.2 三大微分中值定理

### Fermat 引理

若 $f$ 在内点 $x_0$ 可导，并在该点取得局部极值，则

$$
f'(x_0)=0.
$$

### Rolle 定理

若 $f$ 在 $[a,b]$ 连续、在 $(a,b)$ 可导，并且 $f(a)=f(b)$，则至少存在

$$
\xi\in(a,b),\qquad f'(\xi)=0.
$$

构造辅助函数的核心，是把题目要求改写成某个 $F'(\xi)=0$，再设法让 $F(a)=F(b)$。若有三个或更多等值点，可以分区间反复使用 Rolle 定理，得到更高阶导数的零点。

> [!source-note]- 原稿第 20 页
> [打开原稿第 20 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC20%E9%A1%B5.webp)

<span id="page-20" class="source-page-anchor" aria-hidden="true"></span>

### Lagrange 中值定理

<span class="priority-star">★★★</span>

若 $f$ 在 $[a,b]$ 连续、在 $(a,b)$ 可导，则存在 $\xi\in(a,b)$，使

> **核心公式**
> $$
> f(b)-f(a)=f'(\xi)(b-a).
> $$

几何上，曲线上至少有一点的切线平行于连接两端点的弦。

<span class="priority-star">★★★</span> 若 $|f'(x)|\le M$，则由 Lagrange 中值定理立即得到

$$
|f(b)-f(a)|\le M|b-a|.
$$

<span class="priority-star">★★</span> 用 Lagrange 中值定理把差商化成导数值，例如

$$
\frac{\sin x}{x}=\frac{\sin x-\sin0}{x-0}=\cos\xi\to1
\qquad(x\to0).
$$

### Cauchy 中值定理

若 $f,g$ 在 $[a,b]$ 连续、在 $(a,b)$ 可导，且相关分母不为零，则存在 $\xi\in(a,b)$ 使

$$
\frac{f(b)-f(a)}{g(b)-g(a)}
=\frac{f'(\xi)}{g'(\xi)}.
$$

<img src="/blog_test2/notes/calculus/images/chapters-3-7/%E7%AC%AC6%E7%AB%A0-%E6%8B%89%E6%A0%BC%E6%9C%97%E6%97%A5%E4%B8%AD%E5%80%BC%E5%AE%9A%E7%90%86%E5%9B%BE%E7%A4%BA.webp" alt="第6章-拉格朗日中值定理图示" width="560" loading="lazy" decoding="async">

> [!source-note]- 原稿第 21 页
> [打开原稿第 21 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC21%E9%A1%B5.webp)

<span id="page-21" class="source-page-anchor" aria-hidden="true"></span>

## 6.3 Taylor 公式

<span class="priority-star">★</span>

### 带 Lagrange 余项的 Taylor 公式

$$
f(x)=\sum_{k=0}^{n}\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k
+\frac{f^{(n+1)}(\xi)}{(n+1)!}(x-x_0)^{n+1},
$$

其中 $\xi$ 位于 $x$ 与 $x_0$ 之间。

### 带 Peano 余项的 Taylor 公式

$$
f(x)=\sum_{k=0}^{n}\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k
+o\!\left((x-x_0)^n\right).
$$

取 $x_0=0$ 即为 Maclaurin 公式。

> **蓝笔补充｜两种余项的用途**
> Lagrange 余项适合估计误差和证明不等式；Peano 余项适合求极限、比较局部主项。

## 6.4 积分中值定理

若 $f$ 在 $[a,b]$ 连续，$g$ 可积且不变号，则存在 $\xi\in[a,b]$ 使

$$
\int_a^b f(x)g(x)\,dx
=f(\xi)\int_a^b g(x)\,dx.
$$

第二积分中值定理把单调因子在端点的值与其余因子的分段积分组合，常用于估计振荡积分。

> [!source-note]- 原稿第 22 页
> [打开原稿第 22 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC22%E9%A1%B5.webp)

<span id="page-22" class="source-page-anchor" aria-hidden="true"></span>

## 6.5 等式、零点与根的证明套路

<span class="priority-star">★</span>

### 证明等式 $f(\xi)=g(\xi)$

令

$$
F(x)=f(x)-g(x),
$$

目标转化为证明 $F(\xi)=0$。优先检查：

1. 能否在两个端点构造异号，用零点定理；
2. 能否构造 $H$ 使 $H(a)=H(b)$，用 Rolle 定理得到 $H'(\xi)=0$；
3. <span class="priority-star">★★★</span> 能否用单调性证明零点唯一；
4. 能否用极值和端点极限判断根的个数。

### 多项式与重根

- 奇次实系数多项式至少有一个实根；
- 若 $x_0$ 是 $m$ 重根，则

$$
f(x_0)=f'(x_0)=\cdots=f^{(m-1)}(x_0)=0,
\qquad f^{(m)}(x_0)\ne0;
$$

- <span class="priority-star">★★</span> 多个等值点可通过反复使用 Rolle 定理，逐阶推出高阶导数存在零点。

> [!source-note]- 原稿第 23 页
> [打开原稿第 23 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC23%E9%A1%B5.webp)

<span id="page-23" class="source-page-anchor" aria-hidden="true"></span>

## 6.6 辅助函数的构造

看到“存在 $\xi$ 使某个式子成立”时，先把目标式整理为以下形态之一：

- $F'(\xi)=0$：反推一个适合 Rolle 定理的 $F$；
- $F'(\xi)=k$：考虑 $F(x)-kx$；
- $F'(\xi)/G'(\xi)=k$：考虑 Cauchy 中值定理；
- <span class="priority-star">★</span> $F^{(n)}(\xi)=0$：构造足够多个零点并反复使用 Rolle 定理；
- <span class="priority-star">★★★</span> Taylor 公式：在合适点展开，由余项或系数关系得到高阶导数结论；
- <span class="priority-star">★★</span> 代数多项式：按目标式的导数结构选择多项式次数和待定系数；
- 两个中间点的关系：在两个子区间分别使用中值定理，再消去公共量。

> **蓝笔补充｜构造原则**
> 辅助函数不是凭空猜。先从目标等式反推“它像谁的导数”，再用端点条件补出常数项或线性项。

> [!source-note]- 原稿第 24 页
> [打开原稿第 24 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC24%E9%A1%B5.webp)

<span id="page-24" class="source-page-anchor" aria-hidden="true"></span>

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

# 第 7 章：微分不等式与高阶导证明（编辑归类）

> **编辑说明**
> 本章标题为整理者添加；内容对应原稿第 25—26 页，原稿本身没有明确写出“第七章”。

## 7.1 一元函数不等式

证明

$$
f(x)\ge g(x)
$$

通常令

$$
F(x)=f(x)-g(x),
$$

再选择基准点 $x_0$，证明 $F(x_0)=0$ 且 $F$ 在两侧的单调性保证 $F(x)\ge0$；也可证明 $x_0$ 是 $F$ 的最小值点。

可用工具：

- 一阶导数与单调性；
- <span class="priority-star">★</span> 二阶导数与凹凸性；
- <span class="priority-star">★</span> 极值、最值；
- Lagrange 中值定理；
- Taylor 公式加余项符号。

## 7.2 两变量差值型不等式

若目标含 $f(x)-f(y)$，优先使用 Lagrange 中值定理：

$$
f(x)-f(y)=f'(\xi)(x-y),
$$

其中 $\xi$ 位于 $x,y$ 之间。然后利用 $f'$ 的上下界、单调性或符号估计右端。

> [!source-note]- 原稿第 25 页
> [打开原稿第 25 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC25%E9%A1%B5.webp)

<span id="page-25" class="source-page-anchor" aria-hidden="true"></span>

## 7.3 凹凸性与 Jensen 型不等式

<span class="priority-star">★★</span>

若 $f''(x)>0$，函数图像位于弦的下方，并有

$$
f\left(\frac{x_1+x_2+\cdots+x_n}{n}\right)
\le \frac{f(x_1)+f(x_2)+\cdots+f(x_n)}n.
$$

若 $f''(x)<0$，不等号方向反向。使用时要先确认定义域是凸区间，并保证所有 $x_i$ 及其平均值都在定义域内。

## 7.4 高阶导数存在性与高阶零点

常见策略有两类：

1. **反复 Rolle**：先构造足够多的零点，再逐阶推出 $f',f'',\dots,f^{(n)}$ 的零点；
2. **Taylor 展开**：在合适点展开，把低阶项消去，由余项得到所需的高阶导数结论。

> **重点订正｜证明题检查单**
> - 定理的闭区间连续、开区间可导条件是否写全？
> - $\xi$ 所在区间是否写明？
> - 使用 Cauchy 中值定理时分母是否可能为零？
> - 不等式取等条件是否核对？
> - 用 Taylor 公式时，需要的导数阶数和余项形式是否匹配？

> [!source-note]- 原稿第 26 页
> [打开原稿第 26 页](/blog_test2/notes/calculus/images/chapters-3-7/%E5%8E%9F%E7%A8%BF-%E7%AC%AC26%E9%A1%B5.webp)

<span id="page-26" class="source-page-anchor" aria-hidden="true"></span>

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

# 复习速查

## 性态分析最短流程

$$
\text{定义域}
\to \text{对称/周期}
\to f'
\to \text{单调与极值}
\to f''
\to \text{凹凸与拐点}
\to \text{渐近线}
\to \text{作图}.
$$

## 证明题选工具

| 题目特征 | 首选工具 |
|---|---|
| 连续且端点异号 | 零点定理 |
| 两端函数值相等 | Rolle 定理 |
| 出现差值 $f(b)-f(a)$ | Lagrange 中值定理 |
| 两个函数的差值比 | Cauchy 中值定理 |
| 要求误差、近似或高阶信息 | Taylor 公式 |
| 证明全区间不等式 | 作差后研究单调/最值/凹凸 |
| 多个零点推出高阶导零点 | 反复 Rolle 定理 |

## 公式索引

- <a href="#31-%E5%AF%BC%E6%95%B0%E7%9A%84%E5%AE%9A%E4%B9%89%E4%B8%8E%E6%80%A7%E8%B4%A8">导数定义</a>
- <a href="#41-%E5%9F%BA%E6%9C%AC%E6%B1%82%E5%AF%BC%E5%85%AC%E5%BC%8F">基本求导公式</a>
- <a href="#43-%E9%9A%90%E5%87%BD%E6%95%B0%E5%8F%82%E6%95%B0%E6%96%B9%E7%A8%8B%E4%B8%8E%E5%AF%B9%E6%95%B0%E6%B1%82%E5%AF%BC">隐函数与参数方程</a>
- <a href="#44-%E9%AB%98%E9%98%B6%E5%AF%BC%E6%95%B0%E7%9A%84%E8%AE%A1%E7%AE%97">高阶导数与 Leibniz 公式</a>
- <a href="#56-%E6%B8%90%E8%BF%91%E7%BA%BF">三类渐近线</a>
- <a href="#58-%E6%9B%B2%E7%8E%87">曲率公式</a>
- <a href="#62-%E4%B8%89%E5%A4%A7%E5%BE%AE%E5%88%86%E4%B8%AD%E5%80%BC%E5%AE%9A%E7%90%86">三大微分中值定理</a>
- <a href="#63-taylor-%E5%85%AC%E5%BC%8F">Taylor 公式</a>
