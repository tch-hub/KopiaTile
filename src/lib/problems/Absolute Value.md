---
id: '6.5'
difficulty: 28
title:
  ja: 絶対値を使ってみよう
  en: Absolute Value
description:
  ja: xの絶対値 abs(x) が 2 以下のマスを YELLOW (黄色)、それ以外を WHITE にしてください。
  en: Make pixels where the absolute value of x, abs(x), is 2 or less YELLOW, and the rest WHITE.
---

```lua:initial
if x <= 2 then
    return YELLOW
end
```

```lua:target
if abs(x) <= 2 then
    return YELLOW
else
    return WHITE
end
```
