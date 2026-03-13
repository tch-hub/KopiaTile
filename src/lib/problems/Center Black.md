---
id: '5'
difficulty: 15
title:
  ja: 真ん中だけ黒にしよう
  en: Center Black
description:
  ja: 中央のアドレス（x=0, y=0）だけを BLACK に、それ以外を WHITE にしてください。
  en: Make only the center pixel (x=0, y=0) BLACK, and the rest WHITE.
---

```lua:initial
if x == 1 and y == 0 then
    return PINK
end
```

```lua:target
if x == 0 and y == 0 then
    return BLACK
end
```
