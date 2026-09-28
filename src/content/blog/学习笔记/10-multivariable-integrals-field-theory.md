---
title: "高等数学第 18 章：多元积分与场论"
description: "由 17 页手写笔记整理而成，涵盖三重积分、曲线积分、曲面积分及 Green、Gauss、Stokes 公式。"
pubDate: "2026-09-27"
updatedDate: "2026-09-27"
author: "离子怪"
sourceUrl: "https://github.com/ice11123/blog_test2/blob/main/src/content/blog/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/10-multivariable-integrals-field-theory.md"
dir1: "学习笔记"
dir2: "高等数学笔记"
tags: ["高等数学", "三重积分", "曲线积分", "曲面积分", "场论"]
---

<span id="高数第-18-章多元积分与场论" class="article-top-anchor" aria-hidden="true"></span>

<a href="/blog_test2/blog/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/00-calculus-index/">← 返回高数笔记总索引</a>

> [!blue-ink] 使用说明
> 本文由原扫描件第 75—91 页整理，共 17 页。正文与公式可搜索；积分区域、方向和投影关系保留必要局部裁图；每页均可打开对应原稿。

> 来源：打开第 18 章扫描 PDF

> [!note] 原稿星级
> <span class="priority-star">★</span>、<span class="priority-star">★★</span>、<span class="priority-star">★★★</span> 仅按扫描原稿中明确可辨的位置保留。

## 总导航

- <a href="#181-%E4%B8%89%E9%87%8D%E7%A7%AF%E5%88%86">三重积分</a>
- <a href="#182-%E7%AC%AC%E4%B8%80%E5%9E%8B%E6%9B%B2%E7%BA%BF%E7%A7%AF%E5%88%86">第一型曲线积分</a>
- <a href="#183-%E7%AC%AC%E4%B8%80%E5%9E%8B%E6%9B%B2%E9%9D%A2%E7%A7%AF%E5%88%86">第一型曲面积分</a>
- <a href="#184-%E7%AC%AC%E4%BA%8C%E5%9E%8B%E6%9B%B2%E7%BA%BF%E7%A7%AF%E5%88%86">第二型曲线积分与 Green 公式</a>
- <a href="#185-%E7%AC%AC%E4%BA%8C%E5%9E%8B%E6%9B%B2%E9%9D%A2%E7%A7%AF%E5%88%86">第二型曲面积分与 Gauss 公式</a>
- <a href="#186-%E7%A9%BA%E9%97%B4%E7%AC%AC%E4%BA%8C%E5%9E%8B%E6%9B%B2%E7%BA%BF%E7%A7%AF%E5%88%86%E4%B8%8E-stokes-%E5%85%AC%E5%BC%8F">空间曲线积分与 Stokes 公式</a>
- <a href="#%E4%B8%89%E5%A4%A7%E5%85%AC%E5%BC%8F%E6%80%BB%E8%A1%A8">Green、Gauss、Stokes 对照</a>
- 原稿：<a href="#page-01">1</a> · <a href="#page-02">2</a> · <a href="#page-03">3</a> · <a href="#page-04">4</a> · <a href="#page-05">5</a> · <a href="#page-06">6</a> · <a href="#page-07">7</a> · <a href="#page-08">8</a> · <a href="#page-09">9</a> · <a href="#page-10">10</a> · <a href="#page-11">11</a> · <a href="#page-12">12</a> · <a href="#page-13">13</a> · <a href="#page-14">14</a> · <a href="#page-15">15</a> · <a href="#page-16">16</a> · <a href="#page-17">17</a>

---
<!-- 原PDF第 1 页 -->

> [!source-note]- 原稿第 1 页
> [打开原稿第 1 页](/blog_test2/notes/calculus/images/chapter-18/%E5%8E%9F%E7%A8%BF-%E7%AC%AC01%E9%A1%B5.webp)

<span id="page-01" class="source-page-anchor" aria-hidden="true"></span>

本章积分对象与方向性的对应关系：

