## Context

現有 `index.html` 以灰白底色、標準 HTML input 元件快速實作，缺乏視覺層次。計算邏輯完整正確，需保留。此次使用 `frontend-design` skill 重新設計視覺層，以資料儀表板風格呈現成本拆解。

## Goals / Non-Goals

**Goals:**
- 產出具有專業質感的單頁介面，有清楚的視覺層次與資料對比感
- 保留所有 JS 計算函式（calcEC2、calcS3IT、calcMSK、calcMongoDB、calcTotal）完全不變
- 維持零依賴、零 build、單一 `index.html` 的交付形式

**Non-Goals:**
- 不更動任何計算邏輯或公式常數
- 不新增功能（無圖表、無歷史記錄、無匯出）
- 不引入外部 CSS framework 或 JS library

## Decisions

**D1：委由 frontend-design skill 主導視覺決策**

frontend-design skill 具備生成高質感、非泛型 AI 風格介面的能力。設計方向、配色、版型由 skill 自主決定，不預先限定風格，給予最大創作空間。

**D2：計算邏輯區塊完整複製，不重寫**

為避免引入 regression，`<script>` 中的所有常數定義與計算函式直接從現有 `index.html` 複製，僅替換 HTML 結構與 CSS。

## Risks / Trade-offs

- [計算邏輯中斷] 重寫 HTML 時若 element ID 對應到錯誤的 JS selector → 複製 JS 後逐一確認 `getElementById` 對應的 ID 存在於新 HTML 中
- [視覺過度複雜] frontend-design skill 若生成過於華麗的設計，反而降低可讀性 → 實作後以「數字是否清楚可讀」為標準評估
