---
title: "高等数学第 16 章：无穷级数"
description: "由 14 页手写笔记整理而成，涵盖数项级数判敛、幂级数、求和函数、Taylor 展开与 Fourier 级数。"
pubDate: "2026-09-27"
updatedDate: "2026-09-27"
author: "离子怪"
sourceUrl: "https://github.com/ice11123/blog_test2/blob/main/src/content/blog/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/08-infinite-series.md"
dir1: "学习笔记"
dir2: "高等数学笔记"
tags: ["高等数学", "无穷级数", "幂级数", "Fourier级数", "学习笔记"]
---

<span id="高数第-16-章无穷级数" class="article-top-anchor" aria-hidden="true"></span>

<a href="/blog_test2/blog/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/00-calculus-index/">← 返回高数笔记总索引</a>

> [!blue-ink] 使用说明
> 本文对应原扫描件第 52—65 页，共 14 页。正文和公式可搜索；幂级数收敛区间、周期延拓等图形保留为局部裁图。

> 来源：打开第 16 章扫描 PDF

> [!note] 原稿星级
> <span class="priority-star">★</span>、<span class="priority-star">★★</span>、<span class="priority-star">★★★</span> 仅按原稿中能够明确辨认的位置保留。

## 总导航

- <a href="#161-%E5%B8%B8%E6%95%B0%E9%A1%B9%E7%BA%A7%E6%95%B0">常数项级数</a>
- <a href="#162-%E7%BA%A7%E6%95%B0%E6%95%9B%E6%95%A3%E6%80%A7%E5%88%A4%E5%88%AB">敛散性判别</a>
- <a href="#163-%E5%B9%82%E7%BA%A7%E6%95%B0">幂级数</a>
- <a href="#164-%E5%B9%82%E7%BA%A7%E6%95%B0%E6%B1%82%E5%92%8C%E5%87%BD%E6%95%B0">求和函数</a>
- <a href="#165-%E5%87%BD%E6%95%B0%E5%B1%95%E5%BC%80%E6%88%90%E5%B9%82%E7%BA%A7%E6%95%B0">Taylor 展开</a>
- <a href="#166-fourier-%E7%BA%A7%E6%95%B0">Fourier 级数</a>
- 原稿：<a href="#page-01">1</a> · <a href="#page-02">2</a> · <a href="#page-03">3</a> · <a href="#page-04">4</a> · <a href="#page-05">5</a> · <a href="#page-06">6</a> · <a href="#page-07">7</a> · <a href="#page-08">8</a> · <a href="#page-09">9</a> · <a href="#page-10">10</a> · <a href="#page-11">11</a> · <a href="#page-12">12</a> · <a href="#page-13">13</a> · <a href="#page-14">14</a>

---

## 16.1 常数项级数

### 16.1.1 概念与分类

<!-- 原PDF第 1 页 -->

> [!source-note]- 原稿第 1 页
> [打开原稿第 1 页](/blog_test2/notes/calculus/images/chapter-16/%E5%8E%9F%E7%A8%BF-%E7%AC%AC01%E9%A1%B5.webp)

<span id="page-01" class="source-page-anchor" aria-hidden="true"></span>

给定数列 $\{u_n\}$，部分和为

$$
S_n=u_1+u_2+\cdots+u_n.
$$

若

$$
\lim_{n\to\infty}S_n=S
$$

存在且有限，则称级数

$$
\sum_{n=1}^{\infty}u_n
$$

收敛，和为 $S$；否则发散。

常见类型：正项级数、交错级数、任意项级数以及几何级数

$$
\sum_{n=1}^{\infty}aq^{n-1}.
$$

几何级数在 $|q|<1$ 时收敛于 $a/(1-q)$，在 $|q|\ge1$ 时发散。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 16.1.2 基本性质与必要条件

<!-- 原PDF第 2 页 -->

