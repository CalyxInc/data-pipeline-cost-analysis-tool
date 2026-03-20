## 1. Constants

- [x] 1.1 Add `MONGO_PER_CAMERA_DC = 11.28` and `MONGO_PER_CAMERA_PCV = 1.88` constants in `index.html`

## 2. Cost Calculation

- [x] 2.1 Include MongoDB per-camera constant in the per-camera total formula for DC pipeline
- [x] 2.2 Include MongoDB per-camera constant in the per-camera total formula for PCV pipeline

## 3. Cost Breakdown UI

- [x] 3.1 Add MongoDB line item row in Section 1 cost breakdown panel (after MSK, before total)
- [x] 3.2 Display correct MongoDB value ($11.28 DC / $1.88 PCV) based on selected pipeline type
- [x] 3.3 Update percentage bars to reflect new total including MongoDB

## 4. Validation

- [x] 4.1 Verify DC baseline: N=12, M_DC=340 → EC2=$8.20, S3=$45.00, MSK=$2.00, MongoDB=$11.28, total=$66.48
- [x] 4.2 Verify PCV baseline: N=12, M_PCV=240 → EC2=$4.38, S3=$7.48, MSK=$0.33, MongoDB=$1.88, total=$14.07
- [x] 4.3 Verify MongoDB value does not change when N or M sliders are adjusted
