---
title: "高等数学第 17 章：空间解析几何与向量分析"
description: "由 9 页手写笔记整理而成，涵盖向量代数、空间直线与平面、曲线曲面、方向导数、梯度、散度与旋度。"
pubDate: "2026-09-27"
updatedDate: "2026-09-27"
author: "离子怪"
sourceUrl: "https://github.com/ice11123/blog_test2/blob/main/src/content/blog/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/09-analytic-geometry-vector-analysis.md"
dir1: "学习笔记"
dir2: "高等数学笔记"
tags: ["高等数学", "空间解析几何", "向量分析", "梯度", "旋度"]
---

<span id="高数第-17-章空间解析几何与向量分析" class="article-top-anchor" aria-hidden="true"></span>

<a href="/blog_test2/blog/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/00-calculus-index/">← 返回高数笔记总索引</a>

> **蓝笔补充｜使用说明**
> 本文对应原扫描件第 66—74 页，共 9 页。正文与公式均可搜索；空间二次曲面以及切线、法平面的几何关系保留为局部裁图。

> 来源：打开第 17 章扫描 PDF

> [!note] 原稿星级
> <span class="priority-star">★</span>、<span class="priority-star">★★</span>、<span class="priority-star">★★★</span> 仅按原稿中能够明确辨认的位置保留，不对整理者判断的重要性追加星级。

## 总导航

- <a href="#171-%E5%90%91%E9%87%8F%E4%BB%A3%E6%95%B0">向量代数</a>
- <a href="#172-%E5%B9%B3%E9%9D%A2%E4%B8%8E%E7%9B%B4%E7%BA%BF">平面与直线</a>
- <a href="#173-%E7%A9%BA%E9%97%B4%E6%9B%B2%E7%BA%BF%E4%B8%8E%E6%9B%B2%E9%9D%A2">空间曲线与曲面</a>
- <a href="#174-%E6%9B%B2%E7%BA%BF%E6%9B%B2%E9%9D%A2%E7%9A%84%E5%88%87%E7%BA%BF%E4%B8%8E%E6%B3%95%E5%B9%B3%E9%9D%A2">切线、法平面与法线</a>
- <a href="#175-%E6%96%B9%E5%90%91%E5%AF%BC%E6%95%B0%E4%B8%8E%E6%A2%AF%E5%BA%A6">方向导数与梯度</a>
- <a href="#176-%E6%95%A3%E5%BA%A6%E4%B8%8E%E6%97%8B%E5%BA%A6">散度与旋度</a>
- 原稿：<a href="#page-01">1</a> · <a href="#page-02">2</a> · <a href="#page-03">3</a> · <a href="#page-04">4</a> · <a href="#page-05">5</a> · <a href="#page-06">6</a> · <a href="#page-07">7</a> · <a href="#page-08">8</a> · <a href="#page-09">9</a>

---

## 17.1 向量代数

<!-- 原PDF第 1 页 -->

> [!source-note]- 原稿第 1 页
> [打开原稿第 1 页](/blog_test2/notes/calculus/images/chapter-17/%E5%8E%9F%E7%A8%BF-%E7%AC%AC01%E9%A1%B5.webp)

<span id="page-01" class="source-page-anchor" aria-hidden="true"></span>

本章内容由四部分构成：向量代数，空间平面、直线及其位置关系，空间曲线与曲面，以及方向导数、梯度、散度和旋度等微分算子。

### 17.1.1 向量的坐标表示

设

$$
\boldsymbol a=(a_1,a_2,a_3),\qquad
\boldsymbol b=(b_1,b_2,b_3).
$$

向量的模及单位向量为

$$
|\boldsymbol a|=\sqrt{a_1^2+a_2^2+a_3^2},\qquad
\boldsymbol e_a=\frac{\boldsymbol a}{|\boldsymbol a|}\quad(\boldsymbol a\ne\boldsymbol0).
$$

<!-- 原PDF第 2 页 -->

