---
id: '7'
difficulty: 35
title:
  ja: 四角い枠を描こう
  en: Square Frame
description:
  ja: 一番外側（座標が -4 または 4）のマスを BLACK、それ以外を WHITE にして枠を描いてください。
  en: Draw a frame by making the outermost pixels (x or y is -4 or 4) BLACK, and the rest WHITE.
---

```lua:initial
if x == -2 or x == 2 or y == -2 or y == 2 then
    return GREEN
end
```

```lua:target
if x == -4 or x == 4 or y == -4 or y == 4 then
    return BLACK
end
```
