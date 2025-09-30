# Dookie UI Style Guide v0.1

This document defines the visual and interaction standards for the Dookie exchange interface.
It is written to be machine-consumable for implementation in code.

---

## 1. Brand Identity

- **Name:** `dookie`
- **Definition (Splash Text):**

> dookie
> Latin, noun
>
> The successful investment of effort and resources resulting in prosperity.
>
> A state of enduring abundance achieved through wise action and focus.

- **Tone:** buttoned-up, friendly, smart
- **UX Philosophy:** modern, simple, beginner-friendly first; pro-trader depth later

---

## 2. Logo

- **Primary Concept:** stylized infinity symbol replacing the double "oo"
- **Forms:**
  - `d∞kie` (full wordmark, lowercase)
  - Infinity symbol alone (icon)
- **Style:** minimal, geometric/modern
- **Colors:** navy (primary), white (inverted)

---

## 3. Typography

- **Primary Typeface:** serif (contemporary, warm)
  Candidates: Merriweather, Source Serif Pro, Georgia
- **Secondary Typeface (UI + labels):** sans-serif
  Candidates: Inter, Roboto
- **Monospace (for addresses/IDs):** IBM Plex Mono
- **Rules:**
  - Headings: serif, bold
  - Body: serif, regular
  - Labels/UI: sans-serif
  - Weights: solid, not heavy

---

## 4. Color Palette

- **Base Color:** warm/traditional dark navy (near black)
- **Accents:** metallic gold, metallic silver
- **Functional Colors:**
  - Success: Green `#00C853`
  - Error: Red `#D32F2F`
  - Warning: Orange `#F9A825`
  - Neutral Grays: scale from light → dark for text and backgrounds
- **Mode:** dark mode first; define light mode variant later

---

## 5. UI Elements

- **Buttons:**
  - Style: filled (solid navy or accent), outlined as secondary
  - Shape: sharp corners, serious look
  - States: default, hover, pressed, disabled
- **Tables:**
  - Beginner-friendly: open spacing, simple layout
  - Pro (future): dense, data-rich layout
  - Consistent color coding: green = buy, red = sell, navy = neutral
- **Forms & Inputs:**
  - Styles: bordered fields with clear focus state
  - States: default, hover, focus, disabled, error
- **Cards/Panels:** flat with subtle shadow, rounded corners (4px radius)

---

## 6. Feedback & Messaging

- **Alerts/Notifications:**
  - Success: green background, plainspoken copy
  - Error: red background, plainspoken copy
  - Info: navy background, white text
- **Examples:**
  - Success: "Your trade was submitted successfully."
  - Error: "Looks like you don't have enough funds for this trade."
  - Warning: "Gas fees are unusually high right now."

---

## 7. Navigation & Layout

- **Navigation:** top nav for global actions, side nav for secondary tools
- **Grid System:** responsive breakpoints (desktop, tablet, mobile)
- **Spacing Scale:** multiples of 4px (4, 8, 16, 24, 32)
- **Containers:** max-width 1440px, with gutters

---

## 8. Iconography

- **Library:** start with standard icon set (Feather or Material Icons)
- **Style:** line-based, consistent stroke weight
- **Asset Logos:** use official token logos (BTC, ETH, etc.)

---

## 9. Copy & Tone

- **Voice:** plainspoken, direct, approachable
- **System Messages:** clear and simple, avoid jargon
- **Tooltips:** optional toggle for educational mode

---

## 10. Accessibility

- **Color Contrast:** meet WCAG AA contrast ratios
- **Font Sizes:** minimum 14px body, 16px inputs
- **Keyboard Navigation:** all interactive elements tabbable
- **Screen Readers:** ARIA labels where necessary

---

## 11. Specialized Exchange Elements

- **Order Book:** red/green bid-ask standard
- **Charts:** candlestick default with navy background, green = up, red = down
- **Trade Indicators:** consistent with functional colors