> [!source-note]- 原稿第 2 页
> [打开原稿第 2 页](/blog_test2/notes/calculus/images/chapter-16/%E5%8E%9F%E7%A8%BF-%E7%AC%AC02%E9%A1%B5.webp)

<span id="page-02" class="source-page-anchor" aria-hidden="true"></span>

1. 线性：若 $\sum u_n$、$\sum v_n$ 收敛，则 $\sum(au_n+bv_n)$ 收敛；收敛级数与发散级数相加必发散，但两个发散级数相加未必发散。
2. <span class="priority-star">★</span> 增删有限项不改变级数的敛散性。
3. 收敛级数任意加括号仍收敛且和不变；反向拆括号一般不能保证保持敛散性。
4. <span class="priority-star">★</span> 必要条件：

$$
\sum_{n=1}^{\infty}u_n\text{ 收敛}
\Longrightarrow
\lim_{n\to\infty}u_n=0.
$$

逆命题不成立，例如调和级数 $\sum1/n$ 发散。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

## 16.2 级数敛散性判别

### 16.2.1 正项级数：比较判别法

<!-- 原PDF第 3 页 -->

> [!source-note]- 原稿第 3 页
> [打开原稿第 3 页](/blog_test2/notes/calculus/images/chapter-16/%E5%8E%9F%E7%A8%BF-%E7%AC%AC03%E9%A1%B5.webp)

<span id="page-03" class="source-page-anchor" aria-hidden="true"></span>

若 $u_n\ge0$，则部分和单调不减。因此

$$
\sum u_n\text{ 收敛}
\Longleftrightarrow
\{S_n\}\text{ 有上界}.
$$

设 $0\le u_n\le v_n$：

- 若 $\sum v_n$ 收敛，则 $\sum u_n$ 收敛；
- 若 $\sum u_n$ 发散，则 $\sum v_n$ 发散。

### 极限比较判别法

设 $u_n,v_n>0$，且

$$
\lim_{n\to\infty}\frac{u_n}{v_n}=A.
$$

- 若 $0<A<\infty$，两级数同敛散；
- 若 $A=0$，$\sum v_n$ 收敛可推出 $\sum u_n$ 收敛；
- 若 $A=\infty$，$\sum v_n$ 发散可推出 $\sum u_n$ 发散。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

<!-- 原PDF第 4 页 -->

> [!source-note]- 原稿第 4 页
> [打开原稿第 4 页](/blog_test2/notes/calculus/images/chapter-16/%E5%8E%9F%E7%A8%BF-%E7%AC%AC04%E9%A1%B5.webp)

<span id="page-04" class="source-page-anchor" aria-hidden="true"></span>

比较时常用等价无穷小或同阶量选择基准级数。典型基准：

$$
\sum\frac1{n^p}
\begin{cases}
\text{收敛},&p>1,\\
\text{发散},&p\le1.
\end{cases}
$$

<span class="priority-star">★</span> 若含三角函数、对数或指数差，可先求通项的主阶，再与 $p$ 级数比较；只证明 $u_n\to0$ 不能证明级数收敛。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 16.2.2 比值、根值与积分判别法

<!-- 原PDF第 5 页 -->

> [!source-note]- 原稿第 5 页
> [打开原稿第 5 页](/blog_test2/notes/calculus/images/chapter-16/%E5%8E%9F%E7%A8%BF-%E7%AC%AC05%E9%A1%B5.webp)

<span id="page-05" class="source-page-anchor" aria-hidden="true"></span>

对正项级数，若极限存在：

$$
\rho=\lim_{n\to\infty}\frac{u_{n+1}}{u_n},
$$

或

$$
\rho=\lim_{n\to\infty}\sqrt[n]{u_n},
$$

则

$$
\rho<1\Rightarrow\text{收敛},
\qquad
\rho>1\Rightarrow\text{发散},
$$

而 $\rho=1$ 时判别失效。

若 $f(x)$ 在 $[1,\infty)$ 上正、连续且单调递减，并且 $u_n=f(n)$，则

