## Context

The application currently hardcodes S3 Intelligent-Tiering (IT) as the only storage pricing model. S3 IT uses a lookup table for N<4 months and a linear formula for N≥4, reflecting tiered access patterns over time.

A new use case involves cropping images to the recognizable region before storage, reducing image size to ~15% of the original. This makes S3 Standard pricing competitive because the reduced data volume offsets Standard's higher per-GB rate. Users need to compare both options.

The existing DC/PCV segmented control within Section 01 provides a good UX pattern to follow, but the storage mode toggle is a higher-level concern that affects all three sections.

## Goals / Non-Goals

**Goals:**
- Allow users to switch between S3 IT and S3 Standard (Cropped) pricing globally
- S3 Standard costs = S3 IT costs × 0.15 (proportional to the cropped image size ratio)
- All sections (01, 02, 03) react to the selected storage mode
- Tab UI is visually distinct from section-level controls to convey its global scope

**Non-Goals:**
- Custom multiplier input (fixed at 0.15)
- Side-by-side comparison view of both modes simultaneously
- Persisting the selected mode across page reloads
- Adding other storage classes (Glacier, One Zone-IA, etc.)

## Decisions

### 1. Global state variable for storage mode

Use a simple `let storageMode = "s3it"` variable at the top of the JS section. Values: `"s3it"` or `"s3std"`. All S3 cost functions route through a dispatcher that checks this variable.

**Rationale**: Minimal complexity — a single variable is sufficient since there are only two modes and no async considerations. Avoids over-engineering with events or pub/sub.

**Alternative considered**: Storing mode in a `data-*` attribute on the body element. Rejected because JS variable is simpler and all rendering is already driven by JS.

### 2. S3 Standard cost = S3 IT cost × 0.15

Rather than building an independent S3 Standard pricing model, define `calcS3Std_DC(n) = calcS3IT_DC(n) * 0.15` and `calcS3Std_PCV(n) = calcS3IT_PCV(n) * 0.15`.

**Rationale**: The 0.15 factor represents the image size reduction from cropping, which proportionally reduces all storage costs. This keeps the two modes in sync — if IT pricing is updated, Standard automatically reflects the same change.

**Alternative considered**: Independent lookup tables for S3 Standard. Rejected because the cost relationship is purely multiplicative and maintaining two separate tables creates drift risk.

### 3. Tab bar placement: between header and Section 01

Insert a horizontal tab bar between `</header>` and the first `section-label`. Style it as a full-width bar within the `max-width: 1000px` container, using the existing design system colors.

**Rationale**: Visually conveys "this affects everything below" — positioned above all content sections but below the app title. Follows the information hierarchy.

### 4. Tab styling: pill/segment style with `--teal` active state

Reuse the visual language of the existing DC/PCV segmented control (`.seg-control`) but at a larger scale with distinct styling to indicate its global scope. Use `--teal` for the active tab background.

**Rationale**: Consistent with the existing design system. The segmented control pattern is already familiar in this app.

### 5. S3 cost label updates dynamically

The cost breakdown labels (e.g., "S3 Intelligent-Tiering" in Section 01, "S3 IT 合計" in Section 03) update to reflect the active mode: "S3 Intelligent-Tiering" vs "S3 Standard (Cropped)".

**Rationale**: Users need to see which pricing model is reflected in the numbers. Static labels would be confusing.

### 6. Dispatcher pattern for S3 cost routing

Introduce `calcS3_DC(n)` and `calcS3_PCV(n)` wrapper functions that check `storageMode` and delegate to either the IT or Standard functions. Update all call sites (`calcTotal`, `renderFleet`, `renderBatchList`) to use these dispatchers instead of calling `calcS3IT_*` directly.

**Rationale**: Single point of change — adding future storage modes only requires updating the dispatcher. Minimizes edits to existing rendering code.

## Risks / Trade-offs

- **[Simplistic cost model]** → The 0.15 multiplier assumes linear scaling of storage cost with image size. In practice, S3 Standard and IT have different pricing structures (Standard has no monitoring fee, IT has tiered access). Mitigation: This is a first approximation; the user understands it's an estimate. Can be refined later with an independent formula if needed.
- **[No persistence]** → Page reload resets to S3 IT (default). Mitigation: Acceptable for a lightweight tool; can add `localStorage` later if requested.
- **[Label hardcoding]** → The S3 label text is updated in multiple render functions. Mitigation: Use a helper function `s3Label()` that returns the correct label string based on `storageMode`.
