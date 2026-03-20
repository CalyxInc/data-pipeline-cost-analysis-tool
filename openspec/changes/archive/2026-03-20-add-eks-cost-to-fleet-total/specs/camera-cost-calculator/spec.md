## ADDED Requirements

### Requirement: EKS 節點成本顯示於艦隊總成本區塊
工具 SHALL 在 Section 3 艦隊總成本區塊顯示 EKS 固定成本行，包含 Tokyo 與 Oregon 兩個 production cluster 的節點費用合計，以及各 cluster 的機型細項。

#### Scenario: EKS 行顯示兩個 cluster 合計
- **WHEN** 頁面載入或任意 slider 調整
- **THEN** Section 3 顯示 EKS 行，金額固定為 $2,107.99，不隨相機數量或 N 變動

#### Scenario: Tokyo cluster 細項展示
- **WHEN** 頁面載入
- **THEN** EKS 行下方顯示 Tokyo（ap-northeast-1）細項：t4g.medium × 28 = $883.01、m6a.xlarge × 1 = $162.94、Cluster 管理費 = $72.00，小計 $1,117.94

#### Scenario: Oregon cluster 細項展示
- **WHEN** 頁面載入
- **THEN** EKS 行下方顯示 Oregon（us-west-2）細項：t4g.medium × 14 = $343.39、t4g.xlarge × 1 = $98.11、m7g.4xlarge × 1 = $476.54、Cluster 管理費 = $72.00，小計 $990.05

#### Scenario: 艦隊月費合計含 EKS
- **WHEN** 任意有效輸入
- **THEN** 艦隊月費合計 = EC2合計 + S3 IT合計 + MSK + MongoDB Atlas + EKS（$2,107.99）