> [!source-note]- 原稿第 2 页
> [打开原稿第 2 页](/blog_test2/notes/calculus/images/chapter-17/%E5%8E%9F%E7%A8%BF-%E7%AC%AC02%E9%A1%B5.webp)

<span id="page-02" class="source-page-anchor" aria-hidden="true"></span>

### 17.1.2 数量积、向量积与混合积

**数量积**

$$
\boldsymbol a\cdot\boldsymbol b
=|\boldsymbol a||\boldsymbol b|\cos\theta
=a_1b_1+a_2b_2+a_3b_3.
$$

- 正交判据：$\boldsymbol a\perp\boldsymbol b\iff \boldsymbol a\cdot\boldsymbol b=0$；
- $\boldsymbol a$ 在 $\boldsymbol b$ 上的投影：
  $$
  \operatorname{Prj}_{\boldsymbol b}\boldsymbol a
  =\frac{\boldsymbol a\cdot\boldsymbol b}{|\boldsymbol b|}.
  $$

**向量积**

$$
\boldsymbol a\times\boldsymbol b
=
\begin{vmatrix}
\boldsymbol i&\boldsymbol j&\boldsymbol k\\
a_1&a_2&a_3\\
b_1&b_2&b_3
\end{vmatrix},
\qquad
|\boldsymbol a\times\boldsymbol b|=|\boldsymbol a||\boldsymbol b|\sin\theta.
$$

- 平行判据：$\boldsymbol a\parallel\boldsymbol b\iff\boldsymbol a\times\boldsymbol b=\boldsymbol0$；
- $|\boldsymbol a\times\boldsymbol b|$ 等于以两向量为邻边的平行四边形面积，方向按右手法则确定。

**混合积**

$$
[\boldsymbol a,\boldsymbol b,\boldsymbol c]
=(\boldsymbol a\times\boldsymbol b)\cdot\boldsymbol c
=
\begin{vmatrix}
a_1&a_2&a_3\\
b_1&b_2&b_3\\
c_1&c_2&c_3
\end{vmatrix}.
$$

三向量共面当且仅当 $[\boldsymbol a,\boldsymbol b,\boldsymbol c]=0$。

## 17.2 平面与直线

<!-- 原PDF第 3 页 -->

> [!source-note]- 原稿第 3 页
> [打开原稿第 3 页](/blog_test2/notes/calculus/images/chapter-17/%E5%8E%9F%E7%A8%BF-%E7%AC%AC03%E9%A1%B5.webp)

<span id="page-03" class="source-page-anchor" aria-hidden="true"></span>

### 17.2.1 方向角与方向余弦

非零向量 $\boldsymbol a=(a_1,a_2,a_3)$ 与 $x,y,z$ 轴正向的夹角分别为 $\alpha,\beta,\gamma$，则

$$
\cos\alpha=\frac{a_1}{|\boldsymbol a|},\qquad
\cos\beta=\frac{a_2}{|\boldsymbol a|},\qquad
\cos\gamma=\frac{a_3}{|\boldsymbol a|},
$$

且

$$
\cos^2\alpha+\cos^2\beta+\cos^2\gamma=1.
$$

### 17.2.2 平面方程

若平面经过 $P_0(x_0,y_0,z_0)$，法向量为 $\boldsymbol n=(A,B,C)$，则点法式为

$$
A(x-x_0)+B(y-y_0)+C(z-z_0)=0.
$$

常用形式：

- 一般式：$Ax+By+Cz+D=0$；
- 截距式：$\dfrac{x}{a}+\dfrac{y}{b}+\dfrac{z}{c}=1$；
- 三点式：三个不共线点代入行列式方程；
- 平面束：经过两平面 $\Pi_1=0,\Pi_2=0$ 交线的平面可写成 $\Pi_1+\lambda\Pi_2=0$。

<!-- 原PDF第 4 页 -->

> [!source-note]- 原稿第 4 页
> [打开原稿第 4 页](/blog_test2/notes/calculus/images/chapter-17/%E5%8E%9F%E7%A8%BF-%E7%AC%AC04%E9%A1%B5.webp)

