# FileBrik Component Inventory & Specification

All UI components are built using semantic HTML5 and vanilla CSS scoped to `--fb-*` design tokens defined in `design/tokens.css`. Zero external CSS framework or Tailwind CDN is used.

## 1. Core Component Specs

### 1.1 Header & Navigation (`<header class="fb-header">`)
- Sticky container (`position: sticky; top: 0; z-index: 50`)
- Brand Logo with icon + wordmark ("FileBrik")
- Search bar for quick tool lookup
- Quick tool dropdown + Category links (PDF, Image, Audio)

### 1.2 Tool Card (`<div class="fb-card">`)
- Standardized container for client-side processing
- File Dropzone with drag-over visual feedback
- Accepted file types indicator and max client memory badge
- Client-side guarantee badge ("100% Client-Side: Your files never leave your device")

### 1.3 Action Buttons (`.fb-btn`)
- `.fb-btn--primary`: Solid brand indigo `#4F46E5`, white text, focus ring.
- `.fb-btn--secondary`: Slate surface with border.
- `.fb-btn--success`: Emerald green for Download/Save actions.
- `.fb-btn--ghost`: Clean text button for secondary actions.

### 1.4 Progress & Feedback Indicator (`.fb-progress`)
- Linear progress bar with percentage readout and step status text.
- Indeterminate pulse animation during cryptographic hashing or complex PDF rendering.

### 1.5 Result Pane (`.fb-result`)
- Clear before/after file size reduction badges (`-64% saved`).
- Instant Download button with download count / filename.
- "Next step" tool recommendation buttons for multi-step workflows.

### 1.6 Ad Container Specifications (`.fb-ad`)
- Statically reserved height containers to enforce CLS < 0.05.
- Fixed aspect-ratio wrappers for banner, native, and social widgets.
- Explicit visual separation from tool interaction controls.
- Never rendered on `/privacy`, `/terms`, or `/contact`.

### 1.7 Affiliate Card (`.fb-affiliate`)
- Distinct border styling with sponsored disclosure label.
- High-relevance companion service links (e.g. Adobe Acrobat Pro, pCloud secure cloud, Surfshark VPN).
