---
id: '10'
difficulty: 70
title:
  ja: 赤い円を描こう
  en: Red Circle
description:
  ja: 中心からの距離の2乗(x*x + y*y)が 4以下のマスを RED、その他は TRANSPARENT (透明) にしましょう。
  en: Make pixels with a distance squared (x*x + y*y) of 4 or less RED, and the rest TRANSPARENT.
---

```lua:initial
if x*x + y*y <= 1 then
    return YELLOW
end
```

```lua:target
if x*x + y*y <= 4 then
    return RED
end
```
