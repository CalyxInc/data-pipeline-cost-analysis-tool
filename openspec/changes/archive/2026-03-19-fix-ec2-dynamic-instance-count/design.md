## Context

`index.html` 的 EC2 算力欄位下方顯示一行副標籤（如 `g6.xlarge × 1 + m7g.4xlarge × 1`），目前為靜態字串，硬寫在 HTML 中。EC2 成本計算函式已正確使用 `Math.ceil(M / threshold)` 計算實例數，但計算結果只用於金額，未回寫至標籤。

## Goals / Non-Goals

**Goals:**
- 讓 EC2 副標籤隨每次參數更新即時反映當前所需 g6.xlarge 與 m7g.4xlarge 實例數量

**Non-Goals:**
- 修改成本計算公式或常數
- 更動其他成本項目（S3、MSK、MongoDB）的標籤邏輯

## Decisions

**在 JS 計算函式中計算並回傳實例數，再更新 DOM 標籤**

計算函式（`calcDC` / `calcPCV` 或統一的 `calculateCosts`）已知道 M 值與 threshold，直接在函式內計算：

```
g6Count  = Math.ceil(M / g6Threshold)
m7gCount = Math.ceil(M / m7gThreshold)
```

計算完成後，用 `element.textContent` 更新標籤字串：

```
`g6.xlarge × ${g6Count} + m7g.4xlarge × ${m7gCount}`
```

**選擇此方案而非在 HTML template 中寫 binding 的原因：** `index.html` 是單一 vanilla JS 檔案，無框架，所有 DOM 更新已集中在同一個 render/update 函式中，保持一致風格最省事。

## Risks / Trade-offs

- **數值與標籤短暫不同步**（風險極低）→ 標籤更新與金額更新在同一個函式呼叫中完成，不存在非同步問題
- **threshold 常數重複定義**（可能）→ 確認 threshold 已定義為具名常數（而非 magic number），直接重用，不另起變數

## Migration Plan

純前端改動，無 build 步驟，無部署流程。修改後重新整理瀏覽器即可驗證。
