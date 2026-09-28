---
title: "高等数学第 13 章：多元函数微分学"
description: "由 8 页手写笔记整理而成，涵盖多元函数极限、偏导数、全微分、复合与隐函数求导及条件极值。"
pubDate: "2026-09-27"
updatedDate: "2026-09-27"
author: "离子怪"
sourceUrl: "https://github.com/ice11123/blog_test2/blob/main/src/content/blog/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/05-multivariable-differential-calculus.md"
dir1: "学习笔记"
dir2: "高等数学笔记"
tags: ["高等数学", "多元函数", "多元微分", "偏导数", "极值"]
---

<span id="高数第-13-章多元函数微分学" class="article-top-anchor" aria-hidden="true"></span>

<a href="/blog_test2/blog/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/00-calculus-index/">← 返回高数笔记总索引</a>

> [!blue-ink] 使用说明
> 本文由 8 页手写扫描笔记转写而成。正文与常规公式已转换为可搜索的 Markdown/LaTeX；几何关系只保留必要的局部裁图。每页均设有页内锚点和原稿入口。

> 来源：打开第 13 章扫描 PDF

> [!note] 原稿星级
> <span class="priority-star">★</span>、<span class="priority-star">★★</span>、<span class="priority-star">★★★</span> 仅按扫描原稿中能够明确辨认的位置保留，红色只用于恢复原作者的重点层级。

## 总导航

- <a href="#131-%E5%A4%9A%E5%85%83%E5%BE%AE%E5%88%86%E7%9A%84%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5">13.1 基本概念</a>
  - <a href="#1311-%E9%82%BB%E5%9F%9F">邻域与去心邻域</a>
  - <a href="#1312-%E5%A4%9A%E5%85%83%E5%87%BD%E6%95%B0%E6%9E%81%E9%99%90">二重极限</a>
  - <a href="#1313-%E8%BF%9E%E7%BB%AD">连续与间断</a>
  - <a href="#1314-%E5%81%8F%E5%AF%BC%E6%95%B0">偏导数及几何意义</a>
  - <a href="#1315-%E5%8F%AF%E5%BE%AE%E4%B8%8E%E5%85%A8%E5%BE%AE%E5%88%86">可微、全微分和高阶偏导</a>
- <a href="#132-%E5%A4%9A%E5%85%83%E5%BE%AE%E5%88%86%E6%B3%95%E5%88%99">13.2 多元微分法则</a>
  - <a href="#1321-%E5%A4%8D%E5%90%88%E5%87%BD%E6%95%B0%E9%93%BE%E5%BC%8F%E6%B3%95%E5%88%99">复合函数链式法则</a>
  - <a href="#1322-%E5%85%A8%E5%BE%AE%E5%88%86%E5%BD%A2%E5%BC%8F%E4%B8%8D%E5%8F%98%E6%80%A7">全微分形式不变性</a>
  - <a href="#1323-%E9%9A%90%E5%87%BD%E6%95%B0%E6%B1%82%E5%AF%BC">隐函数求导</a>
  - <a href="#1324-%E5%A4%9A%E5%85%83%E5%BE%AE%E5%88%86%E4%B8%AD%E5%80%BC%E7%BB%93%E8%AE%BA">多元微分中值结论</a>
- <a href="#133-%E5%A4%9A%E5%85%83%E5%87%BD%E6%95%B0%E6%9E%81%E5%80%BC%E4%B8%8E%E6%9C%80%E5%80%BC">13.3 极值与最值</a>
  - <a href="#1331-%E6%9E%81%E5%80%BC%E7%9A%84%E5%BF%85%E8%A6%81%E6%9D%A1%E4%BB%B6">必要条件</a>
  - <a href="#1332-%E4%BA%8C%E5%85%83%E5%87%BD%E6%95%B0%E6%9E%81%E5%80%BC%E7%9A%84%E5%85%85%E5%88%86%E6%9D%A1%E4%BB%B6">Hessian 判别</a>
  - <a href="#1333-%E6%9D%A1%E4%BB%B6%E6%9E%81%E5%80%BC%E4%B8%8E-lagrange-%E4%B9%98%E6%95%B0%E6%B3%95">条件极值</a>
  - <a href="#1334-%E6%9C%89%E7%95%8C%E9%97%AD%E5%8C%BA%E5%9F%9F%E4%B8%8A%E7%9A%84%E6%9C%80%E5%80%BC">闭区域最值</a>
