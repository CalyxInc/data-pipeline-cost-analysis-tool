## Why

Section 02 目前只有 MSK 配置了容量規劃子區塊，讓使用者能直覺看出不同 tier 的相機容量上限。MongoDB Atlas 同樣有 M50 / M60 兩個 tier，且因 DC 相機對 MongoDB 的寫入壓力是 PCV 的 6 倍，容量瓶頸比 MSK 更複雜——若沒有同樣的視覺化工具，使用者很難評估當前離升級還有多少空間。

## What Changes

- 在 Section 02 的 MongoDB cost row 下方新增 MongoDB Atlas 容量規劃子區塊
- 子區塊包含 M50 / M60 兩張 tier 卡片、DC slider、PCV slider、堆疊容量條、等效單位明細、以及「可再加 X 台 DC，或 Y 台 PCV」提示
- 容量條以**等效單位**（W = DC×6 + PCV×1）為計算基礎，而非單純相機台數
- M50 上限採保守值 2,700 eq，M60 上限採保守值 5,400 eq
- Tier 卡片依等效單位自動 highlight，無需使用者手動選取

## Capabilities

### New Capabilities
- `mongodb-capacity-planner`: MongoDB Atlas 容量規劃子區塊，含 tier 卡片（M50/M60）、獨立 DC/PCV slider、堆疊等效單位容量條、明細行與剩餘容量提示

### Modified Capabilities
- `camera-cost-calculator`: Section 02 需在 MongoDB cost row 下方嵌入容量規劃子區塊

## Impact

- `index.html`：Section 02 MongoDB row 後新增子區塊 HTML + JS
- 與 MSK 容量規劃子區塊並列，兩者 slider 完全獨立，互不影響
- 不影響 Section 01 per-camera 成本計算邏輯
