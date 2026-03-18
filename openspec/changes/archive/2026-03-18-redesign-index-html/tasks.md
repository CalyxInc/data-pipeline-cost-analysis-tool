## 1. 使用 frontend-design skill 重新設計 index.html

- [x] 1.1 呼叫 frontend-design skill，提供現有 index.html 內容與設計需求（資料儀表板風格、成本拆解清楚、零依賴）
- [x] 1.2 確認生成的 HTML 包含所有必要的 element ID（result-ec2、result-s3、result-msk、result-mongo、result-total、ec2-detail、msk-tag、mongo-tag、result-note）
- [x] 1.3 將現有 index.html 的完整 `<script>` 區塊（常數 + 所有 calc 函式 + render + init）複製貼入新設計

## 2. 驗證功能完整性

- [x] 2.1 開啟新 index.html，以預設值（N=12, M_DC=340, M_PCV=240, DC）確認合計顯示約 $66.80
- [x] 2.2 切換至 PCV pipeline，確認合計顯示約 $22.81
- [x] 2.3 調整 M_DC + M_PCV > 945，確認 MSK 標籤切換至 xlarge
- [x] 2.4 調整 M_DC + M_PCV > 900，確認 MongoDB 標籤切換至 M60
- [x] 2.5 確認 slider 與 number input 雙向同步正常
