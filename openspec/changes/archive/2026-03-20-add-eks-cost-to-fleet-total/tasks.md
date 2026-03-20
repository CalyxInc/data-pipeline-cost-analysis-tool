## 1. Constants

- [x] 1.1 定義 Tokyo cluster 常數：t4g.medium×28 @ $31.536、m6a.xlarge×1 @ $162.936、Cluster 管理費 $72
- [x] 1.2 定義 Oregon cluster 常數：t4g.medium×14 @ $24.528、t4g.xlarge×1 @ $98.112、m7g.4xlarge×1 @ $476.544、Cluster 管理費 $72
- [x] 1.3 定義 EKS_TOKYO_TOTAL = 1117.944、EKS_OREGON_TOTAL = 990.048、EKS_TOTAL = 2107.992

## 2. Fleet Calculation

- [x] 2.1 在 `renderFleet` 中加入 EKS_TOTAL 到 fleet total
- [x] 2.2 將 EKS_TOTAL 加入比例條陣列（`vals`、`barIds`、`pctIds`）

## 3. Section 3 UI

- [x] 3.1 新增 EKS cost row（含 `id="fleet-eks"`、`id="fleet-pct-eks"`、`id="fleet-bar-eks"`）
- [x] 3.2 EKS row 下方加入 Tokyo 細項（cluster 標題 + 三行機型明細 + Cluster 管理費）
- [x] 3.3 EKS row 下方加入 Oregon 細項（cluster 標題 + 四行機型明細 + Cluster 管理費）
- [x] 3.4 在 `renderFleet` 中填入 fleet-eks 數值與百分比

## 4. Validation

- [x] 4.1 驗證 EKS_TOKYO_TOTAL = 883.008 + 162.936 + 72 = 1117.944
- [x] 4.2 驗證 EKS_OREGON_TOTAL = 343.392 + 98.112 + 476.544 + 72 = 990.048
- [x] 4.3 驗證 EKS_TOTAL = 1117.944 + 990.048 = 2107.992
- [x] 4.4 驗證調整 slider 後 EKS 行金額維持不變