- <a href="#%E5%A4%8D%E4%B9%A0%E9%80%9F%E6%9F%A5">复习速查</a>

### 原稿逐页入口

- <a href="#page-01">第 1 页</a> · <a href="#page-02">第 2 页</a> · <a href="#page-03">第 3 页</a> · <a href="#page-04">第 4 页</a>
- <a href="#page-05">第 5 页</a> · <a href="#page-06">第 6 页</a> · <a href="#page-07">第 7 页</a> · <a href="#page-08">第 8 页</a>

---

# 13.1 多元微分的基本概念

## 13.1.1 邻域

<!-- 原PDF第 1 页 -->

> [!source-note]- 原稿第 1 页
> [打开原稿第 1 页](/blog_test2/notes/calculus/images/chapter-13/%E5%8E%9F%E7%A8%BF-%E7%AC%AC01%E9%A1%B5.webp)

<span id="page-01" class="source-page-anchor" aria-hidden="true"></span>

设 $P_0(x_0,y_0)$ 是 $xOy$ 平面内一点，$P(x,y)$ 为动点，距离

$$
\rho(P,P_0)=\sqrt{(x-x_0)^2+(y-y_0)^2}.
$$

以 $P_0$ 为中心、$\delta>0$ 为半径的邻域为

$$
U(P_0,\delta)
=\{P:\rho(P,P_0)<\delta\}.
$$

去心邻域为

$$
\mathring U(P_0,\delta)
=\{P:0<\rho(P,P_0)<\delta\}.
$$

一元与二元邻域的对应关系：

$$
U(x_0,\delta)=(x_0-\delta,x_0+\delta),
$$

$$
\mathring U(x_0,\delta)
=(x_0-\delta,x_0)\cup(x_0,x_0+\delta).
$$

<img src="/blog_test2/notes/calculus/images/chapter-13/%E7%AC%AC13%E7%AB%A0-%E9%82%BB%E5%9F%9F%E4%B8%8E%E5%8E%BB%E5%BF%83%E9%82%BB%E5%9F%9F.webp" alt="第13章-邻域与去心邻域" width="760" loading="lazy" decoding="async">

> [!blue-ink] 与一元情形的差异
> 一元函数可从左、右两个方向逼近；二元函数可沿平面内无穷多条路径逼近。二重极限必须与逼近路径无关。

## 13.1.2 多元函数极限

### 二重极限的定义

设函数 $f(x,y)$ 在 $P_0(x_0,y_0)$ 的某个去心邻域内有定义。若

$$
\forall\varepsilon>0,\ \exists\delta>0,
$$

当

$$
0<\rho(P,P_0)<\delta
$$

时恒有

$$
|f(x,y)-A|<\varepsilon,
$$

则称

$$
\lim_{(x,y)\to(x_0,y_0)}f(x,y)=A,
$$

也可写作 $\lim_{P\to P_0}f(P)=A$。

### 存在性与唯一性

- 一元函数：左右极限都存在且相等，双侧极限才存在；
- 多元函数：沿任意路径趋于 $P_0$ 所得极限都必须相同；
- 若找到两条路径使极限不同，二重极限必不存在；
- 仅验证若干条路径相同，不能证明二重极限存在。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 二重极限的性质

<!-- 原PDF第 2 页 -->

> [!source-note]- 原稿第 2 页
> [打开原稿第 2 页](/blog_test2/notes/calculus/images/chapter-13/%E5%8E%9F%E7%A8%BF-%E7%AC%AC02%E9%A1%B5.webp)

<span id="page-02" class="source-page-anchor" aria-hidden="true"></span>

设

$$
\lim_{P\to P_0}f(P)=A,
\qquad
\lim_{P\to P_0}g(P)=B.
$$

常用性质如下。

1. **唯一性**：极限若存在则唯一。
2. **局部有界性**：极限存在时，$f$ 在 $P_0$ 的某个去心邻域内有界。
3. **局部保号性**：若 $A>0$，则在充分小的去心邻域内 $f(P)>0$；反向结论需保留严格正下界，不能仅由 $f(P)>0$ 推出 $A>0$。
4. **四则运算**：

$$
\lim(f\pm g)=A\pm B,
\qquad
\lim(fg)=AB,
$$

$$
\lim\frac{f}{g}=\frac AB
\quad(B\ne0).
$$

5. **夹逼定理**：若 $g(P)\le f(P)\le h(P)$，且

