---
title: "高等数学第 8—11 章：一元积分学"
description: "由 28 页手写笔记整理而成，涵盖积分概念与性质、积分计算、几何应用、积分中值定理与积分不等式。"
pubDate: "2026-09-27"
updatedDate: "2026-09-27"
author: "离子怪"
sourceUrl: "https://github.com/ice11123/blog_test2/blob/main/src/content/blog/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/04-single-variable-integral-calculus.md"
dir1: "学习笔记"
dir2: "高等数学笔记"
tags: ["高等数学", "一元积分", "定积分", "反常积分", "学习笔记"]
---

<span id="高数第-811-章一元积分学" class="article-top-anchor" aria-hidden="true"></span>

<a href="/blog_test2/blog/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/00-calculus-index/">← 返回高数笔记总索引</a>

> **蓝笔补充｜使用说明**
> 本文由 28 页手写扫描笔记转写而成。正文和常规公式已转换为可搜索的 Markdown/LaTeX；几何图形与多色示意仅保留必要局部裁图。每一页均提供原稿入口，便于核对。

> 来源：打开第 8—11 章扫描 PDF

> [!note] 原稿星级
> <span class="priority-star">★</span>、<span class="priority-star">★★</span>、<span class="priority-star">★★★</span> 按扫描原稿中能够明确辨认的位置和数量保留；没有根据整理者判断重新评级。

## 总导航

- <a href="#%E7%AC%AC-8-%E7%AB%A0%E4%B8%80%E5%85%83%E5%87%BD%E6%95%B0%E7%A7%AF%E5%88%86%E5%AD%A6%E7%9A%84%E6%A6%82%E5%BF%B5%E4%B8%8E%E6%80%A7%E8%B4%A8">第 8 章：概念与性质</a>
  - <a href="#81-%E4%B8%8D%E5%AE%9A%E7%A7%AF%E5%88%86%E4%B8%8E%E5%8E%9F%E5%87%BD%E6%95%B0">原函数与不定积分</a>
  - <a href="#82-%E5%AE%9A%E7%A7%AF%E5%88%86">Riemann 定积分及性质</a>
  - <a href="#83-%E5%8F%98%E9%99%90%E7%A7%AF%E5%88%86">变限积分</a>
  - <a href="#84-%E5%8F%8D%E5%B8%B8%E7%A7%AF%E5%88%86">反常积分及判敛</a>
- <a href="#%E7%AC%AC-9-%E7%AB%A0%E4%B8%80%E5%85%83%E7%A7%AF%E5%88%86%E7%9A%84%E8%AE%A1%E7%AE%97">第 9 章：一元积分的计算</a>
  - <a href="#91-%E5%9F%BA%E6%9C%AC%E7%A7%AF%E5%88%86%E5%85%AC%E5%BC%8F">基本积分公式</a>
  - <a href="#92-%E4%B8%8D%E5%AE%9A%E7%A7%AF%E5%88%86%E7%9A%84%E8%AE%A1%E7%AE%97%E6%96%B9%E6%B3%95">换元、分部与有理函数积分</a>
  - <a href="#93-%E5%AE%9A%E7%A7%AF%E5%88%86%E8%AE%A1%E7%AE%97">定积分计算</a>
  - <a href="#94-%E5%8F%98%E9%99%90%E7%A7%AF%E5%88%86%E8%AE%A1%E7%AE%97">变限积分计算</a>
  - <a href="#95-%E5%8F%8D%E5%B8%B8%E7%A7%AF%E5%88%86%E8%AE%A1%E7%AE%97">反常积分计算与 Gamma 函数</a>
- <a href="#%E7%AC%AC-10-%E7%AB%A0%E4%B8%80%E5%85%83%E7%A7%AF%E5%88%86%E7%9A%84%E5%87%A0%E4%BD%95%E5%BA%94%E7%94%A8">第 10 章：几何应用</a>
  - <a href="#101-%E5%B9%B3%E9%9D%A2%E5%9B%BE%E5%BD%A2%E9%9D%A2%E7%A7%AF">平面图形面积</a>
  - <a href="#102-%E6%97%8B%E8%BD%AC%E4%BD%93%E4%BD%93%E7%A7%AF">旋转体体积</a>
  - <a href="#103-%E8%B4%A8%E5%BF%83%E4%B8%8E%E5%BC%A7%E9%95%BF">质心与弧长</a>
  - <a href="#104-%E6%97%8B%E8%BD%AC%E6%9B%B2%E9%9D%A2%E9%9D%A2%E7%A7%AF">旋转曲面面积</a>
- <a href="#%E7%AC%AC-11-%E7%AB%A0%E7%A7%AF%E5%88%86%E4%B8%AD%E5%80%BC%E5%AE%9A%E7%90%86%E4%B8%8E%E7%A7%AF%E5%88%86%E4%B8%8D%E7%AD%89%E5%BC%8F">第 11 章：积分中值与不等式</a>
  - <a href="#111-%E7%A7%AF%E5%88%86%E4%B8%AD%E5%80%BC%E5%AE%9A%E7%90%86">积分中值定理</a>
  - <a href="#112-%E7%A7%AF%E5%88%86%E4%B8%8D%E7%AD%89%E5%BC%8F">积分不等式</a>
- <a href="#%E5%A4%8D%E4%B9%A0%E9%80%9F%E6%9F%A5">复习速查</a>

### 原稿逐页入口

- 第 8 章：<a href="#page-01">第 1 页</a> · <a href="#page-02">第 2 页</a> · <a href="#page-03">第 3 页</a> · <a href="#page-04">第 4 页</a> · <a href="#page-05">第 5 页</a> · <a href="#page-06">第 6 页</a> · <a href="#page-07">第 7 页</a> · <a href="#page-08">第 8 页</a>
- 第 9 章：<a href="#page-09">第 9 页</a> · <a href="#page-10">第 10 页</a> · <a href="#page-11">第 11 页</a> · <a href="#page-12">第 12 页</a> · <a href="#page-13">第 13 页</a> · <a href="#page-14">第 14 页</a> · <a href="#page-15">第 15 页</a> · <a href="#page-16">第 16 页</a> · <a href="#page-17">第 17 页</a> · <a href="#page-18">第 18 页</a> · <a href="#page-19">第 19 页</a>
- 第 10 章：<a href="#page-20">第 20 页</a> · <a href="#page-21">第 21 页</a> · <a href="#page-22">第 22 页</a> · <a href="#page-23">第 23 页</a> · <a href="#page-24">第 24 页</a> · <a href="#page-25">第 25 页</a>
- 第 11 章：<a href="#page-26">第 26 页</a> · <a href="#page-27">第 27 页</a> · <a href="#page-28">第 28 页</a>

---

# 第 8 章：一元函数积分学的概念与性质

## 8.1 不定积分与原函数

<!-- 原PDF第 1 页 -->

