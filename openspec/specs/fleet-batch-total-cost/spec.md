# fleet-batch-total-cost

## Purpose

本規格定義「艦隊批次總成本」功能的行為，包含：多批次相機群組管理、各批次獨立的 EC2 與 S3 IT 成本計算、以艦隊全體相機總量計算的 MSK 與 MongoDB 成本、以及艦隊月費合計與成本拆解顯示。

## Requirements

### Requirement: 兩個計算區塊之間有明顯的視覺區隔與說明標題

工具 SHALL 在「單台相機月費」區塊與「艦隊總成本」區塊前各顯示一個 section label，清楚說明各自的用途與計算單位。

#### Scenario: Section labels 顯示
- **WHEN** 頁面載入
- **THEN** 「單台相機月費」區塊前顯示標題（如「01 · Per Camera Cost」）；「艦隊總成本」區塊前顯示標題（如「02 · Fleet Total Cost」），兩者之間有足夠的視覺間距以產生明顯區隔

---

### Requirement: 使用者可管理多個相機批次

工具 SHALL 在主 grid 下方提供批次管理介面，允許使用者新增與刪除批次。

#### Scenario: 預設狀態
- **WHEN** 頁面初始載入
- **THEN** Fleet Total Cost 區塊顯示一個預設批次（N=12, M_DC=340, M_PCV=240）

#### Scenario: 新增批次
- **WHEN** 使用者點擊「+ Add Batch」按鈕
- **THEN** 批次列表新增一列，預設值為 N=1, M_DC=0, M_PCV=0，艦隊總成本即時重新計算

#### Scenario: 刪除批次
- **WHEN** 使用者點擊某批次的刪除按鈕
- **THEN** 該批次從列表移除，至少保留 1 個批次（只剩 1 批時刪除按鈕應 disable 或隱藏），艦隊總成本即時重新計算

#### Scenario: 修改批次參數
- **WHEN** 使用者修改任一批次的 N、M_DC 或 M_PCV 值
- **THEN** 所有受影響的成本即時重新計算並更新顯示

---

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

### Requirement: 系統依艦隊全體總 M 計算 MSK 與 MongoDB 成本

工具 SHALL 依所有批次 M_DC + M_PCV 之總和計算 MSK 與 MongoDB 月費各一份，不依批次重複計算。

#### Scenario: 艦隊 MSK 成本計算（fleet M ≤ 945）
- **WHEN** 所有批次的 M_DC + M_PCV 加總 ≤ 945
- **THEN** Fleet MSK = $1,238.88，UI 顯示「kafka.m7g.large」

#### Scenario: 艦隊 MSK 成本計算（fleet M > 945）
- **WHEN** 所有批次的 M_DC + M_PCV 加總 > 945
- **THEN** Fleet MSK = $1,997.76，UI 顯示「kafka.m7g.xlarge（升級）」

#### Scenario: 艦隊 MongoDB 成本計算（fleet M ≤ 900）
- **WHEN** 所有批次的 M_DC + M_PCV 加總 ≤ 900
- **THEN** Fleet MongoDB = $6,019，UI 顯示「M50」

#### Scenario: 艦隊 MongoDB 成本計算（fleet M > 900）
- **WHEN** 所有批次的 M_DC + M_PCV 加總 > 900
- **THEN** Fleet MongoDB = $10,600，UI 顯示「M60（升級）」

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

#### Scenario: 各項拆解顯示
- **WHEN** 艦隊總費用計算完成
- **THEN** 結果區塊分別顯示：EC2 合計、S3 合計（標籤依儲存方案動態）、MSK、MongoDB 各項金額，以及 Fleet Total
