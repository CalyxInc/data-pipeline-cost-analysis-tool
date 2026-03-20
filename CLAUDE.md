# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A single-page web application for calculating per-camera monthly costs across AWS infrastructure (EC2, S3 IT, MSK, MongoDB) for DC and PCV camera pipelines, with fleet-level aggregation and capacity planning.

## Running

No build process. Static HTML file — open directly in a browser:

```bash
open index.html
# or
python3 -m http.server 8000
```

No package manager, test framework, or transpiler.

## Architecture

The entire application lives in `index.html` (~1,650 lines): HTML structure, CSS (custom properties design system), and vanilla JS.

### Three Independent Sections

1. **Section 01 — Per-Camera Cost**: Calculates EC2, S3 IT, MSK, MongoDB costs for a single camera given N (months), M_DC, M_PCV, and pipeline type (DC/PCV). Uses `calcTotal()` which delegates to `calcEC2_DC/PCV()`, `calcS3IT_DC/PCV()`, `calcMSK()`, `calcMongoDB()`.

2. **Section 02 — Shared Infrastructure Capacity Planners**: MSK and MongoDB capacity planners with their own independent sliders (completely isolated from Section 01 inputs). Uses `calcMSKCapacity()` and `calcMongoCapacity()`.

3. **Section 03 — Fleet Total Cost**: Multi-batch aggregation. Each batch has its own N/M_DC/M_PCV; EC2 and S3 are per-batch, while MSK, MongoDB, and EKS are fleet-wide shared costs. Managed via `renderBatchList()` and `renderFleet()`.

### Key Business Logic

- **MSK tiers**: message rate = M_DC × 0.05 + M_PCV × (1/120); ≤31 msg/s → large ($1,238.88), >31 → xlarge ($1,997.76)
- **MongoDB tiers**: equivalent units W = M_DC × 6 + M_PCV; ≤2,700 → M50 ($6,019), >2,700 → M60 ($10,600)
- **EC2**: ceil-based node counting (DC: 91/g6, 828/m7g; PCV: 545/g6, 600/m7g)
- **S3 IT**: lookup table for N<4, linear formula for N≥4

### CSS Design System

CSS custom properties define the color palette: `--teal` (primary), `--purple` (secondary), `--amber`, `--green`, `--red`, plus neutrals (`--bg`, `--surface`, `--border`, `--text`, `--muted`, `--dim`).

## Change Management

Uses OpenSpec workflow for structured changes. Canonical specs live in `openspec/specs/`, completed changes are archived in `openspec/changes/archive/`. Use `/opsx:*` slash commands for workflow operations.

## Conventions

- All calculation constants are defined at the top of the JS section — update there when costs change
- Slider ↔ number input sync handled by `linkSlider()`
- Each section's render function is independent: `render()` (Section 01+02 breakdown), `renderMSKCapacity()`, `renderMongoCapacity()`, `renderBatchList()`/`renderFleet()` (Section 03)