$$
\sum_{n=1}^{\infty}u_n
\quad\text{与}\quad
\int_1^{\infty}f(x)\,dx
$$

同敛散。

由此可判断含 $n^p(\ln n)^q$ 的级数：

$$
\sum_{n\ge2}\frac1{n^p(\ln n)^q}
$$

在 $p>1$ 时收敛；$p<1$ 时发散；$p=1$ 时当且仅当 $q>1$ 收敛。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 16.2.3 交错级数、绝对收敛与条件收敛

<!-- 原PDF第 6 页 -->

> [!source-note]- 原稿第 6 页
> [打开原稿第 6 页](/blog_test2/notes/calculus/images/chapter-16/%E5%8E%9F%E7%A8%BF-%E7%AC%AC06%E9%A1%B5.webp)

<span id="page-06" class="source-page-anchor" aria-hidden="true"></span>

Leibniz 判别法：若 $u_n\ge0$、$u_n$ 单调不增且 $u_n\to0$，则

$$
\sum_{n=1}^{\infty}(-1)^{n-1}u_n
$$

收敛。

任意项级数中：

- 若 $\sum|u_n|$ 收敛，则 $\sum u_n$ 绝对收敛；
- 若 $\sum u_n$ 收敛但 $\sum|u_n|$ 发散，则条件收敛。

<span class="priority-star">★</span>

$$
\sum|u_n|\text{ 收敛}
\Longrightarrow
\sum u_n\text{ 收敛},
$$

反之不成立。判别任意项级数时，应先检查绝对收敛，再考虑交错结构。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

<!-- 原PDF第 7 页 -->

> [!source-note]- 原稿第 7 页
> [打开原稿第 7 页](/blog_test2/notes/calculus/images/chapter-16/%E5%8E%9F%E7%A8%BF-%E7%AC%AC07%E9%A1%B5.webp)

<span id="page-07" class="source-page-anchor" aria-hidden="true"></span>

本页汇总了任意项级数的运算关系：

1. 绝对收敛级数与绝对收敛级数相加仍绝对收敛；
2. 绝对收敛级数与条件收敛级数相加仍条件收敛；
3. 两个条件收敛级数相加可能收敛，也可能发散；
4. 若 $\sum|u_n|$ 发散，不能直接推出 $\sum u_n$ 发散；
5. 比值或根值判别对 $\sum|u_n|$ 给出收敛时，原级数绝对收敛。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

## 16.3 幂级数

### 16.3.1 收敛半径与收敛区间

<!-- 原PDF第 8 页 -->

> [!source-note]- 原稿第 8 页
> [打开原稿第 8 页](/blog_test2/notes/calculus/images/chapter-16/%E5%8E%9F%E7%A8%BF-%E7%AC%AC08%E9%A1%B5.webp)

<span id="page-08" class="source-page-anchor" aria-hidden="true"></span>

幂级数的一般形式为

$$
\sum_{n=0}^{\infty}a_n(x-x_0)^n.
$$

Abel 定理说明：若它在某个 $x_1\ne x_0$ 处收敛，则在 $|x-x_0|<|x_1-x_0|$ 内绝对收敛；若在某点发散，则离中心更远处均发散。

因此存在收敛半径 $R$：

$$
|x-x_0|<R\Rightarrow\text{绝对收敛},
\qquad
|x-x_0|>R\Rightarrow\text{发散}.
$$

<img src="/blog_test2/notes/calculus/images/chapter-16/%E7%AC%AC16%E7%AB%A0-%E5%B9%82%E7%BA%A7%E6%95%B0%E6%94%B6%E6%95%9B%E5%8C%BA%E9%97%B4.webp" alt="第16章-幂级数收敛区间" width="760" loading="lazy" decoding="async">

端点 $x=x_0\pm R$ 必须分别代回原级数判断。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

<!-- 原PDF第 9 页 -->

