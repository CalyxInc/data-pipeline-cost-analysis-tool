# MSK Capacity Planner

## Purpose

A sub-section embedded within the Section 02 shared infrastructure block of the Camera Cost Calculator, providing an independent capacity planning view for MSK (Amazon Managed Streaming for Kafka). Displays tier cards, independent DC/PCV sliders, and a stacked capacity bar that visualise broker utilisation without affecting the per-camera cost calculations in Section 01.

---

## Requirements

### Requirement: MSK 容量規劃子區塊嵌入 Section 02
工具 SHALL 在 Section 02 的 MSK cost row 下方顯示一個獨立的容量規劃子區塊，含 tier 卡片、獨立 slider 及堆疊容量條。

#### Scenario: 頁面載入時子區塊可見
- **WHEN** 頁面載入
- **THEN** Section 02 的 MSK 行下方顯示容量規劃子區塊，含兩張 tier 卡片、DC slider、PCV slider 及容量條

---

### Requirement: MSK 容量規劃使用獨立輸入參數
工具 SHALL 在容量規劃子區塊提供兩個獨立的輸入控制項（DC 相機數 340–3000、PCV 相機數 240–10000），與 Section 01 的 slider 完全獨立，互不影響。

#### Scenario: 調整容量規劃 slider 不影響 Section 01
- **WHEN** 使用者調整容量規劃子區塊的 DC 或 PCV slider
- **THEN** Section 01 的 slider 數值保持不變，Section 01 的 per-camera 成本保持不變

#### Scenario: 調整 Section 01 slider 不影響容量規劃
- **WHEN** 使用者調整 Section 01 的 M_DC 或 M_PCV slider
- **THEN** 容量規劃子區塊的 slider 數值保持不變，容量條保持不變

#### Scenario: MSK DC 不可低於最小值 340
- **WHEN** 使用者嘗試將 MSK DC 設為低於 340 的數值
- **THEN** 數值被截斷至 340

#### Scenario: MSK PCV 不可低於最小值 240
- **WHEN** 使用者嘗試將 MSK PCV 設為低於 240 的數值
- **THEN** 數值被截斷至 240

---

### Requirement: tier 卡片根據總台數自動 highlight
工具 SHALL 依據容量規劃子區塊的 DC + PCV 總台數自動 highlight 對應的 tier 卡片，不需使用者手動選取。

#### Scenario: 總台數 ≤ 945 時 large 卡片 highlight
- **WHEN** 容量規劃 DC + PCV ≤ 945
- **THEN** kafka.m7g.large 卡片為 active 狀態，kafka.m7g.xlarge 卡片為非 active 狀態

#### Scenario: 總台數 > 945 時 xlarge 卡片 highlight
- **WHEN** 容量規劃 DC + PCV > 945
- **THEN** kafka.m7g.xlarge 卡片為 active 狀態（含升級標示），kafka.m7g.large 卡片為非 active 狀態

#### Scenario: 各 tier 卡片顯示對應月費
- **WHEN** 頁面載入
- **THEN** large 卡片顯示 $1,238.88 / 月，xlarge 卡片顯示 $1,997.76 / 月

---

### Requirement: 堆疊容量條即時反映使用率
工具 SHALL 在容量規劃子區塊顯示一條堆疊式橫向容量條，以當前 tier 上限為 100%，分三段顯示 DC 已用、PCV 已用、剩餘容量。

#### Scenario: large tier 狀態下容量條上限為 945
- **WHEN** 容量規劃總台數 ≤ 945
- **THEN** 容量條總寬度代表 945 台；DC 段寬 = DC / 945 × 100%；PCV 段寬 = PCV / 945 × 100%

#### Scenario: xlarge tier 狀態下容量條上限為 1890
- **WHEN** 容量規劃總台數 > 945 且 ≤ 1890
- **THEN** 容量條總寬度代表 1890 台；DC 段寬 = DC / 1890 × 100%；PCV 段寬 = PCV / 1890 × 100%

#### Scenario: 顯示已用台數、百分比、剩餘台數
- **WHEN** 任意有效輸入
- **THEN** 容量條上方或下方顯示：「已用 X 台 / tier上限 · Y% · 剩餘 Z 台」

#### Scenario: 數值驗證（large 狀態）
- **WHEN** 容量規劃 DC = 340, PCV = 240（M = 580，tier = large，上限 = 945）
- **THEN** DC 段 = 36.0%，PCV 段 = 25.4%，剩餘 = 365 台（38.6%），顯示「580 / 945 · 61.4% · 剩餘 365 台」

---

### Requirement: 超出 xlarge 容量時顯示超載警示
工具 SHALL 在容量規劃總台數超過 1890 時，將容量條轉為紅色狀態並顯示超載警示文字。

#### Scenario: 超載時容量條轉紅
- **WHEN** 容量規劃 DC + PCV > 1890
- **THEN** 容量條整體轉為紅色，xlarge 卡片仍 highlight 但顯示超載狀態

#### Scenario: 超載時顯示警示文字
- **WHEN** 容量規劃 DC + PCV > 1890
- **THEN** 容量條下方顯示：「⚠ 已超出 kafka.m7g.xlarge 最大容量（1,890 台）」
