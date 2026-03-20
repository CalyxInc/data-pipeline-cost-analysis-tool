## Context

Section 1 (Per-Camera Cost) currently shows EC2 and S3 IT as breakdown line items. MSK costs were previously excluded from per-camera breakdown and only shown as a fleet-level total in Section 2 (Shared Infrastructure). Following the MSK capacity planner analysis, per-camera MSK cost is now a known constant: **$2.00/台/月 (DC)** and **$0.33/台/月 (PCV)**. These values are fixed regardless of current camera count, and do not vary with N or M within the current cluster tier.

## Goals / Non-Goals

**Goals:**
- Add MSK as a third line item in Section 1 cost breakdown panel
- Per-camera total in Section 1 includes MSK cost
- MSK value shown is the per-camera constant, not the fleet total

**Non-Goals:**
- Not changing Section 2 (Shared Infrastructure) — MSK fleet total stays there as-is
- Not making MSK per-camera cost dynamic (it remains a hardcoded constant)
- Not adding tier-upgrade logic to per-camera MSK (the step-down at xlarge tier is a second-order effect; use simple constants for now)

## Decisions

**1. Hardcode MSK per-camera constants in `index.html`**
- DC: `MSK_PER_CAMERA_DC = 2.00`
- PCV: `MSK_PER_CAMERA_PCV = 0.33`
- Rationale: Consistent with how other cost constants are managed in `index.html`. Values sourced from `0003-pipeline-cost-analysis.md` via the MSK capacity planner change.

**2. Include MSK in per-camera total**
- The per-camera total displayed in Section 1 updates to `EC2 + S3_IT + MSK`.
- Rationale: The user expects a complete per-camera cost view in Section 1.

**3. Display MSK line item between S3 IT and the total**
- Matches the ordering shown in the source-of-truth cost table (EC2 → S3 IT → MSK → MongoDB).
- MongoDB remains in Section 2 only; this change does not move MongoDB.

## Risks / Trade-offs

- [Risk] Per-camera MSK constant doesn't account for xlarge tier step-down → Acceptable for now; tier boundary is high (M > 945) and the delta ($0.39 DC / $0.06 PCV) is minor. Can revisit if needed.
- [Risk] Section 1 total diverges from spec's current validation scenarios → Delta spec must update the validation scenarios (per-camera total now includes MSK).
