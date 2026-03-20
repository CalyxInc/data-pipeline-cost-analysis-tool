## MODIFIED Requirements

### Requirement: 使用者可調整 4 個輸入參數
工具 SHALL 提供以下 4 個可互動輸入控制項：
- **N**（上線月數）：整數，範圍 1–24
- **M_DC**（DC 相機總數）：整數，範圍 340–3000
- **M_PCV**（PCV 相機總數）：整數，範圍 240–10000
- **Pipeline Type**：DC 或 PCV 二選一

#### Scenario: 調整 slider 時數值即時同步
- **WHEN** 使用者拖動任一 slider
- **THEN** 對應的 number input 數值同步更新，且成本結果即時重新計算

#### Scenario: 直接輸入數字時 slider 同步
- **WHEN** 使用者在 number input 中輸入有效數值
- **THEN** 對應的 slider 位置同步更新，且成本結果即時重新計算

#### Scenario: 輸入超出範圍的數值
- **WHEN** 使用者輸入小於最小值或大於最大值的數字
- **THEN** 數值被截斷至有效範圍邊界，成本結果使用截斷後數值計算

#### Scenario: M_DC 不可低於最小值 340
- **WHEN** 使用者嘗試將 M_DC 設為低於 340 的數值
- **THEN** 數值被截斷至 340

#### Scenario: M_PCV 不可低於最小值 240
- **WHEN** 使用者嘗試將 M_PCV 設為低於 240 的數值
- **THEN** 數值被截斷至 240