| 积分对象 | 典型形式 | 是否有方向 |
|---|---|---|
| 三重积分 | $\iiint_\Omega f\,dV$ | 无方向 |
| 第一型曲线积分 | $\int_L f\,ds$ | 无方向 |
| 第二型曲线积分 | $\int_LP\,dx+Q\,dy$ | 有方向 |
| 第一型曲面积分 | $\iint_\Sigma f\,dS$ | 无方向 |
| 第二型曲面积分 | $\iint_\Sigma P\,dy\,dz+Q\,dz\,dx+R\,dx\,dy$ | 有方向 |
| 空间第二型曲线积分 | $\int_\Gamma P\,dx+Q\,dy+R\,dz$ | 有方向 |

方向积分与区域积分之间由三大公式连接：

$$
\text{Green：闭曲线}\longrightarrow\text{平面区域},
$$

$$
\text{Gauss：闭曲面}\longrightarrow\text{空间区域},
$$

$$
\text{Stokes：闭曲线}\longrightarrow\text{所张曲面}.
$$

## 18.1 三重积分

### 18.1.1 概念与性质

<!-- 原PDF第 2 页 -->

> [!source-note]- 原稿第 2 页
> [打开原稿第 2 页](/blog_test2/notes/calculus/images/chapter-18/%E5%8E%9F%E7%A8%BF-%E7%AC%AC02%E9%A1%B5.webp)

<span id="page-02" class="source-page-anchor" aria-hidden="true"></span>

设空间区域 $\Omega$ 被分成小体积 $\Delta V_i$，在每个小区域内任取点 $(\xi_i,\eta_i,\zeta_i)$。若极限

$$
\lim_{\lambda\to0}
\sum_{i=1}^n
f(\xi_i,\eta_i,\zeta_i)\Delta V_i
$$

存在且与分割及取点无关，则定义

$$
\iiint_\Omega f(x,y,z)\,dV.
$$

连续函数在有界闭区域上三重可积。其线性、区域可加、保序、绝对值不等式、估值和积分中值定理与二重积分完全类似：

$$
\iiint_\Omega1\,dV=V_\Omega,
$$

$$
\left|\iiint_\Omega f\,dV\right|
\le\iiint_\Omega|f|\,dV,
$$

若 $m\le f\le M$，则

$$
mV_\Omega\le\iiint_\Omega f\,dV\le MV_\Omega.
$$

若 $f$ 连续，则存在 $(\xi,\eta,\zeta)\in\Omega$ 使

$$
\iiint_\Omega f\,dV=f(\xi,\eta,\zeta)V_\Omega.
$$

### 三重积分的对称性

<!-- 原PDF第 3 页 -->

> [!source-note]- 原稿第 3 页
> [打开原稿第 3 页](/blog_test2/notes/calculus/images/chapter-18/%E5%8E%9F%E7%A8%BF-%E7%AC%AC03%E9%A1%B5.webp)

<span id="page-03" class="source-page-anchor" aria-hidden="true"></span>

若 $\Omega$ 关于 $xOy$ 面对称，则比较

$$
f(x,y,z)\quad\text{与}\quad f(x,y,-z).
$$

偶对称时取一半区域乘 $2$，奇对称时积分为 $0$。关于其他坐标面、坐标轴或原点的结论同理。

若区域与被积函数对变量交换保持不变，例如

$$
f(x,y,z)=f(y,x,z),
$$

则可交换 $x,y$。球域内还常用

$$
\iiint_\Omega f(x)\,dV
=\iiint_\Omega f(y)\,dV
=\iiint_\Omega f(z)\,dV.
$$

例如在球域上，

$$
\iiint_\Omega x^2\,dV
=\frac13\iiint_\Omega(x^2+y^2+z^2)\,dV.
$$

### 18.1.2 直角坐标下的计算

若 $\Omega$ 在 $xOy$ 平面的投影为 $D_{xy}$，且

$$
z_1(x,y)\le z\le z_2(x,y),
$$

则

> [!key-formula] 先一后二
> $$
> \iiint_\Omega f(x,y,z)\,dV
> =
> \iint_{D_{xy}}
> \left[\int_{z_1(x,y)}^{z_2(x,y)}
> f(x,y,z)\,dz\right]dx\,dy.
> $$

若区域更适合沿 $z$ 分层，令截面区域为 $D_z$，则

