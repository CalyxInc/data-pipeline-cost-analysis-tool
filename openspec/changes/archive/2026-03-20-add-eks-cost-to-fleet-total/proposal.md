## Why

Section 3 的艦隊月費合計目前缺少 EKS 節點成本。Production 環境有兩個 cluster（Tokyo ap-northeast-1 與 Oregon us-west-2），兩者合計 $2,107.99/月，屬於固定基礎設施費用，應納入艦隊總成本以反映真實部署支出。

## What Changes

- Section 3 新增 **EKS** 行，顯示兩個 cluster 合計費用 $2,107.99
- EKS 行下方展示兩個 cluster 的細項：
  - **Tokyo**（ap-northeast-1）：t4g.medium×28、m6a.xlarge×1、Cluster 管理費 → $1,117.94
  - **Oregon**（us-west-2）：t4g.medium×14、t4g.xlarge×1、m7g.4xlarge×1、Cluster 管理費 → $990.05
- 艦隊月費合計（hero total）加入 EKS 費用
- 比例條與百分比同步更新

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `camera-cost-calculator`: Section 3 艦隊總成本新增 EKS 固定成本行，含兩個 cluster 細項展示；合計公式加入 EKS。

## Impact

- `index.html`: Section 3 HTML（新增 EKS cost row 含 cluster 細項）、`renderFleet` 計算邏輯、EKS 常數定義
- `openspec/specs/camera-cost-calculator/spec.md`: 新增 EKS fleet cost requirement
