## 1. 常數定義

- [x] 1.1 在 `index.html` JS 常數區塊新增 `MONGO_DC_WEIGHT = 6`、`MONGO_M50_EQ_LIMIT = 2700`、`MONGO_M60_EQ_LIMIT = 5400`

## 2. HTML 結構

- [x] 2.1 在 Section 02 的 `#shared-mongodb` cost row 內，於現有 cost display 之後插入 `#mongo-capacity` 子區塊骨架（對應 `#msk-capacity` 的 DOM 結構）
- [x] 2.2 新增兩張 tier 卡片（M50 / M60），顯示月費與等效單位上限
- [x] 2.3 新增 DC slider（id: `mongoDC`，範圍 0–3000）與 PCV slider（id: `mongoPCV`，範圍 0–10000），含 number input 同步

## 3. 樣式

- [x] 3.1 新增容量條顏色 CSS 變數：DC 段 `#7c3aed`（紫色）、PCV 段 `#a78bfa`（淺紫），與 MSK 的 teal 系區隔
- [x] 3.2 複用或擴充 `.tier-card`、`.capacity-bar`、`.tier-card.active`、`.tier-card.upgrade` 樣式至 MongoDB 子區塊

## 4. 核心計算邏輯

- [x] 4.1 實作 `renderMongoCapacity()` 函式：計算 `W = mongoDC×6 + mongoPCV`
- [x] 4.2 實作 tier 判斷邏輯：`W ≤ 2700` → M50 active；`W > 2700` → M60 active（`.upgrade`）；`W > 5400` → M60 active（`.overload`）
- [x] 4.3 實作容量條三段寬度計算：DC 段 = `(mongoDC×6)/limit×100%`，PCV 段 = `mongoPCV/limit×100%`，剩餘 = `(limit-W)/limit×100%`（超載時鎖定 100%）
- [x] 4.4 實作明細行一：`DC X台（×6 = A eq）+ PCV Y台（×1 = B eq）= W / limit · Z% used · 剩餘 R eq`
- [x] 4.5 實作明細行二：`可再加 ⌊R/6⌋ 台 DC，或 R 台 PCV`（僅在未超載時顯示）
- [x] 4.6 實作超載警示：`⚠ 已超出 M60 最大容量（5,400 eq）`（W > 5400 時顯示）

## 5. 事件綁定

- [x] 5.1 綁定 `mongoDC` slider 與 number input 的雙向同步（`input` 事件），呼叫 `renderMongoCapacity()`
- [x] 5.2 綁定 `mongoPCV` slider 與 number input 的雙向同步（`input` 事件），呼叫 `renderMongoCapacity()`
- [x] 5.3 確認 `mongoDC` / `mongoPCV` 的事件不觸發 Section 01 的重新計算

## 6. 驗證

- [x] 6.1 驗證基準情境：DC=340, PCV=240 → W=2,280，M50 active，DC段75.6%，PCV段8.9%，剩餘420 eq，可再加70台DC或420台PCV
- [x] 6.2 驗證升級情境：DC=400, PCV=400 → W=2,800，M60 active（升級標示），limit=5,400
- [x] 6.3 驗證超載情境：W > 5400 → 容量條轉紅，顯示超載警示
- [x] 6.4 驗證獨立性：調整 Section 01 slider 不影響 `#mongo-capacity`；調整 `mongoDC`/`mongoPCV` 不影響 Section 01 成本
