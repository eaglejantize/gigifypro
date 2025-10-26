# gigifypro

## Overview

gigifypro is a gig-economy marketplace platform connecting clients with local service professionals. The platform enables service discovery, booking, real-time messaging, and a trust-based review system where "likes" function as positive review signals. Built as a full-stack TypeScript application with modern web technologies, it emphasizes transparent pricing, worker verification, and social proof through ratings and reviews.

**New Feature (Oct 2025):** Launched a Public Discourse system (Digital Town Square) with community posts, comments, reactions, topics, reputation/karma system, moderation tools, and hot feed algorithm for community engagement.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing**
- React 18 with TypeScript using Vite as the build tool
- Wouter for lightweight client-side routing
- Page-based architecture with routes for landing, feed, listings, profiles, dashboard, inbox, and settings

**UI & Styling**
- shadcn/ui component library with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design system
- Design inspired by marketplace leaders (Airbnb, LinkedIn, TaskRabbit) for trust-building aesthetics
- Inter font family for UI/body text, JetBrains Mono for pricing/technical information
- Comprehensive color palette supporting light/dark modes with trust-blue primary color (HSL: 220 90% 56%)

**State Management**
- React Query (TanStack Query) for server state management and data fetching
- React Context API for authentication state
- Local storage for persisting user authentication
- Form state managed with React Hook Form and Zod validation

**Key Features**
- Worker discovery feed with search and filtering
- Service listing detail pages with booking flows
- User and worker profile pages
- Real-time messaging inbox interface
- Dashboard for managing bookings and tracking performance
- Settings pages for account and worker profile configuration
- Services index page with InfoPopover tooltips for each service
- Admin area for managing service information (role-restricted)
- Brand slogan banner "Learn. Earn. Get Gigified."

### Backend Architecture

**Runtime & Framework**
- Node.js with Express.js as the HTTP server
- TypeScript for type safety across the entire backend
- RESTful API design pattern at `/api/*` endpoints

