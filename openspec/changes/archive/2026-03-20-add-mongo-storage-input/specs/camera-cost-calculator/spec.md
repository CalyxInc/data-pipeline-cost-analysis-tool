## MODIFIED Requirements

### Requirement: MongoDB 成本依等效單位分段計算
工具 SHALL 依 W = M_DC×6 + M_PCV 自動套用對應 MongoDB tier，並在**共享基礎設施區塊**及**艦隊總成本區塊**顯示目前使用的 tier 與**總月費**（非 per-camera 分攤值）。MongoDB 總月費 SHALL 根據容量規劃區塊的 storage 輸入動態計算，而非使用固定常數。

#### Scenario: W ≤ 2700（M50 tier）
- **WHEN** M_DC×6 + M_PCV ≤ 2,700
- **THEN** MongoDB 總月費 = calcMongoMonthly("M50")（根據當前 storage 輸入計算），UI 顯示「M50」

#### Scenario: W > 2700（M60 tier）
- **WHEN** M_DC×6 + M_PCV > 2,700
- **THEN** MongoDB 總月費 = calcMongoMonthly("M60")（根據當前 storage 輸入計算），UI 顯示「M60（升級）」

#### Scenario: 預設 storage 時總月費與原值一致
- **WHEN** storage = 2215 GB（預設值），M_DC=340, M_PCV=240
- **THEN** MongoDB 總月費 = $6,019（M50），與變更前一致

#### Scenario: 調整 storage 時共享基礎設施區塊即時更新
- **WHEN** 使用者調整 storage 輸入
- **THEN** Section 02 共享基礎設施的 MongoDB 總月費即時重新計算並更新

#### Scenario: 調整 storage 時 per-camera 成本即時更新
- **WHEN** 使用者調整 storage 輸入
- **THEN** Section 01 的 per-camera MongoDB 分攤成本即時重新計算（MongoDB 月費 ÷ 總相機數 × 權重比例）

#### Scenario: 調整 storage 時艦隊總成本即時更新
- **WHEN** 使用者調整 storage 輸入
- **THEN** Section 03 艦隊總成本中的 MongoDB 成本行即時重新計算

#### Scenario: 數值驗證（M50 邊界）
- **WHEN** M_DC=450, M_PCV=0（W = 2,700），storage = 2215 GB
- **THEN** MongoDB tier = M50（W 不超過 2,700），月費 = $6,019

#### Scenario: 數值驗證（M60 觸發）
- **WHEN** M_DC=451, M_PCV=0（W = 2,706），storage = 2215 GB
- **THEN** MongoDB tier = M60（升級），總月費 = $10,600
