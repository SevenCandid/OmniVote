# OmniVote Design Language (ODL) v1.0
**One System. Every Vote.**
*Powered by VeroSeven*

---

## 1. Product Personality & Design Philosophy
OmniVote's visual identity bridges high-security trust with modern, premium usability. 

### 1.1 Personality Matrix
* **Professional & Secure:** Users must immediately sense they are interacting with an enterprise-grade platform. Visual elements should convey stability and confidentiality.
* **Modern & Premium:** Inspired by clean interfaces (e.g., Stripe, Linear, Vercel). We avoid outdated, heavy corporate patterns in favor of glassmorphism, crisp borders, and refined color accents.
* **Friendly & Accessible:** Simple layouts that guide voters and administrators, reducing anxiety during high-pressure events.

### 1.2 Mobile-First Philosophy
* Every screen, component, and user flow is designed for mobile devices first.
* Desktop layouts represent **progressive enhancements** of mobile foundations.
* Touch targets, form fields, and navigations are optimized for single-hand phone usage before scaling to larger viewports.

---

## 2. Branding & Layout Grid
Branding elements establish corporate consistency across white-labeled tenant spaces.

* **Logo Placement:** 
  * Mobile: Centered in the top header.
  * Desktop: Placed in the top-left of the sidebar navigation.
  * Sizing: Minimum width of 120px; maximum width of 180px.
* **Favicon Usage:** Clean, vector representation of the OmniVote "OV" shield mark, dynamically updating logo colors based on the organization's branding schema.
* **Footer Branding:** Every tenant page must render a footer note: `Powered by VeroSeven` using Neutral Muted color, sized at 11px (XS), with 1.5px letter-spacing.
* **Consistency Rules:** Custom CSS or color overrides applied by organization administrators must adhere to minimum accessibility constraints checked by the system.

---

## 3. Typography
OmniVote uses a modern sans-serif typeface to ensure readability on small displays.

* **Primary Font Family:** **Geist Sans** (fallback to *Inter*, then system sans-serif). Geist Sans provides geometric spacing and readability on lower-resolution mobile screens.
* **Monospace Font Family:** **Geist Mono** (fallback to *Fira Code*), reserved for vote receipts, transaction references, and audit logs.

### 3.1 Type Scale Hierarchy

| Token | Size (px) | Line Height | Weight | Letter Spacing | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display` | 36px | 44px (1.2) | 700 (Bold) | -0.02em | High-impact headlines, turnout totals |
| `h1` | 30px | 38px (1.25) | 600 (Semibold) | -0.015em | Top-level dashboard headers |
| `h2` | 24px | 32px (1.3) | 600 (Semibold) | -0.01em | Section titles, event titles |
| `h3` | 20px | 28px (1.4) | 600 (Semibold) | -0.01em | Card headers, category titles |
| `body-lg` | 16px | 24px (1.5) | 400 (Regular) | 0 | Interactive voter prompts |
| `body-md` | 14px | 20px (1.4) | 400 (Regular) | 0 | Default text, settings descriptions |
| `body-sm` | 12px | 16px (1.35) | 500 (Medium) | 0.01em | Table data, metadata labels |
| `caption` | 11px | 14px (1.3) | 500 (Medium) | 0.03em | Footer, timestamp indicators, receipts |

---

## 4. Color System
OmniVote uses a semantic color system that adapts to light and dark modes.

### 4.1 Light Mode System (Base Tokens)
* **Background Canvas:** `#FAFAFA` (Slate Tint)
* **Surface Card:** `#FFFFFF` (Pure white)
* **Surface Muted:** `#F4F4F5`
* **Neutral Text (Primary):** `#09090B` (Rich dark zinc)
* **Neutral Text (Secondary):** `#52525B`
* **Neutral Text (Muted):** `#71717A`
* **Border Default:** `#E4E4E7` (Soft grey)
* **Border Muted:** `#F4F4F5`

### 4.2 Dark Mode System (Base Tokens)
* **Background Canvas:** `#09090B` (Zinc midnight)
* **Surface Card:** `#18181B` (Zinc background card)
* **Surface Muted:** `#27272A`
* **Neutral Text (Primary):** `#FAFAFA`
* **Neutral Text (Secondary):** `#A1A1AA`
* **Neutral Text (Muted):** `#71717A`
* **Border Default:** `#27272A`
* **Border Muted:** `#18181B`

### 4.3 Semantic Colors (Both Modes)
* **Primary (Brand):** `#4F46E5` (Indigo-600) — Represents action, forward progress, and main control focuses.
* **Secondary:** `#0D9488` (Teal-600) — Represents Module B branding and financial operations.
* **Success:** `#10B981` (Emerald-500) — Represents a verified vote or completed payment.
* **Warning:** `#F59E0B` (Amber-500) — Alerts regarding closing event times or warnings.
* **Danger:** `#EF4444` (Red-500) — Identifies validation failure, rejected OTP, or system lockout.
* **Information:** `#3B82F6` (Blue-500) — System announcements and metadata highlights.

---

