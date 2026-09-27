---
title: "高等数学第 14 章：二重积分"
description: "由 5 页手写笔记整理而成，涵盖二重积分的概念、性质、对称性、累次积分、极坐标与一般换元。"
pubDate: "2026-09-27"
updatedDate: "2026-09-27"
author: "离子怪"
sourceUrl: "https://github.com/ice11123/blog_test2/blob/main/src/content/blog/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/06-double-integrals.md"
dir1: "学习笔记"
dir2: "高等数学笔记"
tags: ["高等数学", "二重积分", "极坐标", "换元法", "学习笔记"]
---

<span id="高数第-14-章二重积分" class="article-top-anchor" aria-hidden="true"></span>

<a href="/blog_test2/blog/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/00-calculus-index/">← 返回高数笔记总索引</a>

> **蓝笔补充｜使用说明**
> 本文由原扫描件第 37—41 页整理，共 5 页。正文与公式可搜索；区域和换元关系保留必要局部裁图；每页均可打开对应原稿。

> 来源：打开第 14 章扫描 PDF

> [!note] 原稿星级
> <span class="priority-star">★</span>、<span class="priority-star">★★</span>、<span class="priority-star">★★★</span> 仅按扫描原稿中明确可辨的位置保留。

## 总导航

- <a href="#141-%E4%BA%8C%E9%87%8D%E7%A7%AF%E5%88%86%E7%9A%84%E6%A6%82%E5%BF%B5%E4%B8%8E%E6%80%A7%E8%B4%A8">概念、性质与对称性</a>
- <a href="#142-%E4%BA%8C%E9%87%8D%E7%A7%AF%E5%88%86%E7%9A%84%E8%AE%A1%E7%AE%97">直角坐标、极坐标与换元</a>
- 原稿：<a href="#page-01">第1页</a> · <a href="#page-02">第2页</a> · <a href="#page-03">第3页</a> · <a href="#page-04">第4页</a> · <a href="#page-05">第5页</a>

---
## 14.1 二重积分的概念与性质

### 14.1.1 定义与几何意义

<!-- 原PDF第 1 页 -->

> [!source-note]- 原稿第 1 页
> [打开原稿第 1 页](/blog_test2/notes/calculus/images/chapter-14/%E5%8E%9F%E7%A8%BF-%E7%AC%AC01%E9%A1%B5.webp)

<span id="page-01" class="source-page-anchor" aria-hidden="true"></span>

设有界闭区域 $D$ 被分割成 $n$ 个小区域 $\Delta\sigma_i$，在每个小区域内任取一点 $(\xi_i,\eta_i)$。若当各小区域直径的最大值 $\lambda\to0$ 时，极限

$$
\lim_{\lambda\to0}
\sum_{i=1}^{n}f(\xi_i,\eta_i)\Delta\sigma_i
$$

存在且与分割方式及取点方式无关，则称 $f$ 在 $D$ 上可积，并定义

> **核心公式｜二重积分**
> $$
> \iint_D f(x,y)\,d\sigma
> =\lim_{\lambda\to0}
> \sum_{i=1}^{n}f(\xi_i,\eta_i)\Delta\sigma_i.
> $$

其中 $d\sigma$ 是面积元素，在直角坐标下 $d\sigma=dx\,dy$。

<img src="/blog_test2/notes/calculus/images/chapter-14/%E7%AC%AC14%E7%AB%A0-%E4%BA%8C%E9%87%8D%E7%A7%AF%E5%88%86%E5%87%A0%E4%BD%95%E5%AE%9A%E4%B9%89.webp" alt="第14章-二重积分几何定义" width="760" loading="lazy" decoding="async">

当 $f(x,y)\ge0$ 时，二重积分表示曲顶柱体的体积：

$$
V=\iint_D f(x,y)\,d\sigma.
$$

特别地，

$$
\iint_D 1\,d\sigma=S_D,
$$

其中 $S_D$ 是区域 $D$ 的面积。

### 可积的常用充分条件

- $f$ 在有界闭区域 $D$ 上连续，则 $f$ 在 $D$ 上可积；
- 对有界函数，分片连续且间断点集合足够小，也可保证可积；
- 可积函数在 $D$ 上必有界。

## 14.1.2 二重积分的性质

<!-- 原PDF第 2 页 -->

> [!source-note]- 原稿第 2 页
> [打开原稿第 2 页](/blog_test2/notes/calculus/images/chapter-14/%E5%8E%9F%E7%A8%BF-%E7%AC%AC02%E9%A1%B5.webp)

<span id="page-02" class="source-page-anchor" aria-hidden="true"></span>

1. **面积**

$$
\iint_D1\,d\sigma=S_D.
$$

