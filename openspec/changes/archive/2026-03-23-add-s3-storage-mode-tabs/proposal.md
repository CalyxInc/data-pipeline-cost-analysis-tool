## Why

The tool currently only supports S3 Intelligent-Tiering pricing. However, when using S3 Standard with cropped images (recognizable region only), the image size drops to ~15% of the original. Users need to compare both storage strategies side-by-side to make informed cost decisions.

## What Changes

- Add a top-level tab bar above all sections (01–03) to switch between two S3 storage modes:
  - **S3 Intelligent-Tiering** — current behavior, unchanged
  - **S3 Standard (Cropped)** — S3 Standard pricing with a 0.15× image size multiplier
- All S3 cost calculations across Section 01 (per-camera), Section 02 (shared infrastructure), and Section 03 (fleet total) reflect the selected storage mode
- All non-S3 costs (EC2, MSK, MongoDB, EKS) remain identical regardless of the selected tab
- The tab selection is global — switching affects all sections simultaneously

## Capabilities

### New Capabilities
- `s3-storage-mode`: Global tab-based toggle between S3 Intelligent-Tiering and S3 Standard (Cropped ×0.15) pricing, with mode-aware S3 cost calculation functions

### Modified Capabilities
- `camera-cost-calculator`: S3 cost in per-camera breakdown must use the active storage mode instead of hardcoded S3 IT
- `fleet-batch-total-cost`: Fleet S3 aggregation must use the active storage mode

## Impact

- `index.html`: All changes are within this single file
  - New HTML for the tab bar UI above Section 01
  - New CSS for tab styling
  - New JS: S3 Standard cost functions (`calcS3Std_DC`, `calcS3Std_PCV`), storage mode state variable, tab switching logic
  - Modified JS: `calcTotal()`, `render()`, `renderFleet()`, and `renderBatchList()` must route through the active storage mode when computing S3 costs
