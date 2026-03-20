## 1. 常數拆分

- [x] 1.1 將 `MONGO_M50_MONTHLY = 6019` 和 `MONGO_M60_MONTHLY = 10600` 拆分為各自的 compute base、included GB、per-GB rate 常數（共 6 個常數），確保 `calcMongoMonthly("M50")` 在 2215 GB 時 = 6019、`calcMongoMonthly("M60")` = 10600
- [x] 1.2 新增 `getMongoStorageGB()` 函數，從 storage input 讀取當前值
- [x] 1.3 新增 `calcMongoMonthly(tier)` 函數，根據 tier 和 storage 計算月費

## 2. 替換所有固定月費引用

- [x] 2.1 修改 `calcMongoDB(mDC, mPCV)` — 將 `MONGO_M50_MONTHLY` / `MONGO_M60_MONTHLY` 改為 `calcMongoMonthly("M50")` / `calcMongoMonthly("M60")`
- [x] 2.2 修改 `calcMongoCapacity()` 相關的 tier 卡片月費顯示（`renderMongoCapacity()`）— 從硬編碼 HTML 改為動態更新
- [x] 2.3 修改 `calcFleetMongo(fleetDC, fleetPCV)` — 將固定月費改為 `calcMongoMonthly()`
- [x] 2.4 移除 `MONGO_PER_CAMERA_DC` 和 `MONGO_PER_CAMERA_PCV` 常數，改為在 `render()` 中從 `calcMongoDB()` 返回的動態月費計算 per-camera 分攤

## 3. UI — Storage 輸入控制項

- [x] 3.1 在 tier 卡片下方、DC slider 上方新增 storage slider + number input HTML（id: `mongo-storage-slider` / `mongo-storage-input`，range 160–10000，預設 2215，單位 GB）
- [x] 3.2 將 tier 卡片月費文字從硬編碼改為 `<span>` 元素（id: `mongo-m50-cost` / `mongo-m60-cost`），以便動態更新

## 4. Wiring — Storage 輸入連動

- [x] 4.1 在 MongoDB slider wiring IIFE 中加入 storage slider 雙向同步（同 DC/PCV slider pattern）
- [x] 4.2 Storage 輸入變動時觸發 `render()`（Section 01+02）、`renderMongoCapacity()`（Section 02 容量規劃）、`renderFleet()`（Section 03）

## 5. 驗證

- [x] 5.1 確認預設值（storage=2215）下所有計算結果與變更前一致
- [x] 5.2 確認調整 storage 時三個 section 的 MongoDB 相關金額即時更新
- [x] 5.3 確認 storage slider 範圍限制（160–10000）與截斷行為正確