> [!key-formula] 先二后一
> $$
> \iiint_\Omega f(x,y,z)\,dV
> =
> \int_a^b
> \left[\iint_{D_z}f(x,y,z)\,dx\,dy\right]dz.
> $$

<img src="/blog_test2/notes/calculus/images/chapter-18/%E7%AC%AC18%E7%AB%A0-%E4%B8%89%E9%87%8D%E7%A7%AF%E5%88%86%E6%8A%95%E5%BD%B1%E6%B3%95.webp" alt="第18章-三重积分投影法" width="760" loading="lazy" decoding="async">

> [!blue-ink] 选法原则
> 有清晰上下曲面时优先“先一后二”；截面面积容易写或侧面复杂时可用“先二后一”。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 18.1.3 柱面坐标与球面坐标

<!-- 原PDF第 4 页 -->

> [!source-note]- 原稿第 4 页
> [打开原稿第 4 页](/blog_test2/notes/calculus/images/chapter-18/%E5%8E%9F%E7%A8%BF-%E7%AC%AC04%E9%A1%B5.webp)

<span id="page-04" class="source-page-anchor" aria-hidden="true"></span>

#### 柱面坐标

$$
x=r\cos\theta,\qquad
y=r\sin\theta,\qquad
z=z,
$$

$$
dV=r\,dr\,d\theta\,dz.
$$

柱面坐标适用于绕 $z$ 轴旋转对称的区域或含 $x^2+y^2$ 的被积函数。

#### 球面坐标

采用原稿约定：

$$
x=r\sin\varphi\cos\theta,\qquad
y=r\sin\varphi\sin\theta,\qquad
z=r\cos\varphi,
$$

$$
dV=r^2\sin\varphi\,dr\,d\varphi\,d\theta.
$$

常用范围为

$$
0\le\theta\le2\pi,\qquad
0\le\varphi\le\pi,\qquad
r\ge0,
$$

再根据区域缩小各变量范围。

<img src="/blog_test2/notes/calculus/images/chapter-18/%E7%AC%AC18%E7%AB%A0-%E6%9F%B1%E9%9D%A2%E4%B8%8E%E7%90%83%E9%9D%A2%E5%9D%90%E6%A0%87.webp" alt="第18章-柱面与球面坐标" width="760" loading="lazy" decoding="async">

> [!red-ink] 两个 Jacobian
> 柱面坐标不能漏 $r$；球面坐标不能漏 $r^2\sin\varphi$。

### 18.1.4 三重积分的一般换元

<!-- 原PDF第 5 页 -->

> [!source-note]- 原稿第 5 页
> [打开原稿第 5 页](/blog_test2/notes/calculus/images/chapter-18/%E5%8E%9F%E7%A8%BF-%E7%AC%AC05%E9%A1%B5.webp)

<span id="page-05" class="source-page-anchor" aria-hidden="true"></span>

设

$$
x=x(u,v,w),\quad
y=y(u,v,w),\quad
z=z(u,v,w),
$$

则

$$
\iiint_{\Omega_{xyz}}f(x,y,z)\,dx\,dy\,dz
=
\iiint_{\Omega_{uvw}}
f(x(u,v,w),y(u,v,w),z(u,v,w))
\left|\frac{\partial(x,y,z)}{\partial(u,v,w)}\right|
du\,dv\,dw.
$$

Jacobian 为

$$
\frac{\partial(x,y,z)}{\partial(u,v,w)}
=
\begin{vmatrix}
x_u&x_v&x_w\\
y_u&y_v&y_w\\
z_u&z_v&z_w
\end{vmatrix}.
$$

### 18.1.5 三重积分的应用

#### 体积

$$
V_\Omega=\iiint_\Omega1\,dV.
$$

#### 质量与重心

若密度为 $\rho(x,y,z)$，则

$$
M=\iiint_\Omega\rho\,dV,
$$

$$
\bar x=\frac{\iiint_\Omega x\rho\,dV}{M},\qquad
\bar y=\frac{\iiint_\Omega y\rho\,dV}{M},\qquad
\bar z=\frac{\iiint_\Omega z\rho\,dV}{M}.
$$

若密度为常数，重心即形心。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 转动惯量与引力

<!-- 原PDF第 1 页 -->

