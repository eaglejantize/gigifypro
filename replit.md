# gigifypro

## Overview

gigifypro is a gig-economy marketplace platform connecting clients with local service professionals. The platform enables service discovery, booking, real-time messaging, and a trust-based review system where "likes" function as positive review signals. Built as a full-stack TypeScript application with modern web technologies, it emphasizes transparent pricing, worker verification, and social proof through ratings and reviews.

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

**Data Relationships**
- One-to-one: User to WorkerProfile
- One-to-many: Worker to ServiceListings, User to JobRequests, Booking to Messages
- Many-to-many implicit: Categories to Services through listings

**File-Based Storage**
- Service info stored in JSON format at server/content/serviceInfo.json
- Contains 13 service guides with summaries, detailed descriptions, gear recommendations, requirements, and badges
- Admin-editable via protected CRUD endpoints with Zod validation
- Used by InfoPopover component for inline tooltips across the platform

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
- Protected by isAdmin middleware and client-side role checks

**Additional Services**
- Google Fonts CDN for Inter and JetBrains Mono font families
- WebSocket support via @neondatabase/serverless for real-time capabilities (future enhancement)