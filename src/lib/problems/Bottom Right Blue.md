---
id: '4'
difficulty: 20
title:
  ja: 右下だけ青にしよう
  en: Bottom Right Blue
description:
  ja: xが正で、かつyが負のエリア（右下）だけを BLUE (青) に、それ以外を WHITE にしてください。
  en: Make only the area where x > 0 and y < 0 (bottom right) BLUE, and the rest WHITE.
---

```lua:initial
if x < -2 and y > 2 then
    return PURPLE
else
    return BLACK
end
```

```lua:target
if x > 0 and y < 0 then
    return BLUE
else
    return WHITE
end
```
