---
id: '3'
difficulty: 12
title:
  ja: 下半分を赤にしよう
  en: Bottom Half Red
description:
  ja: y座標が0より小さい（下半分）を RED (赤)、それ以外を WHITE (白) にしてください。
  en: Make the bottom half (y < 0) RED and the rest WHITE.
---

```lua:initial
if x < 0 then
    return RED
else
    return WHITE
end
```

```lua:target
if y < 0 then
    return RED
else
    return WHITE
end
```
