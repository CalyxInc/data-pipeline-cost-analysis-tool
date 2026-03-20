## Context

目前 `MONGO_M50_MONTHLY = 6019` 和 `MONGO_M60_MONTHLY = 10600` 是基於 2,215 GB 儲存量的固定常數。這個值被 4 個函數使用：`calcMongoDB()`（Section 01/02）、`calcMongoCapacity()`（Section 02 容量規劃 tier 卡片顯示）、`calcFleetMongo()`（Section 03）。per-camera 常數 `MONGO_PER_CAMERA_DC = 11.28` 和 `MONGO_PER_CAMERA_PCV = 1.88` 也是基於同一個固定月費推算。

MongoDB Atlas M50 General 的費用結構（截圖）：compute $2.32/hr、included storage 160 GB、額外儲存按 per-GB 費率計算。

## Goals / Non-Goals

**Goals:**

- 在 MongoDB 容量規劃區塊新增 storage GB 輸入（slider + number input），讓使用者可調整儲存大小
- 月費根據公式動態計算：`compute_base + max(0, storageGB - includedGB) × perGB_rate`
- Tier 卡片即時顯示計算後的月費
- 所有依賴 MongoDB 月費的計算（Section 01 per-camera、Section 02 shared、Section 03 fleet）自動連動

**Non-Goals:**

- 不支援 M50/M60 分別設定不同 storage（共用同一個 storage 輸入）
- 不支援 backup cost、IOPS provisioning 等其他 Atlas 計費項目
- 不修改 per-camera 常數的計算邏輯（仍為月費 ÷ 相機數的分攤）

## Decisions

### 1. 單一 storage input，M50/M60 各自計算

新增一個 storage slider（預設 2215 GB，範圍 160–10000 GB），放在 tier 卡片下方、DC/PCV slider 上方。M50 和 M60 各自有不同的 compute base 和 per-GB rate，但共用同一個 storage 輸入值。

**替代方案**：兩個 tier 各一個 storage input → 過度複雜，實際上兩個 tier 的儲存量是同一個資料庫。

### 2. 將固定常數拆分為計算函數

移除 `MONGO_M50_MONTHLY` 和 `MONGO_M60_MONTHLY` 常數，改為：

```js
// MongoDB Atlas pricing components (TBD: confirm exact values)
const MONGO_M50_COMPUTE   = ???;    // M50 compute base $/month
const MONGO_M50_INCL_GB   = 160;    // M50 included storage
const MONGO_M50_PER_GB    = ???;    // M50 extra storage $/GB/month
const MONGO_M60_COMPUTE   = ???;    // M60 compute base $/month
const MONGO_M60_INCL_GB   = ???;    // M60 included storage
const MONGO_M60_PER_GB    = ???;    // M60 extra storage $/GB/month
```

新增函數讀取 storage input 並計算月費：

```js
function getMongoStorageGB() {
  return parseInt(document.getElementById("mongo-storage-input").value, 10) || 2215;
}

function calcMongoMonthly(tier) {
  const gb = getMongoStorageGB();
  if (tier === "M60") {
    return MONGO_M60_COMPUTE + Math.max(0, gb - MONGO_M60_INCL_GB) * MONGO_M60_PER_GB;
  }
  return MONGO_M50_COMPUTE + Math.max(0, gb - MONGO_M50_INCL_GB) * MONGO_M50_PER_GB;
}
```

所有原本讀取 `MONGO_M50_MONTHLY` / `MONGO_M60_MONTHLY` 的地方改為呼叫 `calcMongoMonthly("M50")` / `calcMongoMonthly("M60")`。

**替代方案**：保留常數但在每次 render 時重算 → 語義不清楚，常數不應該是變數。

### 3. Per-camera 常數也改為動態計算

`MONGO_PER_CAMERA_DC` 和 `MONGO_PER_CAMERA_PCV` 目前是基於固定月費的硬編碼值。改為：

```js
// 基於預設相機數 (340 DC + 240 PCV) 和當前 M50 月費動態計算
// DC per-camera = M50_monthly × (340×6)/(340×6+240) / 340
// PCV per-camera = M50_monthly × 240/(340×6+240) / 240
```

由於 Section 01 的 per-camera 成本需要一個 MongoDB 月費，而 tier 取決於相機數，直接使用 `calcMongoDB()` 已經返回的 `totalMonthly` 和 `cost`（per-camera）即可。但 `calcMongoDB` 內部的固定月費需要改為 `calcMongoMonthly(tier)`。

### 4. Storage slider 觸發所有 section re-render

Storage input 變動時需要觸發：`render()`（Section 01+02）、`renderMongoCapacity()`（Section 02 容量規劃）、`renderFleet()`（Section 03）。使用與現有 slider wiring 相同的 pattern。

### 5. Tier 卡片月費改為動態文字

目前 tier 卡片的月費是硬編碼 HTML（`$6,019 / 月`、`~$10,600 / 月`）。改為用 `<span>` 元素，在 `renderMongoCapacity()` 中根據 `calcMongoMonthly()` 動態更新。

## Risks / Trade-offs

- **[需要確認定價常數]** → M50/M60 的 compute base 和 per-GB rate 需要使用者提供確切數值，目前無法從截圖推算完整 breakdown。實作時先用 placeholder，待確認後填入。
- **[per-camera 成本精度]** → per-camera 分攤是 MongoDB 月費除以相機總數，儲存量變動會影響所有 per-camera 成本。這是正確行為但使用者需理解。→ 無需額外 mitigation，這正是本 change 的目的。
- **[預設值向後相容]** → storage 預設 2215 GB，確保在使用者未調整時，所有計算結果與目前一致。→ 確認 `calcMongoMonthly("M50")` 在 2215 GB 時 = 6019、`calcMongoMonthly("M60")` = 10600。
