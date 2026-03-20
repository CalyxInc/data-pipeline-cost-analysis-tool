## Context

`index.html` 是單一靜態檔案，所有 UI 與計算邏輯都在同一個 HTML/JS 內。Section 02 目前在 MongoDB cost row 顯示依 `mDC + mPCV` 自動決定的 tier（M50/M60）與總月費，但沒有互動式的容量規劃視覺化。

MSK 容量規劃子區塊已是現成的參考實作（`#msk-capacity`）。新增的 MongoDB 容量規劃子區塊需遵循相同模式，但核心差異在於：瓶頸是 **WiredTiger cache RAM**，DC 相機的寫入壓力是 PCV 的 6 倍，因此必須以**等效單位**（W = DC×6 + PCV）而非台數決定 tier 與容量條寬度。

## Goals / Non-Goals

**Goals:**
- 在 Section 02 的 MongoDB cost row 下方嵌入容量規劃子區塊
- 獨立 DC / PCV slider，滑動即時更新容量條
- 兩張 tier 卡片（M50 / M60）根據等效單位自動 highlight
- 堆疊容量條：DC 段（紫色）+ PCV 段（紫色-dim）+ 剩餘段（bg），以 tier 上限等效單位為 100%
- 條下顯示等效單位明細行：`DC X台（×6 = A eq）+ PCV Y台（×1 = B eq）= W / limit · Z% used · 剩餘 R eq`
- 第二行顯示：`可再加 ⌊R/6⌋ 台 DC，或 R 台 PCV`
- 三種狀態（M50 正常 / M60 升級 / 超載），超載時條轉紅並顯示警示

**Non-Goals:**
- 不修改 Section 01 的任何 slider 或計算邏輯
- 不修改 Section 02 MongoDB 現有的 cost display（仍由 Section 01 值驅動）
- 不修改 MSK 容量規劃子區塊
- 不新增網路請求或外部依賴

## Decisions

### D1：等效單位常數

```
MONGO_DC_WEIGHT     = 6        // DC 相機對 MongoDB 的負載倍率
MONGO_M50_EQ_LIMIT  = 2700     // M50 保守上限（等效單位）
MONGO_M60_EQ_LIMIT  = 5400     // M60 保守上限（等效單位）
```

- M50 上限採 2,700（保守值），M60 上限採 5,400（保守值）
- **理由**：保守值避免使用者在接近上限時低估風險；與 MSK 一致只使用單一固定數值，不顯示範圍

### D2：容量條實作方式

採用與 MSK 相同的三段 `flex` 結構，但寬度依等效單位計算：

```
DC 段寬  = (DC × 6)    / limit × 100%
PCV 段寬 = (PCV × 1)   / limit × 100%
剩餘段寬 = (limit - W) / limit × 100%（W ≤ limit 時）
```

超載時（W > limit）：DC + PCV 段加總鎖定 100%，按各自比例分配，容器邊框轉紅。

- **理由**：與 MSK 實作對稱，flex 最簡單，不需 canvas/SVG

### D3：Tier 卡片 highlight 機制

使用 CSS class 切換（`.tier-card.active`），由 `renderMongoCapacity()` 在每次 input 事件後呼叫：

- `W ≤ 2700` → M50 card 加 `.active`，M60 移除
- `2700 < W ≤ 5400` → M60 card 加 `.active`（+ `.upgrade`），M50 移除
- `W > 5400` → M60 card 加 `.active.overload`，顯示超載警示

- **理由**：純 display 反映計算結果，與 MSK tier 卡片邏輯對稱

### D4：Slider 範圍

- `mongoDC`：0–3000（與 Section 01 M_DC 一致）
- `mongoPCV`：0–10000（與 Section 01 M_PCV 一致）
- 允許超過 tier 上限（讓使用者能看到超載警示）

### D5：DOM 結構位置

在 Section 02 的 `#shared-mongodb` cost row 內，於現有 cost display 之後插入容量規劃子區塊 `#mongo-capacity`，結構與 `#msk-capacity` 對稱。

### D6：容量條顏色

MongoDB 容量條使用紫色系（以區隔 MSK 的 teal 系）：
- DC 段：`#7c3aed`（紫色）
- PCV 段：`#a78bfa`（淺紫）
- 剩餘段：bg（與 MSK 一致）
- 超載：`#dc2626`（與 MSK 一致）

## Risks / Trade-offs

- [Risk] 等效單位的概念對初次使用者不直覺（1 台 DC = 6 eq）
  → Mitigation：條下明細行明確展示「DC X台（×6 = A eq）」，讓換算過程可見

- [Risk] M50 / M60 上限是 RAM 壓力估算值，非硬性限制，接近上限時不會觸發系統錯誤
  → Mitigation：tier 卡片 tooltip 或小字說明「保守估算，以 WiredTiger cache 壓力為基準」

- [Risk] Section 02 同時存在兩組獨立 slider（MSK + MongoDB），頁面會變長
  → Mitigation：子區塊預設展開（與 MSK 一致），不另加折疊，依賴捲動
