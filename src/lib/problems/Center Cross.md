---
id: '6'
difficulty: 25
title:
  ja: 中心を通る十字を描こう
  en: Center Cross
description:
  ja: x軸(y=0)とy軸(x=0)を BLACK、その他は WHITE にして十字の形を描いてください。
  en: Draw a BLACK cross along the x-axis and y-axis. The rest should be WHITE.
---

```lua:initial
if x == 1 or y == 1 then
    return RED
end
```

```lua:target
if x == 0 or y == 0 then
    return BLACK
end
```
