## Why

此工具的使用情境是預估未來大規模擴展的成本，目前實際部署為 DC 340 台、PCV 240 台，相機數量只會增加不會減少。允許 slider 調整至 0 會讓使用者誤以為可以縮減規模，與工具的預估目的不符。

## What Changes

- Section 01 的 M_DC slider 與 number input 最小值從 0 改為 340
- Section 01 的 M_PCV slider 與 number input 最小值從 0 改為 240
- MSK 容量規劃子區塊的 DC slider 最小值從 0 改為 340
- MSK 容量規劃子區塊的 PCV slider 最小值從 0 改為 240
- MongoDB 容量規劃子區塊的 DC slider 最小值從 0 改為 340
- MongoDB 容量規劃子區塊的 PCV slider 最小值從 0 改為 240
- 所有受影響 slider 的預設值維持 340（DC）和 240（PCV）不變

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `camera-cost-calculator`: M_DC / M_PCV slider 最小值限制從 0 改為 340 / 240，input 驗證範圍同步更新

## Impact

- `index.html`：Section 01、MSK 容量規劃子區塊、MongoDB 容量規劃子區塊共 6 組 slider/input 的 `min` 屬性與驗證邏輯
