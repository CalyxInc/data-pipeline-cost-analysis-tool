## MODIFIED Requirements

### Requirement: 系統即時計算單台相機月費並拆解各項成本
工具 SHALL 根據 4 個輸入參數及當前選擇的 S3 儲存方案，計算所選 pipeline 類型的單台相機月費，並分別顯示 **EC2**、**S3**、**MSK** 與 **MongoDB** 四項費用及合計。S3 成本 SHALL 依全域儲存方案 tab 的選擇，使用對應的計算公式（S3 IT 或 S3 Standard × 0.15）。

#### Scenario: DC pipeline 成本計算（N ≥ 4）
- **WHEN** Pipeline Type = DC，N ≥ 4
- **THEN** EC2_DC = (⌈M_DC/91⌉ × $580 + ⌈M_DC/828⌉ × $470) / M_DC；S3 = calcS3_DC(N)（依儲存方案）；MSK_DC = $2.00；MongoDB_DC = $11.28

#### Scenario: DC pipeline 成本計算（N < 4）
- **WHEN** Pipeline Type = DC，N = 1
- **THEN** S3 = calcS3_DC(N)（依儲存方案，IT 時 $10.02，Standard 時 $1.503）；N=2 時 IT $15.93 / Std $2.3895；N=3 時 IT $21.84 / Std $3.276；MSK_DC = $2.00（所有 N 值固定）；MongoDB_DC = $11.28（所有 N 值固定）

#### Scenario: PCV pipeline 成本計算（N ≥ 4）
- **WHEN** Pipeline Type = PCV，N ≥ 4
- **THEN** EC2_PCV = (⌈M_PCV/545⌉ × $580 + ⌈M_PCV/600⌉ × $470) / M_PCV；S3 = calcS3_PCV(N)（依儲存方案）；MSK_PCV = $0.33；MongoDB_PCV = $1.88

#### Scenario: 數值驗證（DC 基準，S3 IT 模式）
- **WHEN** N=12, M_DC=340, M_PCV=240, Pipeline Type=DC，儲存方案 = S3 IT
- **THEN** EC2=$8.20, S3=$45.00, MSK=$2.00, MongoDB=$11.28, per-camera 合計=$66.48

#### Scenario: 數值驗證（DC 基準，S3 Standard 模式）
- **WHEN** N=12, M_DC=340, M_PCV=240, Pipeline Type=DC，儲存方案 = S3 Standard
- **THEN** EC2=$8.20, S3=$6.744, MSK=$2.00, MongoDB=$11.28, per-camera 合計=$28.22

#### Scenario: 數值驗證（PCV 基準，S3 IT 模式）
- **WHEN** N=12, M_DC=340, M_PCV=240, Pipeline Type=PCV，儲存方案 = S3 IT
- **THEN** EC2=$4.38, S3=$7.48, MSK=$0.33, MongoDB=$1.88, per-camera 合計=$14.07

#### Scenario: 數值驗證（PCV 基準，S3 Standard 模式）
- **WHEN** N=12, M_DC=340, M_PCV=240, Pipeline Type=PCV，儲存方案 = S3 Standard
- **THEN** EC2=$4.38, S3=$1.1265, MSK=$0.33, MongoDB=$1.88, per-camera 合計=$7.72

#### Scenario: 切換儲存方案時即時更新
- **WHEN** 使用者切換全域儲存方案 tab
- **THEN** Section 01 的 S3 成本與合計即時重新計算，EC2/MSK/MongoDB 不變
