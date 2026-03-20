## Why

EC2 算力欄位下方顯示的實例數量標籤（如 `g6.xlarge × 1 + m7g.4xlarge × 1`）為靜態文字，不會隨 M_DC / M_PCV 相機數量變動而更新。實際上 EC2 成本公式已依 ⌈M/threshold⌉ 動態計算實例個數，但 UI 標籤沒有反映這個計算結果，導致顯示與計算脫節。

## What Changes

- EC2 算力欄位的副標籤改為動態計算並顯示當前所需實例數量
  - DC pipeline：g6.xlarge 數量 = ⌈M_DC / 91⌉，m7g.4xlarge 數量 = ⌈M_DC / 828⌉
  - PCV pipeline：g6.xlarge 數量 = ⌈M_PCV / 545⌉，m7g.4xlarge 數量 = ⌈M_PCV / 600⌉
- 每次輸入參數（M_DC、M_PCV、Pipeline Type）改變時，標籤隨成本結果同步更新

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `camera-cost-calculator`：新增需求 — EC2 實例數量標籤 SHALL 依當前輸入參數動態顯示，而非固定為靜態文字

## Impact

- `index.html`：EC2 成本計算段落，在 render/update 函式中補充標籤動態更新邏輯
- 無 API 變更、無新依賴
