---
id: '8'
difficulty: 50
title:
  ja: 市松模様を作ろう
  en: Checkerboard Pattern
description:
  ja: 白と黒が交互になる市松模様を作ってください。ヒント: (x + y) % 2
  en: Create an alternating BLACK and WHITE checkerboard pattern. Hint: (x + y) % 2
---

```lua:initial
if x % 2 == 0 then
    return PURPLE
end
```

```lua:target
if (x + y) % 2 == 0 then
    return BLACK
end
```
