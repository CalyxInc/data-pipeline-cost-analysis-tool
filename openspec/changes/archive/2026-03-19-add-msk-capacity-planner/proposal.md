## Why

目前 Section 02 只顯示 MSK 當前 tier 的總月費，使用者無法直觀看出「現在的 MSK 還能再支撐多少台相機」。加入獨立的 MSK 容量規劃區塊，讓使用者在規劃部署規模時能一目瞭然地知道目前 tier 的使用率與剩餘空間。

## What Changes

- 在 Section 02 (Shared Infrastructure) 的 MSK 行下方，新增一個 MSK 容量規劃子區塊
- 新增兩個獨立 slider：DC 相機數（0–3000）與 PCV 相機數（0–10000），與 Section 01 的 slider 完全獨立
- 兩個 tier 卡片（kafka.m7g.large / kafka.m7g.xlarge）根據輸入總台數自動 highlight，不需手動切換
- 堆疊式容量條（DC 段 + PCV 段 + 剩餘段）顯示當前使用率
- 三種狀態：正常（large）、升級（xlarge）、超載（xlarge 上限 1,890 台，超出時紅色警示）
- Section 02 現有的 MSK 成本顯示（由 Section 01 的 M_DC + M_PCV 驅動）維持不變

## Capabilities

### New Capabilities
- `msk-capacity-planner`: 嵌入 Section 02 的 MSK 容量規劃工具，含獨立 DC/PCV slider、tier 自動 highlight 卡片、堆疊容量條、剩餘容量提示

### Modified Capabilities
- `camera-cost-calculator`: Section 02 layout 調整（MSK 行下方新增容量規劃子區塊）

## Impact

- `index.html`：Section 02 HTML 結構與 JavaScript render 邏輯新增容量規劃相關 DOM 與計算
- 新增常數：`MSK_LARGE_CAPACITY = 945`、`MSK_XLARGE_CAPACITY = 1890`（已有 `MSK_LARGE_LIMIT = 945`，可直接複用；xlarge 為 2×）
- 不影響 Section 01 per-camera 計算、Section 03 Fleet Total Cost、或任何現有的 slider 邏輯
