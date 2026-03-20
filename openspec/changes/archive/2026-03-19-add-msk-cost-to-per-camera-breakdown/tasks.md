## 1. Constants

- [x] 1.1 Add `MSK_PER_CAMERA_DC = 2.00` and `MSK_PER_CAMERA_PCV = 0.33` constants in `index.html`

## 2. Cost Calculation

- [x] 2.1 Include MSK per-camera constant in the per-camera total formula for DC pipeline
- [x] 2.2 Include MSK per-camera constant in the per-camera total formula for PCV pipeline

## 3. Cost Breakdown UI

- [x] 3.1 Add MSK line item row in Section 1 cost breakdown panel (between S3 IT and the total)
- [x] 3.2 Display correct MSK value ($2.00 DC / $0.33 PCV) based on selected pipeline type
- [x] 3.3 Update percentage bars to reflect new total including MSK

## 4. Validation

- [x] 4.1 Verify DC baseline: N=12, M_DC=340 → EC2=$8.20, S3 IT=$45.00, MSK=$2.00, total=$55.20
- [x] 4.2 Verify PCV baseline: N=12, M_PCV=240 → EC2=$4.38, S3 IT=$7.48, MSK=$0.33, total=$12.19
- [x] 4.3 Verify MSK value does not change when N or M sliders are adjusted