> [!source-note]- 原稿第 1 页
> [打开原稿第 1 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC01%E9%A1%B5.webp)

<span id="page-01" class="source-page-anchor" aria-hidden="true"></span>

### 8.1.1 原函数与不定积分

若在区间 $I$ 上恒有

$$
F'(x)=f(x),
$$

则称 $F$ 是 $f$ 在 $I$ 上的一个原函数。

若 $F$ 是 $f$ 在区间 $I$ 上的一个原函数，则 $f$ 在 $I$ 上的全部原函数为

$$
F(x)+C,\qquad C\in\mathbb R.
$$

因此不定积分定义为

> **核心公式｜不定积分**
> $$
> \int f(x)\,dx=F(x)+C.
> $$

这里必须明确区间 $I$；跨越不连续点时，不同连通区间上的积分常数可以不同。

### 8.1.2 原函数存在问题

<span class="priority-star">★★★</span>

<!-- 原PDF第 2 页 -->

> [!source-note]- 原稿第 2 页
> [打开原稿第 2 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC02%E9%A1%B5.webp)

<span id="page-02" class="source-page-anchor" aria-hidden="true"></span>

- 若 $f$ 在区间 $I$ 上连续，则 $f$ 在 $I$ 上一定存在原函数；
- 连续是原函数存在的充分条件，不是必要条件；
- 若 $f$ 有原函数，则 $f$ 具有 Darboux 性质：即使不连续，也不能出现第一类跳跃间断；
- 导函数可以不连续，但其不连续通常表现为振荡型第二类间断。

> **重点订正｜不能反推**
> “存在原函数”不能推出“函数连续”。真正能推出的是导函数具有介值性。

若 $f$ 可导，则 $f'$ 可能不连续；但若 $f'(x_0)$ 存在，则 $f$ 在 $x_0$ 连续。

## 8.2 定积分

### 8.2.1 定积分定义与几何意义

<span class="priority-star">★★★</span>

将 $[a,b]$ 分割为

$$
a=x_0<x_1<\cdots<x_n=b,
$$

在每个小区间 $[x_{i-1},x_i]$ 内任取 $\xi_i$，记

$$
\Delta x_i=x_i-x_{i-1},\qquad
\lambda=\max_i\Delta x_i.
$$

若极限

$$
\lim_{\lambda\to0}\sum_{i=1}^{n}f(\xi_i)\Delta x_i
$$

存在，并且与分割及取点方式无关，则称 $f$ 在 $[a,b]$ 上 Riemann 可积，并定义

> **核心公式｜Riemann 定积分**
> $$
> \int_a^b f(x)\,dx
> =\lim_{\lambda\to0}\sum_{i=1}^{n}f(\xi_i)\Delta x_i.
> $$

对等距分割，$\Delta x=(b-a)/n$，可写成

$$
\int_a^b f(x)\,dx
=\lim_{n\to\infty}\sum_{i=1}^{n}
f\left(a+\frac{b-a}{n}i\right)\frac{b-a}{n}.
$$

在 $[0,1]$ 上尤其常见：

$$
\int_0^1 f(x)\,dx
=\lim_{n\to\infty}\frac{1}{n}\sum_{i=1}^{n}f\left(\frac{i}{n}\right).
$$

几何上，$\int_a^b f(x)\,dx$ 表示带符号面积；它与积分变量使用 $x,t,u$ 等字母无关。

<!-- 原PDF第 3 页 -->

> [!source-note]- 原稿第 3 页
> [打开原稿第 3 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC03%E9%A1%B5.webp)

<span id="page-03" class="source-page-anchor" aria-hidden="true"></span>

### 8.2.2 可积的充分条件和必要条件

定积分存在当且仅当函数在闭区间上 Riemann 可积。常用充分条件：

- $f$ 在 $[a,b]$ 上连续；
- $f$ 在 $[a,b]$ 上单调；
- $f$ 在 $[a,b]$ 上有界，且只有有限个第一类间断点；
- 更一般地，有界且间断点集满足 Riemann 可积判据。

必要条件：

> **核心公式｜可积必有界**
> 若 $f$ 在 $[a,b]$ 上 Riemann 可积，则 $f$ 在 $[a,b]$ 上有界。

反之不成立；仅有界不能保证可积。

### 8.2.3 可积、可导、连续与有界的关系

<span class="priority-star">★</span>

在闭区间上的常用关系链：

$$
\text{可导}\Rightarrow\text{连续}
\Rightarrow\text{可积}\Rightarrow\text{有界}.
$$

各逆命题一般均不成立。典型反例：

- 连续但不可导：尖点、折点、竖直切线；
- 可积但不连续：只有有限个第一类间断点的有界函数；
- 有界但不可积：Dirichlet 型函数。

## 8.2.4 定积分的性质

<!-- 原PDF第 4 页 -->

> [!source-note]- 原稿第 4 页
> [打开原稿第 4 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC04%E9%A1%B5.webp)

<span id="page-04" class="source-page-anchor" aria-hidden="true"></span>

### 线性与区间可加性

$$
\int_a^b A\,dx=A(b-a),
$$

$$
\int_a^b[k_1f(x)+k_2g(x)]\,dx
=k_1\int_a^b f(x)\,dx+k_2\int_a^b g(x)\,dx,
$$

$$
\int_a^b f(x)\,dx
=\int_a^c f(x)\,dx+\int_c^b f(x)\,dx.
$$

### 保序性与估值

<span class="priority-star">★</span>

若 $f(x)\le g(x)$，则

$$
\int_a^b f(x)\,dx\le\int_a^b g(x)\,dx.
$$

并有

$$
\left|\int_a^b f(x)\,dx\right|
\le\int_a^b|f(x)|\,dx.
$$

若 $m\le f(x)\le M$，则

$$
m(b-a)\le\int_a^b f(x)\,dx\le M(b-a).
$$

### 积分中值定理

<span class="priority-star">★★★</span>

若 $f$ 在 $[a,b]$ 上连续，则存在 $\xi\in[a,b]$，使

> **核心公式**
> $$
> \int_a^b f(x)\,dx=f(\xi)(b-a).
> $$

也就是曲线下的带符号面积等于“某个函数值 × 区间长度”。

## 8.3 变限积分

### 8.3.1 变限积分函数

<!-- 原PDF第 5 页 -->

> [!source-note]- 原稿第 5 页
> [打开原稿第 5 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC05%E9%A1%B5.webp)

<span id="page-05" class="source-page-anchor" aria-hidden="true"></span>

定义

$$
F(x)=\int_a^x f(t)\,dt,\qquad a\le x\le b.
$$

这里 $t$ 是哑变量，$x$ 是上限变量。

### 8.3.2 变限积分的连续与可导