**Authentication & Security**
- Bcrypt for password hashing (6 rounds)
- Session-based authentication with express-session
- Role-based access control (user, worker, admin roles)
- Admin middleware protecting sensitive routes (/api/admin/*)
- Credential-based auth with future OAuth readiness
- Current user endpoint (/api/me) for retrieving user profile with role

**API Structure**
- Validation using Zod schemas for request bodies
- Centralized storage layer abstracting database operations
- Type-safe contracts between frontend and backend via shared schema definitions
- Error handling middleware for consistent error responses

**Core Business Logic**
- Pricing calculator: Default $25 per 30-minute blocks with customizable rates
- Worker ranking algorithm: Weighted scoring based on likes (1.0x), ratings (2.5x), recency decay (0.85 per week), and response time bonuses
- Booking state machine: requested → accepted → in_progress → completed → cancelled

### Data Storage

**Database**
- PostgreSQL as the primary database
- Drizzle ORM for type-safe database queries and schema management
- Neon serverless PostgreSQL with WebSocket support for connection pooling

**Schema Design**
- Users table with role-based access (user, worker, admin)
- Worker profiles linked to users with skills, rates, and verification status
- Service categories for organizing offerings
- Service listings published by workers
- Job requests posted by clients
- Bookings as the contract entity tracking state transitions
- Review/Like system combining social signals with optional ratings and comments
- Messages table for in-app chat functionality
- Notifications table for user alerts
- Badges table storing certification/achievement definitions with icons and descriptions
- UserBadges join table tracking user certification achievements with earned dates
- AnalyticsEvents table for tracking user engagement (page views, service views, knowledge views, CTA clicks)

**Community Discourse Tables**
- Topics: Pre-defined discussion categories (4 topics: ideas, service-tips, show-tell, neighborhood)
- Posts: User-generated forum posts with markdown support, service tagging, and hot scoring
- Comments: Nested discussion threads under posts with markdown support
- Reactions: User engagement signals (LIKE, HELPFUL, INSIGHTFUL) with weighted scoring
- Reports: User-submitted content moderation reports (handled by admins)
- Reputations: User karma/reputation scores earned from community engagement
- CommunityFollows: Topic subscription tracking
- UserFollows: User-to-user following relationships

**Data Relationships**
- One-to-one: User to WorkerProfile
- One-to-many: Worker to ServiceListings, User to JobRequests, Booking to Messages, Topic to Posts, Post to Comments, User to Posts/Comments/Reactions
- Many-to-many implicit: Categories to Services through listings, Users to Topics through CommunityFollows, Users to Users through UserFollows

**File-Based Storage**
- Service info stored in JSON format at server/content/serviceInfo.json
- Contains 75 comprehensive service guides across 12 categories with summaries, detailed descriptions, gear recommendations, requirements, and badges
- Admin-editable via protected CRUD endpoints with Zod validation
- Used by InfoPopover component for inline tooltips across the platform
- Backup maintained at server/content/serviceInfo.backup.json
- Testimonials stored in server/content/testimonials.json with curated user success stories
- Badge auto-awarding logic in server/services/badgeService.ts triggers certifications based on training progress

### External Dependencies

**Payment Processing**
- Stripe integration for payment processing (test mode)
- Stripe React components (@stripe/react-stripe-js, @stripe/stripe-js)
- Placeholder architecture for future Stripe Connect implementation for worker payouts

**Third-Party UI Libraries**
- Radix UI for accessible component primitives (20+ components including dialog, dropdown, popover, etc.)
- Lucide React for iconography
- date-fns for date formatting and manipulation
- React Day Picker for calendar/date selection

**Development Tools**
- Vite for fast development and optimized production builds
- Replit-specific plugins for development environment integration
- Drizzle Kit for database migrations and schema management

**Admin Tools**
- Make-admin script (scripts/make-admin.ts) for promoting users to admin role
- Usage: `npx tsx scripts/make-admin.ts <email>`
- Admin dashboard accessible at /admin/services for managing service info
- Admin analytics dashboard at /admin/analytics showing KPIs and engagement metrics
- Protected by isAdmin middleware and client-side role checks

**Analytics & Tracking**
- Server-side analytics tracking system with graceful failure handling
- Tracking endpoints: /api/track/page-view, /api/track/service-view, /api/track/knowledge-view
- CTA click tracking integrated into Hero components
- Admin analytics API endpoint aggregating KPIs: total events, top services, top articles, top CTAs, 7-day page view trends
- All analytics events persist to analytics_events table with user_id, event_type, metadata, and timestamps

**Badge & Certification System**
- Auto-awarding badge service refreshes certifications on profile view based on training progress
- ProfileBadges component displays earned badges on user profiles with icons and descriptions
- BadgePill component renders individual badge achievements with test IDs
- Badge types: safety_verified, compliance_certified, pro_trained, elite_performer
- Badges awarded based on article completion counts, background checks, and certifications

**Social Proof & Testimonials**
- TestimonialCarousel component displays curated success stories
- Interval-based rotation (5 seconds) with smooth transitions
- Testimonials cached via server endpoint with JSON content backing
- Integrated on Services page to build trust and credibility

**Knowledge Hub & Service Catalog**
- Comprehensive catalog of 75 services across 12 categories
- Categories: Home & Living (30), Errands & Transportation (13), Creative/Media/Event Services (9), Outdoor & Yard Care (7), Art/Design/Custom Creations (5), Pet Services (4), Cleaning & Detailing (2), Personal Growth & Lifestyle (2), Food & Hospitality (1), Family & Child Services (1), Senior & Care Companion (1)
- Each service guide includes: How It Works, Tools & Startup Gear, Certifications & Requirements, Safety & Best Practices, Pricing Model, Upsell & Business Growth, Get Gigified Badge
- Service guides designed for first-time gig workers with practical business advice
- Emphasis on compliance, safety, cross-selling opportunities, and scalable business models

**Community Discourse System**
- Hot feed algorithm: score = weighted_reactions / (age_hours + 2)^1.5
  - Reaction weights: LIKE=1, HELPFUL=2, INSIGHTFUL=3
  - Scores recalculated on each reaction event
- Markdown rendering with DOMPurify sanitization (marked + isomorphic-dompurify)
  - Allows: links, images, formatting, lists, code blocks
  - Strips: scripts, iframes, event handlers, dangerous HTML
- Session-based authentication using req.session.uid (set on login/register)
- Community routes: /api/community/* (posts, comments, reactions)
- Admin moderation: /api/admin/community/* (report management)
- Feed modes: "latest" (chronological) and "hot" (algorithm-ranked)
- Topic filtering and service tag filtering
- Rate limiting: Not yet implemented (planned: 10/min posts, 30/min comments, 60/min reactions)

**Additional Services**
- Google Fonts CDN for Inter and JetBrains Mono font families
- WebSocket support via @neondatabase/serverless for real-time capabilities (future enhancement)