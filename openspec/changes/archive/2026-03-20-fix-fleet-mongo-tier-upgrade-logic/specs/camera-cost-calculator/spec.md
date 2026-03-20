## MODIFIED Requirements

### Requirement: MongoDB 成本依等效單位分段計算
工具 SHALL 依 W = M_DC×6 + M_PCV 自動套用對應 MongoDB tier，並在**共享基礎設施區塊**及**艦隊總成本區塊**顯示目前使用的 tier 與**總月費**（非 per-camera 分攤值）。

#### Scenario: W ≤ 2700（M50 tier）
- **WHEN** M_DC×6 + M_PCV ≤ 2,700
- **THEN** MongoDB 總月費 = $6,019，UI 顯示「M50」

#### Scenario: W > 2700（M60 tier）
- **WHEN** M_DC×6 + M_PCV > 2,700
- **THEN** MongoDB 總月費 = $10,600，UI 顯示「M60（升級）」

#### Scenario: 數值驗證（M50 邊界）
- **WHEN** M_DC=450, M_PCV=0（W = 2,700）
- **THEN** MongoDB tier = M50（W 不超過 2,700）

#### Scenario: 數值驗證（M60 觸發）
- **WHEN** M_DC=451, M_PCV=0（W = 2,706）
- **THEN** MongoDB tier = M60（升級），總月費 = $10,600

#### Scenario: 數值驗證（純 PCV 基準）
- **WHEN** M_DC=0, M_PCV=900（W = 900）
- **THEN** MongoDB tier = M50（與舊邏輯結果相同）
