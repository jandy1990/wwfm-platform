# WWFM Design System

**Last Updated:** January 2025
**Status:** Production Standard

---

## Design Principles

WWFM follows a **bold, minimal, high-contrast** design language that prioritizes:

1. **Clarity** - Users should immediately understand what they're looking at
2. **Confidence** - Bold typography and strong visual hierarchy inspire trust
3. **Accessibility** - WCAG AA compliance minimum, with excellent contrast ratios
4. **Consistency** - Unified purple accent color and predictable patterns

---

## Typography

### Font Weights

```css
/* Headlines */
h1: text-4xl md:text-5xl lg:text-6xl font-black tracking-tight
h2: text-3xl md:text-4xl font-black tracking-tight
h3: text-2xl font-black tracking-tight
h4: text-xl font-bold tracking-tight

/* Body & UI */
Buttons: font-semibold
Links: font-semibold
Body text: font-normal
Labels: font-medium
Emphasis: font-semibold
Strong: font-bold
```

### Key Rules

- **Always use `tracking-tight` on headlines** for that bold, confident look
- **Minimum `font-semibold` for all interactive elements** (buttons, tabs, links)
- **`font-black` for primary headlines** (h1, h2)
- **`font-bold` for section headers and emphasized content** (h3, h4)

---

## Color System

### Brand Colors

```css
Primary Purple: purple-600 (#9333ea)
Light Purple: purple-400 (#c084fc)
Dark Purple: purple-700 (#7e22ce)
```

### Usage

- **Purple is accent only** - Use sparingly for CTAs, active states, and interactive elements
- **Never use blue** - All accent colors are purple
- **Background rhythm** - Alternate dark/light sections for visual interest

### Background Patterns

```css
/* Dark sections */
bg-gray-900 dark:bg-black

/* Light sections */
bg-white dark:bg-gray-50

/* Alternating pattern on home page */
Dark → Light → Dark → Light → Dark
```

### Text Colors

```css
/* On dark backgrounds */
Headings: text-white
Body: text-gray-300
Labels: text-gray-400

/* On light backgrounds */
Headings: text-gray-900
Body: text-gray-600
Labels: text-gray-500
```

---

## Component Standards

### Borders

```css
/* All cards and inputs */
border-2 (not border or border-1)

/* Card examples */
border-2 border-gray-300 dark:border-gray-700

/* Active states */
border-2 border-purple-500
```

### Shadows

```css
/* Default cards */
shadow-lg

/* Hover states */
hover:shadow-xl

/* Never use */
shadow-sm or shadow-md (too weak)
```

### Focus States

```css
/* All interactive elements */
focus:ring-2 focus:ring-purple-500 focus:border-transparent

/* Never use */
ring-[3px] or ring-1 (inconsistent)
```

### Spacing

```css
/* Section padding */
py-20 (not py-12 or py-16)

/* Card padding */
p-6 or p-8 (generous padding)

/* Gaps */
gap-4 to gap-8 (ample breathing room)
```

---

## Interactive Elements

### Buttons

```css
/* Primary CTA */
bg-purple-600 text-white rounded-full font-semibold
hover:bg-purple-700 transition-colors

/* Secondary */
bg-transparent border-2 border-white text-white rounded-full font-semibold
hover:bg-white hover:text-gray-900 transition-all

/* Tertiary (text links) */
text-purple-600 dark:text-purple-400 font-semibold
hover:text-purple-700 dark:hover:text-purple-300
```

### Hover Effects

- **Cards**: `hover:shadow-xl hover:border-purple-400 transition-all`
- **Buttons**: `hover:-translate-y-1 hover:scale-[1.02] transition-all`
- **Links**: `hover:text-purple-700 dark:hover:text-purple-300`

### Active States

```css
/* Tabs */
Active: border-b-2 border-purple-500 text-purple-500
Inactive: text-gray-500 hover:text-gray-700

/* Buttons */
Active: scale-95 (active:scale-95)
```

---

## Layout Patterns

### Page Structure

```tsx
// Hero section (dark background)
<section className="bg-gray-900 py-20">

// Content section (light background)
<section className="bg-white py-20">

// Alternate section (dark background)
<section className="bg-gray-900 py-20">
```