- <span class="priority-star">★</span> 若 $f$ 在 $[a,b]$ 上可积，则 $F(x)=\int_a^x f(t)\,dt$ 在 $[a,b]$ 上连续；
- <span class="priority-star">★★★</span> 若 $f$ 在 $[a,b]$ 上连续，则

$$
F'(x)=f(x).
$$

若 $x_0$ 是 $f$ 的第一类间断点，则

$$
F'_-(x_0)=f(x_0-0),\qquad
F'_+(x_0)=f(x_0+0).
$$

只有两个单侧极限相等时，$F'(x_0)$ 才存在；若 $f(x_0)$ 与该共同极限不同，则仍有 $F'(x_0)$ 等于共同极限，而不等于 $f(x_0)$。

### 周期与对称

<span class="priority-star">★★★</span>

若 $f$ 以 $2l$ 为周期，并取

$$
F(x)=\int_0^x f(t)\,dt,
$$

则：

- $f$ 为奇函数时，$F$ 为偶函数；
- $f$ 为偶函数时，$F$ 为奇函数；
- $F$ 是否仍为周期函数，取决于一个周期内的积分是否为零。

### 8.3.3 三类积分的区别

| 类型 | 写法 | 存在条件 | 结果 | 与原函数关系 |
|---|---|---|---|---|
| 不定积分 | $\int f(x)\,dx$ | $f$ 存在原函数 | 一族函数 | $F(x)+C$ |
| 定积分 | $\int_a^b f(x)\,dx$ | $f$ 在 $[a,b]$ 可积 | 一个数 | $F(b)-F(a)$ |
| 变限积分 | $\int_a^x f(t)\,dt$ | $f$ 在相应区间可积 | 关于 $x$ 的函数 | 连续；连续点处导数为 $f(x)$ |

## 8.4 反常积分

<!-- 原PDF第 6 页 -->

> [!source-note]- 原稿第 6 页
> [打开原稿第 6 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC06%E9%A1%B5.webp)

<span id="page-06" class="source-page-anchor" aria-hidden="true"></span>

### 8.4.1 定义与拆分

反常积分由两类情形产生：积分区间无穷，或被积函数在有限区间内存在无界点。

无穷区间：

$$
\int_a^{+\infty}f(x)\,dx
=\lim_{b\to+\infty}\int_a^b f(x)\,dx,
$$

$$
\int_{-\infty}^{b}f(x)\,dx
=\lim_{a\to-\infty}\int_a^b f(x)\,dx.
$$

对整个实轴必须任取 $x_0$ 后拆开：

$$
\int_{-\infty}^{+\infty}f(x)\,dx
=\int_{-\infty}^{x_0}f(x)\,dx
+\int_{x_0}^{+\infty}f(x)\,dx.
$$

两部分都收敛时才称原反常积分收敛；不能用两个发散量相消。

有限区间内若 $a$ 为瑕点，则

$$
\int_a^b f(x)\,dx
=\lim_{\varepsilon\to0^+}\int_{a+\varepsilon}^{b}f(x)\,dx.
$$

若内部 $c\in(a,b)$ 是瑕点，必须拆成 $[a,c)$ 与 $(c,b]$ 两段分别判断。

> **重点订正｜反常积分与 Cauchy 主值不同**
> 普通反常积分要求拆开的每一段分别收敛；对称截断得到的主值不能代替这一条件。

### 8.4.2 判敛方法

<!-- 原PDF第 7 页 -->

> [!source-note]- 原稿第 7 页
> [打开原稿第 7 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC07%E9%A1%B5.webp)

<span id="page-07" class="source-page-anchor" aria-hidden="true"></span>

#### 比较判别法

设 $0\le f(x)\le g(x)$：

- 若 $\int g(x)\,dx$ 收敛，则 $\int f(x)\,dx$ 收敛；
- 若 $\int f(x)\,dx$ 发散，则 $\int g(x)\,dx$ 发散。

记忆：大函数收敛推出小函数收敛；小函数发散推出大函数发散。

#### 极限比较判别法

若 $f,g>0$，且在瑕点或无穷远处

$$
\lim\frac{f(x)}{g(x)}=\lambda,
$$

则：

- $0<\lambda<\infty$：两积分同敛散；
- $\lambda=0$：$f$ 比 $g$ 小，$\int g$ 收敛可推出 $\int f$ 收敛；
- $\lambda=\infty$：$f$ 比 $g$ 大，$\int g$ 发散可推出 $\int f$ 发散。

### 8.4.3 重要 p 型结论

<span class="priority-star">★★★</span>

<!-- 原PDF第 8 页 -->

> [!source-note]- 原稿第 8 页
> [打开原稿第 8 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC08%E9%A1%B5.webp)

<span id="page-08" class="source-page-anchor" aria-hidden="true"></span>

> **核心公式｜两个方向的临界指数相反**
> $$
> \int_0^1\frac{dx}{x^p}
> \begin{cases}
> \text{收敛},&p<1,\\
> \text{发散},&p\ge1,
> \end{cases}
> \qquad
> \int_1^{+\infty}\frac{dx}{x^p}
> \begin{cases}
> \text{收敛},&p>1,\\
> \text{发散},&p\le1.
> \end{cases}
> $$

更一般地，若 $a$ 是瑕点，则

$$
\int_a^b\frac{dx}{(x-a)^p}
\begin{cases}
\text{收敛},&p<1,\\
\text{发散},&p\ge1.
\end{cases}
$$

<img src="/blog_test2/notes/calculus/images/chapters-8-11/%E7%AC%AC8%E7%AB%A0-p%E5%9E%8B%E5%8F%8D%E5%B8%B8%E7%A7%AF%E5%88%86%E5%88%A4%E6%95%9B%E5%9B%BE.webp" alt="第8章-p型反常积分判敛图" width="760" loading="lazy" decoding="async">

含对数因子的常用结论：

$$
\int_0^1\frac{|\ln x|^q}{x^p}\,dx
\quad(q>-1)\quad\text{收敛}\Longleftrightarrow p<1,
$$

$$
\int_e^{+\infty}\frac{(\ln x)^q}{x^p}\,dx
\quad\text{收敛}\Longleftrightarrow
\begin{cases}
p>1,\\
p=1\text{ 且 }q<-1.
\end{cases}
$$

对称性只能在反常积分已经收敛的前提下使用：

- $f$ 偶且 $\int_0^{\infty}f$ 收敛，则 $\int_{-\infty}^{\infty}f=2\int_0^{\infty}f$；
- $f$ 奇且两侧均收敛，则 $\int_{-\infty}^{\infty}f=0$。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

# 第 9 章：一元积分的计算

## 9.1 基本积分公式

<span class="priority-star">★★★</span>

<!-- 原PDF第 9 页 -->

> [!source-note]- 原稿第 9 页
> [打开原稿第 9 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC09%E9%A1%B5.webp)

<span id="page-09" class="source-page-anchor" aria-hidden="true"></span>

