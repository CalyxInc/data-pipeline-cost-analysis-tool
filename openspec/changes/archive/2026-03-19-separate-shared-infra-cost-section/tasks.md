## 1. HTML — 新增共享基礎設施區塊

- [x] 1.1 在 section 01 和現有 section 02（艦隊總成本）之間，新增 section-gap 與 section-label「02 共享基礎設施 · Shared Infrastructure」
- [x] 1.2 在新區塊內新增 MSK 成本列（顯示總月費 + scheme-tag）和 MongoDB 成本列（顯示總月費 + tier-tag），參考 section 01 的 cost-row 結構，id 使用 `shared-msk`、`shared-msk-tag`、`shared-mongo`、`shared-mongo-tag`
- [x] 1.3 將原 section 02 的標題文字從「02 艦隊總成本 · Fleet Total Cost」改為「03 艦隊總成本 · Fleet Total Cost」

## 2. HTML — 調整 Section 01 成本列

- [x] 2.1 從 section 01 的 cost-breakdown 中移除 MSK 的 cost-row（`result-msk`、`msk-tag`）
- [x] 2.2 從 section 01 的 cost-breakdown 中移除 MongoDB 的 cost-row（`result-mongo`、`mongo-tag`）

## 3. JS — 更新 render() 函式

- [x] 3.1 將 `result-total` 的計算改為只加 `r.ec2.cost + r.s3`（移除 `r.msk.cost + r.mongo.cost`）
- [x] 3.2 新增對 `shared-msk` 的更新：`textContent = fmt(r.msk.totalMonthly)`（MSK 總月費，非 per-camera）
- [x] 3.3 新增對 `shared-msk-tag` 的更新：scheme 名稱與 upgrade class
- [x] 3.4 新增對 `shared-mongo` 的更新：`textContent = fmt(r.mongo.totalMonthly)`（MongoDB 總月費，非 per-camera）
- [x] 3.5 新增對 `shared-mongo-tag` 的更新：tier 名稱與 upgrade class
- [x] 3.6 確認 `calcMSK` 與 `calcMongoDB` 回傳物件中包含 `totalMonthly`（或直接使用現有的 total 常數計算）

## 4. JS — 調整比例 bar

- [x] 4.1 Section 01 的比例 bar（`bar-ec2`、`bar-s3`）改以 EC2 + S3 IT 為分母計算
- [x] 4.2 移除或更新 `bar-msk`、`bar-mongo`、`pct-msk`、`pct-mongo`（若保留在 section 01 則需移除；若移至共享區塊則更新 id）

## 5. 參數 Slider 動態顯示

- [x] 5.1 在 `render()` 或 pipeline change handler 中，依 pipeline type 切換 M_DC / M_PCV param 區塊的顯示與隱藏
- [x] 5.2 驗證：切換 pipeline type → 對應 slider 即時切換，另一個隱藏

## 6. 驗證

- [x] 5.1 N=12, M_DC=340, M_PCV=240, Pipeline=DC → per-camera 合計顯示約 $53.20（EC2 $8.20 + S3 $45.00）
- [x] 5.2 N=12, M_DC=340, M_PCV=240, Pipeline=PCV → per-camera 合計顯示約 $11.86（EC2 $4.38 + S3 $7.48）
- [x] 5.3 共享基礎設施區塊顯示 MSK $1,238.88（kafka.m7g.large）和 MongoDB $6,019（M50）
- [x] 5.4 調整 M_DC + M_PCV > 945 → MSK 升級至 xlarge，共享區塊即時更新
- [x] 5.5 section 編號：01 單台相機月費、02 共享基礎設施、03 艦隊總成本
