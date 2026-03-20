## ADDED Requirements

### Requirement: EC2 實例數量標籤隨輸入參數動態顯示
工具 SHALL 在 EC2 算力欄位下方顯示當前所需 g6.xlarge 與 m7g.4xlarge 的實例數量，數量根據當前 Pipeline Type 與相機數量即時計算。

- DC pipeline：g6.xlarge 數量 = ⌈M_DC / 91⌉，m7g.4xlarge 數量 = ⌈M_DC / 828⌉
- PCV pipeline：g6.xlarge 數量 = ⌈M_PCV / 545⌉，m7g.4xlarge 數量 = ⌈M_PCV / 600⌉

#### Scenario: DC pipeline 實例數隨 M_DC 變化
- **WHEN** Pipeline Type = DC，M_DC 從任意值改變
- **THEN** EC2 標籤更新為 `g6.xlarge × ⌈M_DC/91⌉ + m7g.4xlarge × ⌈M_DC/828⌉`

#### Scenario: PCV pipeline 實例數隨 M_PCV 變化
- **WHEN** Pipeline Type = PCV，M_PCV 從任意值改變
- **THEN** EC2 標籤更新為 `g6.xlarge × ⌈M_PCV/545⌉ + m7g.4xlarge × ⌈M_PCV/600⌉`

#### Scenario: 切換 Pipeline Type 時標籤同步更新
- **WHEN** 使用者從 DC 切換至 PCV（或反之）
- **THEN** EC2 標籤立即改用對應 pipeline 的 threshold 重新計算並顯示

#### Scenario: 數值驗證（DC 基準）
- **WHEN** Pipeline Type = DC，M_DC = 340
- **THEN** EC2 標籤顯示 `g6.xlarge × 4 + m7g.4xlarge × 1`（⌈340/91⌉=4，⌈340/828⌉=1）

#### Scenario: 數值驗證（PCV 基準）
- **WHEN** Pipeline Type = PCV，M_PCV = 240
- **THEN** EC2 標籤顯示 `g6.xlarge × 1 + m7g.4xlarge × 1`（⌈240/545⌉=1，⌈240/600⌉=1）