$$
\lim_{P\to P_0}g(P)
=\lim_{P\to P_0}h(P)=A,
$$

则 $\lim_{P\to P_0}f(P)=A$。

### 常用二重极限放缩

令 $r=\sqrt{x^2+y^2}$，则

$$
|x|\le r,
\qquad
|y|\le r,
$$

$$
x^2\le x^2+y^2,
\qquad
y^2\le x^2+y^2,
$$

$$
|xy|\le\frac{x^2+y^2}{2},
\qquad
\left|\frac{xy}{x^2+y^2}\right|\le\frac12.
$$

一元基本不等式仍可用于复合量：

$$
|\sin u|\le|u|,
\qquad
1-\cos u\le\frac{u^2}{2},
$$

$$
|\ln(1+u)|\le C|u|,
\qquad
|e^u-1|\le C|u|
$$

（后两式在 $u$ 的充分小邻域内成立）。

也可令

$$
x=r\cos\theta,
\qquad
y=r\sin\theta,
\qquad r\to0^+,
$$

把二重极限转化为对 $r$ 的估计；若所得表达式仍依赖 $\theta$，需检查是否能对所有 $\theta$ 一致控制。

### 无穷小

$$
\lim_{P\to P_0}f(P)=A
\Longleftrightarrow
f(P)=A+\alpha(P),
\quad \alpha(P)\to0.
$$

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

## 13.1.3 连续

<!-- 原PDF第 3 页 -->

> [!source-note]- 原稿第 3 页
> [打开原稿第 3 页](/blog_test2/notes/calculus/images/chapter-13/%E5%8E%9F%E7%A8%BF-%E7%AC%AC03%E9%A1%B5.webp)

<span id="page-03" class="source-page-anchor" aria-hidden="true"></span>

函数 $f$ 在点 $P_0(x_0,y_0)$ 连续，当且仅当

$$
\lim_{(x,y)\to(x_0,y_0)}f(x,y)=f(x_0,y_0).
$$

与一元函数相同，间断可表现为可去间断、跳跃、无穷或振荡；但二元函数沿不同路径的行为可能不同，不能照搬“左右极限”的判定方式。

<img src="/blog_test2/notes/calculus/images/chapter-13/%E7%AC%AC13%E7%AB%A0-%E8%BF%9E%E7%BB%AD%E4%B8%8E%E9%97%B4%E6%96%AD%E7%A4%BA%E6%84%8F.webp" alt="第13章-连续与间断示意" width="720" loading="lazy" decoding="async">

## 13.1.4 偏导数

设 $z=f(x,y)$，在点 $(x_0,y_0)$ 处关于 $x$ 的偏导数定义为

$$
f_x(x_0,y_0)
=\lim_{\Delta x\to0}
\frac{f(x_0+\Delta x,y_0)-f(x_0,y_0)}{\Delta x}.
$$

关于 $y$ 的偏导数为

$$
f_y(x_0,y_0)
=\lim_{\Delta y\to0}
\frac{f(x_0,y_0+\Delta y)-f(x_0,y_0)}{\Delta y}.
$$

常用记号：

$$
f_x=\frac{\partial f}{\partial x}=z_x,
\qquad
f_y=\frac{\partial f}{\partial y}=z_y.
$$

几何上，$f_x(x_0,y_0)$ 是曲面 $z=f(x,y)$ 被平面 $y=y_0$ 截得的曲线在该点的切线斜率；$f_y(x_0,y_0)$ 对应平面 $x=x_0$ 的截线斜率。

<img src="/blog_test2/notes/calculus/images/chapter-13/%E7%AC%AC13%E7%AB%A0-%E5%81%8F%E5%AF%BC%E6%95%B0%E5%87%A0%E4%BD%95%E6%84%8F%E4%B9%89.webp" alt="第13章-偏导数几何意义" width="760" loading="lazy" decoding="async">

> [!warning] 偏导数只反映坐标方向
> 两个偏导数存在，只能说明沿 $x$、$y$ 两个坐标方向的变化率存在，不能单独推出函数在该点连续或可微。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

## 13.1.5 可微与全微分

<!-- 原PDF第 4 页 -->

> [!source-note]- 原稿第 4 页
> [打开原稿第 4 页](/blog_test2/notes/calculus/images/chapter-13/%E5%8E%9F%E7%A8%BF-%E7%AC%AC04%E9%A1%B5.webp)

<span id="page-04" class="source-page-anchor" aria-hidden="true"></span>

<span class="priority-star">★★★</span>