### 幂、指数与对数

$$
\int x^n\,dx=\frac{x^{n+1}}{n+1}+C\qquad(n\ne-1),
$$

$$
\int\frac{dx}{x}=\ln|x|+C,
$$

$$
\int a^x\,dx=\frac{a^x}{\ln a}+C\qquad(a>0, a\ne1),
$$

$$
\int e^x\,dx=e^x+C.
$$

### 三角函数

$$
\int\sin x\,dx=-\cos x+C,
\qquad
\int\cos x\,dx=\sin x+C,
$$

$$
\int\tan x\,dx=-\ln|\cos x|+C,
\qquad
\int\cot x\,dx=\ln|\sin x|+C,
$$

$$
\int\sec x\,dx=\ln|\sec x+\tan x|+C,
$$

$$
\int\csc x\,dx=\ln|\csc x-\cot x|+C,
$$

$$
\int\sec^2x\,dx=\tan x+C,
\qquad
\int\csc^2x\,dx=-\cot x+C,
$$

$$
\int\sec x\tan x\,dx=\sec x+C,
\qquad
\int\csc x\cot x\,dx=-\csc x+C.
$$

二次型的常用结果：

$$
\int\sin^2x\,dx=\frac x2-\frac{\sin2x}{4}+C,
$$

$$
\int\cos^2x\,dx=\frac x2+\frac{\sin2x}{4}+C,
$$

$$
\int\tan^2x\,dx=\tan x-x+C,
\qquad
\int\cot^2x\,dx=-\cot x-x+C.
$$

<!-- 原PDF第 10 页 -->

> [!source-note]- 原稿第 10 页
> [打开原稿第 10 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC10%E9%A1%B5.webp)

<span id="page-10" class="source-page-anchor" aria-hidden="true"></span>

### 反三角函数与根式

$$
\int\frac{dx}{1+x^2}=\arctan x+C,
$$

$$
\int\frac{dx}{a^2+x^2}=\frac1a\arctan\frac xa+C\qquad(a>0),
$$

$$
\int\frac{dx}{\sqrt{1-x^2}}=\arcsin x+C,
$$

$$
\int\frac{dx}{\sqrt{a^2-x^2}}=\arcsin\frac xa+C\qquad(a>0),
$$

$$
\int\frac{dx}{\sqrt{x^2+a^2}}
=\ln\left|x+\sqrt{x^2+a^2}\right|+C,
$$

$$
\int\frac{dx}{\sqrt{x^2-a^2}}
=\ln\left|x+\sqrt{x^2-a^2}\right|+C,
$$

$$
\int\frac{dx}{x^2-a^2}
=\frac1{2a}\ln\left|\frac{x-a}{x+a}\right|+C,
$$

$$
\int\sqrt{a^2-x^2}\,dx
=\frac{a^2}{2}\arcsin\frac xa
+\frac x2\sqrt{a^2-x^2}+C.
$$

## 9.2 不定积分的计算方法

### 9.2.1 第一换元法：凑微分

若能识别 $u=g(x)$ 及其微分，则

> **核心公式**
> $$
> \int f(g(x))g'(x)\,dx
> =\int f(u)\,du.
> $$

常见凑微分模式包括：

$$
x\,dx=\frac12d(x^2),\qquad
\frac{dx}{x}=d(\ln|x|),\qquad
e^x\,dx=d(e^x),
$$

$$
\sin x\,dx=-d(\cos x),\qquad
\cos x\,dx=d(\sin x),
$$

$$
\sec^2x\,dx=d(\tan x),\qquad
\csc^2x\,dx=-d(\cot x).
$$

例：

$$
\int\tan x\,dx
=\int\frac{\sin x}{\cos x}\,dx
=-\int\frac{d(\cos x)}{\cos x}
=-\ln|\cos x|+C.
$$

### 9.2.2 第二换元法

<!-- 原PDF第 11 页 -->

> [!source-note]- 原稿第 11 页
> [打开原稿第 11 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC11%E9%A1%B5.webp)

<span id="page-11" class="source-page-anchor" aria-hidden="true"></span>

令 $x=\varphi(t)$，则

$$
\int f(x)\,dx
=\int f(\varphi(t))\varphi'(t)\,dt.
$$

#### 三角代换

<span class="priority-star">★</span>

- $\sqrt{a^2-x^2}$：令 $x=a\sin t$；
- $\sqrt{a^2+x^2}$：令 $x=a\tan t$；
- $\sqrt{x^2-a^2}$：令 $x=a\sec t$。

例如

$$
\int\sqrt{a^2-x^2}\,dx,\qquad x=a\sin t,\quad |t|\le\frac\pi2,
$$

可化为 $a^2\int\cos^2t\,dt$，最后回代得到

$$
\frac{a^2}{2}\arcsin\frac xa+
\frac x2\sqrt{a^2-x^2}+C.
$$

<!-- 原PDF第 12 页 -->

> [!source-note]- 原稿第 12 页
> [打开原稿第 12 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC12%E9%A1%B5.webp)

<span id="page-12" class="source-page-anchor" aria-hidden="true"></span>

#### 根式代换与倒代换

<span class="priority-star">★★★</span>

- 当多个根式含 $ax+b$ 时，可令 $ax+b=t^n$，其中 $n$ 取各根指数分母的最小公倍数；
- 分母次数明显高于分子时，可尝试 $x=1/t$；
- 对 $a^x,e^x,\ln x,\arcsin x,\arctan x$ 等，也可直接把整体设为新变量。

若出现 $\sqrt{ax^2+bx+c}$，先配方为

$$
\sqrt{\varphi(x)^2+k^2},\quad
\sqrt{k^2-\varphi(x)^2},\quad
\sqrt{\varphi(x)^2-k^2},
$$

再按对应三角代换处理。

### 9.2.3 分部积分法

<span class="priority-star">★</span>

> **核心公式**
> $$
> \int u\,dv=uv-\int v\,du.
> $$

选择 $u$ 的经验：反三角、对数、幂函数通常优先作 $u$；指数与三角函数通常作 $dv$。核心目标是让 $du$ 变简单，并使剩余积分降阶。

典型例子：

$$
\int\ln(1+x^2)\,dx
=x\ln(1+x^2)-2x+2\arctan x+C,
$$

$$
\int x^3e^x\,dx
=e^x(x^3-3x^2+6x-6)+C.
$$

<!-- 原PDF第 13 页 -->

> [!source-note]- 原稿第 13 页
> [打开原稿第 13 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC13%E9%A1%B5.webp)

<span id="page-13" class="source-page-anchor" aria-hidden="true"></span>

#### 循环积分

例如记

$$
I=\int e^t\sin t\,dt.
$$

连续两次分部积分后原积分重新出现：

$$
I=e^t\sin t-e^t\cos t-I,
$$

从而

