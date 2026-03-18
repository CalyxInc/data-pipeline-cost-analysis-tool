## Why

成本試算邏輯目前僅存在於 `.md` 文件中，無法互動調整。需要一個可直接在瀏覽器開啟的工具，讓使用者調整 4 個參數即時得到單台相機的月費拆解，方便規劃相機擴充與成本溝通。

## What Changes

- 新增單一 `index.html` 工具頁面（純 HTML + Vanilla JS，無 build 步驟）
- 使用者可透過 slider / input 調整 4 個參數：
  - **N** — 相機已上線月數（1–24）
  - **M_DC** — 同時上線的 DC 相機總數
  - **M_PCV** — 同時上線的 PCV 相機總數
  - **Pipeline Type** — 欲查看的相機類型（DC 或 PCV）
- 即時顯示選定 pipeline 單台相機的月費拆解：EC2、S3 IT、MSK、MongoDB 及合計
- 實作 spec 中定義的分段公式（EC2 階梯、S3 IT 分段、MSK 分段、MongoDB M50/M60）

## Capabilities

### New Capabilities

- `camera-cost-calculator`: 互動式單台相機成本計算工具，輸入 N / M_DC / M_PCV / pipeline type，輸出各項費用拆解與月費合計

### Modified Capabilities

（無）

## Impact

- 新增獨立靜態檔案 `index.html`，不影響任何現有系統
- 無外部依賴、無 build 步驟、無後端
