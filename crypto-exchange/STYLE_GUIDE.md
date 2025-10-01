# Dookie Crypto Exchange - AI Assistant Style Guide

## Core Principles

### 1. No Emojis
Never use emojis in any AI responses. Keep communication professional and text-only.

### 2. Concise Messaging
Keep messages short and to the point. Users should be able to quickly understand what they need to do next.

### 3. Avoid Brand Name in Communication
Never use the word "dookie" when communicating with users - it sounds unprofessional. Refer to the platform generically as "the platform" or "your account."

### 4. Direct and Clear
- Use simple, direct language
- Avoid jargon unless necessary
- One clear call-to-action per message

### 5. Progressive Disclosure
Only show users what they need to know next. Don't overwhelm with all options at once.

## Specific Scenarios

### Initial Greeting (Empty Account)
**Say:** "Welcome. Are you ready to start your account? We currently accept PYUSD deposits, would you like me to show you how to do that?"

**Don't say:** Long explanations, multiple options, or overwhelming detail upfront.

### Funding Flow
**User agrees (yes/sure/ok/what's that):**
- Call `show_funding_info` tool
- Provide brief instruction: "Open PayPal or Venmo, buy some PYUSD, then go to the 'Send' tab and input the address shown below."

**User declines (no/not now/later):**
- Say: "Thank you. Check back later to see when we offer additional deposit options."
- Don't push or try to convince

### General Tone
- Professional but friendly
- Helpful without being pushy
- Clear without being robotic
- Concise without being curt

---

## Motion and Interaction Design

### Animation Duration Standards
- **Micro-interactions** (hover, press): 100–150ms
- **UI reveal** (card, table, modal): 200–300ms
- **Larger transitions** (full panel, overlay): 300–400ms

### Easing
Use `ease-in-out` for smooth, gradual acceleration/deceleration that reinforces the concierge metaphor.

### Chat Interactions

#### Typing Indicator
- Animated pulsing dots (`...`)
- Each dot pulses every 500ms with staggered delays (0ms, 166ms, 332ms)
- Color: `#a3a3a3` (gray-400) on navy background
- CSS class: `.animate-pulse-dot`

#### Message Appearance
- **Assistant messages**: Fade + slide in from left (200ms)
  - Animation: `slideInLeft`
  - CSS class: `.animate-slideInLeft`
- **User messages**: Fade + slide in from right (200ms)
  - Animation: `slideInRight`
  - CSS class: `.animate-slideInRight`

### Progressive UI Reveal

#### Card/Panel Entrance
- Animation: Fade + upward slide (250ms)
- Elevation: Soft shadow `0 4px 16px rgba(0,0,0,0.25)`
- CSS class: `.animate-cardReveal`
- Apply to: Funding info, balance cards, trading interface, portfolio

#### Button States

**Hover:**
- Increase brightness by 10% (`hover:brightness-110`)
- Transition: 120ms `ease-in-out`

**Press/Active:**
- Scale down to 98% (`active:scale-[0.98]`)
- Duration: 120ms

**Disabled:**
- Opacity: 60% (`disabled:opacity-60`)
- Cursor: `disabled:cursor-not-allowed`
- No hover effects on disabled state

**Focus (inputs):**
- Border color changes to gold (`#d4af37`)
- Transition: 120ms `ease-in-out`

### Loading States

#### Infinity Symbol Spinner
- Continuous rotation (2s per rotation)
- Color: Gold (`#d4af37`) on navy
- CSS class: `.animate-infinity-spin`

### Success Confirmations
- Gold glow pulse behind element
- Animation: Fade-out over 200ms
- CSS class: `.animate-gold-glow`
- Box shadow: `0 0 20px rgba(212, 175, 55, 0.5)` fading to transparent

### Accessibility

#### Reduced Motion Support
All animations respect `@media (prefers-reduced-motion: reduce)`:
- Animations are disabled
- Instant opacity and position changes
- Maintains visual hierarchy without motion

### Implementation Classes

```css
/* Message animations */
.animate-slideInLeft      /* 200ms fade + slide from left */
.animate-slideInRight     /* 200ms fade + slide from right */

/* Card/panel reveals */
.animate-cardReveal       /* 250ms fade + upward slide */

/* Loading states */
.animate-pulse-dot        /* 500ms pulsing dot */
.animate-infinity-spin    /* 2s continuous rotation */

/* Success feedback */
.animate-gold-glow        /* 200ms gold glow fade-out */
```

### Transition Utilities
- Standard interactive transitions: `transition-all duration-[120ms] ease-in-out`
- Hover brightness: `hover:brightness-110`
- Active scale: `active:scale-[0.98]`
- Focus border: `focus:border-[#d4af37]`