$$
I=\frac12e^t(\sin t-\cos t)+C.
$$

#### 分部积分的消项法

有时展开被积式后分别积分反而复杂，可先把某一部分写成微分，再分部积分，使中间积分彼此抵消。

多项式与指数或三角函数的组合可使用表格分部法：

$$
\int P_n(x)e^{ax}\,dx,\qquad
\int P_n(x)\sin bx\,dx,\qquad
\int P_n(x)\cos bx\,dx.
$$

### 9.2.4 有理函数积分

<!-- 原PDF第 14 页 -->

> [!source-note]- 原稿第 14 页
> [打开原稿第 14 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC14%E9%A1%B5.webp)

<span id="page-14" class="source-page-anchor" aria-hidden="true"></span>

对

$$
\int\frac{P_n(x)}{Q_m(x)}\,dx,
$$

先比较次数：若 $n\ge m$，先作多项式除法；真分式再对 $Q_m$ 因式分解并作部分分式分解。

常见分解结构：

$$
\frac{A}{ax+b},\qquad
\frac{A_1}{ax+b}+\frac{A_2}{(ax+b)^2}+\cdots,
$$

$$
\frac{Ax+B}{px^2+qx+r},\qquad
\frac{A_1x+B_1}{px^2+qx+r}
+\frac{A_2x+B_2}{(px^2+qx+r)^2}+\cdots.
$$

对不可约二次因子，常把分子拆成“分母导数的倍数 + 常数”，分别得到对数项与反三角项。

## 9.3 定积分计算

### 9.3.1 Newton-Leibniz 公式

<!-- 原PDF第 15 页 -->

> [!source-note]- 原稿第 15 页
> [打开原稿第 15 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC15%E9%A1%B5.webp)

<span id="page-15" class="source-page-anchor" aria-hidden="true"></span>

若 $F$ 是连续函数 $f$ 在 $[a,b]$ 上的一个原函数，则

> **核心公式**
> $$
> \int_a^b f(x)\,dx=F(b)-F(a).
> $$

若 $f$ 在有限个点分段连续，可分段寻找原函数后分别使用公式；只要各分段积分都存在，整体定积分仍存在。

### 9.3.2 定积分换元与分部积分

令 $x=\varphi(t)$ 时，必须同时更换上下限：

<span class="priority-star">★</span>

$$
\int_a^b f(x)\,dx
=\int_{\alpha}^{\beta}f(\varphi(t))\varphi'(t)\,dt,
$$

其中 $\varphi(\alpha)=a$、$\varphi(\beta)=b$，并保证换元满足所需连续与单调条件。

分部积分：

$$
\int_a^b u(x)v'(x)\,dx
=\bigl[u(x)v(x)\bigr]_a^b
-\int_a^b v(x)u'(x)\,dx.
$$

### 9.3.3 对称性、周期性与区间再现

<!-- 原PDF第 16 页 -->

> [!source-note]- 原稿第 16 页
> [打开原稿第 16 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC16%E9%A1%B5.webp)

<span id="page-16" class="source-page-anchor" aria-hidden="true"></span>

若积分存在，则

$$
f\text{ 为偶函数}\Rightarrow
\int_{-a}^{a}f(x)\,dx=2\int_0^a f(x)\,dx,
$$

$$
f\text{ 为奇函数}\Rightarrow
\int_{-a}^{a}f(x)\,dx=0.
$$

若 $f$ 以 $T$ 为周期并可积，则任意长度为 $T$ 的区间积分相等：

$$
\int_a^{a+T}f(x)\,dx=\int_0^T f(x)\,dx.
$$

<span class="priority-star">★★</span> 区间再现公式：

> **核心公式**
> $$
> \int_a^b f(x)\,dx
> =\int_a^b f(a+b-x)\,dx.
> $$

两式相加常得到

$$
2\int_a^b f(x)\,dx
=\int_a^b[f(x)+f(a+b-x)]\,dx.
$$

<span class="priority-star">★★</span> 例如

$$
I=\int_0^{\pi/4}\ln(1+\tan x)\,dx.
$$

令 $x\mapsto\pi/4-x$，利用

$$
1+\tan\left(\frac\pi4-x\right)=\frac{2}{1+\tan x},
$$

可得

$$
I=\frac\pi8\ln2.
$$

### Wallis 公式

<!-- 原PDF第 17 页 -->

> [!source-note]- 原稿第 17 页
> [打开原稿第 17 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC17%E9%A1%B5.webp)

<span id="page-17" class="source-page-anchor" aria-hidden="true"></span>

设

$$
I_n=\int_0^{\pi/2}\sin^n x\,dx
=\int_0^{\pi/2}\cos^n x\,dx.
$$

递推关系为

$$
I_n=\frac{n-1}{n}I_{n-2}.
$$

因此

$$
I_n=
\begin{cases}
\dfrac{n-1}{n}\dfrac{n-3}{n-2}\cdots\dfrac12\cdot\dfrac\pi2,&n\text{ 为偶数},\\[6pt]
\dfrac{n-1}{n}\dfrac{n-3}{n-2}\cdots\dfrac23\cdot1,&n\text{ 为奇数}.
\end{cases}
$$

并可据区间对称性换算 $[0,\pi]$ 或 $[0,2\pi]$ 上的幂积分；奇偶性必须单独检查。

## 9.4 变限积分计算

若

$$
F(x)=\int_{\varphi_1(x)}^{\varphi_2(x)}f(t)\,dt,
$$

且相关函数满足连续可导条件，则

> **核心公式｜Leibniz 公式**
> $$
> F'(x)=f(\varphi_2(x))\varphi_2'(x)
> -f(\varphi_1(x))\varphi_1'(x).
> $$

若被积函数还含参数 $x$，则需再加上偏导积分项：

$$
\frac d{dx}\int_{a(x)}^{b(x)}F(x,t)\,dt
=F(x,b)b'-F(x,a)a'
+\int_{a(x)}^{b(x)}\frac{\partial F}{\partial x}(x,t)\,dt.
$$

<span class="priority-star">★★★</span> 含绝对值的变限积分，应先找被积函数变号点并分段，再求导或展开。

<!-- 原PDF第 18 页 -->

> [!source-note]- 原稿第 18 页
> [打开原稿第 18 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC18%E9%A1%B5.webp)

<span id="page-18" class="source-page-anchor" aria-hidden="true"></span>

例如对 $0<x<\pi/2$，

$$
F(x)=\int_x^{\pi/2}|\sin x-\sin t|\,dt
=\cos x-\left(\frac\pi2-x\right)\sin x.
$$

在 $x\to0^+$ 时

$$
F(x)=1-\frac\pi2x+\frac12x^2+o(x^2).
$$

### 9.4.1 奇偶性与周期性

设 $F(x)=\int_0^x f(t)\,dt$：