### Container Widths

```css
max-w-7xl mx-auto  /* Standard page container */
max-w-4xl mx-auto  /* Narrow content (forms, articles) */
max-w-2xl mx-auto  /* Very narrow (search bars, CTAs) */
```

### Grid Layouts

```css
/* Standard 3-column */
grid md:grid-cols-3 gap-8

/* 2-column */
grid md:grid-cols-2 gap-6

/* Responsive cards */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
```

---

## Accessibility Standards

### Contrast Ratios

- **Normal text**: 4.5:1 minimum (WCAG AA)
- **Large text (18px+)**: 3:1 minimum
- **Purple-600 on white**: ✅ Passes AA
- **White on purple-600**: ✅ Passes AA
- **Gray-500 on white**: ✅ Passes AA

### Keyboard Navigation

- All interactive elements must have `focus:ring-2 focus:ring-purple-500`
- Tab order must be logical (top to bottom, left to right)
- No focus traps

### Screen Readers

- Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<article>`)
- Add `aria-label` for icon-only buttons
- Use `<h1>` through `<h6>` in correct hierarchy

---

## Dark Mode

### Implementation

All components must support dark mode with `dark:` variants:

```css
/* Light mode → Dark mode */
bg-white → dark:bg-gray-900
text-gray-900 → dark:text-white
border-gray-300 → dark:border-gray-700
text-gray-600 → dark:text-gray-300
```

### Testing

- Toggle dark mode in OS settings
- Check all pages for proper contrast
- Verify purple-400 (not purple-600) for dark backgrounds

---

## Common Patterns

### Card Component

```tsx
<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-300 dark:border-gray-700 shadow-lg hover:shadow-xl hover:border-purple-400 transition-all">
  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
    Card Title
  </h3>
  <p className="text-gray-600 dark:text-gray-300">
    Card content
  </p>
</div>
```

### Section Header

```tsx
<h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-8">
  Section Title
</h2>
```

### CTA Button

```tsx
<button className="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold shadow-md hover:bg-purple-700 hover:shadow-xl hover:-translate-y-1 transition-all">
  Call to Action
</button>
```

### Input Field

```tsx
<input className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900" />
```

---

## Don'ts

❌ **Never use blue accent colors** (all accents are purple)
❌ **Never use `border` without `border-2`** (too thin)
❌ **Never use `shadow-sm` or `shadow-md`** (use `shadow-lg`)
❌ **Never use `py-12` for sections** (use `py-20`)
❌ **Never use `font-medium` for buttons** (use `font-semibold`)
❌ **Never use decorative elements without purpose** (stay minimal)
❌ **Never center-align text sections** (left-align for readability)

---

## Mobile Considerations

### Responsive Typography

```css
/* Scale down on mobile */
text-5xl md:text-7xl lg:text-8xl  /* Hero headlines */
text-3xl md:text-4xl              /* Section headers */
text-lg sm:text-xl                /* Card titles */
```

### Touch Targets

- Minimum 44x44px for all interactive elements
- Add `py-3` or more to buttons for easy tapping
- Use `gap-4` minimum between interactive elements

### Mobile-Specific

- Stack grid columns on mobile (`grid-cols-1 md:grid-cols-3`)
- Reduce padding on mobile (`p-4 sm:p-6`)
- Show hamburger menu below `md` breakpoint

---

## Implementation Checklist

When creating new components:

- [ ] Bold typography (font-black for h1/h2, font-semibold for buttons)
- [ ] Purple accent only (no blue)
- [ ] Border-2 on cards/inputs
- [ ] Shadow-lg on cards
- [ ] Focus ring-2 ring-purple-500
- [ ] Dark mode variants
- [ ] WCAG AA contrast
- [ ] Responsive sizing
- [ ] py-20 section padding
- [ ] Semantic HTML

---

## Resources

- **Tailwind Documentation**: https://tailwindcss.com/docs
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Color Contrast Checker**: https://webaim.org/resources/contrastchecker/

---

**Questions?** See this file as the source of truth for all design decisions.
