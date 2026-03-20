## 1. 確認現有程式碼結構

- [x] 1.1 在 `index.html` 中找到 EC2 副標籤的 DOM 元素（靜態文字 `g6.xlarge × 1 + m7g.4xlarge × 1`），記下其 id 或 class
- [x] 1.2 找到成本計算函式，確認 g6 與 m7g 的 threshold 常數定義位置（DC: 91 / 828，PCV: 545 / 600）

## 2. 實作動態標籤更新

- [x] 2.1 在計算函式中，依 pipeline type 計算 `g6Count = Math.ceil(M / g6Threshold)` 與 `m7gCount = Math.ceil(M / m7gThreshold)`
- [x] 2.2 在同一個 render/update 函式中，將 EC2 副標籤的 `textContent` 更新為 `` `g6.xlarge × ${g6Count} + m7g.4xlarge × ${m7gCount}` ``

## 3. 驗證

- [x] 3.1 DC pipeline，M_DC = 340 → 標籤顯示 `g6.xlarge × 4 + m7g.4xlarge × 1`
- [x] 3.2 PCV pipeline，M_PCV = 240 → 標籤顯示 `g6.xlarge × 1 + m7g.4xlarge × 1`
- [x] 3.3 調整 M_DC slider 至 100 → 標籤即時更新（g6: ⌈100/91⌉=2，m7g: ⌈100/828⌉=1）
- [x] 3.4 切換 pipeline type → 標籤立即改用對應 threshold 重算
