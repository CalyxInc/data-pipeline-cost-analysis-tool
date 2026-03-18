## 1. 加入百分比顯示

- [x] 1.1 在每個 cost row 的金額旁加入 `<span id="pct-ec2">`, `<span id="pct-s3">`, `<span id="pct-msk">`, `<span id="pct-mongo">` 元素
- [x] 1.2 在 `render()` 中計算各項百分比（`val / total * 100`）並更新對應 span
- [x] 1.3 加入百分比的 CSS 樣式（小字、muted 顏色、tabular-nums）

## 2. 標題樣式改善

- [x] 2.1 加大 `.panel-header` font-size，顏色改用 `var(--text)` 或更深
- [x] 2.2 加大 `.cost-name` font-size，顏色加深

## 3. 驗證

- [x] 3.1 確認四項百分比加總約 100%，且隨參數變動即時更新
- [x] 3.2 確認標題在淺色背景下清楚可讀
