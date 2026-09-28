---
title: "高等数学第 15 章：微分方程"
description: "由 10 页手写笔记整理而成，涵盖一阶微分方程、高阶线性微分方程、微分算子法与 Euler 方程。"
pubDate: "2026-09-27"
updatedDate: "2026-09-27"
author: "离子怪"
sourceUrl: "https://github.com/ice11123/blog_test2/blob/main/src/content/blog/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/07-differential-equations.md"
dir1: "学习笔记"
dir2: "高等数学笔记"
tags: ["高等数学", "微分方程", "线性微分方程", "Euler方程", "学习笔记"]
---

<span id="高数第-15-章微分方程" class="article-top-anchor" aria-hidden="true"></span>

<a href="/blog_test2/blog/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/00-calculus-index/">← 返回高数笔记总索引</a>

> [!blue-ink] 使用说明
> 本文对应原扫描件第 42—51 页，共 10 页。公式均转成可搜索的 LaTeX；每页保留原稿入口。原稿以推导为主，本章不重复嵌入整页图片。

> 来源：打开第 15 章扫描 PDF

> [!note] 原稿星级
> <span class="priority-star">★</span>、<span class="priority-star">★★</span>、<span class="priority-star">★★★</span> 仅按原稿中能够明确辨认的位置保留。

## 总导航

- <a href="#151-%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5">基本概念</a>
- <a href="#152-%E4%B8%80%E9%98%B6%E5%BE%AE%E5%88%86%E6%96%B9%E7%A8%8B">一阶微分方程</a>
- <a href="#153-%E9%AB%98%E9%98%B6%E7%BA%BF%E6%80%A7%E5%BE%AE%E5%88%86%E6%96%B9%E7%A8%8B">高阶线性微分方程</a>
- <a href="#154-euler-%E6%96%B9%E7%A8%8B">Euler 方程</a>
- 原稿：<a href="#page-01">1</a> · <a href="#page-02">2</a> · <a href="#page-03">3</a> · <a href="#page-04">4</a> · <a href="#page-05">5</a> · <a href="#page-06">6</a> · <a href="#page-07">7</a> · <a href="#page-08">8</a> · <a href="#page-09">9</a> · <a href="#page-10">10</a>

---

## 15.1 基本概念

<!-- 原PDF第 1 页 -->

> [!source-note]- 原稿第 1 页
> [打开原稿第 1 页](/blog_test2/notes/calculus/images/chapter-15/%E5%8E%9F%E7%A8%BF-%E7%AC%AC01%E9%A1%B5.webp)

<span id="page-01" class="source-page-anchor" aria-hidden="true"></span>

含未知函数及其导数的方程称为微分方程。一般形式可写成

