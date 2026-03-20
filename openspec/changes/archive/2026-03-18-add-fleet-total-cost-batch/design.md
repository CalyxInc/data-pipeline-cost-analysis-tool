## Context

現有工具以「單台相機月費」為計算單位。使用者的真實需求是計算整個艦隊的月費，而相機是分批上線的，每批有各自的上線月數 N、DC 相機數、PCV 相機數。MSK 與 MongoDB 為共用基礎設施，費用依艦隊全體總相機數決定分段，不重複計算。

## Goals / Non-Goals

**Goals:**
- 允許使用者輸入多批次相機（每批: N、M_DC、M_PCV）
- 正確計算艦隊當月總費用：EC2 與 S3 依批次獨立計算，MSK 與 MongoDB 依全體總 M 計算一次
- 動態新增 / 刪除批次，結果即時更新
- 維持單一 `index.html`，無外部依賴

**Non-Goals:**
- 不修改現有「單台相機月費」區塊的任何邏輯或 UI
- 不引入日期或時間軸（月份不做日曆對應，只用整數 N）
- 不儲存批次資料（重整頁面後清空）

## Decisions

### Decision 1：EC2 & S3 依批次獨立計算

每批次的 EC2 成本由該批次自身的 M_DC / M_PCV 決定（ceiling 除法的顆粒度），而非把全部相機合算。這反映真實部署：每批次有獨立的 EC2 節點配置。

S3 IT 同樣依批次 N 計算，因為 S3 Intelligent-Tiering 的遷移時間軸以批次上線時間為基準。

**Alternatives considered:** 把全部 DC 相機合算 EC2 — 但這樣 ceiling 結果不同，且無法反映批次部署的實際節點數。

### Decision 2：MSK & MongoDB 依艦隊全體總 M 計算一次

MSK broker cluster 與 MongoDB Atlas 是艦隊共用基礎設施，費用固定（只有分段跳升）。艦隊總費用直接使用 `MSK_total(fleet M)` 與 `MongoDB_total(fleet M)` 各一份，不依批次分攤。

公式：
- `fleet_M = Σ (batch.mDC + batch.mPCV)`
- `MSK_fleet = MSK_LARGE_MONTHLY or MSK_XLARGE_MONTHLY`（依 fleet_M 分段）
- `MongoDB_fleet = MONGO_M50_MONTHLY or MONGO_M60_MONTHLY`（依 fleet_M 分段）

### Decision 3：批次資料結構為 JS 陣列，DOM 動態產生

使用一個 `batches` 陣列（每項 `{n, mDC, mPCV}`）作為資料來源，批次 UI 由 JS render 產生。新增 / 刪除批次只更新陣列再 re-render，不手動操作個別 DOM 節點。

### Decision 4：複用現有 calc 函式

`calcEC2_DC`、`calcEC2_PCV`、`calcS3IT_DC`、`calcS3IT_PCV` 直接沿用，不修改。MSK / MongoDB 的 fleet 計算可直接使用現有 `calcMSK` / `calcMongoDB` 的常數，或寫簡化版。

### Decision 5：Fleet 區塊加在主 grid 下方

以獨立 section（`<div class="fleet-section">`）置於現有兩欄 grid 之後，不干擾現有佈局。Fleet 區塊使用與現有 panel 相同的樣式系統（`.panel`、`.cost-row` 等）保持視覺一致性。

## Risks / Trade-offs

- **[Risk] 批次過多時 UI 過長** → 不設批次上限，由使用者自行控制；未來可加摺疊，但非本次 scope
- **[Risk] N 輸入混用（整數 vs 小數）** → 與現有行為一致，使用 `parseInt`，不接受小數
- **[Trade-off] MSK/MongoDB 不分攤至批次** → 艦隊總費用能正確反映基礎設施實際費用，但使用者無法看到「每批次的 MSK 分攤額」，這在本次 scope 中是可接受的

## Migration Plan

純前端新增，不影響任何後端或資料。直接修改 `index.html` 即可部署，無需 build 步驟或資料遷移。

## Open Questions

- 是否需要顯示艦隊總費用的各批次佔比（per-batch subtotal / fleet total）？目前設計只顯示各批 EC2+S3 小計與全艦 MSK+MongoDB，不計算批次佔比。
