## Context

Section 3 目前有 EC2、S3 IT、MSK、MongoDB 四個 cost row。EKS 是兩個固定 production cluster 的節點費用，不隨相機數量變動。每個 cluster 包含多個 node group，使用者希望看到各機型的數量 × 單價細項，不需要互動。

## Goals / Non-Goals

**Goals:**
- 新增 EKS cost row（固定 $2,107.99）至 Section 3
- EKS row 下方顯示兩個 cluster 的靜態細項（機型 × 數量 × 單價 = 小計、Cluster 管理費）
- 艦隊總費加入 EKS
- 比例條與百分比含 EKS

**Non-Goals:**
- EKS 成本不隨任何 slider 變動（純靜態）
- 不加入 Section 1 per-camera 分攤
- 不加入 Section 2 共享基礎設施

## Decisions

**1. 所有 EKS 數字以常數定義**

```
// Tokyo (ap-northeast-1)
EKS_TOKYO_T4G_MEDIUM_COUNT  = 28,  RATE = 31.536  → 883.008
EKS_TOKYO_M6A_XLARGE_COUNT  = 1,   RATE = 162.936 → 162.936
EKS_CLUSTER_FEE             = 72.00  (0.10/hr × 720hr，兩個 cluster 各一)
EKS_TOKYO_TOTAL             = 883.008 + 162.936 + 72.00 = 1117.944

// Oregon (us-west-2)
EKS_OREGON_T4G_MEDIUM_COUNT = 14,  RATE = 24.528  → 343.392
EKS_OREGON_T4G_XLARGE_COUNT = 1,   RATE = 98.112  → 98.112
EKS_OREGON_M7G_4XLARGE_COUNT= 1,   RATE = 476.544 → 476.544
EKS_OREGON_TOTAL            = 343.392 + 98.112 + 476.544 + 72.00 = 990.048

EKS_TOTAL = EKS_TOKYO_TOTAL + EKS_OREGON_TOTAL = 2107.992
```

**2. 細項 UI 使用靜態 sub-rows**
- EKS row 的 `cost-left` 下方嵌入靜態 HTML sub-section，顯示兩個 cluster 各自的明細
- 使用現有 `cost-sub` 樣式呈現細項文字，不需要新增 CSS class
- 格式：`機型 × N  $rate/mo = $subtotal`
- 與 EC2 detail（`g6.xlarge × 4 + m7g.4xlarge × 1`）的 sub-label 風格一致

**3. `renderFleet` 加入 EKS**
- EKS 為常數，`renderFleet` 直接讀取 `EKS_TOTAL`
- fleet total = ec2 + s3 + msk + mongo + EKS_TOTAL
- 比例條陣列加入 EKS

## Risks / Trade-offs

- [Risk] Node group 組成變動時需手動更新常數 → 符合 source of truth 的管理模式（開新 change 同步）
- [Risk] EKS 佔總成本比例高，加入後其他項目百分比會下降 → 預期行為，真實反映成本結構
