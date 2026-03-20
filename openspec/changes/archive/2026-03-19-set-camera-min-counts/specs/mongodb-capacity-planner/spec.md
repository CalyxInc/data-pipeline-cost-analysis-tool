## MODIFIED Requirements

### Requirement: MongoDB 容量規劃使用獨立輸入參數
工具 SHALL 在容量規劃子區塊提供兩個獨立的輸入控制項（DC 相機數 340–3000、PCV 相機數 240–10000），與 Section 01 的 slider 完全獨立，互不影響。

#### Scenario: 調整容量規劃 slider 不影響 Section 01
- **WHEN** 使用者調整 MongoDB 容量規劃子區塊的 DC 或 PCV slider
- **THEN** Section 01 的 slider 數值保持不變，Section 01 的 per-camera 成本保持不變

#### Scenario: 調整 Section 01 slider 不影響 MongoDB 容量規劃
- **WHEN** 使用者調整 Section 01 的 M_DC 或 M_PCV slider
- **THEN** MongoDB 容量規劃子區塊的 slider 數值保持不變，容量條保持不變

#### Scenario: MongoDB DC 不可低於最小值 340
- **WHEN** 使用者嘗試將 MongoDB DC 設為低於 340 的數值
- **THEN** 數值被截斷至 340

#### Scenario: MongoDB PCV 不可低於最小值 240
- **WHEN** 使用者嘗試將 MongoDB PCV 設為低於 240 的數值
- **THEN** 數值被截斷至 240