2. **线性**

$$
\iint_D(k_1f\pm k_2g)\,d\sigma
=k_1\iint_Df\,d\sigma
\pm k_2\iint_Dg\,d\sigma.
$$

3. **区域可加性**<br>
若 $D=D_1\cup D_2$，且 $D_1,D_2$ 内部互不重叠，则

$$
\iint_D f\,d\sigma
=\iint_{D_1}f\,d\sigma+\iint_{D_2}f\,d\sigma.
$$

4. **可积必有界**<br>
若 $f$ 在有界闭区域 $D$ 上可积，则存在 $M>0$ 使

$$
|f(x,y)|\le M.
$$

5. <span class="priority-star">★</span> **保序性**<br>
若在 $D$ 上 $f\le g$，则

$$
\iint_Df\,d\sigma\le\iint_Dg\,d\sigma.
$$

6. **绝对值不等式**

$$
\left|\iint_Df\,d\sigma\right|
\le\iint_D|f|\,d\sigma.
$$

7. **估值**

若 $m\le f(x,y)\le M$，则

$$
mS_D\le\iint_Df\,d\sigma\le MS_D.
$$

8. **积分中值定理**

若 $f$ 在有界闭区域 $D$ 上连续，则存在 $(\xi,\eta)\in D$，使

$$
\iint_Df(x,y)\,d\sigma=f(\xi,\eta)S_D.
$$

### 14.1.3 对称性

使用对称性前，应同时检查积分区域和被积函数。

#### 关于坐标轴对称

若 $D$ 关于 $x$ 轴对称，则

$$
\iint_D f(x,y)\,d\sigma
=
\begin{cases}
2\iint_{D\cap\{y\ge0\}}f(x,y)\,d\sigma,
&f(x,-y)=f(x,y),\\
0,&f(x,-y)=-f(x,y).
\end{cases}
$$

关于 $y$ 轴的情形同理。

#### 关于原点对称

若 $D$ 关于原点对称，且

$$
f(-x,-y)=f(x,y),
$$

则可取一半区域后乘 $2$；若 $f(-x,-y)=-f(x,y)$，则积分为 $0$。

#### 关于直线 $y=x$ 对称

若 $D$ 关于 $y=x$ 对称，则

$$
\iint_Df(x,y)\,d\sigma
=\iint_Df(y,x)\,d\sigma.
$$

因此可把原积分与交换 $x,y$ 后的积分相加，以化简被积函数。

#### 关于直线 $x=a$ 或 $y=a$ 对称

若 $D$ 关于 $x=a$ 对称，则比较 $f(x,y)$ 与 $f(2a-x,y)$；关于 $y=a$ 对称时比较 $f(x,y)$ 与 $f(x,2a-y)$。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>
## 14.2 二重积分的计算

### 14.2.1 直角坐标下的累次积分

<!-- 原PDF第 3 页 -->

> [!source-note]- 原稿第 3 页
> [打开原稿第 3 页](/blog_test2/notes/calculus/images/chapter-14/%E5%8E%9F%E7%A8%BF-%E7%AC%AC03%E9%A1%B5.webp)

<span id="page-03" class="source-page-anchor" aria-hidden="true"></span>

若 $D$ 是 $X$ 型区域

$$
D=\{(x,y):a\le x\le b,\ \varphi_1(x)\le y\le\varphi_2(x)\},
$$

则

> **核心公式｜先对 $y$ 积分**
> $$
> \iint_D f(x,y)\,d\sigma
> =\int_a^b
> \left[\int_{\varphi_1(x)}^{\varphi_2(x)}
> f(x,y)\,dy\right]dx.
> $$

若 $D$ 是 $Y$ 型区域

$$
D=\{(x,y):c\le y\le d,\ \psi_1(y)\le x\le\psi_2(y)\},
$$

则

> **核心公式｜先对 $x$ 积分**
> $$
> \iint_D f(x,y)\,d\sigma
> =\int_c^d
> \left[\int_{\psi_1(y)}^{\psi_2(y)}
> f(x,y)\,dx\right]dy.
> $$

<img src="/blog_test2/notes/calculus/images/chapter-14/%E7%AC%AC14%E7%AB%A0-%E7%9B%B4%E8%A7%92%E5%9D%90%E6%A0%87%E7%B4%AF%E6%AC%A1%E7%A7%AF%E5%88%86.webp" alt="第14章-直角坐标累次积分" width="760" loading="lazy" decoding="async">

> **蓝笔补充｜写积分限的原则**
> 先积变量的上下限可依赖后积变量；后积变量的范围必须是常数。下限必须不大于上限，必要时先分区。

### 交换积分次序