令

$$
\Delta z=f(x_0+\Delta x,y_0+\Delta y)-f(x_0,y_0),
$$

$$
\rho=\sqrt{(\Delta x)^2+(\Delta y)^2}.
$$

若存在与 $\Delta x,\Delta y$ 无关的常数 $A,B$，使

$$
\Delta z=A\Delta x+B\Delta y+o(\rho),
$$

则称 $f$ 在 $(x_0,y_0)$ 可微。此时

$$
A=f_x(x_0,y_0),
\qquad
B=f_y(x_0,y_0),
$$

全微分为

> [!key-formula] 二元函数的全微分
> $$
> dz=f_x(x_0,y_0)\,dx+f_y(x_0,y_0)\,dy.
> $$

### 可微、连续、偏导与极限的关系

$$
\text{可微}\Longrightarrow\text{连续}
\Longrightarrow\text{极限存在}
\Longrightarrow\text{局部有界},
$$

$$
\text{可微}\Longrightarrow\text{偏导数存在}.
$$

反向一般不成立。常用充分条件是：若 $f_x,f_y$ 在点的某邻域内存在并在该点连续，则 $f$ 在该点可微。

判断可微可直接检验

$$
\lim_{(\Delta x,\Delta y)\to(0,0)}
\frac{\Delta z-f_x\Delta x-f_y\Delta y}
{\sqrt{(\Delta x)^2+(\Delta y)^2}}=0.
$$

### 高阶偏导数

$$
f_{xx}=\frac{\partial^2f}{\partial x^2},
\qquad
f_{yy}=\frac{\partial^2f}{\partial y^2},
$$

$$
f_{xy}=\frac{\partial^2f}{\partial y\,\partial x},
\qquad
f_{yx}=\frac{\partial^2f}{\partial x\,\partial y}.
$$

若两个二阶混合偏导数在点的某邻域内连续，则

$$
f_{xy}=f_{yx}.
$$

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

# 13.2 多元微分法则

## 13.2.1 复合函数链式法则

<!-- 原PDF第 5 页 -->

> [!source-note]- 原稿第 5 页
> [打开原稿第 5 页](/blog_test2/notes/calculus/images/chapter-13/%E5%8E%9F%E7%A8%BF-%E7%AC%AC05%E9%A1%B5.webp)

<span id="page-05" class="source-page-anchor" aria-hidden="true"></span>

若

$$
z=f(u,v),
\qquad
u=\varphi(x,y),
\qquad
v=\psi(x,y),
$$

则

> [!key-formula] 多元复合函数链式法则
> $$
> \frac{\partial z}{\partial x}
> =\frac{\partial z}{\partial u}\frac{\partial u}{\partial x}
> +\frac{\partial z}{\partial v}\frac{\partial v}{\partial x},
> $$
> $$
> \frac{\partial z}{\partial y}
> =\frac{\partial z}{\partial u}\frac{\partial u}{\partial y}
> +\frac{\partial z}{\partial v}\frac{\partial v}{\partial y}.
> $$

若 $u=u(t),v=v(t)$，则全导数为

$$
\frac{dz}{dt}
=\frac{\partial z}{\partial u}\frac{du}{dt}
+\frac{\partial z}{\partial v}\frac{dv}{dt}.
$$

链式法则可按依赖关系图逐条相乘、同层相加；求偏导时，未沿该路径变化的变量视为常量。

## 13.2.2 全微分形式不变性

无论 $x,y$ 是自变量还是其他变量的可微函数，全微分始终写为

$$
dz=\frac{\partial z}{\partial x}\,dx
+\frac{\partial z}{\partial y}\,dy.
$$

若 $z=f(u,v)$，且 $u,v$ 又依赖 $x,y$，则

$$
dz=f_u\,du+f_v\,dv,
$$

再将 $du,dv$ 展开即可。这就是全微分形式不变性。

### 隐式微分示例结构

若

$$
F(x,y,z)=e^{x+2y+3z}+xyz-1=0,
$$

则

$$
dF=F_x\,dx+F_y\,dy+F_z\,dz=0,
$$

只要 $F_z\ne0$，便可解出

$$
dz=-\frac{F_x}{F_z}\,dx-\frac{F_y}{F_z}\,dy.
$$

## 13.2.3 隐函数求导

一元隐函数 $F(x,y)=0$ 在点附近确定 $y=y(x)$，若 $F_y\ne0$，则

