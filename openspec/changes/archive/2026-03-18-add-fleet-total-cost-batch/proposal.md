## Why

目前工具只能計算「單台相機的月費」，無法反映整個艦隊的真實總支出。由於相機是分批上線的，每批在不同月份加入，各自累積不同的 N（上線月數），因此艦隊總成本不能簡單用單台成本乘以總數得出，需要依批次分別計算再加總。

## What Changes

- 在現有工具中新增「艦隊總成本」計算區塊（Fleet Total Cost）
- 使用者可新增多個批次（batch），每批次輸入：DC 相機數、PCV 相機數、該批已上線月數 N
- 工具依批次分別套用現有公式計算各批的月費小計，再加總為艦隊當月總成本
- 顯示艦隊總月費（USD/月），並拆解顯示 EC2、S3 IT、MSK、MongoDB 各項合計費用
- 批次可動態新增與刪除

## Capabilities

### New Capabilities
- `fleet-batch-total-cost`: 批次艦隊總成本計算 — 允許輸入多批相機（各自有獨立的 N、M_DC、M_PCV），加總計算整個艦隊的 EC2、S3 IT、MSK、MongoDB 月費與合計

### Modified Capabilities
<!-- 現有 camera-cost-calculator 的計算公式不變，只複用其邏輯，無 spec-level requirement 變更 -->

## Impact

- `index.html`：新增 Fleet Total Cost 區塊（HTML + CSS + JS），複用現有 calcEC2_DC、calcEC2_PCV、calcS3IT_DC、calcS3IT_PCV 函式；MSK 與 MongoDB 需依艦隊全體 M（所有批次 M_DC + M_PCV 之總和）決定分段，不依批次個別計算
- 無外部依賴變更，維持單一 `index.html` 離線運作
