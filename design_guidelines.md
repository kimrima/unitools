# UniTools Design Guidelines

## Design Approach
**Selected Framework**: Material Design 3 principles adapted for utility-focused workflows
**Rationale**: Handling 200+ tools across 8 categories requires systematic component reuse, clear information hierarchy, and proven patterns for data-heavy applications. Material Design provides tested solutions for complex navigation, forms, and file handling interfaces.

## Typography System

**Font Family**: Inter (Google Fonts) for interface, JetBrains Mono for code/technical outputs
- Hero/H1: 2.5rem (40px), font-bold, tracking-tight
- H2 Section Headers: 1.875rem (30px), font-semibold
- H3 Tool Titles: 1.5rem (24px), font-semibold
- Body: 1rem (16px), font-normal, leading-relaxed
- Small/Meta: 0.875rem (14px), font-medium
- Button Text: 0.9375rem (15px), font-semibold

## Layout System

**Spacing Units**: Tailwind 4, 6, 8, 12, 16, 24 (keep it constrained)
- Component padding: p-6 or p-8
- Section spacing: py-12 (mobile), py-16 (desktop)
- Card gaps: gap-6
- Form fields: space-y-4

**Grid Structure**:
- Max container: max-w-7xl mx-auto px-4
- Tool grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Category navigation: 8 equal columns on desktop, stack on mobile

## Core Components

### Navigation
- **Top Header**: Sticky navigation with logo (left), category dropdown (center), language selector + search (right)
- **Category Bar**: Horizontal scrollable tabs showing all 8 categories with active state indicators
- **Breadcrumb**: Always visible showing Home > Category > Tool Name for deep navigation

### Tool Cards (Homepage/Category Pages)
- Compact card design: Icon (top), Tool Name, One-line description, "Use Tool" button
- Fixed aspect ratio to maintain grid alignment
- Hover state: subtle elevation increase, no transformation
- Badge system for "Popular", "New", "Beta" tools

### Tool Page Layout
- **Left Sidebar** (desktop): Tool settings, options, and configuration forms (w-80)
- **Main Area**: Large drop zone or input area with clear CTAs
- **Right Panel** (optional): Output preview or results
- **Mobile**: Stack vertically - settings accordion at top, drop zone below

### File Upload/Drop Zones
- Dashed border rectangle with centered icon and text
- Minimum height: min-h-64
- Clear file type indicators and size limits
- Progress bars for processing feedback
- Multi-file support with list view of queued items

### Forms & Inputs
- Label above input: font-medium text-sm mb-2
- Input fields: rounded-lg border with focus ring, h-12 for text inputs
- Dropdown selects: Custom styled with chevron icon
- Sliders: For numeric adjustments (quality, compression)
- Checkbox groups: For batch options

### Buttons
- Primary Action: Large rounded-full px-8 py-3
- Secondary: Outlined variant with same size
- Icon buttons: Square touch targets (44x44px minimum)
- Download/Export: Always prominent with icon

### Output Display
- **Preview Cards**: For images/PDFs with thumbnail + metadata
- **Download Section**: Clear download button + format/size info
- **Comparison View**: Before/after slider for image tools
- **Batch Results**: Table or grid showing all processed files with individual download links

### Footer
- Compact design: Category links, About/Contact, Language selector, Social links
- Newsletter signup: Single-row email input + button
- Trust indicators: "100% client-side processing", Privacy statement

## Page-Specific Layouts

### Homepage
1. **Hero Section** (h-96): Bold headline "200+ Tools, Zero Server Processing", primary category buttons (4 featured), search bar
2. **Category Grid**: 8 cards showing category icons, tool count, and top 3 tools
3. **Popular Tools**: 3-column grid of most-used utilities
4. **Value Props**: 3 columns explaining client-side processing, multi-language, free forever

### Category Pages
1. **Category Header**: Icon, name, description, tool count
2. **Filter Bar**: Search within category, sort options (Popular, A-Z, Recently Added)
3. **Tool Grid**: 12-16 tools per page with pagination

### Individual Tool Pages
- No hero image needed - utility-focused
- Immediate access to tool functionality above the fold
- Instructions/help text in collapsible accordion below tool
- Related tools section at bottom

## Images
**Hero Section**: Abstract illustration representing digital tools/connectivity (NOT photo), integrated as background with gradient overlay for text readability
**Category Icons**: Custom icon set for all 8 categories (PDF, Image, Video, etc.)
**Tool Cards**: Icon-based, no photographs needed
**Trust/Value Section**: Optional geometric patterns as visual breaks

## Responsive Behavior
- **Desktop (lg)**: Full sidebar layouts, 4-column tool grids
- **Tablet (md)**: 2-column grids, collapsible sidebars
- **Mobile**: Single column, hamburger menu, bottom sheet for options

## Accessibility Standards
- All interactive elements: min-h-11 touch targets
- Form labels: Always visible, never placeholder-only
- Focus indicators: Thick 3px outline on focus
- Skip links for keyboard navigation
- ARIA labels for icon-only buttons

## Animations
**Minimal approach**:
- Page transitions: Simple fade-in only
- File upload: Progress indicator animation
- Success states: Subtle checkmark animation
- Avoid: Scroll animations, parallax, decorative motion

This utility platform prioritizes speed, clarity, and function over visual flair.