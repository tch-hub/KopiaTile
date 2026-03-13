---
id: '9'
difficulty: 60
title:
  ja: ひし形を描こう
  en: Diamond
description:
  ja: 中心からの合計距離 |x| + |y| が 4以下のマスを BLACK にして、ひし形を描いてください。
  en: Draw a diamond shape where the Manhattan distance |x| + |y| is 4 or less.
---

```lua:initial
if abs(x) + abs(y) <= 2 then
    return BLUE
end
```

```lua:target
if abs(x) + abs(y) <= 4 then
    return BLACK
end
```
