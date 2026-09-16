---
name: banmix-frontend-brand
description: Design, build, review, or improve BanMix frontend interfaces using the official BanMix brand system. Use for React, Vite, Tailwind CSS, responsive pages, components, public pages, dashboards, light/dark themes, animations, UI/UX improvements, product pages, navigation, cards, forms, modals, tables, landing pages, and other frontend work for BanMix.
---

# BanMix Frontend Brand

Apply the BanMix frontend design system to all relevant frontend work.

Before making significant UI changes, inspect:

- existing implementation
- project structure
- dependencies
- reusable components
- Tailwind configuration
- theme implementation
- existing UI conventions

Do not replace working architecture unnecessarily.

## Core Brand Colors

Use:

```text
BanMix Blue     #2590C7
BanMix Orange   #E86E2B
BanMix Green    #0E6843
BanMix Dark     #20211A
BanMix Navy     #071426
BanMix Cream    #FFF8EE
```

## Hierarchy

```text
Orange → Action
Blue   → Identity
Green  → Trust
Dark   → Light-mode text (never dark backgrounds)
Cream  → Warmth
Navy   → Dark theme backgrounds and premium sections
```

## References

Read when needed:

- `references/design-system.md` — color purpose and hierarchy
- `references/react-tailwind.md` — project inspection paths and Tailwind usage
- `../assets/banmix-primary-logo.png` — primary logo reference

## Workflow

1. Reuse existing public UI primitives (`src/components/public/ui.jsx`) and layouts.
2. Update or extend `brand.*` Tailwind tokens instead of inventing new palettes.
3. Keep CTAs orange, identity accents blue, trust cues green.
4. Dark theme backgrounds must use `brand-navy` — never `brand-dark` as a surface.
5. Preserve light/dark theme behavior and reduced-motion support.
6. Prefer editing existing pages/components over creating parallel design systems.
