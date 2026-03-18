## Context

`index.html` 是淺色主題的單頁試算工具。cost breakdown 各 row 目前顯示金額與比例 bar，但缺少數字百分比。標題（panel-header、cost-name）字體偏小且用 `var(--muted)` 淺灰色，對比不足。

## Goals / Non-Goals

**Goals:**
- 每個 cost row 顯示該項 / 總費用的百分比（動態隨參數更新）
- 加大 panel header 字體、加深文字顏色
- 加大 cost-name 字體、加深文字顏色

**Non-Goals:**
- 不更動計算邏輯
- 不引入外部依賴

## Decisions

**D1：百分比顯示於金額下方或旁邊，使用次要文字樣式**

百分比作為輔助資訊，視覺優先順序低於金額。放在金額右側以小字顯示（例如 `$7.51  32.9%`），或放在金額下方。選擇右側同行，保持 row 高度不變。

**D2：百分比由 render() 計算並更新對應 DOM 元素**

在每個 cost row 加入 `<span id="pct-ec2">` 等元素，render() 結束時計算 `val/total*100` 並更新。

**D3：標題顏色改用 `var(--text)` 或更深的固定色**

目前 panel-header 用 `var(--muted)`（`#7a90a8`），改為 `var(--text)`（`#1e2d3d`）並加大 font-size。cost-name 同樣加深。

## Risks / Trade-offs

- [total=0 除以零] 初始化時 total 不為 0（render 在 init 時即呼叫），無風險
- [百分比加總非 100%] 因各項使用浮點數，加總可能為 99.9% 或 100.1%，屬正常現象，不需修正
