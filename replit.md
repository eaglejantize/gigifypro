# gigifypro

## Overview

gigifypro is a gig-economy marketplace platform connecting clients with local service professionals. It offers service discovery, booking, real-time messaging, and a trust-based review system. The platform emphasizes transparent pricing, worker verification, and social proof through ratings and reviews. Key features include a multi-profile system for service professionals (Gigers), a redesigned customer booking flow with upfront Giger pricing, various pricing models (hourly, fixed, custom), a "Public Discourse System" for community engagement, and a "GigScore System" for worker performance evaluation. The platform also integrates a "G PRO Brand" for professional products, a "How It Works" onboarding guide, a dual-view dashboard for Gigers and Taskers (customers), and a "Team Collaboration Section" for multi-person jobs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing:** React 18 with TypeScript, Vite, and Wouter for client-side routing.
**UI & Styling:** shadcn/ui with Radix UI primitives, Tailwind CSS, custom design system, Inter and JetBrains Mono fonts, and a trust-blue primary color scheme supporting light/dark modes.
**State Management:** React Query for server state, React Context API for authentication, local storage for persistence, and React Hook Form with Zod for form validation.
**Key Features:** Worker discovery feed, service listing details, user/worker profiles, real-time messaging, dashboards, settings, services index with InfoPopover, admin area, and a brand slogan banner.

### Backend Architecture

**Runtime & Framework:** Node.js with Express.js, TypeScript, and a RESTful API design.
**Authentication & Security:** Bcrypt for password hashing, session-based authentication with `express-session`, role-based access control (user, worker, admin), admin middleware, and a `/api/me` endpoint for user profiles.
**API Structure:** Zod for request body validation, centralized storage layer, type-safe contracts, and error handling middleware.
**Core Business Logic:** Customizable pricing calculator, a weighted worker ranking algorithm (likes, ratings, recency, response time), and a booking state machine.

### Data Storage

**Database:** PostgreSQL with Drizzle ORM for type-safe queries. Neon serverless PostgreSQL for connection pooling.
**Schema Design:** Includes tables for Users (with roles), Worker profiles, multi-profile Gigers (Profiles table with up to 3 specialized profiles), ProfileServices (linking profiles to services), Service categories, Listings, Job requests, Bookings, Review/Like system, Messages, Notifications, Badges, UserBadges, AnalyticsEvents, CommunityStats (G-Square activity tracking), and VolunteerServices (pro-bono work tracking).
**Community Discourse Tables:** Topics, Posts, Comments, Reactions, Reports, Reputations, CommunityFollows, and UserFollows to support the Public Discourse System.
**Data Relationships:** Defined one-to-one, one-to-many, and many-to-many relationships across entities.
**File-Based Storage:** Service info, testimonials, and badge auto-awarding logic are managed via JSON files and dedicated services.

### Additional Features

**Multi-Profile Giger System:** Allows users to create up to 3 specialized Giger profiles, each with custom services, niches, and bios, supported by a 3-step setup wizard.
**Redesigned Post Task Flow:** A 4-step customer booking process showing Giger pricing upfront (hourly, fixed, custom).
**GigScore System:** A comprehensive 0-100 point worker performance algorithm with 7 weighted signals: Review Quality (35%), Completed Jobs (22%), Response Speed (12%), Repeat Taskers (10%), Cancellation Penalty (-10%), Community Involvement (6% - G-Square activity), and Volunteerism (5% - pro-bono work). Displayed with tier badges and a detailed interactive modal. Admin-controlled volunteer approval workflow ensures data integrity.
**How It Works Page:** A comprehensive onboarding guide explaining platform mechanics for clients and Gigers.
**Dual-View Dashboard:** Separated Giger and Tasker dashboards with relevant metrics and management tools.
**Team Collaboration Section:** Knowledge Hub with articles on building gig teams and networking for multi-person jobs.
**Public Discourse System:** A digital town square with posts, comments, reactions, topics, a reputation system, and a hot feed algorithm, with Markdown support and sanitization.

## External Dependencies

**Payment Processing:** Stripe integration for payments (test mode) using `@stripe/react-stripe-js` and `@stripe/stripe-js`.
**Third-Party UI Libraries:** Radix UI for accessible components, Lucide React for iconography, `date-fns` for date manipulation, and React Day Picker for calendar selection.
**Development Tools:** Vite, Replit-specific plugins, and Drizzle Kit for database migrations.
**Admin Tools:** `make-admin` script, admin dashboard for service and analytics management, protected by middleware.
**Analytics & Tracking:** Server-side analytics tracking system for page views, service views, knowledge views, and CTA clicks, persisting to an `analytics_events` table.
**Badge & Certification System:** Auto-awarding badge service with `ProfileBadges` and `BadgePill` components for displaying earned certifications (safety_verified, compliance_certified, pro_trained, elite_performer).
**Social Proof & Testimonials:** `TestimonialCarousel` component displaying curated success stories.
**Knowledge Hub & Service Catalog:** Comprehensive catalog of 75 services with detailed guides on how-to, gear, certifications, safety, pricing, and business growth.
**Additional Services:** Google Fonts CDN for Inter and JetBrains Mono fonts.