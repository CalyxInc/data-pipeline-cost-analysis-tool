## MODIFIED Requirements

### Requirement: 系統依批次計算 EC2 與 S3 IT 成本

工具 SHALL 對每個批次獨立套用現有 EC2 與 S3 公式，計算該批次的 EC2 與 S3 月費小計。S3 成本 SHALL 依全域儲存方案 tab 的選擇使用對應公式。

#### Scenario: 批次 EC2 成本計算
- **WHEN** 某批次含 mDC 台 DC 相機與 mPCV 台 PCV 相機
- **THEN** 批次 EC2 費用 = calcEC2_DC(mDC).cost × mDC + calcEC2_PCV(mPCV).cost × mPCV（USD/月）；若 mDC=0 則 DC 部分為 $0，mPCV=0 同理

#### Scenario: 批次 S3 成本計算
- **WHEN** 某批次的上線月數為 n，含 mDC 台 DC 相機與 mPCV 台 PCV 相機
- **THEN** 批次 S3 費用 = calcS3_DC(n) × mDC + calcS3_PCV(n) × mPCV（使用當前儲存方案對應的 S3 計算函數）

#### Scenario: 批次 EC2+S3 小計顯示
- **WHEN** 任一輸入參數更新
- **THEN** 各批次列顯示該批次的 EC2 + S3 小計金額（USD/月）

---

### Requirement: 工具顯示艦隊月費合計與成本拆解

工具 SHALL 顯示艦隊當月總費用，並拆解為 EC2 合計、S3 合計、MSK、MongoDB 四項。S3 合計的標籤 SHALL 依儲存方案動態顯示。

#### Scenario: 艦隊總費用計算
- **WHEN** 使用者設定至少一個批次
- **THEN** Fleet Total = Σ(批次 EC2) + Σ(批次 S3) + MSK_fleet + MongoDB_fleet（USD/月）

#### Scenario: 數值驗證（單批次基準，S3 IT 模式）
- **WHEN** 單一批次 N=12, M_DC=340, M_PCV=240，儲存方案 = S3 IT
- **THEN** 批次 EC2 = $3,838.32；批次 S3 = $17,088.80（DC $44.96×340 + PCV $7.51×240）；MSK_fleet = $1,238.88；MongoDB_fleet = $6,019.00；Fleet Total = $28,185.00

#### Scenario: 數值驗證（單批次基準，S3 Standard 模式）
- **WHEN** 單一批次 N=12, M_DC=340, M_PCV=240，儲存方案 = S3 Standard
- **THEN** 批次 EC2 = $3,838.32；批次 S3 = $2,563.32（DC $6.744×340 + PCV $1.1265×240）；MSK_fleet = $1,238.88；MongoDB_fleet = $6,019.00；Fleet Total = $13,659.52

#### Scenario: S3 合計標籤動態顯示
- **WHEN** 儲存方案 = S3 IT
- **THEN** Section 03 顯示「S3 IT 合計」
- **WHEN** 儲存方案 = S3 Standard (Cropped)
- **THEN** Section 03 顯示「S3 Std 合計」

#### Scenario: 切換儲存方案時艦隊總成本即時更新
- **WHEN** 使用者切換全域儲存方案 tab
- **THEN** Section 03 的 S3 合計與 Fleet Total 即時重新計算，EC2/MSK/MongoDB/EKS 不變
