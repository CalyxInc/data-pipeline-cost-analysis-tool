# MongoDB Capacity Planner

## Purpose

TBD — 嵌入在 Section 02 MongoDB cost row 下方的容量規劃子區塊，讓使用者透過獨立 slider 評估 MongoDB Atlas tier 使用率。

---

## Requirements

### Requirement: MongoDB 容量規劃子區塊嵌入 Section 02
工具 SHALL 在 Section 02 的 MongoDB cost row 下方顯示一個獨立的容量規劃子區塊，含 tier 卡片、獨立 slider 及堆疊等效單位容量條。

#### Scenario: 頁面載入時子區塊可見
- **WHEN** 頁面載入
- **THEN** Section 02 的 MongoDB cost row 下方顯示容量規劃子區塊，含兩張 tier 卡片（M50 / M60）、DC slider、PCV slider 及容量條

---

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

---

### Requirement: tier 卡片根據等效單位自動 highlight
工具 SHALL 依據容量規劃子區塊的等效單位（W = DC×6 + PCV×1）自動 highlight 對應的 tier 卡片，不需使用者手動選取。

#### Scenario: W ≤ 2700 時 M50 卡片 highlight
- **WHEN** 容量規劃 DC×6 + PCV ≤ 2700
- **THEN** M50 卡片為 active 狀態，M60 卡片為非 active 狀態

#### Scenario: W > 2700 時 M60 卡片 highlight
- **WHEN** 容量規劃 DC×6 + PCV > 2700
- **THEN** M60 卡片為 active 狀態（含升級標示），M50 卡片為非 active 狀態

#### Scenario: 各 tier 卡片顯示對應月費
- **WHEN** 頁面載入
- **THEN** M50 卡片顯示 $6,019 / 月，M60 卡片顯示 ~$10,600 / 月

---

### Requirement: 堆疊容量條以等效單位即時反映使用率
工具 SHALL 在容量規劃子區塊顯示一條堆疊式橫向容量條，以當前 tier 等效單位上限為 100%，分三段顯示 DC 佔用、PCV 佔用、剩餘容量。容量條寬度依等效單位計算，而非相機台數。

#### Scenario: M50 tier 狀態下容量條上限為 2700 eq
- **WHEN** 容量規劃 W = DC×6 + PCV ≤ 2700
- **THEN** 容量條總寬度代表 2700 eq；DC 段寬 = (DC×6) / 2700 × 100%；PCV 段寬 = PCV / 2700 × 100%

#### Scenario: M60 tier 狀態下容量條上限為 5400 eq
- **WHEN** 容量規劃 W > 2700 且 ≤ 5400
- **THEN** 容量條總寬度代表 5400 eq；DC 段寬 = (DC×6) / 5400 × 100%；PCV 段寬 = PCV / 5400 × 100%

#### Scenario: 條下顯示等效單位明細行
- **WHEN** 任意有效輸入
- **THEN** 容量條下方第一行顯示：「DC X台（×6 = A eq）+ PCV Y台（×1 = B eq）= W / limit · Z% used · 剩餘 R eq」

#### Scenario: 條下顯示剩餘容量換算提示
- **WHEN** W ≤ limit（未超載）
- **THEN** 容量條下方第二行顯示：「可再加 ⌊R/6⌋ 台 DC，或 R 台 PCV」（R = limit - W）

#### Scenario: 數值驗證（M50 基準）
- **WHEN** 容量規劃 DC = 340, PCV = 240（W = 2,280，tier = M50，limit = 2,700）
- **THEN** DC 段 = 75.6%，PCV 段 = 8.9%，剩餘 = 420 eq（15.6%）；行一顯示「DC 340台（×6 = 2,040 eq）+ PCV 240台（×1 = 240 eq）= 2,280 / 2,700 · 84.4% used · 剩餘 420 eq」；行二顯示「可再加 70 台 DC，或 420 台 PCV」

---

### Requirement: 超出 M60 容量時顯示超載警示
工具 SHALL 在容量規劃等效單位超過 5400 時，將容量條轉為紅色狀態並顯示超載警示文字。

#### Scenario: 超載時容量條轉紅
- **WHEN** 容量規劃 DC×6 + PCV > 5400
- **THEN** 容量條整體轉為紅色，M60 卡片仍 highlight 但顯示超載狀態

#### Scenario: 超載時顯示警示文字
- **WHEN** 容量規劃 DC×6 + PCV > 5400
- **THEN** 容量條下方顯示：「⚠ 已超出 M60 最大容量（5,400 eq）」