> [!source-note]- 原稿第 9 页
> [打开原稿第 9 页](/blog_test2/notes/calculus/images/chapter-16/%E5%8E%9F%E7%A8%BF-%E7%AC%AC09%E9%A1%B5.webp)

<span id="page-09" class="source-page-anchor" aria-hidden="true"></span>

若

$$
\rho=\lim_{n\to\infty}\left|\frac{a_{n+1}}{a_n}\right|
$$

或

$$
\rho=\lim_{n\to\infty}\sqrt[n]{|a_n|}
$$

存在，则

$$
R=
\begin{cases}
1/\rho,&0<\rho<\infty,\\
\infty,&\rho=0,\\
0,&\rho=\infty.
\end{cases}
$$

<span class="priority-star">★</span> 求收敛域的完整步骤：先求 $R$，再分别检查两个端点。平移中心、逐项求导或逐项积分通常不改变收敛半径，但端点敛散性可能改变。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 16.3.2 幂级数运算

<!-- 原PDF第 10 页 -->

> [!source-note]- 原稿第 10 页
> [打开原稿第 10 页](/blog_test2/notes/calculus/images/chapter-16/%E5%8E%9F%E7%A8%BF-%E7%AC%AC10%E9%A1%B5.webp)

<span id="page-10" class="source-page-anchor" aria-hidden="true"></span>

在共同收敛区间内部，幂级数可逐项相加、相乘、求导和积分。若

$$
A(x)=\sum_{n=0}^{\infty}a_nx^n,
\qquad
B(x)=\sum_{n=0}^{\infty}b_nx^n,
$$

则 Cauchy 乘积为

$$
A(x)B(x)
=\sum_{n=0}^{\infty}
\left(\sum_{k=0}^{n}a_kb_{n-k}\right)x^n.
$$

求和函数时常用三种操作：

1. 逐项求导消去 $1/n$ 等因子；
2. 逐项积分制造 $1/(n+1)$；
3. 提取 $x^k$ 或平移指标，使级数化为已知基本级数。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

## 16.4 幂级数求和函数

<!-- 原PDF第 11 页 -->

> [!source-note]- 原稿第 11 页
> [打开原稿第 11 页](/blog_test2/notes/calculus/images/chapter-16/%E5%8E%9F%E7%A8%BF-%E7%AC%AC11%E9%A1%B5.webp)

<span id="page-11" class="source-page-anchor" aria-hidden="true"></span>

在收敛域内，记

$$
S(x)=\sum_{n=0}^{\infty}a_nx^n.
$$

常以几何级数

$$
\sum_{n=0}^{\infty}x^n=\frac1{1-x},
\qquad |x|<1
$$

为起点，通过逐项积分、求导和代换得到所求级数。例如

$$
\sum_{n=1}^{\infty}\frac{x^n}{n}
=-\ln(1-x),
\qquad -1\le x<1.
$$

端点必须回到原级数单独讨论，不能由求和函数公式机械外推。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

## 16.5 函数展开成幂级数

<!-- 原PDF第 12 页 -->

> [!source-note]- 原稿第 12 页
> [打开原稿第 12 页](/blog_test2/notes/calculus/images/chapter-16/%E5%8E%9F%E7%A8%BF-%E7%AC%AC12%E9%A1%B5.webp)

<span id="page-12" class="source-page-anchor" aria-hidden="true"></span>

函数在 $x_0$ 处的 Taylor 展开为

$$
f(x)=\sum_{n=0}^{\infty}
\frac{f^{(n)}(x_0)}{n!}(x-x_0)^n,
$$

在 $x_0=0$ 时称为 Maclaurin 展开。

常用展开：

$$
e^x=\sum_{n=0}^{\infty}\frac{x^n}{n!},
\qquad -\infty<x<\infty,
$$

$$
\frac1{1-x}=\sum_{n=0}^{\infty}x^n,
\qquad |x|<1,
$$

