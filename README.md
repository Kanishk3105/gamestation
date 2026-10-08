# 🎮 GameStation — Next-Gen Gaming Console Rental Platform

> **Portfolio-Grade, Award-Winning Web Application** built with React 19, TypeScript, Vite, Three.js, React Three Fiber, Drei, and Framer Motion.

[![React](https://img.shields.io/badge/React-19.1.0-61dafb.svg?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.0-3178c6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.0-646cff.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-R175-black.svg?style=flat-square&logo=three.js)](https://threejs.org/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.6.0-ff0055.svg?style=flat-square)](https://www.framer.com/motion/)

---

## 🌟 Executive Summary

GameStation is a high-performance, dark-mode gaming marketplace designed specifically for renting PlayStation 5 consoles, bundled controllers, EA Play access, and gaming library packages.

Inspired by **Apple-style product minimalism**, **futuristic gaming HUDs**, and **luxury ecommerce**, the application elevates standard catalogue browsing into a cinematic, fluid, and tactile experience.

---

## 🚀 Key Features & Architectural Highlights

### 1. 🗃️ 100% Real Product Catalog (Zero Synthetic Data)
- **23 verified console packages** directly sourced from `product-list.json`.
- Accurately renders:
  - Real daily rental rates (including decimals, e.g. ₹158.25 for PlayStation Portal).
  - High booking counts (formatted intuitively: `649`, `1.5K+`, `10K+`).
  - Tags (`Trending` [Orange], `New` [Cyan], `Vote to Launch` [Purple], and Untagged).
  - Out of stock state management (4 packages appropriately flagged and visually dimmed with disabled CTAs).
  - Dynamic ratings (handling 0 rating gracefully with `⭐ New Arrival`).

### 2. 🌌 Ambient 3D Experience (Three.js & R3F)
- Code-split into a separate bundle (`Scene3D-*.js` and `three-vendor-*.js`) so the initial page load remains instant.
- Lightweight floating abstract geometry with glass physical materials, dynamic mesh distortion, and environmental reflection.
- Adaptive performance:
  - Automatically disabled on mobile devices (`max-width: 768px`) to conserve battery and GPU resources.
  - Automatically respects user OS preference `prefers-reduced-motion` by freezing animation loops.

### 3. 🎯 Cursor-Responsive Micro-Interactions (Desktop)
- **3D Card Perspective Tilt**: Smooth ±6° multi-axis tilt following cursor trajectory on hover with smooth spring reset.
- **Dynamic Radial Spotlight**: Ambient light follow effect illuminating glass edges behind the mouse.
- **Responsive Touch Equivalents**: Tactile scale-tap feedback on mobile and touchscreens.

### 4. 🔍 Instant Search & Multi-Dimensional Filtering
- **Case-Insensitive Instant Search**: Real-time matching against titles, categories, and tags.
- **Availability Filters**: `All`, `Available`, `Out of Stock`.
- **Dynamic Tag Filtering**: Color-coded chips for `Trending`, `New`, and `Vote to Launch`.
- **Price Range Control**: Smooth slider dynamically bound between min (₹158) and max (₹440) prices.
- **Star Rating Filter**: 1 to 5-star minimum threshold.
- **Sorting Options**:
  - Most Popular (by `booked_count`)
  - Price: Low to High
  - Price: High to Low
  - Highest Rated
  - Newest Arrivals
- **Active Filter Chips**: Removable chips with 1-click dismissal and a "Clear All" action.
- **Designed Empty State**: Engaging animated gamepad empty screen with a 1-tap "Clear Filters" CTA.

### 5. 📱 Responsive Engineering Across All Breakpoints
- **Mobile Drawer / Bottom Sheet**: Filter controls slide smoothly from the bottom on phones and tablets with spring physics.
- **Compact Frosted Navigation**: Sticky navigation bar transforms from transparent to frosted blur on scroll (`backdrop-filter: blur(20px)`).
- **Responsive Grid**:
  - `> 1200px`: 4 columns
  - `1024px - 1199px`: 3 columns
  - `640px - 1023px`: 2 columns
  - `< 640px`: 1 column
- Zero horizontal overflow across 320px, 375px, 390px, 430px, 768px, 1024px, 1280px, and 1440px+.

### 6. 🪟 Comprehensive Product Detail Modal
- Triggered by clicking any available product card.
- Displays high-resolution product imagery, ratings, pricing, and live availability badge.
- **Dynamic Rental Inclusions**: Intelligently parses package attributes (DualSense controllers count, games library, EA Play subscription, racing wheel accessories).
- Complete accessibility:
  - `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"`.
  - Body scroll lock during view.
  - `Escape` key dismissal.
  - Focus trap and focus restoration to trigger element on close.

---

## 🛠️ Tech Stack & Dependencies

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 19 + TypeScript | Core UI & Strict Type Safety |
| **Bundler** | Vite 6 | Sub-second HMR & Production Rollup Build |
| **Motion** | Framer Motion 12 | Fluid Spring Physics & Layout Animations |
| **3D Engine** | Three.js + R3F + Drei | Ambient Floating Hero Scene |
| **Styling** | Modern CSS-in-JS + CSS Tokens | High-Performance Zero-Runtime CSS Glassmorphism |
| **Icons** | Custom Inline SVGs | Zero external icon library bloat |

---

## 📦 Project Setup & Running Locally

### Prerequisites
- Node.js 18+ (tested on Node 20 & 22)
- npm 9+

### Installation

```bash
# Navigate to the project directory
cd gamestation

# Install dependencies
npm install

# Create the local SQLite database and seed product catalog
npx prisma db push
npx tsx prisma/seed.ts

# Start the app
npm run dev:all
```

### Production Build & Preview

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## ♿ Accessibility Standards (WCAG 2.1 AA)

- **Semantic HTML**: `<header>`, `<nav>`, `<section>`, `<article>`, `<main>`, `<footer>`.
- **Keyboard Navigation**: Full keyboard traversal using Tab, Shift+Tab, Enter, Space, and Escape.
- **Focus Rings**: High-contrast, glowing focus rings via `:focus-visible`.
- **Screen Reader Support**: Descriptive `aria-label`, `aria-expanded`, and `aria-modal` attributes.
- **Reduced Motion**: Complete CSS `@media (prefers-reduced-motion: reduce)` rules and JS-level `usePrefersReducedMotion` disabling 3D rotations, continuous floats, and heavy scaling.

---

## 🎨 Visual System & Design Tokens

- **Background Base**: `#0a0a0f` (Deep Obsidian)
- **Surface Elevation**: `rgba(255, 255, 255, 0.03)` with `1px solid rgba(255, 255, 255, 0.06)` border
- **Accent Primary**: `#6366f1` (Electric Indigo) to `#8b5cf6` (Electric Violet)
- **Trending Tag**: `#f97316` (Neon Blaze)
- **New Tag**: `#06b6d4` (Cyber Cyan)
- **Vote Tag**: `#a855f7` (Cosmic Purple)
- **Typography**: Inter (Body) & Space Grotesk (Headings)
