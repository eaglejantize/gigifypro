# Design Guidelines for Gigifypro

## Design Approach

**Selected Approach**: Reference-Based Design inspired by marketplace leaders
- **Primary Reference**: Airbnb (trust-driven marketplace aesthetics, booking flows, clean card designs)
- **Secondary References**: LinkedIn (professional profiles, credibility signals), TaskRabbit (service discovery patterns)
- **Key Principles**: Build trust through clarity, showcase services beautifully, make booking frictionless, emphasize social proof

## Core Design Elements

### A. Color Palette

**Light Mode**:
- Primary: 220 90% 56% (trust blue - professional, reliable)
- Primary Hover: 220 90% 48%
- Background: 0 0% 100% (pure white)
- Surface: 220 13% 97% (subtle warm gray)
- Border: 220 13% 91%
- Text Primary: 222 47% 11%
- Text Secondary: 215 16% 47%

**Dark Mode**:
- Primary: 220 90% 64%
- Primary Hover: 220 90% 72%
- Background: 222 47% 11%
- Surface: 217 33% 17%
- Border: 217 33% 24%
- Text Primary: 210 40% 98%
- Text Secondary: 215 20% 65%

**Accent Colors** (used sparingly):
- Success: 142 76% 36% (completed jobs, positive reviews)
- Warning: 38 92% 50% (pending actions)
- Error: 0 84% 60% (cancellations, issues)

### B. Typography

**Font Families**:
- Primary: 'Inter' (headings, UI, body text) - via Google Fonts CDN
- Monospace: 'JetBrains Mono' (pricing, stats, technical info)

**Type Scale**:
- Hero: text-6xl (60px) font-bold
- H1: text-4xl (36px) font-bold
- H2: text-3xl (30px) font-semibold
- H3: text-2xl (24px) font-semibold
- H4: text-xl (20px) font-medium
- Body: text-base (16px) font-normal
- Small: text-sm (14px) font-normal
- Caption: text-xs (12px) font-medium

### C. Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 8, 12, 16, 20, 24 for consistent rhythm
- Component padding: p-4, p-6, p-8
- Section spacing: py-16, py-20, py-24
- Card gaps: gap-4, gap-6, gap-8
- Grid columns: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

**Container Widths**:
- Full sections: max-w-7xl mx-auto
- Content areas: max-w-6xl mx-auto
- Forms: max-w-2xl mx-auto
- Reading content: max-w-prose

### D. Component Library

**Worker/Service Cards**:
- Rounded corners (rounded-xl)
- Subtle shadow (shadow-sm hover:shadow-md transition)
- Profile image (circular, 48px or 64px)
- Like count with heart icon (Heroicons)
- Star rating display (filled/outlined stars)
- Price tag prominent (font-semibold, larger text)
- Quick action buttons (Book Now, Message)

**Booking Flow Components**:
- Step indicator (numbered circles with connecting lines)
- Price calculator card (sticky on desktop)
- Calendar picker (date/time selection)
- Location input with map preview placeholder
- Confirmation summary card

**Profile Components**:
- Split layout: sidebar with stats, main content area
- Badge system (verified, top-rated, fast responder)
- Stats grid (4 columns: likes, ratings, jobs completed, response time)
- Portfolio/work showcase grid (masonry or 3-column)
- Review cards with like button integration

**Messaging Interface**:
- Chat bubble design (sender: primary color, receiver: surface color)
- Threaded by booking (context header showing job details)
- Quick actions toolbar (attach, emoji, send)
- Unread indicators (badge count)

**Navigation**:
- Top navbar: transparent on landing, solid white/dark on scroll
- Primary: Logo left, main links center, profile/notifications right
- Mobile: hamburger menu with slide-in drawer
- Bottom nav on mobile (Feed, Post, Inbox, Profile)

**Forms & Inputs**:
- Consistent border-radius (rounded-lg)
- Focus states with ring (ring-2 ring-primary)
- Labels above inputs (text-sm font-medium)
- Helper text below (text-xs text-secondary)
- Error states (border-error, text-error)

**Data Displays**:
- Ranking score visualization (progress bars or numerical badges)
- Activity timeline (vertical line with dots)
- Earnings charts (simple bar/line charts using chart.js placeholders)
- Stats cards (icon + number + label in grid)

### E. Animations

**Minimal, Purposeful Animations**:
- Card hover lift (transform scale-[1.02] transition-transform)
- Button press feedback (active:scale-95)
- Like button heart animation (scale bounce on click)
- Skeleton loaders for async content (animate-pulse)
- Page transitions (fade-in only, no sliding)

## Page-Specific Layouts

### Landing Page
- Hero: 80vh with large image background (service workers in action), centered headline + dual CTAs
- Trust indicators: "10,000+ services completed" ticker
- 3-column feature grid (How it Works)
- 6-column service category showcase (icons + labels)
- Social proof: 2-column testimonial cards with star ratings
- Final CTA: centered, contrasting background section

### Feed (Ranked Listings)
- Filter bar: sticky top, category pills, sort dropdown
- Masonry grid or 3-column cards (worker listings)
- Infinite scroll with loading states
- Each card: photo, name, rating, like count, price, quick book button

### Post Task Wizard
- Multi-step form (4 steps: category, details, timing, review)
- Progress indicator at top
- Side panel: live price calculation
- Sticky bottom bar: Back/Next/Submit buttons

### Profile Page
- Hero banner with profile photo (left-aligned large)
- Stats row: 4 metrics with icons
- Tabbed content: About, Services, Reviews, Portfolio
- Right sidebar: pricing, availability calendar, contact button

## Images

**Hero Section**: 
- Landing page hero: High-quality image showing diverse service workers (handyman, chef, trainer) in action, warm and professional lighting, overlaid with dark gradient for text readability

**Worker Profile Photos**:
- Circular avatars throughout cards and listings
- Professional headshots preferred

**Service Category Icons**:
- Use Heroicons for category representations (wrench, chef hat, dumbbell, etc.)
- Consistent size (w-8 h-8 or w-12 h-12)

**Portfolio Showcase**:
- Grid of completed work photos (3 columns on desktop, 2 on tablet, 1 on mobile)
- Aspect ratio 4:3 or 16:9, consistent across grid

**Trust Signals**:
- Badge icons for achievements (verified checkmark, star burst, lightning bolt)
- Placeholder for map preview in location selection

This design system creates a trustworthy, professional marketplace that prioritizes clarity, social proof, and seamless booking experiences while maintaining visual appeal and modern aesthetics.