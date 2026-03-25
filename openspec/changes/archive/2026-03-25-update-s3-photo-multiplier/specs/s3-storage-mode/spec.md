## MODIFIED Requirements

### Requirement: S3 Standard (Cropped) 成本計算公式
當儲存方案為 S3 Standard (Cropped) 時，工具 SHALL 使用以下公式計算 S3 成本：
- DC pipeline：S3_Std_DC(N) = S3_IT_DC(N) × 0.15
- PCV pipeline：S3_Std_PCV(N) = S3_IT_PCV(N) × 0.15

#### Scenario: S3 Standard DC 成本（N >= 4）
- **WHEN** 儲存方案 = S3 Standard (Cropped)，Pipeline Type = DC，N >= 4
- **THEN** S3 成本 = ($9.41 + $1.72 × N) × 0.15

#### Scenario: S3 Standard DC 成本（N < 4）
- **WHEN** 儲存方案 = S3 Standard (Cropped)，Pipeline Type = DC，N = 1
- **THEN** S3 成本 = $6.69 × 0.15 = $1.0035；N=2 時 $10.63 × 0.15 = $1.5945；N=3 時 $14.57 × 0.15 = $2.1855

#### Scenario: S3 Standard PCV 成本（N >= 4）
- **WHEN** 儲存方案 = S3 Standard (Cropped)，Pipeline Type = PCV，N >= 4
- **THEN** S3 成本 = ($0.77 + $0.15 × N) × 0.15

#### Scenario: 數值驗證（DC 基準，S3 Standard）
- **WHEN** 儲存方案 = S3 Standard (Cropped)，N=12, Pipeline Type=DC
- **THEN** S3 成本 = ($9.41 + $1.72 × 12) × 0.15 = $30.05 × 0.15 = $4.5075

#### Scenario: 數值驗證（PCV 基準，S3 Standard）
- **WHEN** 儲存方案 = S3 Standard (Cropped)，N=12, Pipeline Type=PCV
- **THEN** S3 成本 = ($0.77 + $0.15 × 12) × 0.15 = $2.57 × 0.15 = $0.3855