$$
F\bigl(x,y,y',\ldots,y^{(n)}\bigr)=0,
$$

或

$$
y^{(n)}=f\bigl(x,y,y',\ldots,y^{(n-1)}\bigr).
$$

方程中出现的最高阶导数的阶数称为微分方程的阶。

### 线性与非线性

$n$ 阶线性微分方程为

$$
a_n(x)y^{(n)}+a_{n-1}(x)y^{(n-1)}+\cdots+a_1(x)y'+a_0(x)y=f(x).
$$

- 若 $f(x)=0$，称为齐次线性微分方程；
- 若 $f(x)\ne0$，称为非齐次线性微分方程；
- 若未知函数或其导数以非一次形式出现，则为非线性方程。

### 解、通解与初值问题

- 将函数代入方程后恒成立，称为方程的解；
- 含有与方程阶数相同个数任意常数的解，通常称为通解；
- 给定 $y(x_0),y'(x_0),\ldots$ 等条件后确定常数，得到特解。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

## 15.2 一阶微分方程

### 15.2.1 可分离变量方程与变量代换

同页续记：一阶方程的常见类型包括可分离变量、齐次型、一阶线性、Bernoulli、全微分以及可降阶方程。

若

$$
y'=f(x)g(y),
$$

则在不遗漏使 $g(y)=0$ 的常数解后，可分离变量：

$$
\frac{dy}{g(y)}=f(x)\,dx,
\qquad
\int\frac{dy}{g(y)}=\int f(x)\,dx+C.
$$

若方程含 $ax+by+c$，可令

$$
u=ax+by+c,
$$

利用 $du/dx=a+b,dy/dx$ 化为可分离变量方程。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 15.2.2 齐次型与一阶线性方程

<!-- 原PDF第 2 页 -->

> [!source-note]- 原稿第 2 页
> [打开原稿第 2 页](/blog_test2/notes/calculus/images/chapter-15/%E5%8E%9F%E7%A8%BF-%E7%AC%AC02%E9%A1%B5.webp)

<span id="page-02" class="source-page-anchor" aria-hidden="true"></span>

<span class="priority-star">★</span> 齐次型一阶方程

$$
\frac{dy}{dx}=\varphi\left(\frac yx\right)
$$

令 $u=y/x$，即 $y=ux$，则

$$
\frac{dy}{dx}=u+x\frac{du}{dx},
$$

从而化为 $u$ 与 $x$ 的可分离变量方程。

<span class="priority-star">★★★</span> 一阶线性方程

$$
y'+p(x)y=q(x)
$$

的通解为

$$
y=e^{-\int p(x)\,dx}
\left[
\int q(x)e^{\int p(x)\,dx}\,dx+C
\right].
$$

若某一变量更容易作为函数，也可以把 $x$ 视为 $y$ 的函数，先化成关于 $x(y)$ 的一阶线性方程。

> [!tip] 带初值的稳妥写法
> 取定基点 $x_0$ 后，可写成
> $$
> y=e^{-\int_{x_0}^{x}p(t)\,dt}
> \left[
> C+\int_{x_0}^{x}q(t)e^{\int_{x_0}^{t}p(s)\,ds}\,dt
> \right],
> $$
> 这样不定积分常数不易混乱。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 15.2.3 Bernoulli 方程与可降阶方程

<!-- 原PDF第 3 页 -->

> [!source-note]- 原稿第 3 页
> [打开原稿第 3 页](/blog_test2/notes/calculus/images/chapter-15/%E5%8E%9F%E7%A8%BF-%E7%AC%AC03%E9%A1%B5.webp)

<span id="page-03" class="source-page-anchor" aria-hidden="true"></span>

Bernoulli 方程为

$$
y'+p(x)y=q(x)y^n,
\qquad n\ne0,1.
$$

两边乘 $y^{-n}$，再令

$$
z=y^{1-n},
$$

即可化为关于 $z$ 的一阶线性方程。

#### 不显含 $y$ 的二阶方程

若

$$
y''=f(x,y'),
$$

令 $p=y'$，则 $y''=dp/dx$，先求 $p(x)$，再积分得到 $y$。

#### 不显含 $x$ 的二阶方程

若

$$
y''=f(y,y'),
$$

令 $p=y'$，把 $p$ 看成 $y$ 的函数，则

$$
y''=\frac{dp}{dx}=\frac{dp}{dy}\frac{dy}{dx}=p\frac{dp}{dy}.
$$

先求 $p(y)$，再由 $dy/dx=p(y)$ 求 $y(x)$。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 15.2.4 全微分方程

<!-- 原PDF第 4 页 -->

> [!source-note]- 原稿第 4 页
> [打开原稿第 4 页](/blog_test2/notes/calculus/images/chapter-15/%E5%8E%9F%E7%A8%BF-%E7%AC%AC04%E9%A1%B5.webp)

<span id="page-04" class="source-page-anchor" aria-hidden="true"></span>

方程

$$
P(x,y)\,dx+Q(x,y)\,dy=0
$$

若满足

$$
\frac{\partial P}{\partial y}
=
\frac{\partial Q}{\partial x},
$$

则存在势函数 $u(x,y)$，使

$$
du=P\,dx+Q\,dy.
$$

因此通解为

$$
u(x,y)=C.
$$

求 $u$ 时可先对 $P$ 关于 $x$ 积分，再用 $u_y=Q$ 补出只含 $y$ 的部分；也可反向处理。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

## 15.3 高阶线性微分方程

### 15.3.1 二阶常系数齐次线性方程

同页续记：高阶线性方程包括常系数齐次、常系数非齐次、可降阶以及 Euler 方程等类型。

对

$$
y''+py'+qy=0,
$$

特征方程为

$$
r^2+pr+q=0.
$$

设根为 $r_1,r_2$，则：

| 特征根 | 通解 |
|---|---|
| 两个不等实根 | $y=C_1e^{r_1x}+C_2e^{r_2x}$ |
| 二重实根 $r$ | $y=(C_1+C_2x)e^{rx}$ |
| 共轭复根 $\alpha\pm i\beta$ | $y=e^{\alpha x}(C_1\cos\beta x+C_2\sin\beta x)$ |

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 15.3.2 二阶常系数非齐次线性方程

<!-- 原PDF第 5 页 -->

> [!source-note]- 原稿第 5 页
> [打开原稿第 5 页](/blog_test2/notes/calculus/images/chapter-15/%E5%8E%9F%E7%A8%BF-%E7%AC%AC05%E9%A1%B5.webp)

<span id="page-05" class="source-page-anchor" aria-hidden="true"></span>

对

$$
y''+py'+qy=f(x),
$$

通解结构为

$$
y=\bar y+y^*,
$$

其中 $\bar y$ 是对应齐次方程的通解，$y^*$ 是任一特解。

<span class="priority-star">★★★</span> 待定系数法的核心是按右端形式设特解，并处理与特征根的重复。

若

$$
f(x)=e^{\alpha x}P_n(x),
$$

可设

$$
y^*=x^k e^{\alpha x}Q_n(x),
$$

其中 $Q_n$ 是同次数的一般多项式；$k$ 等于 $\alpha$ 作为特征根的重数。

若

$$
f(x)=e^{\alpha x}igl[P_m(x)\cos\beta x+P_n(x)\sin\beta x\bigr],
$$

则设

$$
y^*=x^k e^{\alpha x}
\bigl[Q_l(x)\cos\beta x+R_l(x)\sin\beta x\bigr],
$$

其中 $l=\max(m,n)$，$k$ 由 $\alpha+i\beta$ 是否为特征根及其重数决定。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 15.3.3 微分算子法

<!-- 原PDF第 6 页 -->

> [!source-note]- 原稿第 6 页
> [打开原稿第 6 页](/blog_test2/notes/calculus/images/chapter-15/%E5%8E%9F%E7%A8%BF-%E7%AC%AC06%E9%A1%B5.webp)

<span id="page-06" class="source-page-anchor" aria-hidden="true"></span>

记

$$
D=\frac{d}{dx},
$$

则常系数线性方程可写成

$$
F(D)y=f(x).
$$

形式上，特解为

$$
y^*=\frac1{F(D)}f(x).
$$

常用规则：

1. 若 $F(\alpha)\ne0$，则
   $$
   \frac1{F(D)}e^{\alpha x}=\frac{e^{\alpha x}}{F(\alpha)}.
   $$
2. 若 $F(\alpha)=0$，需按零点重数提取相应的 $x^k$；
3. 对 $\cos\beta x$、$\sin\beta x$，可利用 $D^2=-\beta^2$ 化简仅含 $D^2$ 的算子；
4. 位移规则：
   $$
   \frac1{F(D)}\bigl(e^{\alpha x}V(x)\bigr)
   =e^{\alpha x}\frac1{F(D+\alpha)}V(x).
   $$

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

<!-- 原PDF第 7 页 -->

> [!source-note]- 原稿第 7 页
> [打开原稿第 7 页](/blog_test2/notes/calculus/images/chapter-15/%E5%8E%9F%E7%A8%BF-%E7%AC%AC07%E9%A1%B5.webp)

<span id="page-07" class="source-page-anchor" aria-hidden="true"></span>

当 $1/F(D)$ 可作有限多项式运算或幂级数展开时，可先展开再作用于 $f(x)$。若 $f(x)$ 为多项式，展开到高阶导数消失即可停止。

> [!warning] 算子法边界
> 算子法是求特解的快捷记号，关键仍是正确处理 $F(\alpha)=0$、复根重复以及位移后的算子。最终应把所得特解代回原方程检查。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 15.3.4 反求微分方程

<!-- 原PDF第 8 页 -->

> [!source-note]- 原稿第 8 页
> [打开原稿第 8 页](/blog_test2/notes/calculus/images/chapter-15/%E5%8E%9F%E7%A8%BF-%E7%AC%AC08%E9%A1%B5.webp)

<span id="page-08" class="source-page-anchor" aria-hidden="true"></span>

若已知齐次解的组成，可以反推特征根：

- $e^{\alpha x}$ 对应实根 $r=\alpha$；
- $x^k e^{\alpha x}$ 表明 $\alpha$ 至少为 $k+1$ 重根；
- $e^{\alpha x}\cos\beta x$ 与 $e^{\alpha x}\sin\beta x$ 对应共轭根 $\alpha\pm i\beta$；
- 若再乘 $x^k$，则共轭根的重数至少为 $k+1$。

据此构造特征多项式，再写出常系数齐次线性微分方程。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

<!-- 原PDF第 9 页 -->

> [!source-note]- 原稿第 9 页
> [打开原稿第 9 页](/blog_test2/notes/calculus/images/chapter-15/%E5%8E%9F%E7%A8%BF-%E7%AC%AC09%E9%A1%B5.webp)

<span id="page-09" class="source-page-anchor" aria-hidden="true"></span>

本页通过“已知一个特解与方程最高阶系数”反求参数及通解，使用路线为：

1. 从右端指数因子判断候选共振根；
2. 从特解中 $x$ 的次数判断该根在特征方程中的重复次数；
3. 将特解代回原方程确定未知系数；
4. 再求齐次通解并与特解相加；
5. 若表达式中出现与齐次解重合的项，应并入任意常数，而不是重复保留。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 15.3.5 高阶常系数齐次方程

同页续记：对 $n$ 阶常系数齐次方程，先写特征多项式 $F(r)=0$。每个实根或共轭复根按其重数贡献相应数量的线性无关解，所有解的总数应等于方程阶数。

---

## 15.4 Euler 方程

<!-- 原PDF第 10 页 -->

> [!source-note]- 原稿第 10 页
> [打开原稿第 10 页](/blog_test2/notes/calculus/images/chapter-15/%E5%8E%9F%E7%A8%BF-%E7%AC%AC10%E9%A1%B5.webp)

<span id="page-10" class="source-page-anchor" aria-hidden="true"></span>

二阶 Euler 方程写成

$$
x^2y''+pxy'+qy=f(x).
$$

当 $x>0$ 时令

$$
x=e^t,
\qquad t=\ln x.
$$

则

$$
\frac{dy}{dx}=\frac1x\frac{dy}{dt},
\qquad
\frac{d^2y}{dx^2}
=\frac1{x^2}\left(\frac{d^2y}{dt^2}-\frac{dy}{dt}\right).
$$

代入后得到常系数方程

$$
\frac{d^2y}{dt^2}+(p-1)\frac{dy}{dt}+qy=f(e^t).
$$

求得 $y(t)$ 后再代回 $t=\ln x$。当 $x<0$ 时可在相应区间令 $t=\ln(-x)$。

## 复习速查

1. 一阶方程先识别类型，再决定分离变量、代换或线性公式。
2. 可降阶方程先看是否缺少 $y$ 或缺少 $x$。
3. 常系数齐次方程只看特征根；非齐次方程先求齐次通解，再求一个特解。
4. 待定系数法最容易错在共振时漏乘 $x^k$。
5. Euler 方程用 $t=\ln|x|$ 化为常系数方程。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>
