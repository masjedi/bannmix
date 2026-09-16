# BanMix React + Tailwind Guidelines

## Project Inspection

Before creating components inspect:

```text
src/components
src/layouts
src/pages
src/hooks
src/utils
src/assets
src/components/public/ui.jsx
src/context
tailwind.config.js
src/index.css
```

## Token Mapping

Use Tailwind brand tokens from `tailwind.config.js`:

```text
text-brand-dark                       → light-mode body text only
bg-brand-navy / dark:bg-brand-navy    → dark theme surfaces
bg-brand-cream                        → warm light accents
bg-brand-orange / text-brand-orange   → actions
bg-brand-blue / text-brand-blue       → identity
bg-brand-green / text-brand-green     → trust
```

Never use `bg-brand-dark` or `#20211A` for dark theme backgrounds.

Prefer `btn-primary` / `btn-secondary` / `btn-dark-secondary` from `src/index.css` for CTAs.

## Conventions

- Public pages: React + Tailwind utility classes; reuse `Container`, `SectionHeading`, `ButtonLink`, `FadeUp`
- Theme: class-based dark mode via existing `ThemeContext`
- Do not introduce a second UI library for public surfaces unless already in use
- Keep hardcoded hex out of components when a brand token exists
