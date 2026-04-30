---
name: Premium Mobility
colors:
  surface: '#fcf8f9'
  surface-dim: '#dcd9da'
  surface-bright: '#fcf8f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f3'
  surface-container: '#f0eded'
  surface-container-high: '#ebe7e8'
  surface-container-highest: '#e5e2e2'
  on-surface: '#1c1b1c'
  on-surface-variant: '#45474b'
  inverse-surface: '#313031'
  inverse-on-surface: '#f3f0f0'
  outline: '#76777c'
  outline-variant: '#c6c6cc'
  surface-tint: '#5a5e69'
  primary: '#080c14'
  on-primary: '#ffffff'
  primary-container: '#1e222b'
  on-primary-container: '#868994'
  inverse-primary: '#c3c6d2'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#110b02'
  on-tertiary: '#ffffff'
  tertiary-container: '#292113'
  on-tertiary-container: '#948875'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dfe2ef'
  primary-fixed-dim: '#c3c6d2'
  on-primary-fixed: '#181c24'
  on-primary-fixed-variant: '#434751'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#f0e0ca'
  tertiary-fixed-dim: '#d3c4af'
  on-tertiary-fixed: '#221a0d'
  on-tertiary-fixed-variant: '#4f4535'
  background: '#fcf8f9'
  on-background: '#1c1b1c'
  surface-variant: '#e5e2e2'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 56px
    fontWeight: '800'
    lineHeight: '1.1'
  headline-md:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  section-padding: 80px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The brand personality is rooted in reliability, efficiency, and a premium "executive" feel. This design system targets sophisticated travelers and professionals who value clarity and quality. 

The aesthetic follows a **Corporate / Modern** movement, leaning heavily into minimalism. It avoids visual clutter, favoring high-quality car photography as the primary expressive element. The interface should feel expensive yet accessible, utilizing generous whitespace to communicate a sense of calm and organized logistics.

## Colors

The palette is anchored by a deep charcoal primary color that serves as the foundation for all high-emphasis elements, including primary buttons and headlines. This is contrasted against a pure white background to maintain high readability and a clean "gallery" feel for the car imagery.

Subtle gray accents are used for secondary information, icon containers, and section backgrounds to create a clear visual hierarchy without introducing distracting hues. This monochromatic approach ensures that the vibrant colors of the automobiles remain the focal point of the user experience.

## Typography

This design system utilizes **Manrope** for all text levels to maintain a refined, balanced, and highly legible appearance. The typography relies on significant weight contrast—using ExtraBold for hero headers and Medium or Regular for body text—to guide the user's eye.

Line heights are kept tight for headings to create a modern, "impactful" look, while body copy is given more breathing room to improve readability. Small labels and "pre-headers" use uppercase styling and slight tracking to differentiate them from standard prose.

## Layout & Spacing

The layout utilizes a **Fixed Grid** model centered on the screen with a maximum width of 1280px. A 12-column grid provides the structure for content blocks, with car cards typically spanning 4 columns and search widgets spanning the full 12.

Spacing follows a strict vertical rhythm. Large 80px to 100px gaps separate major sections to prevent the UI from feeling cramped. Within components, an 8px base unit is used to define padding and margins, ensuring consistent alignment between icons, text, and button boundaries.

## Elevation & Depth

Visual depth in the design system is achieved through **Tonal Layers** and extremely soft **Ambient Shadows**. Instead of heavy shadows, the system uses light gray surface containers (e.g., `#F8FAFC`) to distinguish interactive areas from the main white background.

Where shadows are applied—specifically on car cards and the primary search widget—they are diffused and low-opacity (around 4-6%), creating a subtle "lift" rather than a hard physical presence. This ensures the UI remains flat and modern while still providing enough affordance for interactivity.

## Shapes

The design system employs a **Rounded** shape language to soften the corporate aesthetic and make the platform feel more approachable. 

- **Primary Buttons & Inputs:** Use a 0.5rem (8px) radius for a modern, standard look.
- **Content Cards:** Use a larger 1rem (16px) radius to create a distinct frame for imagery and text.
- **Section Containers:** Occasional use of "large" rounded corners (1.5rem) for immersive blocks like the special offer or search tray.

## Components

### Buttons
Primary buttons are solid charcoal with white text and a right-pointing arrow icon for directional flow. Secondary buttons use a light gray outline or a simple text-plus-icon treatment for lower-priority actions like "How it Works."

### Search Widget
A prominent, horizontal bar with divided sections for Location, Pick-up, and Drop-off dates. Each section includes a recognizable icon and a dropdown chevron, maintaining a high-density utility look.

### Car Cards
Cards are clean, white containers with a soft shadow. The car image is placed at the top with a transparent background, followed by the car name in a bold weight and technical specs (transmission, seats) in a muted gray label. The price is emphasized in the bottom-left, paired with a "View Details" text link.

### Features Grid
Simple, centered compositions featuring a thin-line icon followed by a small headline and descriptive text. These icons are housed in soft-gray circular or rounded-square backgrounds to provide visual consistency.

### Input Fields
Inputs for the newsletter or contact forms use a light gray background with minimal borders and subtle placeholder text. The "Subscribe" button is often nested within the input field or placed immediately adjacent to maintain a compact footprint.