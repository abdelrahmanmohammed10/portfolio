# Project Rules: Abdelrahman Portfolio

This workspace ruleset defines guidelines for selecting colors, designing themes, implementing animations, and planning changes.

## 1. Theme Color Alignment
- **Strict Brand DNA:** When adding or editing themes (Light Mode, Dark Mode, etc.), all color variables must strictly map to or be shades of the following brand identity colors:
  - **Solar Flare (Gold):** `#FF9F1C` (Dark theme) / `#7a5100` (Light theme shade). Avoid random oranges like `#e08a10`.
  - **Aurora Emerald (Cyan):** `#2EC4B6` (Dark theme) / `#08665c` (Light theme shade).
  - **Ionosphere Blue (Navy):** `#274C77` (Dark theme) / `#1e3d61` (Light theme shade).
  - **Violet:** `#7C3AED` (Dark theme) / `#5b21b6` (Light theme shade).
- **Harmony:** Custom elements (such as download buttons, tags, or links) must use these variables directly rather than introducing new off-palette hex values.

## 2. WCAG AA Contrast Compliance & Eye Strain Reduction
- **Contrast Check:** Every font color used in the light theme must pass a relative luminance contrast ratio check of at least **4.5:1** (target **>= 5.0:1** for comfortable reading) against its corresponding background (whether it is a white card or a sky gradient).
- **Desaturated Backdrops:** Sky/blue backgrounds must remain pastel, light, and desaturated (e.g., lightness >= 85%, saturation <= 70%) to reduce eye strain, minimize short-wavelength emission, and maximize foreground text contrast.
- **Verification Gate:** Any color adjustment must be verified using the automated Python contrast calculator script (`verify_contrast.py`) before delivering.

## 3. Workflow Invariants
- **Multi-Phase Planning:** For complex design updates, theme integrations, or layout rewrites, the agent must present a structured, multi-phase implementation plan (e.g., 5 distinct checkable phases) and obtain explicit user approval before execution.
- **Thorough Work Review:** The agent must run local builds, review code changes multiple times, and check visual responsiveness across viewports prior to git commits.
