## 1. 建立 HTML 骨架與輸入控制項

- [x] 1.1 建立 `index.html`，加入頁面標題、基本 CSS reset 與 layout
- [x] 1.2 加入 Pipeline Type 切換（DC / PCV radio button 或 toggle）
- [x] 1.3 加入 N slider + number input（範圍 1–24，預設 12）
- [x] 1.4 加入 M_DC slider + number input（範圍 1–3000，預設 340）
- [x] 1.5 加入 M_PCV slider + number input（範圍 1–10000，預設 240）
- [x] 1.6 實作 slider ↔ number input 雙向同步（oninput 事件）

## 2. 實作成本計算函式

- [x] 2.1 定義常數（g6 月費 $580、m7g 月費 $470、各分段閾值）
- [x] 2.2 實作 `calcEC2_DC(M_DC)` — g6/m7g 台數 ceiling 計算，回傳每台 EC2 費用
- [x] 2.3 實作 `calcEC2_PCV(M_PCV)` — 同上，使用 PCV 參數（545 / 600 台）
- [x] 2.4 實作 `calcS3IT_DC(N)` — N=1/2/3 獨立值，N≥4 用線性公式
- [x] 2.5 實作 `calcS3IT_PCV(N)` — 同上，使用 PCV 參數
- [x] 2.6 實作 `calcMSK(M_DC, M_PCV, pipeline)` — 依 M 分段選方案，回傳每台費用與方案名稱
- [x] 2.7 實作 `calcMongoDB(M)` — M≤900 用 M50，M>900 用 M60，回傳每台費用與 tier 名稱
- [x] 2.8 實作 `calcTotal(N, M_DC, M_PCV, pipeline)` — 組合上述四函式，回傳各項明細與合計

## 3. 將計算結果渲染至 UI

- [x] 3.1 建立結果顯示區塊（EC2 / S3 IT / MSK / MongoDB 各項費用 + 合計）
- [x] 3.2 顯示目前 MSK 方案名稱（kafka.m7g.large 或 xlarge）
- [x] 3.3 顯示目前 MongoDB tier（M50 或 M60）
- [x] 3.4 任一輸入變動時呼叫 `calcTotal` 並更新顯示區塊

## 4. 驗證數值正確性

- [x] 4.1 以 N=12, M_DC=340, M_PCV=240, DC pipeline 驗證結果：EC2=$8.20, S3=$45.00, MSK=$3.24, MongoDB=$10.38, 合計=$66.82
- [x] 4.2 以 N=12, M_DC=340, M_PCV=240, PCV pipeline 驗證結果：EC2=$4.38, S3=$7.48, MSK=$0.57, MongoDB=$10.38, 合計=$22.81
- [x] 4.3 驗證 N=1/2/3 的 S3 IT 邊界值（DC: $10.02/$15.93/$21.84）
- [x] 4.4 驗證 MSK 切換邊界（M=945 → m7g.large；M=946 → m7g.xlarge）
- [x] 4.5 驗證 MongoDB 切換邊界（M=900 → M50；M=901 → M60）

## 5. 樣式與使用體驗

- [x] 5.1 加入基本 CSS 使介面整齊易讀（輸入區 / 結果區分欄）
- [x] 5.2 金額格式化為兩位小數並加上 $ 符號
- [ ] 5.3 離線測試：在無網路環境下開啟 `index.html` 確認功能正常