## 5. Spacing System
The spacing system uses a **4px base grid** to ensure consistency.

* **Base Scale:**
  * `space-1`: 4px
  * `space-2`: 8px
  * `space-3`: 12px
  * `space-4`: 16px (Default mobile container padding)
  * `space-6`: 24px (Default card padding, gap spacing)
  * `space-8`: 32px (Desktop content section margins)
  * `space-12`: 48px
  * `space-16`: 64px
* **Container Widths:**
  * Mobile: 100% of viewport minus `space-4` padding on left and right.
  * Tablet / Desktop: Capped at `1280px` maximum width.
* **Form Grid Spacing:** Input groups are separated by `space-4`. Label-to-input gap is locked to `space-2`.

---

## 6. Border Radius
OmniVote features soft, rounded corners to create a modern appearance.

* **Radius Tokens:**
  * `radius-sm` (4px): Checkboxes, switches, and small tags.
  * `radius-md` (8px): Form input fields, dropdown menus.
  * `radius-lg` (12px): Standard cards, dashboard components.
  * `radius-xl` (16px): Large dialog popups, slide-out panels.
  * `radius-pill` (9999px): Primary buttons, secondary buttons, status badges.
* **Visual Hierarchy Rationale:** Pill buttons provide a clear call-to-action signature, while cards use clean, rounded corners.

---

## 7. Shadows
Shadows add depth and separate components visually.

* **Light Mode Shadows:**
  * `shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)` (Cards, input fields)
  * `shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)` (Dropdown menus, float selectors)
  * `shadow-lg`: `0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)` (Modals, popup sheets)
* **Dark Mode Shadows:**
  * Uses translucent black with a subtle light-gray border outline to create elevation.
  * Focuses on borders (`Border Default` or `Border Muted`) to define layout edges in dark mode.

---

## 8. Buttons
All primary and secondary buttons use a **full pill shape** (`radius-pill`) as their signature layout.

### 8.1 Button Specifications
* **Primary Pill:**
  * Background: Primary Indigo; Text: White.
  * Padding: 12px vertical, 24px horizontal (Mobile: 14px vertical for easier touch target).
  * Typography: `body-md` (Semibold, letter-spacing +0.02em).
* **Secondary Pill:**
  * Background: Surface Muted; Text: Neutral Primary.
  * Border: Default Border.
* **Outline / Ghost:**
  * Transparent background, thin default border, text Primary Indigo. Ghost removes border entirely.
* **Disabled:**
  * Background: Slate/Zinc 200 (light mode) / 800 (dark mode), pointer-events: none.

### 8.2 Interaction States
* **Hover:** Transform scale `1.02` with slight translation shadow elevation. Primary color shifts 5% darker.
* **Focus:** Outline ring offset `2px` colored Primary Indigo.
* **Pressed:** Transform scale `0.98`.
* **Loading State:** Text opacity set to 0. An animated loading spinner (16px SVG) is centered on the button.

---

## 9. Forms
Forms are designed with large touch targets for mobile accessibility.

* **Form Fields:** 
  * Height: 44px (Mobile optimized for touch).
  * Typography: `body-md` (Regular).
  * Padding: 12px horizontal.
* **States:**
  * **Focus:** Border transitions to `Primary`, shadow uses custom indigo glow ring.
  * **Error:** Border changes to `Danger` Red, inline warning text shows below input.
* **OTP Input Component:** Six individual input squares (each 48px x 48px) with automatic focus forwarding.
* **CSV Upload Dropzone:** Generous card area (`radius-lg`) with dashed border, light background tint, and a file attachment icon.

---

## 10. Tables
Tables are designed to handle data on both mobile and desktop viewports.

### 10.1 Responsive Behavior
* **Desktop View:** Standard multi-column tabular grid with a sticky header.
* **Mobile View:** Columns collapse, converting each row into a cards stack.

```
Desktop:
┌──────────────────┬───────────┬──────────────┐
│ Candidate        │ Category  │ Turnout      │
├──────────────────┼───────────┼──────────────┤
│ Jane Doe         │ President │ 14,203 Votes │
└──────────────────┴───────────┴──────────────┘

Mobile:
┌─────────────────────────────────────────────┐
│ Jane Doe (President)                        │
│ Turnout: 14,203 Votes                       │
└─────────────────────────────────────────────┘
```

* **Interactive Elements:** Pagination is centered at the bottom of the table using clear `< Previous` and `Next >` pill layouts.

---

## 11. Dashboard Layout
The dashboard layout is designed for admin users.

* **Mobile Layout:** Single-column layout. Top navigation bar containing a hamburger menu button and tenant selector.
* **Desktop Layout:** Two-column layout with a fixed sidebar (width 260px) and a main scrollable panel.
* **Metric Cards:** Displayed in a grid (1 column on mobile, 4 columns on desktop). Displays a large metric value alongside a comparison trend tag (e.g., `+12.4% vs last week`).

---