$$
\ln(1+x)=\sum_{n=1}^{\infty}(-1)^{n-1}\frac{x^n}{n},
\qquad -1<x\le1,
$$

$$
\sin x=\sum_{n=0}^{\infty}(-1)^n\frac{x^{2n+1}}{(2n+1)!},
$$

$$
\cos x=\sum_{n=0}^{\infty}(-1)^n\frac{x^{2n}}{(2n)!}.
$$

广义二项式展开为

$$
(1+x)^\alpha
=1+\alpha x+\frac{\alpha(\alpha-1)}{2!}x^2+\cdots,
\qquad |x|<1,
$$

端点是否包含取决于 $\alpha$。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

## 16.6 Fourier 级数

### 16.6.1 一般形式与收敛值

<!-- 原PDF第 13 页 -->

> [!source-note]- 原稿第 13 页
> [打开原稿第 13 页](/blog_test2/notes/calculus/images/chapter-16/%E5%8E%9F%E7%A8%BF-%E7%AC%AC13%E9%A1%B5.webp)

<span id="page-13" class="source-page-anchor" aria-hidden="true"></span>

周期为 $2l$ 的函数在 $[-l,l]$ 上的 Fourier 系数为

$$
a_n=\frac1l\int_{-l}^{l}f(x)\cos\frac{n\pi x}{l}\,dx,
\qquad n=0,1,2,\ldots,
$$

$$
b_n=\frac1l\int_{-l}^{l}f(x)\sin\frac{n\pi x}{l}\,dx,
\qquad n=1,2,\ldots
$$

对应级数为

$$
\frac{a_0}{2}
+\sum_{n=1}^{\infty}
\left(
a_n\cos\frac{n\pi x}{l}
+b_n\sin\frac{n\pi x}{l}
\right).
$$

<span class="priority-star">★</span> 在满足 Dirichlet 条件时，级数在连续点收敛于 $f(x)$，在跳跃间断点收敛于

$$
\frac{f(x-0)+f(x+0)}2,
$$

端点按周期延拓后的左右极限取平均。

若 $f$ 为奇函数，只含正弦项；若为偶函数，只含余弦项。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 16.6.2 半区间展开与周期延拓

<!-- 原PDF第 14 页 -->

> [!source-note]- 原稿第 14 页
> [打开原稿第 14 页](/blog_test2/notes/calculus/images/chapter-16/%E5%8E%9F%E7%A8%BF-%E7%AC%AC14%E9%A1%B5.webp)

<span id="page-14" class="source-page-anchor" aria-hidden="true"></span>

若函数只定义在 $[0,l]$：

- 作奇延拓后再作周期 $2l$ 延拓，得到正弦级数；
- 作偶延拓后再作周期 $2l$ 延拓，得到余弦级数。

<img src="/blog_test2/notes/calculus/images/chapter-16/%E7%AC%AC16%E7%AB%A0-%E5%91%A8%E6%9C%9F%E5%BB%B6%E6%8B%93%E4%B8%8E%E5%A5%87%E5%81%B6%E5%BB%B6%E6%8B%93.webp" alt="第16章-周期延拓与奇偶延拓" width="760" loading="lazy" decoding="async">

正弦级数系数：

$$
b_n=\frac2l\int_0^l f(x)\sin\frac{n\pi x}{l}\,dx.
$$

余弦级数系数：

$$
a_n=\frac2l\int_0^l f(x)\cos\frac{n\pi x}{l}\,dx,
\qquad
a_0=\frac2l\int_0^l f(x)\,dx.
$$

## 复习速查

1. 先验必要条件永远是 $u_n\to0$，但它不能证明收敛。
2. 正项级数优先比较、比值、根值或积分判别。
3. 任意项级数先判绝对收敛，再看交错结构。
4. 幂级数先求半径，再单独检查两个端点。
5. 求和函数优先从几何级数出发，用求导、积分和代换。
6. Fourier 级数在间断点取左右极限平均，半区间展开先明确奇延拓还是偶延拓。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>