- $f$ 奇，则 $F$ 偶；
- $f$ 偶，则 $F$ 奇；
- 若 $f$ 以 $T$ 为周期，则 $F$ 为周期函数当且仅当

$$
\int_0^T f(t)\,dt=0.
$$

## 9.5 反常积分计算

### 常见面积

<!-- 原PDF第 19 页 -->

> [!source-note]- 原稿第 19 页
> [打开原稿第 19 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC19%E9%A1%B5.webp)

<span id="page-19" class="source-page-anchor" aria-hidden="true"></span>

$$
\int_{-\infty}^{+\infty}e^{-x^2}\,dx=\sqrt\pi,
\qquad
\int_0^{+\infty}e^{-x}\,dx=1.
$$

### Gamma 函数

<span class="priority-star">★</span>

定义

$$
\Gamma(\alpha)=\int_0^{+\infty}x^{\alpha-1}e^{-x}\,dx,
\qquad \alpha>0.
$$

分部积分得递推关系

$$
\Gamma(\alpha+1)=\alpha\Gamma(\alpha).
$$

常用值：

$$
\Gamma(1)=1,\qquad
\Gamma(n+1)=n!,\qquad
\Gamma\left(\frac12\right)=\sqrt\pi,
$$

$$
\Gamma\left(\frac32\right)=\frac12\sqrt\pi,\qquad
\Gamma\left(\frac52\right)=\frac34\sqrt\pi.
$$

由换元 $t=ax$ 可得

$$
\int_0^{+\infty}x^n e^{-ax}\,dx
=\frac{\Gamma(n+1)}{a^{n+1}}
=\frac{n!}{a^{n+1}},\qquad a>0.
$$

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>


---

# 第 10 章：一元积分的几何应用

积分应用的统一思路是：选取合适的微元，写出局部量 $dQ$，再在完整区间上积分。

## 10.1 平面图形面积

<!-- 原PDF第 20 页 -->

> [!source-note]- 原稿第 20 页
> [打开原稿第 20 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC20%E9%A1%B5.webp)

<span id="page-20" class="source-page-anchor" aria-hidden="true"></span>

### 10.1.1 直角坐标系

<span class="priority-star">★</span>

用竖直微元 $dx$：

$$
dS=|y_{\text{上}}(x)-y_{\text{下}}(x)|\,dx,
$$

$$
S=\int_a^b|y_1(x)-y_2(x)|\,dx.
$$

若两曲线在区间内部相交，应先求交点并分段，保证每段“上减下”的关系固定。

<img src="/blog_test2/notes/calculus/images/chapters-8-11/%E7%AC%AC10%E7%AB%A0-%E7%9B%B4%E8%A7%92%E5%9D%90%E6%A0%87%E9%9D%A2%E7%A7%AF%E5%BE%AE%E5%85%83.webp" alt="第10章-直角坐标面积微元" width="520" loading="lazy" decoding="async">

用水平微元 $dy$：

$$
dS=|x_{\text{右}}(y)-x_{\text{左}}(y)|\,dy,
$$

$$
S=\int_A^B|x_1(y)-x_2(y)|\,dy.
$$

选 $dx$ 还是 $dy$，以分段少、边界函数简单为准。

### 10.1.2 极坐标系

<!-- 原PDF第 21 页 -->

> [!source-note]- 原稿第 21 页
> [打开原稿第 21 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC21%E9%A1%B5.webp)

<span id="page-21" class="source-page-anchor" aria-hidden="true"></span>

扇形微元为

$$
dS=\frac12r^2(\theta)\,d\theta.
$$

两条极径 $r_1(\theta)$、$r_2(\theta)$ 围成的面积为

> **核心公式**
> $$
> S=\frac12\int_\alpha^\beta
> \left|r_2^2(\theta)-r_1^2(\theta)\right|\,d\theta.
> $$

<img src="/blog_test2/notes/calculus/images/chapters-8-11/%E7%AC%AC10%E7%AB%A0-%E6%9E%81%E5%9D%90%E6%A0%87%E9%9D%A2%E7%A7%AF%E5%BE%AE%E5%85%83.webp" alt="第10章-极坐标面积微元" width="720" loading="lazy" decoding="async">

必须检查：

- 积分角度区间是否覆盖所求区域且没有重复；
- $r^2$ 消除了半径正负号，但曲线追踪方向仍可能导致重复计数；
- 图形有对称性时，可先算一部分再乘倍数。

### 10.1.3 参数方程

若边界由

$$
x=x(t),\qquad y=y(t),\qquad t\in[\alpha,\beta]
$$

给出，则把原面积积分中的 $dx$ 或 $dy$ 换为

$$
dx=x'(t)dt,\qquad dy=y'(t)dt.
$$

例如竖直微元形式可化为

$$
S=\int_\alpha^\beta
|y_1(t)-y_2(t)|\,|x'(t)|\,dt.
$$

一般不应同时使用 $x(t)$ 与 $y(t)$ 两套不同参数。

## 10.2 旋转体体积

<!-- 原PDF第 22 页 -->

> [!source-note]- 原稿第 22 页
> [打开原稿第 22 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC22%E9%A1%B5.webp)

<span id="page-22" class="source-page-anchor" aria-hidden="true"></span>

### 10.2.1 垫片法（截面法）

微元垂直于旋转轴。若绕 $x$ 轴旋转，外半径 $R(x)$、内半径 $r(x)$，则

> **核心公式**
> $$
> dV=\pi\bigl(R^2(x)-r^2(x)\bigr)dx,
> $$
> $$
> V=\pi\int_a^b\bigl(R^2(x)-r^2(x)\bigr)dx.
> $$

绕直线 $y=h$ 旋转时，半径改为到 $y=h$ 的距离；绕 $y$ 轴时可用反函数，把半径写成关于 $y$ 的函数。

<img src="/blog_test2/notes/calculus/images/chapters-8-11/%E7%AC%AC10%E7%AB%A0-%E6%97%8B%E8%BD%AC%E4%BD%93%E5%9E%AB%E7%89%87%E6%B3%95.webp" alt="第10章-旋转体垫片法" width="820" loading="lazy" decoding="async">

反函数形式：

$$
V=\pi\int_A^B\bigl(R^2(y)-r^2(y)\bigr)dy.
$$

<img src="/blog_test2/notes/calculus/images/chapters-8-11/%E7%AC%AC10%E7%AB%A0-%E5%8F%8D%E5%87%BD%E6%95%B0%E5%9E%AB%E7%89%87%E6%B3%95.webp" alt="第10章-反函数垫片法" width="720" loading="lazy" decoding="async">

### 10.2.2 柱壳法

<!-- 原PDF第 23 页 -->

> [!source-note]- 原稿第 23 页
> [打开原稿第 23 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC23%E9%A1%B5.webp)

<span id="page-23" class="source-page-anchor" aria-hidden="true"></span>