1. 根据原积分限画出区域 $D$；
2. 将区域改写成另一种类型；
3. 必要时按边界交点分割；
4. 按新的区域描述写出累次积分。

### 对称化技巧

当区域关于 $y=x$ 对称时，

$$
I=\iint_Df(x,y)\,d\sigma
$$

可与

$$
I=\iint_Df(y,x)\,d\sigma
$$

相加，得到

$$
2I=\iint_D[f(x,y)+f(y,x)]\,d\sigma.
$$

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 14.2.2 极坐标下的计算

<!-- 原PDF第 4 页 -->

> [!source-note]- 原稿第 4 页
> [打开原稿第 4 页](/blog_test2/notes/calculus/images/chapter-14/%E5%8E%9F%E7%A8%BF-%E7%AC%AC04%E9%A1%B5.webp)

<span id="page-04" class="source-page-anchor" aria-hidden="true"></span>

极坐标变换为

$$
x=r\cos\theta,\qquad y=r\sin\theta,
$$

面积元素必须写成

> **核心公式｜极坐标面积元素**
> $$
> dx\,dy=r\,dr\,d\theta.
> $$

因此

$$
\iint_Df(x,y)\,dx\,dy
=\int_\alpha^\beta
\int_{r_1(\theta)}^{r_2(\theta)}
f(r\cos\theta,r\sin\theta)\,r\,dr\,d\theta.
$$

<img src="/blog_test2/notes/calculus/images/chapter-14/%E7%AC%AC14%E7%AB%A0-%E6%9E%81%E5%9D%90%E6%A0%87%E5%8C%BA%E5%9F%9F%E4%B8%8E%E7%A7%AF%E5%88%86%E9%99%90.webp" alt="第14章-极坐标区域与积分限" width="760" loading="lazy" decoding="async">

积分限的两种常见情形：

- 原点在区域外：$\theta\in[\alpha,\beta]$，$r\in[r_1(\theta),r_2(\theta)]$；
- 原点在区域内且每条射线与边界只交一次：$r\in[0,r(\theta)]$。

> **重点订正｜高频错误**
> 极坐标换元后不能漏掉 Jacobian 因子 $r$。

### 适合使用极坐标的信号

- 区域由圆、圆环、扇形或过原点射线围成；
- 被积函数含 $x^2+y^2$；
- 区域或被积函数具有旋转对称性。

### 14.2.3 直角坐标与极坐标配合

若积分区域的几何边界用极坐标容易表达，而某一内层积分在直角坐标下更简单，可先利用对称性、交换次序或局部换元，再决定最终坐标系。坐标选择应由“区域和被积函数一起”决定。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

### 14.2.4 二重积分的一般换元

<!-- 原PDF第 5 页 -->

> [!source-note]- 原稿第 5 页
> [打开原稿第 5 页](/blog_test2/notes/calculus/images/chapter-14/%E5%8E%9F%E7%A8%BF-%E7%AC%AC05%E9%A1%B5.webp)

<span id="page-05" class="source-page-anchor" aria-hidden="true"></span>

设

$$
x=x(u,v),\qquad y=y(u,v),
$$

并且变换在相应区域内一一对应，Jacobian 不为零，则

> **核心公式｜二重积分换元公式**
> $$
> \iint_{D_{xy}}f(x,y)\,dx\,dy
> =
> \iint_{D_{uv}}
> f(x(u,v),y(u,v))
> \left|\frac{\partial(x,y)}{\partial(u,v)}\right|
> du\,dv.
> $$

其中

$$
\frac{\partial(x,y)}{\partial(u,v)}
=
\begin{vmatrix}
\dfrac{\partial x}{\partial u}&\dfrac{\partial x}{\partial v}\\
\dfrac{\partial y}{\partial u}&\dfrac{\partial y}{\partial v}
\end{vmatrix}.
$$

<img src="/blog_test2/notes/calculus/images/chapter-14/%E7%AC%AC14%E7%AB%A0-%E4%BA%8C%E9%87%8D%E7%A7%AF%E5%88%86%E5%8F%98%E9%87%8F%E6%9B%BF%E6%8D%A2.webp" alt="第14章-二重积分变量替换" width="760" loading="lazy" decoding="async">

换元时必须同时完成三件事：

1. 将被积函数改写为 $u,v$；
2. 将积分区域 $D_{xy}$ 改写为 $D_{uv}$；
3. 将 $dx\,dy$ 替换为 Jacobian 绝对值乘 $du\,dv$。

> [!warning] Jacobian 取绝对值
> 面积元素没有方向，换元因子应使用 Jacobian 的绝对值。

<a href="#%E6%80%BB%E5%AF%BC%E8%88%AA">返回总导航</a>

---
