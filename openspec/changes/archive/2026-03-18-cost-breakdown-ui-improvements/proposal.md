## Why

Cost breakdown 面板缺少各項佔總費用的百分比，使用者無法直觀判斷哪項成本最顯著。此外，標題文字過小且顏色對比不足，在淺色背景下閱讀困難。

## What Changes

- 在 cost breakdown 每個 row 加上該項佔總費用的百分比（例如 `45.6%`）
- 加大標題字體、加深標題顏色，提升對比度與可讀性

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

（無——純視覺調整，功能需求不變，不需要 delta spec）

## Impact

- 僅修改 `index.html` 的 HTML 結構與 CSS
- JS 計算邏輯不變，`render()` 函式需新增百分比更新邏輯
