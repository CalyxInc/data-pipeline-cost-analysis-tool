## 1. Section 01 Sliders

- [x] 1.1 將 `dc-slider` 的 `min` 屬性從 `0` 改為 `340`，`dc-input` 同步更新
- [x] 1.2 將 `pcv-slider` 的 `min` 屬性從 `0` 改為 `240`，`pcv-input` 同步更新
- [x] 1.3 將 Section 01 `wire()` 呼叫中 DC 的 `min` 參數從 `0` 改為 `340`，PCV 的 `min` 參數從 `0` 改為 `240`

## 2. MSK 容量規劃 Sliders

- [x] 2.1 將 `msk-dc-slider` 的 `min` 屬性從 `0` 改為 `340`，`msk-dc-input` 同步更新
- [x] 2.2 將 `msk-pcv-slider` 的 `min` 屬性從 `0` 改為 `240`，`msk-pcv-input` 同步更新
- [x] 2.3 將 MSK `wire()` 呼叫中 DC 的 `min` 參數從 `0` 改為 `340`，PCV 的 `min` 參數從 `0` 改為 `240`

## 3. MongoDB 容量規劃 Sliders

- [x] 3.1 將 `mongo-dc-slider` 的 `min` 屬性從 `0` 改為 `340`，`mongo-dc-input` 同步更新
- [x] 3.2 將 `mongo-pcv-slider` 的 `min` 屬性從 `0` 改為 `240`，`mongo-pcv-input` 同步更新
- [x] 3.3 將 MongoDB `wire()` 呼叫中 DC 的 `min` 參數從 `0` 改為 `340`，PCV 的 `min` 參數從 `0` 改為 `240`

## 4. 驗證

- [x] 4.1 驗證 Section 01：拖動 DC slider 到底不會低於 340，手動輸入 100 會被截斷至 340
- [x] 4.2 驗證 Section 01：拖動 PCV slider 到底不會低於 240，手動輸入 100 會被截斷至 240
- [x] 4.3 驗證 MSK 容量規劃：DC 和 PCV slider 最小值分別為 340 和 240
- [x] 4.4 驗證 MongoDB 容量規劃：DC 和 PCV slider 最小值分別為 340 和 240