微元平行于旋转轴。绕 $y$ 轴旋转时，柱壳半径为 $|x|$，高度为 $|f(x)-g(x)|$：

> **核心公式**
> $$
> V=2\pi\int_a^b|x|\,|f(x)-g(x)|\,dx.
> $$

绕直线 $x=k$ 旋转：

$$
V=2\pi\int_a^b|x-k|\,|f(x)-g(x)|\,dx.
$$

<img src="/blog_test2/notes/calculus/images/chapters-8-11/%E7%AC%AC10%E7%AB%A0-%E6%9F%B1%E5%A3%B3%E6%B3%95%E7%BB%95y%E8%BD%B4.webp" alt="第10章-柱壳法绕y轴" width="820" loading="lazy" decoding="async">

绕 $x$ 轴旋转时，使用水平壳层：

$$
V=2\pi\int_A^B|y|\,|x_{\text{右}}(y)-x_{\text{左}}(y)|\,dy.
$$

绕 $y=k$ 旋转时，把半径改为 $|y-k|$。

<img src="/blog_test2/notes/calculus/images/chapters-8-11/%E7%AC%AC10%E7%AB%A0-%E6%9F%B1%E5%A3%B3%E6%B3%95%E7%BB%95x%E8%BD%B4.webp" alt="第10章-柱壳法绕x轴" width="820" loading="lazy" decoding="async">

> **蓝笔补充｜选法原则**
> 垫片法的微元垂直旋转轴，柱壳法的微元平行旋转轴。优先选择不需要求反函数、分段较少的方向。

### 10.2.3 绕斜直线旋转

<!-- 原PDF第 24 页 -->

> [!source-note]- 原稿第 24 页
> [打开原稿第 24 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC24%E9%A1%B5.webp)

<span id="page-24" class="source-page-anchor" aria-hidden="true"></span>

设旋转轴

$$
L_0:Ax+By+C=0,
$$

曲线 $y=f(x)$（$x\in[a,b]$）与 $L_0$ 至多有一个交点。原稿给出的截面计算公式为

$$
V=\frac{\pi}{(A^2+B^2)^{3/2}}
\int_a^b[Ax+Bf(x)+C]^2\,|Af'(x)-B|\,dx.
$$

<img src="/blog_test2/notes/calculus/images/chapters-8-11/%E7%AC%AC10%E7%AB%A0-%E7%BB%95%E6%96%9C%E7%9B%B4%E7%BA%BF%E6%97%8B%E8%BD%AC.webp" alt="第10章-绕斜直线旋转" width="560" loading="lazy" decoding="async">

> **重点订正｜使用前先画图**
> 斜轴旋转公式依赖曲线与旋转轴的相对位置及是否重复覆盖。若题目区域跨越旋转轴，应先分区讨论，不能机械套式。

## 10.3 质心与弧长

### 10.3.1 平面薄片质心

对于区域

$$
D=\{(x,y)\mid a\le x\le b, 0\le y\le f(x)\},
$$

面积

$$
S=\int_a^b f(x)\,dx,
$$

质心坐标为

> **核心公式**
> $$
> \bar x=\frac{\int_a^b x f(x)\,dx}{\int_a^b f(x)\,dx},
> \qquad
> \bar y=\frac{\frac12\int_a^b f^2(x)\,dx}{\int_a^b f(x)\,dx}.
> $$

密度不均匀时，应在面积微元中乘密度函数，再用“总矩 / 总质量”。

### 10.3.2 弧长

直角坐标 $y=f(x)$：