> [!source-note]- 原稿第 1 页
> [打开原稿第 1 页](/blog_test2/notes/calculus/images/chapter-18/%E5%8E%9F%E7%A8%BF-%E7%AC%AC01%E9%A1%B5.webp)

<span id="page-01" class="source-page-anchor" aria-hidden="true"></span>

若密度为 $\rho(x,y,z)$，则对三个坐标轴的转动惯量分别为

$$
I_x=\iiint_\Omega(y^2+z^2)\rho\,dV,
$$

$$
I_y=\iiint_\Omega(x^2+z^2)\rho\,dV,
$$

$$
I_z=\iiint_\Omega(x^2+y^2)\rho\,dV.
$$

对原点的转动惯量

$$
I_O=\iiint_\Omega(x^2+y^2+z^2)\rho\,dV
=\frac12(I_x+I_y+I_z).
$$

若空间物体对点 $M_0(x_0,y_0,z_0)$ 产生万有引力，则各分量可按

$$
F_x=Gm\iiint_\Omega
\rho(x,y,z)
\frac{x-x_0}
{\left[(x-x_0)^2+(y-y_0)^2+(z-z_0)^2\right]^{3/2}}
\,dV
$$

及其对 $y,z$ 的对应式计算。符号取决于向量方向的约定。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>
---

## 18.2 第一型曲线积分

### 18.2.1 概念、性质与对称性

<!-- 原PDF第 2 页 -->

> [!source-note]- 原稿第 2 页
> [打开原稿第 2 页](/blog_test2/notes/calculus/images/chapter-18/%E5%8E%9F%E7%A8%BF-%E7%AC%AC02%E9%A1%B5.webp)

<span id="page-02" class="source-page-anchor" aria-hidden="true"></span>

设曲线弧 $L$ 上分布着线密度 $f(x,y)$，弧长微元为

$$
ds=\sqrt{dx^2+dy^2}.
$$

第一型曲线积分记为

$$
\int_L f(x,y)\,ds.
$$

它表示“沿曲线按弧长累加”。因为 $ds\ge 0$，积分值与曲线的行进方向无关。

<img src="/blog_test2/notes/calculus/images/chapter-18/%E7%AC%AC18%E7%AB%A0-%E7%AC%AC%E4%B8%80%E5%9E%8B%E6%9B%B2%E7%BA%BF%E7%A7%AF%E5%88%86%E6%A6%82%E5%BF%B5.webp" alt="第18章-第一型曲线积分概念" width="760" loading="lazy" decoding="async">

常用性质：

1. $\displaystyle \int_L1\,ds$ 等于曲线 $L$ 的弧长；
2. 线性：$\displaystyle \int_L(af+bg)\,ds=a\int_Lf\,ds+b\int_Lg\,ds$；
3. 对曲线可加：若 $L=L_1+L_2$，则 $\displaystyle \int_Lf\,ds=\int_{L_1}f\,ds+\int_{L_2}f\,ds$；
4. 若 $m\le f\le M$，则 $\displaystyle m\,l(L)\le\int_Lf\,ds\le M\,l(L)$；
5. 若 $f\le g$，则 $\displaystyle \int_Lf\,ds\le\int_Lg\,ds$；
6. 若 $f$ 连续，则存在 $\xi\in L$，使 $\displaystyle \int_Lf\,ds=f(\xi)l(L)$。

#### 对称性

若曲线关于某坐标轴或坐标面对称，应同时观察：曲线是否成对、被积函数关于相应变量是奇函数还是偶函数。奇函数在对称部分上的积分相消，偶函数可取一半区域再乘 $2$。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 18.2.2 计算公式与应用

<!-- 原PDF第 3 页 -->

> [!source-note]- 原稿第 3 页
> [打开原稿第 3 页](/blog_test2/notes/calculus/images/chapter-18/%E5%8E%9F%E7%A8%BF-%E7%AC%AC03%E9%A1%B5.webp)

<span id="page-03" class="source-page-anchor" aria-hidden="true"></span>

#### 平面曲线

若 $L:y=y(x)$，$a\le x\le b$，则