<span id="page-04" class="source-page-anchor" aria-hidden="true"></span>

### 17.2.3 空间直线方程

若直线经过 $P_0(x_0,y_0,z_0)$，方向向量为 $\boldsymbol s=(l,m,n)$，则

$$
\frac{x-x_0}{l}=\frac{y-y_0}{m}=\frac{z-z_0}{n}
$$

为对称式，参数式为

$$
\begin{cases}
x=x_0+lt,\\
y=y_0+mt,\\
z=z_0+nt.
\end{cases}
$$

直线也可表示为两个平面的交线：

$$
\begin{cases}
A_1x+B_1y+C_1z+D_1=0,\\
A_2x+B_2y+C_2z+D_2=0.
\end{cases}
$$

此时可取方向向量 $\boldsymbol s=\boldsymbol n_1\times\boldsymbol n_2$。

### 17.2.4 距离公式

点 $P_0(x_0,y_0,z_0)$ 到平面 $Ax+By+Cz+D=0$ 的距离为

$$
d=\frac{|Ax_0+By_0+Cz_0+D|}{\sqrt{A^2+B^2+C^2}}.
$$

点 $P$ 到过 $P_0$、方向向量为 $\boldsymbol s$ 的直线的距离为

$$
d=\frac{|\overrightarrow{P_0P}\times\boldsymbol s|}{|\boldsymbol s|}.
$$

<!-- 原PDF第 5 页 -->

> [!source-note]- 原稿第 5 页
> [打开原稿第 5 页](/blog_test2/notes/calculus/images/chapter-17/%E5%8E%9F%E7%A8%BF-%E7%AC%AC05%E9%A1%B5.webp)

<span id="page-05" class="source-page-anchor" aria-hidden="true"></span>

### 17.2.5 位置关系与夹角

设两平面法向量为 $\boldsymbol n_1,\boldsymbol n_2$，两直线方向向量为 $\boldsymbol s_1,\boldsymbol s_2$。

| 对象 | 平行条件 | 垂直条件 | 夹角依据 |
|---|---|---|---|
| 平面与平面 | $\boldsymbol n_1\parallel\boldsymbol n_2$ | $\boldsymbol n_1\cdot\boldsymbol n_2=0$ | 法向量夹角 |
| 直线与直线 | $\boldsymbol s_1\parallel\boldsymbol s_2$ | $\boldsymbol s_1\cdot\boldsymbol s_2=0$ | 方向向量夹角 |
| 直线与平面 | $\boldsymbol s\cdot\boldsymbol n=0$ | $\boldsymbol s\parallel\boldsymbol n$ | 线面角与 $\boldsymbol s,\boldsymbol n$ 的夹角互余 |

两异面直线的公垂距离可由混合积求得：

$$
d=\frac{|[\overrightarrow{P_1P_2},\boldsymbol s_1,\boldsymbol s_2]|}
{|\boldsymbol s_1\times\boldsymbol s_2|}.
$$

## 17.3 空间曲线与曲面

### 17.3.1 空间曲线及其投影

空间曲线可写成参数形式

$$
\boldsymbol r(t)=(x(t),y(t),z(t)),
$$

也可写成两个曲面的交线

$$
\begin{cases}
F(x,y,z)=0,\\
G(x,y,z)=0.
\end{cases}
$$

消去 $z$ 得到 $H(x,y)=0$ 后，与 $z=0$ 联立即得曲线在 $xOy$ 面上的投影；其余坐标面同理。求投影时必须同时写出投影曲线方程及其所在坐标面。

<!-- 原PDF第 6 页 -->

> [!source-note]- 原稿第 6 页
> [打开原稿第 6 页](/blog_test2/notes/calculus/images/chapter-17/%E5%8E%9F%E7%A8%BF-%E7%AC%AC06%E9%A1%B5.webp)

<span id="page-06" class="source-page-anchor" aria-hidden="true"></span>