$$
\frac{dy}{dx}=-\frac{F_x}{F_y}.
$$

若 $F(x,y,z)=0$ 在点附近确定 $z=z(x,y)$，且 $F_z\ne0$，则

$$
\frac{\partial z}{\partial x}=-\frac{F_x}{F_z},
\qquad
\frac{\partial z}{\partial y}=-\frac{F_y}{F_z}.
$$

> [!warning] 条件不能省略
> 分母对应的偏导数非零，是局部解出相应隐函数及使用上述公式的关键条件。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

## 13.2.4 多元微分中值结论

<!-- 原PDF第 6 页 -->

> [!source-note]- 原稿第 6 页
> [打开原稿第 6 页](/blog_test2/notes/calculus/images/chapter-13/%E5%8E%9F%E7%A8%BF-%E7%AC%AC06%E9%A1%B5.webp)

<span id="page-06" class="source-page-anchor" aria-hidden="true"></span>

若 $D$ 是区域，$f$ 在 $D$ 内可微，且

$$
f_x(x,y)=f_y(x,y)=0
\quad((x,y)\in D),
$$

则 $f$ 在 $D$ 内为常数。

> [!warning] 逆命题与缺项条件
> 只知道某一个偏导数恒为零，只能说明函数与对应变量无关，不能推出函数是常数；例如 $f_x=0$ 时，$f$ 仍可能是 $y$ 的函数。

---

# 13.3 多元函数极值与最值

<span class="priority-star">★★★</span>

点 $(x_0,y_0)$ 是局部极大值点，是指存在其某个邻域，使邻域内所有点均满足

$$
f(x,y)\le f(x_0,y_0).
$$

局部极小值的定义把不等号反向。极值是局部概念，最值则是在指定区域上的整体比较。

<img src="/blog_test2/notes/calculus/images/chapter-13/%E7%AC%AC13%E7%AB%A0-%E4%BA%8C%E5%85%83%E5%87%BD%E6%95%B0%E6%9E%81%E5%80%BC%E7%A4%BA%E6%84%8F.webp" alt="第13章-二元函数极值示意" width="420" loading="lazy" decoding="async">

## 13.3.1 极值的必要条件

若 $f$ 在内点 $(x_0,y_0)$ 可偏导并取得极值，则

$$
f_x(x_0,y_0)=0,
\qquad
f_y(x_0,y_0)=0.
$$

满足上述方程的点称为驻点。还需检查偏导数不存在的点，以及区域边界上的点。

> [!warning] 必要条件不是充分条件
> $f_x=f_y=0$ 只给出极值候选点，驻点可能是极值点，也可能是鞍点。

## 13.3.2 二元函数极值的充分条件

设驻点 $(x_0,y_0)$ 附近二阶偏导连续，记

$$
A=f_{xx}(x_0,y_0),
\qquad
B=f_{xy}(x_0,y_0),
\qquad
C=f_{yy}(x_0,y_0),
$$

$$
\Delta=AC-B^2.
$$

则：

| 条件 | 结论 |
|---|---|
| $\Delta>0, A>0$ | 严格局部极小值 |
| $\Delta>0, A<0$ | 严格局部极大值 |
| $\Delta<0$ | 鞍点，不是极值点 |
| $\Delta=0$ | 判别失效，需另行分析 |

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

## 13.3.3 条件极值与 Lagrange 乘数法

<!-- 原PDF第 7 页 -->

> [!source-note]- 原稿第 7 页
> [打开原稿第 7 页](/blog_test2/notes/calculus/images/chapter-13/%E5%8E%9F%E7%A8%BF-%E7%AC%AC07%E9%A1%B5.webp)

<span id="page-07" class="source-page-anchor" aria-hidden="true"></span>

在约束

$$
\varphi(x,y,z)=0,
\qquad
\psi(x,y,z)=0
$$

下求 $f(x,y,z)$ 的条件极值，构造 Lagrange 函数

$$
L(x,y,z,\lambda,\mu)
=f(x,y,z)+\lambda\varphi(x,y,z)+\mu\psi(x,y,z).
$$

令所有一阶偏导数为零：

$$
\begin{cases}
L_x=0,\\
L_y=0,\\
L_z=0,\\
L_\lambda=\varphi=0,\\
L_\mu=\psi=0.
\end{cases}
$$

解出全部候选点，再将其代回目标函数比较。若只有一个约束，只需一个乘子。

### 典型应用：几何最远、最近问题

