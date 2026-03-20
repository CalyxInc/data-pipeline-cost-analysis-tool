## 1. 常數與計算函式

- [x] 1.1 新增常數 `MSK_XLARGE_CAPACITY = MSK_LARGE_LIMIT * 2`（= 1890）於 Constants 區塊
- [x] 1.2 新增函式 `calcMSKCapacity(mskDC, mskPCV)` 回傳 `{ total, limit, pctDC, pctPCV, pctRemaining, remaining, tier, isUpgrade, isOverflow }`

## 2. DOM 結構（Section 02 MSK 行擴充）

- [x] 2.1 在 `#shared-msk` cost row 的 `.cost-left` 內、`.cost-bar-wrap` 之後插入容量規劃子區塊 `#msk-capacity`
- [x] 2.2 子區塊包含兩張 tier 卡片（`#msk-card-large`、`#msk-card-xlarge`），各顯示 tier 名稱與月費
- [x] 2.3 新增 DC slider（`#msk-dc-slider` / `#msk-dc-input`，範圍 0–3000，預設 340）
- [x] 2.4 新增 PCV slider（`#msk-pcv-slider` / `#msk-pcv-input`，範圍 0–10000，預設 240）
- [x] 2.5 新增容量條容器 `#msk-cap-bar`，內含三個子 div：`#msk-bar-dc`、`#msk-bar-pcv`、`#msk-bar-remaining`
- [x] 2.6 新增容量摘要文字行 `#msk-cap-summary`（顯示已用 / 上限 · % · 剩餘台數）
- [x] 2.7 新增超載警示行 `#msk-cap-warning`（預設隱藏）

## 3. CSS 樣式

- [x] 3.1 新增 `.tier-card` 基礎樣式（border、padding、border-radius，非 active 狀態為 muted）
- [x] 3.2 新增 `.tier-card.active` 樣式（teal border + teal-dim background，large 用 normal 配色）
- [x] 3.3 新增 `.tier-card.active.upgrade` 樣式（amber border + amber-dim background，xlarge 升級用）
- [x] 3.4 新增 `.msk-cap-bar` flex 容器樣式（高度 8px，border-radius，overflow hidden）
- [x] 3.5 新增 `#msk-bar-dc` 樣式（teal 色，transition width）
- [x] 3.6 新增 `#msk-bar-pcv` 樣式（teal 50% opacity，transition width）
- [x] 3.7 新增 `.overflow` 狀態樣式：`#msk-bar-dc`、`#msk-bar-pcv` 轉為 amber/red 色

## 4. JavaScript — renderMSKCapacity()

- [x] 4.1 新增 `linkSlider` 呼叫：`msk-dc-slider` ↔ `msk-dc-input`、`msk-pcv-slider` ↔ `msk-pcv-input`，每次 input 呼叫 `renderMSKCapacity()`
- [x] 4.2 實作 `renderMSKCapacity()`：讀取 `#msk-dc-input` 與 `#msk-pcv-input` 數值
- [x] 4.3 計算 tier 與 limit（total ≤ 945 → large/945；total > 945 → xlarge/1890）
- [x] 4.4 更新 tier 卡片 class（`active` / `active upgrade` / 無 active）
- [x] 4.5 設定三段容量條寬度（DC%、PCV%；overflow 時夾緊至 100% 並加 `.overflow` class）
- [x] 4.6 更新 `#msk-cap-summary` 文字：`{total} / {limit} · {pct}% · 剩餘 {remaining} 台`
- [x] 4.7 overflow 時顯示 `#msk-cap-warning`，否則隱藏

## 5. 驗證

- [x] 5.1 DC=340, PCV=240（M=580）：large 卡片 active，DC 段 36.0%，PCV 段 25.4%，摘要顯示「580 / 945 · 61.4% · 剩餘 365 台」
- [x] 5.2 DC=600, PCV=400（M=1000）：xlarge 卡片 active（upgrade），DC 段 31.7%，PCV 段 21.2%，摘要顯示「1000 / 1890 · 52.9% · 剩餘 890 台」
- [x] 5.3 DC=1500, PCV=500（M=2000）：overflow 狀態，容量條紅色，警示文字顯示
- [x] 5.4 調整容量規劃 slider，確認 Section 01 per-camera 成本與 slider 無變化
- [x] 5.5 調整 Section 01 slider，確認容量規劃子區塊無變化