### 17.3.2 空间曲面与常见二次曲面

曲面的一般方程为 $F(x,y,z)=0$。识别二次曲面时，可先化为标准式，再观察各平方项的符号、右端常数及缺失变量。

| 曲面 | 典型标准式 | 识别特征 |
|---|---|---|
| 椭球面 | $\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}+\dfrac{z^2}{c^2}=1$ | 三个正平方项，封闭 |
| 单叶双曲面 | $\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}-\dfrac{z^2}{c^2}=1$ | 两正一负，连通 |
| 双叶双曲面 | $-\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}+\dfrac{z^2}{c^2}=1$ | 一正两负，两支 |
| 椭圆抛物面 | $z=\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}$ | 同号平方项，单向开口 |
| 双曲抛物面 | $z=\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}$ | 异号平方项，马鞍形 |
| 椭圆锥面 | $\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}-\dfrac{z^2}{c^2}=0$ | 齐次二次式，过原点 |

若方程缺少某个变量，则曲面沿该变量方向平移不变，通常是柱面。母线沿固定方向移动形成的曲面称为直纹面。

<img src="/blog_test2/notes/calculus/images/chapter-17/%E7%AC%AC17%E7%AB%A0-%E7%A9%BA%E9%97%B4%E4%BA%8C%E6%AC%A1%E6%9B%B2%E9%9D%A2%E5%9B%BE%E8%B0%B1.webp" alt="第17章-空间二次曲面图谱" width="760" loading="lazy" decoding="async">

## 17.4 曲线、曲面的切线与法平面

<!-- 原PDF第 7 页 -->

> [!source-note]- 原稿第 7 页
> [打开原稿第 7 页](/blog_test2/notes/calculus/images/chapter-17/%E5%8E%9F%E7%A8%BF-%E7%AC%AC07%E9%A1%B5.webp)

<span id="page-07" class="source-page-anchor" aria-hidden="true"></span>

### 17.4.1 参数曲线

曲线 $\boldsymbol r(t)=(x(t),y(t),z(t))$ 在 $t=t_0$ 处的切向量为

$$
\boldsymbol r'(t_0)=\bigl(x'(t_0),y'(t_0),z'(t_0)\bigr).
$$

切线方程为

