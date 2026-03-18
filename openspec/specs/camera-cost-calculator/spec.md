# Camera Cost Calculator

## Purpose

A single-file (`index.html`) browser-based tool for calculating per-camera monthly costs across DC and PCV pipeline types, with real-time breakdown of EC2, S3 IT, MSK, and MongoDB costs based on adjustable input parameters.

---

## Source of Truth

所有計算公式中的常數（EC2 機型費率、latency、每節點 pod 數、S3 分層費率、MSK broker 費用、MongoDB tier 費用、分段閾值）均來源於：

**`benson-aws-account-oregon-ml-infra/implementation-plan/0003-pipeline-cost-analysis.md`**

當上述文件的數字更新時，應開啟新的 openspec change 同步更新 `index.html` 中的常數定義，並在 delta spec 中記錄哪些數值從什麼改成什麼、原因為何。`index.html` 本身維持靜態常數，不動態讀取來源文件。

---

## Requirements

### Requirement: 使用者可調整 4 個輸入參數
工具 SHALL 提供以下 4 個可互動輸入控制項：
- **N**（上線月數）：整數，範圍 1–24
- **M_DC**（DC 相機總數）：整數，範圍 1–3000
- **M_PCV**（PCV 相機總數）：整數，範圍 1–10000
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

---

### Requirement: 系統即時計算單台相機月費並拆解各項成本
工具 SHALL 根據 4 個輸入參數計算所選 pipeline 類型的單台相機月費，並分別顯示 EC2、S3 IT、MSK、MongoDB 各項費用及合計。

#### Scenario: DC pipeline 成本計算（N ≥ 4）
- **WHEN** Pipeline Type = DC，N ≥ 4
- **THEN** EC2_DC = (⌈M_DC/91⌉ × $580 + ⌈M_DC/828⌉ × $470) / M_DC；S3_IT_DC = $14.12 + $2.57 × N；MSK 與 MongoDB 依分段公式計算

#### Scenario: DC pipeline 成本計算（N < 4）
- **WHEN** Pipeline Type = DC，N = 1
- **THEN** S3_IT_DC = $10.02；N=2 時 $15.93；N=3 時 $21.84

#### Scenario: PCV pipeline 成本計算（N ≥ 4）
- **WHEN** Pipeline Type = PCV，N ≥ 4
- **THEN** EC2_PCV = (⌈M_PCV/545⌉ × $580 + ⌈M_PCV/600⌉ × $470) / M_PCV；S3_IT_PCV = $2.35 + $0.43 × N

#### Scenario: 數值驗證（現況基準）
- **WHEN** N=12, M_DC=340, M_PCV=240, Pipeline Type=DC
- **THEN** EC2=$8.20, S3 IT=$45.00, MSK=$3.24, MongoDB=$10.38, 合計=$66.82

#### Scenario: 數值驗證（PCV 現況基準）
- **WHEN** N=12, M_DC=340, M_PCV=240, Pipeline Type=PCV
- **THEN** EC2=$4.38, S3 IT=$7.48, MSK=$0.57, MongoDB=$10.38, 合計=$22.81

---

### Requirement: MSK 成本依總相機數分段計算
工具 SHALL 依 M = M_DC + M_PCV 自動套用對應 MSK 方案，並在 UI 中顯示目前使用的方案名稱。

#### Scenario: M ≤ 945（m7g.large 方案）
- **WHEN** M_DC + M_PCV ≤ 945
- **THEN** MSK_total = $1,238.88，UI 顯示「MSK 方案：kafka.m7g.large」

#### Scenario: M > 945（m7g.xlarge 方案）
- **WHEN** M_DC + M_PCV > 945
- **THEN** MSK_total = $1,997.76，UI 顯示「MSK 方案：kafka.m7g.xlarge（升級）」

---

### Requirement: MongoDB 成本依總相機數分段計算
工具 SHALL 依 M = M_DC + M_PCV 自動套用對應 MongoDB tier，並在 UI 中顯示目前使用的 tier。

#### Scenario: M ≤ 900（M50 tier）
- **WHEN** M_DC + M_PCV ≤ 900
- **THEN** MongoDB(M) = $6,019 / M，UI 顯示「MongoDB：M50」

#### Scenario: M > 900（M60 tier）
- **WHEN** M_DC + M_PCV > 900
- **THEN** MongoDB(M) = $10,600 / M，UI 顯示「MongoDB：M60（升級）」

---

### Requirement: 工具無需任何安裝或 build 步驟即可執行
工具 SHALL 以單一 `index.html` 檔案交付，使用者只需在瀏覽器中開啟該檔案即可使用，無需 Node.js、網路連線或任何外部依賴。

#### Scenario: 離線開啟
- **WHEN** 使用者在無網路環境下雙擊 `index.html`
- **THEN** 工具完整載入並可正常運作，所有計算功能可用
