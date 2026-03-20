## Why

目前「單台相機月費」區塊同時顯示 EC2、S3 IT、MSK、MongoDB 四項成本，但 MSK 和 MongoDB 是 DC + PCV 兩種 pipeline 共用的基礎設施，並非純粹的 per-camera 費用，與 EC2（pipeline 專屬算力）和 S3 IT（per-camera 儲存）的性質不同，混在同一個區塊會讓成本歸因模糊。

## What Changes

- 「01 單台相機月費」區塊只保留 **EC2 算力**和 **S3 Intelligent-Tiering** 兩項，月費合計也只計算這兩項
- 新增「02 共享基礎設施月費」（或類似標題）區塊，顯示 **MSK** 和 **MongoDB Atlas** 的總月費（非 per-camera）
- 共享基礎設施區塊顯示的是**絕對金額**（整個部署的月費），不除以相機數
- Section 01 的參數 slider 依 pipeline type 動態顯示：DC tab 只顯示 M_DC slider；PCV tab 只顯示 M_PCV slider

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `camera-cost-calculator`：成本顯示結構改變——per-camera 月費只含 EC2 + S3 IT；MSK 和 MongoDB 移至獨立的共享基礎設施區塊，顯示總月費而非單台分攤費用

## Impact

- `index.html`：Layout 調整（新增第二個成本區塊），計算邏輯需分流（per-camera 合計 vs. 共享基礎設施合計）
- 數值驗證基準值需更新：原 per-camera 合計將不再包含 MSK / MongoDB 分攤額
