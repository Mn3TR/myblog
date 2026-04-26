---
title: lKB J-1
tags:
  - 初中
  - 反比例函数
  - 一次函数
  - 三角形
  - 多答案
  - 数学
time: 2026-04-19
author: ffffffox
---
*MATH-UNKNOWN0415 10(2).*
## 已知：
在平面直角坐标系 $xOy$ 中，有反比例函数 $y=\frac{12}{x}(x>0)$ 与一次函数 $y=kx+b$ ，一次函数交 $x$ 轴于 $B$ ，交 $y$ 轴于 $C$ ，且过点 $A(3,4)$ 。
![[assets/lkb-j-1/title.png]]
## 欲求：
当 $S\triangle AOB = 2S \triangle BOC$ 时，$y=kx+b$ 的解析式。

## 解：
可以列出 $S\triangle AOB = OB * yA * \frac{1}{2}$ ，$S\triangle BOC = OB * OC * \frac{1}{2}$。

观察到，$S\triangle AOB$ 与 $S\triangle BOC$ 的差别主要在 $yA$ 与 $OC$ ，那么当 $S\triangle AOB = 2S \triangle BOC$ 时，$yA = 2OC，即 4 = 2|b|，b=\pm 2$，下文便以这个式子作为讨论出发点。

*题目并未对 $y=kx+b$ 中的 $k$ 与 $b$ 做限制，而从前面我们知道 $b$ 可以 $>0$ 或 $<0$ ，所以我们便着手讨论 $k$ 的正负性。*

（1） $k<0$

> 因为 $k<0$ 时，图像从左至右下降 *(单调递减)*，C在 $y$ 轴上，点$A(3,4)$ 。
> 
> 在保证经过$A$点的条件下， $OC$ 一定 $>yA$ ，即 $OC$ 一定 $>4$ ，这与我们之前所得知的" $b=\pm 2$ "是自相矛盾的。
>
> 因而，此情况舍去。

（2） $k>0$

> 过程与 $k<0$ 大致相同，不再赘述。
>
> 易得 $k>0$ 时， $S\triangle AOB$ 可能 $=2S\triangle BOC$。
>
> 所以可以得知， $k>0，b>0$ 或 $b<0$ 时， $S\triangle AOB$ 可能 $=2S\triangle BOC$。


将 $b=\pm 2$ 代入 $y=kx+b$ ， 得 $y_1 = \frac{2}{3}x+2， y_2=2x-2$

所以 $y=kx+b$ 的解析式为 $y_1 = \frac{2}{3}x+2, y_2=2x-2$