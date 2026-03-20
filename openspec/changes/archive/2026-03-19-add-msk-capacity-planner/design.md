## Context

`index.html` 是單一靜態檔案，所有 UI 與計算邏輯都在同一個 HTML/JS 內。Section 02 目前以一個全寬 panel 呈現 MSK 和 MongoDB 的總月費，MSK tier 由 Section 01 的 `mDC + mPCV` 自動決定。

新增的容量規劃子區塊需要在 MSK cost row 下方展開，並維持一套**完全獨立**的 DOM state（`mskDC`、`mskPCV` 兩個 slider/input），不影響 Section 01 或 Fleet 的任何計算。

## Goals / Non-Goals

**Goals:**
- 在 Section 02 的 MSK 行下方嵌入容量規劃子區塊
- 獨立 DC / PCV slider，滑動即時更新容量條
- 兩張 tier 卡片（large / xlarge）根據總台數自動 highlight
- 堆疊容量條：DC 段（teal） + PCV 段（teal-dim） + 剩餘段（bg），以 tier 上限為 100%
- 顯示：已用台數 / tier 上限、百分比、剩餘台數
- 三種狀態（正常 / 升級 / 超載），超載時條轉紅並顯示警示文字
- xlarge 上限 = 1,890（MSK_LARGE_CAPACITY × 2，因 xlarge CPU = 2× large）

**Non-Goals:**
- 不修改 Section 01 的任何 slider 或計算邏輯
- 不修改 Section 02 MSK 現有的 cost display（仍由 Section 01 值驅動）
- 不修改 Section 03 Fleet Total Cost
- 不新增網路請求或外部依賴

## Decisions

### D1：tier 上限常數命名

- 新增 `MSK_LARGE_CAPACITY = 945`（與現有 `MSK_LARGE_LIMIT` 語意相同，可直接複用 `MSK_LARGE_LIMIT`）
- 新增 `MSK_XLARGE_CAPACITY = MSK_LARGE_LIMIT * 2`（= 1890）
- **理由**：xlarge 的 CPU bottleneck 倍數關係明確，直接在常數定義中表達，避免 magic number

### D2：容量條實作方式

採用**三段 `<div>` 絕對定位於同一容器**，寬度以 % 動態設定：
```
[dc-bar: dc/limit * 100%] [pcv-bar: pcv/limit * 100%] [remaining: auto]
```
- 容器設 `display:flex`，三段依序排列，總寬 ≤ 100%
- 超載（total > limit）時：dc-bar + pcv-bar 加總設為 100%，顯示超出比例，容器邊框轉紅
- **理由**：flex 實作最簡單，不需 canvas 或 SVG，與現有 cost-bar 風格一致

### D3：tier 卡片 highlight 機制

使用 CSS class 切換（`.tier-card.active` vs `.tier-card`）由 `renderMSKCapacity()` 在每次 input 事件後呼叫：
- `total ≤ 945` → large card 加 `.active`，xlarge 移除
- `total > 945` → xlarge card 加 `.active`（+ `.upgrade`），large 移除
- **理由**：不需要 radio/checkbox 狀態，純 display 反映計算結果，最簡單

### D4：slider 範圍

- `mskDC`：0–3000（與 Section 01 M_DC 一致）
- `mskPCV`：0–10000（與 Section 01 M_PCV 一致）
- 允許超過 tier 上限（目的是讓使用者能看到超載警示）

### D5：DOM 結構位置

在 Section 02 的 `#shared-msk` cost row 的 `.cost-left` 內，於 `.cost-bar-wrap` 之後插入容量規劃子區塊 `#msk-capacity`。
- **理由**：語意上屬於 MSK row 的延伸，不需另開 panel，與現有結構對齊

## Risks / Trade-offs

- [Risk] Section 01 與 Section 02 兩組 DC/PCV 數值並存，可能讓初次使用者困惑
  → Mitigation：在容量規劃子區塊的 label 加入小字說明「獨立規劃用，不影響上方試算」

- [Risk] 超載狀態（total > 1890）沒有 spec 定義的精確上限，只顯示警示
  → Mitigation：警示文字明確說明「已超出 kafka.m7g.xlarge 最大容量（1,890 台）」，使用者知道數字來源

## Open Questions

- 無。所有設計決策已在 explore 階段與使用者確認。
