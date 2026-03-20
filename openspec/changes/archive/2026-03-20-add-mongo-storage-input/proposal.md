## Why

目前 MongoDB Atlas 的月費（M50 $6,019、M60 $10,600）是以固定儲存量 2,215 GB 計算的硬編碼常數，但實際資料庫儲存量會隨時間增長。使用者無法調整儲存大小來觀察成本變化，導致估算結果無法反映真實的儲存成本趨勢。

## What Changes

- 在 Section 02 MongoDB 容量規劃區塊的 tier 卡片中，新增一個「MongoDB Storage Size (GB)」輸入欄位（slider + number input）
- 將 `MONGO_M50_MONTHLY` 和 `MONGO_M60_MONTHLY` 從固定常數改為根據儲存量動態計算：拆分為 compute 基礎費用 + storage 費用（超出 included 容量的部分按 per-GB 費率計算）
- Tier 卡片上的月費金額即時反映儲存量變動
- 所有使用 MongoDB 月費的計算（Section 01 per-camera、Section 02 容量規劃、Section 03 fleet total）都連動更新

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `mongodb-capacity-planner`: 新增儲存量輸入控制項，tier 卡片月費從固定值改為根據儲存量動態計算
- `camera-cost-calculator`: MongoDB 月費從固定常數改為動態值（來自儲存量輸入），影響 Section 01 per-camera 分攤和 Section 02 shared 成本顯示

## Impact

- `index.html`：新增 storage slider/input HTML、修改 CSS（tier 卡片佈局）、修改 JS 常數與計算函數（`calcMongoDB`、`calcMongoCapacity`、`calcFleetMongo`、`render`、`renderMongoCapacity`、`renderFleet`）
- 需要確認 M50/M60 各自的 compute 基礎費、included storage、以及超出部分的 per-GB 月費費率（來自 MongoDB Atlas 定價）