## 12. Navigation
* **Desktop Sidebar:** Floating card panels showing features categorized under "Elections", "Billing", "Settings", and "Audit".
* **Mobile Navigation:** Slide-out drawer menu triggered from the header.
* **Step Indicators (Ballot):** A horizontal timeline showing steps (e.g., `1. Auth ──► 2. Selections ──► 3. Review ──► 4. Receipt`).

---

## 13. Cards
Cards group related information together.

* **Spacing & Padding:** `space-6` (24px) padding.
* **Radius:** `radius-lg` (12px).
* **Hover Interaction:** Card translates up by 2px, shadow elevates, and border transitions to `Primary` color.

---

## 14. Charts
Charts display voting progress and metrics.

* **Palette:** Consistent semantic color assignments:
  * Turnout/Participation: Blue/Indigo.
  * Financial Analytics: Teal.
  * Candidate Comparisons: Alternating curated categorical colors.
* **Responsiveness:** Placed inside a container that scales down to fit mobile screens.
* **Aesthetics:** SVG-based curves, clean legends, and hover tooltip overlays.

---

## 15. Feedback Components
* **Toasts:** Float in from the bottom on mobile (top-right on desktop). Use semantic colors to indicate status (Success, Error, Warning).
* **Alert Banners:** Rendered inline at the top of content containers, matching state backgrounds.

---

## 16. Empty States
Empty states guide users when no data is available.

* **Layout:** Centered content layout featuring a soft placeholder graphic, a descriptive headline (e.g., `No Active Elections`), and a primary call-to-action button (e.g., `+ Create New Event`).

---

## 17. Loading Experience
* **Skeleton Screens:** Rendered in place of loading lists or cards using a pulse animation (`duration-2000`).
* **Page Loading:** A central loader containing the OmniVote logo and a circular progress ring.

---

## 18. Motion Design
Animations are designed to be subtle and enhance the user experience.

* **Page Transitions:** Slide-in fade-in transition (`duration-200`, `ease-out`).
* **Hover Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (Ultra-smooth spring-like transition).
* **Modal Overlay:** Fade-in transition (`duration-150`, linear).

---

## 19. Icons
* **Icon Library:** **Lucide Icons** (clean, thin vector layout).
* **Sizing Rules:**
  * Inline text icons: 14px.
  * Button / Navigation icons: 18px.
  * Feature / Empty State icons: 36px.

---

## 20. Accessibility
OmniVote meets WCAG 2.2 AA standards.

* **Contrast Ratios:** Text-to-background contrast ratio must be at least 4.5:1 (minimum 3:1 for large headers).
* **Touch Targets:** Interactive targets on mobile screens must be at least 44px x 44px.
* **Keyboard Focus:** Every interactive component has an active focus state ring.

---

## 21. Responsive Design Breakpoints
* **Mobile (`sm`):** Up to 640px.
* **Tablet (`md`):** 641px to 1024px.
* **Desktop (`lg`):** 1025px to 1440px.
* **Ultra-wide (`xl`):** 1441px and above.

---

## 22. Design Tokens Reference

```json
{
  "colors": {
    "primary": "#4F46E5",
    "secondary": "#0D9488",
    "success": "#10B981",
    "warning": "#F59E0B",
    "danger": "#EF4444",
    "info": "#3B82F6",
    "bg_light": "#FAFAFA",
    "bg_dark": "#09090B",
    "surface_light": "#FFFFFF",
    "surface_dark": "#18181B"
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px"
  },
  "radius": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "xl": "16px",
    "pill": "9999px"
  },
  "transitions": {
    "duration_fast": "150ms",
    "duration_normal": "250ms",
    "easing_default": "cubic-bezier(0.16, 1, 0.3, 1)"
  }
}
```

---

## 23. Component Naming Convention
Standard components are named using prefix systems to indicate their role:
* `Base[Component]`: Foundation elements (`BaseButton`, `BaseInput`).
* `Voter[Component]`: Voter-facing components (`VoterBallotCard`, `VoterReceipt`).
* `Admin[Component]`: Administration-specific components (`AdminMetricCard`, `AdminSidebar`).

---

## 24. UI Writing Style
* **Tone:** Clear, direct, and reassuring.
* **Formatting:** Avoid jargon. Use active voice verbs (e.g., `Submit Ballot` instead of `The ballot should be submitted`).
* **Errors:** Clearly state what went wrong and how the user can resolve the issue (e.g., `Incorrect OTP. Please check your SMS and try again.`).

---

## 25. Signature OmniVote Components
These custom elements define the signature look and feel of OmniVote:

### 25.1 The Election Ballot Card
A container designed to structure categories on the voter ballot:
* Clean borders with generous margins (`space-4`).
* Clear candidate options using radio cards.
* A checkbox indicator inside the candidate card highlights selections.

### 25.2 Live Turnout Gauge
A circular visualization showing live event progress:
* Features a progress indicator showing turnout percentage.
* A pulsing live indicator shows that metrics are updating in real-time.

### 25.3 Voter Receipt Card
Displays the cryptographic ballot verification code:
* Uses a dark monospace container to display the hash code.
* Features a one-click "Copy Receipt" button for the voter.
* Includes a green success badge confirming the vote has been recorded.
