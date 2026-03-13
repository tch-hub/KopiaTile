---
id: '7.5'
difficulty: 42
title:
  ja: 縦縞を描いてみよう
  en: Vertical Stripes
description:
  ja: xを2で割った余りが 0 の列を BLUE (青)、それ以外を WHITE にしてください。
  en: Make columns where x modulo 2 is 0 BLUE, and the rest WHITE.
---

```lua:initial
if x == 0 then
    return BLUE
end
```

```lua:target
if x % 2 == 0 then
    return BLUE
else
    return WHITE
end
```
