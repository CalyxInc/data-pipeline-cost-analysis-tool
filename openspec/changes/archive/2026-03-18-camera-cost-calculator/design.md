## Context

成本試算公式定義於 `0003-pipeline-cost-analysis.md`，涵蓋 DC 與 PCV 兩條 pipeline 的 EC2、S3 IT、MSK、MongoDB 四項成本，各自有分段計算邏輯。目前無任何互動介面，需人工查表或手算。

工具需直接在瀏覽器執行，不依賴任何 build 工具、package manager 或後端服務。

## Goals / Non-Goals

**Goals:**
- 單一 `index.html` 檔案，直接雙擊即可在瀏覽器執行
- 4 個輸入參數：N、M_DC、M_PCV、Pipeline Type（DC/PCV）
- 即時計算並展示單台相機月費，拆解為 EC2 / S3 IT / MSK / MongoDB
- 實作 spec 中所有分段公式，包括 MSK 三段方案切換、MongoDB M50/M60 切換

**Non-Goals:**
- 艦隊總成本計算（多台相機加總）
- 歷史趨勢圖表或多月比較
- 資料持久化或分享功能
- 行動裝置最佳化

## Decisions

**D1：純 HTML + Vanilla JS，不使用任何 framework 或 CDN**

避免 build 步驟與外部依賴。工具邏輯為純數學計算，不需要 React/Vue 的 state management。

**D2：使用 `<input type="range">` + `<input type="number">` 雙向聯動**

Slider 讓使用者快速感受數值變化對成本的影響；number input 讓精確輸入成為可能。兩者保持同步，任一改變即觸發重算。

**D3：公式實作於獨立 JS 函式，不與 DOM 操作混雜**

計算邏輯（`calcEC2`, `calcS3IT`, `calcMSK`, `calcMongoDB`）與 render 邏輯分離，便於驗證數值是否符合 spec。

**D4：MSK 與 MongoDB 方案切換採用 UI 提示而非自動切換**

依 M 值自動切換方案（如超過 655 台自動換 MSK 方案）容易造成使用者困惑。改為：計算時採用對應分段，並在 UI 中顯示「目前使用方案：kafka.m7g.large」等說明，讓使用者理解成本跳升的原因。

## Risks / Trade-offs

- **公式正確性**：分段邊界（91, 828, 545, 600, 655, 945 台等）直接來自 spec，若 spec 更新需手動同步 → 在程式碼中加入常數定義與對應的 spec 章節註解
- **N < 4 的邊界處理**：S3 IT 在 N=1/2/3 各有獨立值，需確保 switch/if 覆蓋完整 → 加入數值驗證測試案例
- **瀏覽器相容性**：使用 ESModule 或 arrow function 等現代語法需 Chrome/Firefox/Safari 近期版本 → 使用廣泛支援語法，不使用 ES2022+ 特性

## Open Questions

（無）
