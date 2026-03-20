## MODIFIED Requirements

### Requirement: 系統即時計算單台相機月費並拆解各項成本
工具 SHALL 根據 4 個輸入參數計算所選 pipeline 類型的單台相機月費，並分別顯示 **EC2**、**S3 IT**、**MSK** 與 **MongoDB** 四項費用及合計。

#### Scenario: DC pipeline 成本計算（N ≥ 4）
- **WHEN** Pipeline Type = DC，N ≥ 4
- **THEN** EC2_DC = (⌈M_DC/91⌉ × $580 + ⌈M_DC/828⌉ × $470) / M_DC；S3_IT_DC = $14.12 + $2.57 × N；MSK_DC = $2.00；MongoDB_DC = $11.28

#### Scenario: DC pipeline 成本計算（N < 4）
- **WHEN** Pipeline Type = DC，N = 1
- **THEN** S3_IT_DC = $10.02；N=2 時 $15.93；N=3 時 $21.84；MSK_DC = $2.00（所有 N 值固定）；MongoDB_DC = $11.28（所有 N 值固定）

#### Scenario: PCV pipeline 成本計算（N ≥ 4）
- **WHEN** Pipeline Type = PCV，N ≥ 4
- **THEN** EC2_PCV = (⌈M_PCV/545⌉ × $580 + ⌈M_PCV/600⌉ × $470) / M_PCV；S3_IT_PCV = $2.35 + $0.43 × N；MSK_PCV = $0.33；MongoDB_PCV = $1.88

#### Scenario: 數值驗證（DC 基準）
- **WHEN** N=12, M_DC=340, M_PCV=240, Pipeline Type=DC
- **THEN** EC2=$8.20, S3 IT=$45.00, MSK=$2.00, MongoDB=$11.28, per-camera 合計=$66.48

#### Scenario: 數值驗證（PCV 基準）
- **WHEN** N=12, M_DC=340, M_PCV=240, Pipeline Type=PCV
- **THEN** EC2=$4.38, S3 IT=$7.48, MSK=$0.33, MongoDB=$1.88, per-camera 合計=$14.07
