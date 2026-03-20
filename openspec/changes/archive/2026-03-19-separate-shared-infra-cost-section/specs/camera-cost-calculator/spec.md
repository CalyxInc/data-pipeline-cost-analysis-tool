## MODIFIED Requirements

### Requirement: 系統即時計算單台相機月費並拆解各項成本
工具 SHALL 根據 4 個輸入參數計算所選 pipeline 類型的單台相機月費，並分別顯示 **EC2** 與 **S3 IT** 兩項費用及合計。MSK 與 MongoDB 移至共享基礎設施區塊，不包含在 per-camera 月費合計中。

#### Scenario: DC pipeline 成本計算（N ≥ 4）
- **WHEN** Pipeline Type = DC，N ≥ 4
- **THEN** EC2_DC = (⌈M_DC/91⌉ × $580 + ⌈M_DC/828⌉ × $470) / M_DC；S3_IT_DC = $14.12 + $2.57 × N

#### Scenario: DC pipeline 成本計算（N < 4）
- **WHEN** Pipeline Type = DC，N = 1
- **THEN** S3_IT_DC = $10.02；N=2 時 $15.93；N=3 時 $21.84

#### Scenario: PCV pipeline 成本計算（N ≥ 4）
- **WHEN** Pipeline Type = PCV，N ≥ 4
- **THEN** EC2_PCV = (⌈M_PCV/545⌉ × $580 + ⌈M_PCV/600⌉ × $470) / M_PCV；S3_IT_PCV = $2.35 + $0.43 × N

#### Scenario: 數值驗證（DC 基準）
- **WHEN** N=12, M_DC=340, M_PCV=240, Pipeline Type=DC
- **THEN** EC2=$8.20, S3 IT=$45.00, per-camera 合計=$53.20（不含 MSK、MongoDB）

#### Scenario: 數值驗證（PCV 基準）
- **WHEN** N=12, M_DC=340, M_PCV=240, Pipeline Type=PCV
- **THEN** EC2=$4.38, S3 IT=$7.48, per-camera 合計=$11.86（不含 MSK、MongoDB）

---

### Requirement: MSK 成本依總相機數分段計算
工具 SHALL 依 M = M_DC + M_PCV 自動套用對應 MSK 方案，並在**共享基礎設施區塊**顯示目前使用的方案名稱與**總月費**（非 per-camera 分攤值）。

#### Scenario: M ≤ 945（m7g.large 方案）
- **WHEN** M_DC + M_PCV ≤ 945
- **THEN** MSK 總月費 = $1,238.88，UI 顯示「kafka.m7g.large」

#### Scenario: M > 945（m7g.xlarge 方案）
- **WHEN** M_DC + M_PCV > 945
- **THEN** MSK 總月費 = $1,997.76，UI 顯示「kafka.m7g.xlarge（升級）」

---

### Requirement: MongoDB 成本依總相機數分段計算
工具 SHALL 依 M = M_DC + M_PCV 自動套用對應 MongoDB tier，並在**共享基礎設施區塊**顯示目前使用的 tier 與**總月費**（非 per-camera 分攤值）。

#### Scenario: M ≤ 900（M50 tier）
- **WHEN** M_DC + M_PCV ≤ 900
- **THEN** MongoDB 總月費 = $6,019，UI 顯示「M50」

#### Scenario: M > 900（M60 tier）
- **WHEN** M_DC + M_PCV > 900
- **THEN** MongoDB 總月費 = $10,600，UI 顯示「M60（升級）」

## ADDED Requirements

### Requirement: 參數 slider 依 Pipeline Type 動態顯示
工具 SHALL 在 Section 01 中根據目前選取的 Pipeline Type，只顯示與該 pipeline 相關的相機數量 slider：DC tab 只顯示 M_DC slider，PCV tab 只顯示 M_PCV slider。

#### Scenario: 選取 DC pipeline 時只顯示 M_DC slider
- **WHEN** Pipeline Type = DC
- **THEN** M_DC slider 與 number input 顯示；M_PCV slider 與 number input 隱藏

#### Scenario: 選取 PCV pipeline 時只顯示 M_PCV slider
- **WHEN** Pipeline Type = PCV
- **THEN** M_PCV slider 與 number input 顯示；M_DC slider 與 number input 隱藏

#### Scenario: 切換 Pipeline Type 時 slider 即時切換
- **WHEN** 使用者從 DC 切換至 PCV（或反之）
- **THEN** 對應 slider 立即顯示或隱藏，且成本結果使用切換後 pipeline 的相機數重新計算

### Requirement: 共享基礎設施月費獨立區塊
工具 SHALL 在 per-camera 月費區塊之後、艦隊總成本區塊之前，顯示一個獨立的「共享基礎設施月費」區塊，列出 MSK 與 MongoDB 的**總月費**（整個部署，非單台分攤）。

#### Scenario: 共享基礎設施區塊顯示正確總月費
- **WHEN** M_DC=340, M_PCV=240（M=580）
- **THEN** 區塊顯示 MSK 總月費 = $1,238.88（kafka.m7g.large），MongoDB 總月費 = $6,019（M50）

#### Scenario: tier 升級時共享基礎設施區塊即時更新
- **WHEN** M_DC + M_PCV 從 ≤945 增加至 >945
- **THEN** MSK 費用及方案標籤即時更新為 xlarge tier

#### Scenario: 區塊標題與編號
- **WHEN** 頁面載入
- **THEN** 區塊標題為「02 共享基礎設施 · Shared Infrastructure」，原艦隊總成本區塊標題更新為「03 艦隊總成本 · Fleet Total Cost」