$$
ds=\sqrt{1+[f'(x)]^2}\,dx,
$$

$$
L=\int_a^b\sqrt{1+[f'(x)]^2}\,dx.
$$

参数方程：

$$
L=\int_\alpha^\beta
\sqrt{[x'(t)]^2+[y'(t)]^2}\,dt.
$$

极坐标 $r=r(\theta)$：

$$
L=\int_\alpha^\beta
\sqrt{r^2(\theta)+[r'(\theta)]^2}\,d\theta.
$$

## 10.4 旋转曲面面积

<!-- 原PDF第 25 页 -->

> [!source-note]- 原稿第 25 页
> [打开原稿第 25 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC25%E9%A1%B5.webp)

<span id="page-25" class="source-page-anchor" aria-hidden="true"></span>

曲线 $y=f(x)$ 绕 $x$ 轴旋转：

> **核心公式**
> $$
> A=2\pi\int_a^b|f(x)|\sqrt{1+[f'(x)]^2}\,dx.
> $$

参数形式：

$$
A=2\pi\int_\alpha^\beta
|y(t)|\sqrt{[x'(t)]^2+[y'(t)]^2}\,dt.
$$

极坐标曲线绕 $x$ 轴旋转：

$$
A=2\pi\int_\alpha^\beta
|r(\theta)\sin\theta|
\sqrt{r^2(\theta)+[r'(\theta)]^2}\,d\theta.
$$

绕 $y$ 轴时，把旋转半径换成 $|x|$；任何旋转曲面公式都必须使用点到旋转轴的实际距离。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

# 第 11 章：积分中值定理与积分不等式

## 11.1 积分中值定理

<span class="priority-star">★</span>

<!-- 原PDF第 26 页 -->

> [!source-note]- 原稿第 26 页
> [打开原稿第 26 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC26%E9%A1%B5.webp)

<span id="page-26" class="source-page-anchor" aria-hidden="true"></span>

### 11.1.1 第一积分中值定理

<span class="priority-star">★★★</span>

若 $f,g$ 在 $[a,b]$ 上连续，且 $g$ 在 $[a,b]$ 上不变号，则存在 $\xi\in[a,b]$，使

> **核心公式**
> $$
> \int_a^b f(x)g(x)\,dx
> =f(\xi)\int_a^b g(x)\,dx.
> $$

取 $g(x)\equiv1$，得到

$$
\int_a^b f(x)\,dx=f(\xi)(b-a).
$$

证明可令

$$
F(x)=\int_a^x f(t)g(t)\,dt,\qquad
G(x)=\int_a^x g(t)\,dt,
$$

再对 $F,G$ 使用 Cauchy 中值定理。

积分中值定理常与以下工具联用：

- Rolle 定理；
- Lagrange、Cauchy 中值定理；
- Taylor 公式及余项；
- 保序性与比较估计。

### 11.1.2 两类证明模式

<!-- 原PDF第 27 页 -->

> [!source-note]- 原稿第 27 页
> [打开原稿第 27 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC27%E9%A1%B5.webp)

<span id="page-27" class="source-page-anchor" aria-hidden="true"></span>

#### 权函数集中到端点

若 $f$ 在 $[1,2]$ 连续，则由积分中值定理

$$
\int_1^2 f(x)e^{-x^n}\,dx
=f(\xi_n)\int_1^2 e^{-x^n}\,dx.
$$

$f(\xi_n)$ 有界，而右侧权函数积分可比较为趋于零，因此

$$
\lim_{n\to\infty}\int_1^2 f(x)e^{-x^n}\,dx=0.
$$

#### 从加权平均值构造导数符号

若加权积分条件能推出某个内点 $\eta$ 满足 $f(\eta)$ 等于已知端点值，则先在端点与 $\eta$ 间用 Rolle 定理得到 $f'(\xi_1)=0$；再在 $\eta$ 与另一端点间用 Lagrange 中值定理得到 $f'(\xi_2)<0$；最后对 $f'$ 再用一次 Lagrange 中值定理，即可推出某点 $f''(\xi)<0$。

这类题的结构是：

$$
\text{积分中值定理}
\to\text{函数值相等或大小关系}
\to\text{Rolle/Lagrange}
\to\text{高阶导数结论}.
$$

## 11.2 积分不等式

### 11.2.1 保序与绝对值

<!-- 原PDF第 28 页 -->

> [!source-note]- 原稿第 28 页
> [打开原稿第 28 页](/blog_test2/notes/calculus/images/chapters-8-11/%E5%8E%9F%E7%A8%BF-%E7%AC%AC28%E9%A1%B5.webp)

<span id="page-28" class="source-page-anchor" aria-hidden="true"></span>

若 $f(x)<g(x)$，可先利用积分保序性：

$$
\int_a^b f(x)\,dx<\int_a^b g(x)\,dx.
$$

常用绝对值估计：

$$
\left|\int_a^b f(x)g(x)\,dx\right|
\le\int_a^b|f(x)|\,|g(x)|\,dx,
$$

$$
\left|\int_a^b f(x)\,dx\right|
\le\int_a^b|f(x)|\,dx.
$$

若 $m\le f(x)\le M$ 且 $x\ge0$，则

$$
m x^n\le x^n f(x)\le Mx^n,
$$

积分后即可得到带权积分的上下界。遇到可积但不便直接比较的题，可先用保序性缩放，再判断对应反常积分。

### 11.2.2 常用工具清单

积分不等式常用：

1. 单调性与保序性；
2. 凸性、Jensen 不等式；
3. Taylor 公式与余项；
4. 换元与分部积分；
5. Cauchy-Schwarz 不等式；
6. 微分方程或构造辅助函数；
7. 降幂、配方及反常积分比较。

若 $f\in C^1[a,b]$ 且 $f(a)=f(b)=0$，可从

$$
f(x)=\int_a^x f'(t)\,dt
=-\int_x^b f'(t)\,dt
$$

得到端点约束下的估计，例如

$$
|f(x)|
\le\frac12\int_a^b|f'(t)|\,dt.
$$

> **重点订正｜不等式证明检查单**
> - 比较积分时，被积函数不等号是否在整个积分区间成立？
> - 乘上权函数后是否保持同号？
> - 反常积分比较时，比较函数的收敛性是否已经确认？
> - 取绝对值、平方或开方时，是否写明非负条件？
> - 使用中值定理时，连续、可导和不变号条件是否完整？

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

# 复习速查

## 积分计算方法选择

| 被积式特征 | 优先方法 |
|---|---|
| 出现复合函数及内层导数 | 第一换元法、凑微分 |
| 根式 $\sqrt{a^2-x^2}$、$\sqrt{a^2+x^2}$、$\sqrt{x^2-a^2}$ | 三角代换 |
| 多个分式根式 | 幂代换，指数取分母最小公倍数 |
| 对数、反三角函数、幂函数与指数/三角函数相乘 | 分部积分 |
| 有理真分式 | 部分分式分解 |
| 定积分区间对称 | 奇偶性、区间再现、周期性 |
| 无穷区间或瑕点 | 先写极限，再作比较或极限比较 |

## 几何应用选微元

| 目标 | 微元方向 | 公式核心 |
|---|---|---|
| 平面面积 | 竖条或横条 | 上减下 / 右减左 |
| 旋转体垫片法 | 垂直旋转轴 | $\pi(R^2-r^2)$ |
| 旋转体柱壳法 | 平行旋转轴 | $2\pi\cdot\text{半径}\cdot\text{高度}$ |
| 弧长 | 沿曲线 | $ds$ |
| 旋转曲面 | 沿曲线 | $2\pi\cdot\text{半径}\cdot ds$ |

## 高频易错点

- 不定积分必须写积分常数 $C$，并注意定义区间；
- 定积分换元必须同步更换上下限；
- 变限积分含绝对值时先找变号点；
- 全实轴反常积分必须在任一点拆成两段分别收敛；
- $p$ 型积分在零点与无穷远处的临界方向相反；
- 利用奇偶性处理反常积分前，先确认普通反常积分确实收敛；
- 旋转体公式中的半径是到旋转轴的距离，平移轴后必须加绝对值；
- 面积、体积与曲面面积不得出现负值，必要时分段或取绝对值。

## 公式索引

- <a href="#821-%E5%AE%9A%E7%A7%AF%E5%88%86%E5%AE%9A%E4%B9%89%E4%B8%8E%E5%87%A0%E4%BD%95%E6%84%8F%E4%B9%89">Riemann 定积分</a>
- <a href="#832-%E5%8F%98%E9%99%90%E7%A7%AF%E5%88%86%E7%9A%84%E8%BF%9E%E7%BB%AD%E4%B8%8E%E5%8F%AF%E5%AF%BC">变限积分基本定理</a>
- <a href="#843-%E9%87%8D%E8%A6%81-p-%E5%9E%8B%E7%BB%93%E8%AE%BA">反常积分 $p$ 型判敛</a>
- <a href="#91-%E5%9F%BA%E6%9C%AC%E7%A7%AF%E5%88%86%E5%85%AC%E5%BC%8F">基本积分公式</a>
- <a href="#923-%E5%88%86%E9%83%A8%E7%A7%AF%E5%88%86%E6%B3%95">分部积分法</a>
- <a href="#933-%E5%AF%B9%E7%A7%B0%E6%80%A7%E5%91%A8%E6%9C%9F%E6%80%A7%E4%B8%8E%E5%8C%BA%E9%97%B4%E5%86%8D%E7%8E%B0">定积分对称技巧</a>
- <a href="#95-%E5%8F%8D%E5%B8%B8%E7%A7%AF%E5%88%86%E8%AE%A1%E7%AE%97">Gamma 函数</a>
- <a href="#102-%E6%97%8B%E8%BD%AC%E4%BD%93%E4%BD%93%E7%A7%AF">旋转体体积</a>
- <a href="#103-%E8%B4%A8%E5%BF%83%E4%B8%8E%E5%BC%A7%E9%95%BF">质心与弧长</a>
- <a href="#111-%E7%A7%AF%E5%88%86%E4%B8%AD%E5%80%BC%E5%AE%9A%E7%90%86">积分中值定理</a>
