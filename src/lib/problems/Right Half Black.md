---
id: '2'
difficulty: 10
title:
  ja: 右半分を黒にしよう
  en: Right Half Black
description:
  ja: x座標が0より大きい（右半分）を BLACK (黒)、それ以外を WHITE (白) にしてください。
  en: Make the right half (x > 0) BLACK and the rest WHITE.
---

```lua:initial
if x > -3 then
    return PINK
else
    return GREEN
end
```

```lua:target
if x > 0 then
    return BLACK
else
    return WHITE
end
```
