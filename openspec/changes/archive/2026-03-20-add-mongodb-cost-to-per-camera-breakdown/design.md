## Context

Section 1 (Per-Camera Cost) currently shows EC2, S3 IT, and MSK. MongoDB costs were previously only shown as a fleet total in Section 2 (Shared Infrastructure). Following the MongoDB capacity planner analysis, per-camera MongoDB cost is now a known constant: **$11.28/台/月 (DC)** and **$1.88/台/月 (PCV)**. These values are fixed regardless of current camera count and do not vary with N or M within the current cluster tier.

## Goals / Non-Goals

**Goals:**
- Add MongoDB as a fourth line item in Section 1 cost breakdown panel
- Per-camera total in Section 1 = EC2 + S3 IT + MSK + MongoDB
- MongoDB value shown is the per-camera constant, not the fleet total

**Non-Goals:**
- Not changing Section 2 (Shared Infrastructure) — MongoDB fleet total stays there as-is
- Not making MongoDB per-camera cost dynamic (remains a hardcoded constant)
- Not adding tier-upgrade logic to per-camera MongoDB (step-down at M60 is a second-order effect)

## Decisions

**1. Hardcode MongoDB per-camera constants in `index.html`**
- DC: `MONGO_PER_CAMERA_DC = 11.28`
- PCV: `MONGO_PER_CAMERA_PCV = 1.88`
- Rationale: Consistent with how MSK per-camera constants are managed. Values sourced from `0003-pipeline-cost-analysis.md` via the MongoDB capacity planner change.

**2. Include MongoDB in per-camera total**
- Per-camera total updates to `EC2 + S3_IT + MSK + MongoDB`.
- Rationale: Completes the full per-camera cost picture in Section 1.

**3. Display MongoDB line item after MSK**
- Matches the source-of-truth cost table ordering (EC2 → S3 IT → MSK → MongoDB).

## Risks / Trade-offs

- [Risk] Per-camera MongoDB constant doesn't account for M60 tier step-down → Acceptable; tier boundary is high (M > 900) and the delta is minor. Can revisit if needed.
- [Risk] Section 1 total diverges from prior validation scenarios → Delta spec must update validation totals (per-camera total now includes MongoDB).
