## MODIFIED Requirements

### Requirement: 共享基礎設施月費獨立區塊
工具 SHALL 在 per-camera 月費區塊之後、艦隊總成本區塊之前，顯示一個獨立的「共享基礎設施月費」區塊，列出 MSK 與 MongoDB 的**總月費**（整個部署，非單台分攤）。MSK 行下方 SHALL 嵌入 MSK 容量規劃子區塊（詳見 `msk-capacity-planner` spec）。MongoDB 行下方 SHALL 嵌入 MongoDB Atlas 容量規劃子區塊（詳見 `mongodb-capacity-planner` spec）。

#### Scenario: 共享基礎設施區塊顯示正確總月費
- **WHEN** M_DC=340, M_PCV=240（M=580）
- **THEN** 區塊顯示 MSK 總月費 = $1,238.88（kafka.m7g.large），MongoDB 總月費 = $6,019（M50）

#### Scenario: tier 升級時共享基礎設施區塊即時更新
- **WHEN** M_DC + M_PCV 從 ≤945 增加至 >945
- **THEN** MSK 費用及方案標籤即時更新為 xlarge tier

#### Scenario: 區塊標題與編號
- **WHEN** 頁面載入
- **THEN** 區塊標題為「02 共享基礎設施 · Shared Infrastructure」，原艦隊總成本區塊標題更新為「03 艦隊總成本 · Fleet Total Cost」

#### Scenario: MSK 行下方嵌入容量規劃子區塊
- **WHEN** 頁面載入
- **THEN** Section 02 的 MSK cost row 下方顯示 MSK 容量規劃子區塊，MongoDB 行位於其下方

#### Scenario: MongoDB 行下方嵌入容量規劃子區塊
- **WHEN** 頁面載入
- **THEN** Section 02 的 MongoDB cost row 下方顯示 MongoDB Atlas 容量規劃子區塊
