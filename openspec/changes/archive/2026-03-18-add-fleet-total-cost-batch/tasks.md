## 1. HTML 結構

- [x] 1.1 在 `index.html` 主 grid 下方新增 `.fleet-section` 容器，包含 panel header「Fleet Total Cost」
- [x] 1.2 新增批次列表容器 `#batch-list`，以及「+ Add Batch」按鈕
- [x] 1.3 設計單一批次列的 HTML template（含 N、M_DC、M_PCV 三個 number input 及刪除按鈕）

## 2. CSS 樣式

- [x] 2.1 新增 `.fleet-section` 樣式，`max-width: 1000px; margin: 16px auto 0;`，與主 grid 對齊
- [x] 2.2 新增 `.batch-row` 樣式，使三個 input 與刪除按鈕橫向排列，label 標示 N / M_DC / M_PCV
- [x] 2.3 複用現有 `.cost-rows` / `.cost-row` / `.cost-value` / `.cost-pct` 樣式顯示艦隊成本拆解

## 3. JavaScript — 批次資料管理

- [x] 3.1 初始化 `batches` 陣列，預設一筆 `{n: 12, mDC: 340, mPCV: 240}`
- [x] 3.2 實作 `renderBatchList()` — 依 `batches` 陣列動態產生 `#batch-list` 的 DOM；當批次數為 1 時 disable 刪除按鈕
- [x] 3.3 實作「Add Batch」click handler：push `{n:1, mDC:0, mPCV:0}` 並重新 render
- [x] 3.4 實作刪除 handler：依 index 從 `batches` splice，重新 render
- [x] 3.5 實作批次 input `input` 事件：更新 `batches[i]` 對應欄位後呼叫 `renderFleet()`

## 4. JavaScript — 艦隊成本計算

- [x] 4.1 實作 `calcFleetEC2(batches)` — 遍歷批次，累加 `calcEC2_DC(b.mDC).cost × b.mDC`（mDC > 0 時）與 `calcEC2_PCV(b.mPCV).cost × b.mPCV`（mPCV > 0 時）
- [x] 4.2 實作 `calcFleetS3(batches)` — 遍歷批次，累加 `calcS3IT_DC(b.n) × b.mDC + calcS3IT_PCV(b.n) × b.mPCV`
- [x] 4.3 實作 `calcFleetMSK(fleetM)` — 依 `fleetM` 與 `MSK_LARGE_LIMIT` 回傳 `{cost, scheme, isUpgrade}`
- [x] 4.4 實作 `calcFleetMongo(fleetM)` — 依 `fleetM` 與 `MONGO_M50_LIMIT` 回傳 `{cost, tier, isUpgrade}`
- [x] 4.5 實作 `renderFleet()` — 計算各項費用並更新所有 fleet 結果 DOM，包含 MSK / MongoDB 的 scheme-tag

## 5. 整合與驗證

- [x] 5.1 頁面初始化時呼叫 `renderBatchList()` 與 `renderFleet()`，確認預設值顯示正確
- [x] 5.2 以 N=12, M_DC=340, M_PCV=240 單批次驗證：Fleet Total = $28,185.00（EC2=$3,838.32, S3=$17,088.80, MSK=$1,238.88, MongoDB=$6,019.00）
- [x] 5.3 測試新增第二批次（N=6, M_DC=200, M_PCV=100），確認 fleet_M=880 → MongoDB M50 未升級
- [x] 5.4 測試新增批次使 fleet_M > 945 → MSK 升級為 xlarge；fleet_M > 900 → MongoDB 升級為 M60
- [x] 5.5 確認批次數為 1 時刪除按鈕 disabled；刪除後 fleet 成本正確重算