- 光滑曲线外一点到曲线的最短连线，在最近点处垂直于曲线切线；
- 两条不相交光滑曲线之间的最短连线，在两个端点处分别垂直于各自切线；
- 距离问题可优先极值化“距离的平方”，以避免根式。

<img src="/blog_test2/notes/calculus/images/chapter-13/%E7%AC%AC13%E7%AB%A0-Lagrange%E5%87%A0%E4%BD%95%E6%84%8F%E4%B9%89.webp" alt="第13章-Lagrange几何意义" width="760" loading="lazy" decoding="async">

### 原稿例题的建模骨架

若约束可化为 $a^2+b^2=1$，目标量为 $S=b-a$，则构造

$$
L(a,b,\lambda)=b-a+\lambda(a^2+b^2-1),
$$

解

$$
L_a=-1+2\lambda a=0,
\quad
L_b=1+2\lambda b=0,
\quad
L_\lambda=a^2+b^2-1=0,
$$

最后比较全部候选点的目标函数值。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

## 13.3.4 有界闭区域上的最值

<!-- 原PDF第 8 页 -->

> [!source-note]- 原稿第 8 页
> [打开原稿第 8 页](/blog_test2/notes/calculus/images/chapter-13/%E5%8E%9F%E7%A8%BF-%E7%AC%AC08%E9%A1%B5.webp)

<span id="page-08" class="source-page-anchor" aria-hidden="true"></span>

连续函数在有界闭区域上一定能取得最大值和最小值。求解时按以下顺序进行：

1. 在区域内部求 $f_x=f_y=0$ 的驻点，并补查偏导不存在的内点；
2. 在每一段边界上求条件极值，可参数化、降为一元问题或使用 Lagrange 乘数法；
3. 检查边界的端点、角点和分段连接点；
4. 比较所有候选点处的函数值，最大者为最大值，最小者为最小值。

> [!red-ink] 高频遗漏
> 只求内部驻点，或只使用二阶判别法而不检查边界，不能完成闭区域最值问题。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---

# 复习速查

## 概念关系

$$
\boxed{\text{可微}\Longrightarrow\text{连续、偏导存在}}
$$

但“连续”“偏导存在”以及“极限存在”均不能单独反推可微。偏导数在邻域内存在并在考察点连续，是常用的可微充分条件。

## 求导路线

| 结构 | 优先方法 |
|---|---|
| 显函数 $z=f(x,y)$ | 分别固定其他变量求偏导 |
| 复合函数 | 依赖关系图：沿路径相乘、同层相加 |
| 隐函数 $F(x,y)=0$ | $y'=-F_x/F_y$ |
| 隐函数 $F(x,y,z)=0$ | $z_x=-F_x/F_z, z_y=-F_y/F_z$ |
| 全微分 | $dz=f_xdx+f_ydy$ |

## 极值题流程

1. 无约束极值：求驻点与不可导点，再用 Hessian 或定义判断；
2. 条件极值：写出约束，构造 Lagrange 函数，解全部方程；
3. 闭区域最值：内部、每段边界、端点和角点全部比较；
4. 几何距离题优先对距离平方求极值。

## 公式索引

- <a href="#1312-%E5%A4%9A%E5%85%83%E5%87%BD%E6%95%B0%E6%9E%81%E9%99%90">二重极限</a>
- <a href="#1314-%E5%81%8F%E5%AF%BC%E6%95%B0">偏导数</a>
- <a href="#1315-%E5%8F%AF%E5%BE%AE%E4%B8%8E%E5%85%A8%E5%BE%AE%E5%88%86">可微与全微分</a>
- <a href="#1321-%E5%A4%8D%E5%90%88%E5%87%BD%E6%95%B0%E9%93%BE%E5%BC%8F%E6%B3%95%E5%88%99">链式法则</a>
- <a href="#1323-%E9%9A%90%E5%87%BD%E6%95%B0%E6%B1%82%E5%AF%BC">隐函数求导</a>
- <a href="#1332-%E4%BA%8C%E5%85%83%E5%87%BD%E6%95%B0%E6%9E%81%E5%80%BC%E7%9A%84%E5%85%85%E5%88%86%E6%9D%A1%E4%BB%B6">Hessian 判别</a>
- <a href="#1333-%E6%9D%A1%E4%BB%B6%E6%9E%81%E5%80%BC%E4%B8%8E-lagrange-%E4%B9%98%E6%95%B0%E6%B3%95">Lagrange 乘数法</a>