$$
\frac{x-x_0}{x'(t_0)}
=\frac{y-y_0}{y'(t_0)}
=\frac{z-z_0}{z'(t_0)},
$$

法平面方程为

$$
x'(t_0)(x-x_0)+y'(t_0)(y-y_0)+z'(t_0)(z-z_0)=0.
$$

### 17.4.2 两曲面的交线

若曲线由 $F(x,y,z)=0$ 与 $G(x,y,z)=0$ 的交线给出，则其切向量可取

$$
\boldsymbol T=\nabla F(P_0)\times\nabla G(P_0).
$$

### 17.4.3 曲面的切平面与法线

对隐式曲面 $F(x,y,z)=0$，$P_0(x_0,y_0,z_0)$ 处的法向量为 $\nabla F(P_0)$。切平面为

$$
F_x(P_0)(x-x_0)+F_y(P_0)(y-y_0)+F_z(P_0)(z-z_0)=0,
$$

法线为

$$
\frac{x-x_0}{F_x(P_0)}
=\frac{y-y_0}{F_y(P_0)}
=\frac{z-z_0}{F_z(P_0)}.
$$

若曲面写成 $z=f(x,y)$，可令 $F=f(x,y)-z$，因此法向量可取 $(f_x,f_y,-1)$。

<img src="/blog_test2/notes/calculus/images/chapter-17/%E7%AC%AC17%E7%AB%A0-%E6%9B%B2%E7%BA%BF%E6%9B%B2%E9%9D%A2%E5%88%87%E7%BA%BF%E4%B8%8E%E6%B3%95%E5%B9%B3%E9%9D%A2.webp" alt="第17章-曲线曲面切线与法平面" width="760" loading="lazy" decoding="async">

## 17.5 方向导数与梯度

<!-- 原PDF第 8 页 -->

> [!source-note]- 原稿第 8 页
> [打开原稿第 8 页](/blog_test2/notes/calculus/images/chapter-17/%E5%8E%9F%E7%A8%BF-%E7%AC%AC08%E9%A1%B5.webp)

<span id="page-08" class="source-page-anchor" aria-hidden="true"></span>

### 17.5.1 标量场、向量场与方向导数

空间中每一点对应一个数量 $u(x,y,z)$ 时称为标量场；每一点对应一个向量 $\boldsymbol A(x,y,z)$ 时称为向量场。

函数 $u(x,y,z)$ 在点 $P_0$ 沿单位方向

$$
\boldsymbol l=(\cos\alpha,\cos\beta,\cos\gamma)
$$

的方向导数定义为

$$
\frac{\partial u}{\partial l}\bigg|_{P_0}
=\lim_{t\to0^+}\frac{u(P_0+t\boldsymbol l)-u(P_0)}{t}.
$$

若 $u$ 在 $P_0$ 可微，则

> **核心公式｜方向导数公式**
> $$
> \frac{\partial u}{\partial l}
> =u_x\cos\alpha+u_y\cos\beta+u_z\cos\gamma
> =\nabla u\cdot\boldsymbol l.
> $$

偏导数只是沿坐标轴方向的方向导数；方向导数还要由给定方向的单位向量确定。

<!-- 原PDF第 9 页 -->

> [!source-note]- 原稿第 9 页
> [打开原稿第 9 页](/blog_test2/notes/calculus/images/chapter-17/%E5%8E%9F%E7%A8%BF-%E7%AC%AC09%E9%A1%B5.webp)

<span id="page-09" class="source-page-anchor" aria-hidden="true"></span>

### 17.5.2 梯度

$$
\operatorname{grad}u=\nabla u=(u_x,u_y,u_z).
$$

在 $\nabla u(P_0)\ne\boldsymbol0$ 时：

- $\nabla u(P_0)$ 指向 $u$ 增长最快的方向；
- 最大方向导数为 $|\nabla u(P_0)|$；
- 等值面 $u(x,y,z)=C$ 的法向量为 $\nabla u$。

## 17.6 散度与旋度

设向量场

$$
\boldsymbol A=P\boldsymbol i+Q\boldsymbol j+R\boldsymbol k.
$$

其散度为

$$
\operatorname{div}\boldsymbol A
=\nabla\cdot\boldsymbol A
=P_x+Q_y+R_z.
$$

其旋度为

$$
\operatorname{rot}\boldsymbol A
=\nabla\times\boldsymbol A
=
\begin{vmatrix}
\boldsymbol i&\boldsymbol j&\boldsymbol k\\
\dfrac{\partial}{\partial x}&\dfrac{\partial}{\partial y}&\dfrac{\partial}{\partial z}\\
P&Q&R
\end{vmatrix}.
$$

> **重点订正｜容易混淆**
> 梯度作用于标量场，结果是向量；散度作用于向量场，结果是标量；旋度作用于向量场，结果仍是向量。

## 复习速查

| 问题 | 首先寻找 | 核心公式或判据 |
|---|---|---|
| 平面、直线位置关系 | 法向量或方向向量 | 点积判垂直，叉积判平行 |
| 空间曲线切线 | 参数导数，或两个曲面的梯度 | $\boldsymbol r'(t_0)$；$\nabla F\times\nabla G$ |
| 曲面切平面 | 曲面梯度 | $\nabla F(P_0)$ 是法向量 |
| 最快增长方向 | 梯度 | 方向为 $\nabla u$，最大值为 $|\nabla u|$ |
| 判断源汇强弱 | 散度 | $\nabla\cdot\boldsymbol A$ |
| 判断局部旋转 | 旋度 | $\nabla\times\boldsymbol A$ |

<a href="/blog_test2/blog/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/00-calculus-index/">← 返回高数笔记总索引</a>