$$
\int_L f(x,y)\,ds
=\int_a^b f\bigl(x,y(x)\bigr)\sqrt{1+[y'(x)]^2}\,dx.
$$

若 $L$ 的参数方程为 $x=x(t),y=y(t)$，$\alpha\le t\le\beta$，则

$$
\int_Lf(x,y)\,ds
=\int_\alpha^\beta f\bigl(x(t),y(t)\bigr)
\sqrt{[x'(t)]^2+[y'(t)]^2}\,dt.
$$

若用极坐标 $r=r(\theta)$，则

$$
ds=\sqrt{r^2+\left(\frac{dr}{d\theta}\right)^2}\,d\theta.
$$

#### 空间曲线

若 $L:x=x(t),y=y(t),z=z(t)$，则

$$
\int_Lf(x,y,z)\,ds
=\int_\alpha^\beta f\bigl(x(t),y(t),z(t)\bigr)
\sqrt{x'^2(t)+y'^2(t)+z'^2(t)}\,dt.
$$

#### 典型应用

若线密度为 $\rho$，则

$$
l(L)=\int_L1\,ds,
\qquad
M=\int_L\rho\,ds,
$$

$$
\bar x=\frac{\int_Lx\rho\,ds}{M},
\qquad
\bar y=\frac{\int_Ly\rho\,ds}{M},
\qquad
\bar z=\frac{\int_Lz\rho\,ds}{M}.
$$

转动惯量只需把到转轴距离的平方乘入被积函数。例如对 $x$ 轴：

$$
I_x=\int_L(y^2+z^2)\rho\,ds.
$$

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

## 18.3 第一型曲面积分

### 18.3.1 概念、性质与对称性

<!-- 原PDF第 4 页 -->

> [!source-note]- 原稿第 4 页
> [打开原稿第 4 页](/blog_test2/notes/calculus/images/chapter-18/%E5%8E%9F%E7%A8%BF-%E7%AC%AC04%E9%A1%B5.webp)

<span id="page-04" class="source-page-anchor" aria-hidden="true"></span>

第一型曲面积分按面积微元累加：

$$
\iint_\Sigma f(x,y,z)\,dS.
$$

它与曲面所选侧无关。若曲面为 $z=z(x,y)$，则

$$
dS=\sqrt{1+z_x^2+z_y^2}\,dx\,dy.
$$

<img src="/blog_test2/notes/calculus/images/chapter-18/%E7%AC%AC18%E7%AB%A0-%E7%AC%AC%E4%B8%80%E5%9E%8B%E6%9B%B2%E9%9D%A2%E7%A7%AF%E5%88%86%E6%A6%82%E5%BF%B5.webp" alt="第18章-第一型曲面积分概念" width="760" loading="lazy" decoding="async">

其线性、可加性、保号性、比较性质和中值定理与二重积分类似。对称性判断也只看曲面与被积函数，不涉及曲面方向。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 18.3.2 计算公式与应用

<!-- 原PDF第 5 页 -->

> [!source-note]- 原稿第 5 页
> [打开原稿第 5 页](/blog_test2/notes/calculus/images/chapter-18/%E5%8E%9F%E7%A8%BF-%E7%AC%AC05%E9%A1%B5.webp)

<span id="page-05" class="source-page-anchor" aria-hidden="true"></span>

<span class="priority-star">★</span> 计算第一型曲面积分的关键是选择投影面。若曲面对某坐标面的投影不是一一对应，或在投影方向出现竖直切面，应先分片。

若 $\Sigma:z=z(x,y)$，投影区域为 $D_{xy}$，则

$$
\iint_\Sigma f\,dS
=\iint_{D_{xy}}f\bigl(x,y,z(x,y)\bigr)
\sqrt{1+z_x^2+z_y^2}\,dx\,dy.
$$

类似地，若 $x=x(y,z)$ 或 $y=y(x,z)$，分别投影到 $yOz$ 或 $xOz$ 平面。

常用曲面面积元：

| 曲面 | 选取的投影 | 面积元 |
|---|---|---|
| 圆柱面 $x^2+y^2=a^2$ | $xOz$ | $\displaystyle dS=\frac{a}{\sqrt{a^2-x^2}}\,dx\,dz$（单片） |
| 球面 $x^2+y^2+z^2=a^2$ | $xOy$ | $\displaystyle dS=\frac{a}{\sqrt{a^2-x^2-y^2}}\,dx\,dy$（单个半球） |
| 圆锥面 $z=\sqrt{x^2+y^2}$ | $xOy$ | $\displaystyle dS=\sqrt2\,dx\,dy$ |

若面密度为 $\rho$，则曲面面积、质量与重心分别为

$$
S=\iint_\Sigma1\,dS,
\qquad
M=\iint_\Sigma\rho\,dS,
$$

$$
\bar x=\frac{\iint_\Sigma x\rho\,dS}{M},
\qquad
\bar y=\frac{\iint_\Sigma y\rho\,dS}{M},
\qquad
\bar z=\frac{\iint_\Sigma z\rho\,dS}{M}.
$$

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

## 18.4 第二型曲线积分

### 18.4.1 概念、性质与方向性

<!-- 原PDF第 1 页 -->

> [!source-note]- 原稿第 1 页
> [打开原稿第 1 页](/blog_test2/notes/calculus/images/chapter-18/%E5%8E%9F%E7%A8%BF-%E7%AC%AC01%E9%A1%B5.webp)

<span id="page-01" class="source-page-anchor" aria-hidden="true"></span>

平面向量场 $\boldsymbol F=(P,Q)$ 沿有向曲线 $L$ 的第二型曲线积分为

$$
\int_LP\,dx+Q\,dy.
$$

它可表示变力沿曲线所做的功，也可表示向量场沿闭曲线的环流。与第一型曲线积分不同，它依赖曲线方向；反向后积分变号：

$$
\int_{-L}P\,dx+Q\,dy=-\int_LP\,dx+Q\,dy.
$$

<img src="/blog_test2/notes/calculus/images/chapter-18/%E7%AC%AC18%E7%AB%A0-%E7%AC%AC%E4%BA%8C%E5%9E%8B%E6%9B%B2%E7%BA%BF%E7%A7%AF%E5%88%86%E6%96%B9%E5%90%91%E6%80%A7.webp" alt="第18章-第二型曲线积分方向性" width="760" loading="lazy" decoding="async">

它具有线性和路径可加性。使用对称性时，必须同时检查路径映射后的方向，以及 $P\,dx$、$Q\,dy$ 各项的奇偶变化。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 18.4.2 直接计算与 Green 公式

<!-- 原PDF第 2 页 -->

> [!source-note]- 原稿第 2 页
> [打开原稿第 2 页](/blog_test2/notes/calculus/images/chapter-18/%E5%8E%9F%E7%A8%BF-%E7%AC%AC02%E9%A1%B5.webp)

<span id="page-02" class="source-page-anchor" aria-hidden="true"></span>

<span class="priority-star">★★★</span> 第二型曲线积分的直接计算与 Green 公式是本章重点。

若有向曲线写成 $y=y(x)$，且方向对应 $x:a\to b$，则

$$
\int_LP\,dx+Q\,dy
=\int_a^b\left[P\bigl(x,y(x)\bigr)
+Q\bigl(x,y(x)\bigr)y'(x)\right]dx.
$$

若 $x=x(t),y=y(t)$，方向对应 $t:\alpha\to\beta$，则

$$
\int_LP\,dx+Q\,dy
=\int_\alpha^\beta
\left[P(x(t),y(t))x'(t)+Q(x(t),y(t))y'(t)\right]dt.
$$

#### Green 公式

设 $D$ 为平面单连通区域，正向边界 $\partial D$ 使区域始终位于行进方向左侧，则

$$
\oint_{\partial D}P\,dx+Q\,dy
=\iint_D\left(\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}\right)dA.
$$

<img src="/blog_test2/notes/calculus/images/chapter-18/%E7%AC%AC18%E7%AB%A0-Green%E5%85%AC%E5%BC%8F%E4%B8%8E%E6%8C%96%E6%B4%9E.webp" alt="第18章-Green公式与挖洞" width="760" loading="lazy" decoding="async">

> [!warning] 使用条件
> Green 公式要求偏导在所围区域内连续。区域有孔时，外边界取逆时针、内边界取顺时针；区域内有奇点时，先挖去奇点附近的小区域，再处理新增的内边界。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 18.4.3 与路径无关、全微分与原函数

<!-- 原PDF第 3 页 -->

> [!source-note]- 原稿第 3 页
> [打开原稿第 3 页](/blog_test2/notes/calculus/images/chapter-18/%E5%8E%9F%E7%A8%BF-%E7%AC%AC03%E9%A1%B5.webp)

<span id="page-03" class="source-page-anchor" aria-hidden="true"></span>

在单连通区域 $D$ 内，若 $P,Q$ 具有连续一阶偏导，则下列命题等价：

1. $\displaystyle \int_LP\,dx+Q\,dy$ 与路径无关；
2. 对 $D$ 内任意闭曲线 $C$，$\displaystyle \oint_CP\,dx+Q\,dy=0$；
3. $\displaystyle \frac{\partial P}{\partial y}=\frac{\partial Q}{\partial x}$；
4. 存在势函数 $u(x,y)$，使 $du=P\,dx+Q\,dy$。

求势函数时可选一条便于计算的折线路径：

$$
u(x,y)
=\int_{x_0}^{x}P(t,y_0)\,dt
+\int_{y_0}^{y}Q(x,s)\,ds+C.
$$

于是

$$
\int_A^B P\,dx+Q\,dy=u(B)-u(A).
$$

> [!warning] 易错点
> 条件 $P_y=Q_x$ 只有在题设区域满足相应连通性且偏导连续时，才能直接推出路径无关；遇到挖点区域必须单独检查闭路积分。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

## 18.5 第二型曲面积分

### 18.5.1 概念、性质与方向性

<!-- 原PDF第 4 页 -->

> [!source-note]- 原稿第 4 页
> [打开原稿第 4 页](/blog_test2/notes/calculus/images/chapter-18/%E5%8E%9F%E7%A8%BF-%E7%AC%AC04%E9%A1%B5.webp)

<span id="page-04" class="source-page-anchor" aria-hidden="true"></span>

<span class="priority-star">★★★</span> 第二型曲面积分依赖曲面的侧，是通量问题的基本形式。

若向量场 $\boldsymbol F=(P,Q,R)$，有向曲面 $\Sigma$ 的单位法向量为 $\boldsymbol n$，则

$$
\iint_\Sigma \boldsymbol F\cdot\boldsymbol n\,dS
=\iint_\Sigma P\,dy\,dz+Q\,dz\,dx+R\,dx\,dy.
$$

<img src="/blog_test2/notes/calculus/images/chapter-18/%E7%AC%AC18%E7%AB%A0-%E7%AC%AC%E4%BA%8C%E5%9E%8B%E6%9B%B2%E9%9D%A2%E7%A7%AF%E5%88%86%E6%96%B9%E5%90%91%E6%80%A7.webp" alt="第18章-第二型曲面积分方向性" width="760" loading="lazy" decoding="async">

封闭曲面通常规定外侧为正侧；非封闭曲面须按题意选上侧、下侧或指定方向。改变曲面侧，积分变号。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 18.5.2 投影计算

<!-- 原PDF第 5 页 -->

> [!source-note]- 原稿第 5 页
> [打开原稿第 5 页](/blog_test2/notes/calculus/images/chapter-18/%E5%8E%9F%E7%A8%BF-%E7%AC%AC05%E9%A1%B5.webp)

<span id="page-05" class="source-page-anchor" aria-hidden="true"></span>

若曲面为 $z=z(x,y)$，取上侧，则向量面积元为

$$
d\boldsymbol S=(-z_x,-z_y,1)\,dx\,dy,
$$

因此

$$
\iint_\Sigma P\,dy\,dz+Q\,dz\,dx+R\,dx\,dy
=\iint_{D_{xy}}(-Pz_x-Qz_y+R)\,dx\,dy.
$$

取下侧时整体变号。对 $x=x(y,z)$、$y=y(z,x)$ 可同理投影到 $yOz$、$zOx$ 平面。

> [!tip] 选投影面的原则
> 优先选择使曲面单值、投影区域简单、法向分量符号明确的坐标面。若某片曲面对某坐标面的投影退化成线段，则对应的投影分量积分为零。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 18.5.3 Gauss 公式

<!-- 原PDF第 1 页 -->

> [!source-note]- 原稿第 1 页
> [打开原稿第 1 页](/blog_test2/notes/calculus/images/chapter-18/%E5%8E%9F%E7%A8%BF-%E7%AC%AC01%E9%A1%B5.webp)

<span id="page-01" class="source-page-anchor" aria-hidden="true"></span>

<span class="priority-star">★★★</span> 对分片光滑闭曲面的外侧，Gauss 公式为

$$
\oiint_\Sigma P\,dy\,dz+Q\,dz\,dx+R\,dx\,dy
=\iiint_\Omega
\left(
\frac{\partial P}{\partial x}
+\frac{\partial Q}{\partial y}
+\frac{\partial R}{\partial z}
\right)dV.
$$

使用前应确认：

1. 曲面是否闭合；若不闭合，先补面再减去补面的通量；
2. 法向是否为外侧；若取内侧，结果应变号；
3. $P,Q,R$ 及其偏导在区域内是否连续；存在奇点时需挖洞，并处理小球面的通量；
4. 若散度为零，可在不跨越奇点的前提下用更简单的同边界曲面替换。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

## 18.6 空间第二型曲线积分与 Stokes 公式

<!-- 原PDF第 2 页 -->

> [!source-note]- 原稿第 2 页
> [打开原稿第 2 页](/blog_test2/notes/calculus/images/chapter-18/%E5%8E%9F%E7%A8%BF-%E7%AC%AC02%E9%A1%B5.webp)

<span id="page-02" class="source-page-anchor" aria-hidden="true"></span>

空间有向曲线 $L:x=x(t),y=y(t),z=z(t)$ 上的积分为

$$
\int_LP\,dx+Q\,dy+R\,dz
=\int_\alpha^\beta
\left(Px'+Qy'+Rz'\right)dt.
$$

<span class="priority-star">★★★</span> Stokes 公式把空间闭曲线积分化为以它为边界的曲面积分：

$$
\oint_\Gamma P\,dx+Q\,dy+R\,dz
=\iint_\Sigma (\nabla\times\boldsymbol F)\cdot\boldsymbol n\,dS,
$$

其中 $\boldsymbol F=(P,Q,R)$，且

$$
\nabla\times\boldsymbol F
=
\begin{vmatrix}
\boldsymbol i&\boldsymbol j&\boldsymbol k\\
\dfrac{\partial}{\partial x}&\dfrac{\partial}{\partial y}&\dfrac{\partial}{\partial z}\\
P&Q&R
\end{vmatrix}.
$$

<img src="/blog_test2/notes/calculus/images/chapter-18/%E7%AC%AC18%E7%AB%A0-Stokes%E5%85%AC%E5%BC%8F%E4%B8%8E%E9%80%89%E9%9D%A2.webp" alt="第18章-Stokes公式与选面" width="760" loading="lazy" decoding="async">

曲线 $\Gamma$ 的正向与曲面法向 $\boldsymbol n$ 按右手定则匹配。计算时应在所有以 $\Gamma$ 为边界的曲面中选择最简单者；若更换曲面，不得跨越向量场的奇点。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

## 三大公式总表

| 公式 | 左端对象 | 右端对象 | 方向约定 | 核心条件 |
|---|---|---|---|---|
| Green | 平面闭曲线积分 | 二重积分 | 外边界逆时针、内边界顺时针 | 平面区域内偏导连续 |
| Gauss | 闭曲面通量 | 三重积分 | 闭曲面外侧 | 空间区域内偏导连续 |
| Stokes | 空间闭曲线积分 | 曲面旋度通量 | 边界与法向满足右手定则 | 曲面及其邻域内偏导连续 |

可用一句话记忆：

$$
\text{边界上的积分}=\text{内部相应微分量的积分}.
$$

## 复习速查

1. 遇到第一型积分：先写弧长元或面积元，不考虑方向。
2. 遇到第二型积分：先确定曲线方向或曲面侧，再选直接参数化、投影或三大公式。
3. 遇到闭曲线：优先检查 Green；遇到闭曲面：优先检查 Gauss；遇到空间闭曲线：优先检查 Stokes。
4. 使用三大公式前，必须检查闭合性、方向、光滑性和奇点。
5. 对称性不能只看函数：第二型积分还要同时追踪 $dx,dy,dz$ 或法向量的符号变化。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>
