# Geek Mail Pro - Email Marketing SaaS Platform

## Overview

Geek Mail Pro is a modern, full-featured email marketing SaaS platform built as a self-hosted alternative to services like Mailchimp. The application provides comprehensive email campaign management, contact list management, domain configuration, and analytics capabilities. It's designed to be a complete solution for businesses looking to manage their email marketing operations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API architecture
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage

### Database Architecture
- **Database**: PostgreSQL (configured for Neon)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon serverless driver with connection pooling

## Key Components

### Authentication System
- Replit Auth integration for secure user authentication
- Session-based authentication with PostgreSQL session storage
- User profile management with customizable plans
- Protected routes with middleware-based authorization

### Domain Management
- Custom domain configuration for email sending
- DNS record verification (SPF, DKIM, DMARC)
- Email alias management per domain
- Domain warming progress tracking
- Sender reputation scoring

### Contact Management
- Contact list creation and organization
- CSV import/export functionality
- Contact segmentation and filtering
- Custom field support for contacts
- List membership management

### Campaign System
- Visual campaign builder with drag-and-drop interface
- Email template library and custom template creation
- Campaign scheduling and immediate sending
- A/B testing capabilities
- Campaign analytics and reporting

### Analytics Dashboard
- Real-time campaign performance metrics
- Open rates, click rates, and engagement tracking
- Bounce rate and spam rate monitoring
- Revenue tracking and ROI calculations
- Exportable reports

## Data Flow

### User Authentication Flow
1. User initiates login through Replit Auth
2. OpenID Connect flow validates credentials
3. Session established with PostgreSQL storage
4. User profile retrieved/created in database
5. Frontend receives authenticated user context

### Campaign Creation Flow
1. User creates campaign through builder interface
2. Campaign data validated and stored
3. Contact lists selected and recipients resolved
4. Email content rendered and validated
5. Campaign scheduled or sent immediately
6. Analytics tracking initiated

### Contact Import Flow
1. CSV file uploaded and parsed
2. Data validated against schema
3. Contacts deduplicated and processed
4. List assignments created
5. Import results reported to user

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for Neon
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### Authentication
- **passport**: Authentication middleware
- **openid-client**: OpenID Connect implementation
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety and development experience
- **tailwindcss**: Utility-first CSS framework
- **eslint/prettier**: Code quality and formatting

## Deployment Strategy

### Development Environment
- Vite development server with HMR
- Real-time error overlay for debugging
- Replit integration with live preview
- Environment-based configuration

### Production Build
- Vite production build with code splitting
- ESBuild for server bundle optimization
- Static asset optimization and compression
- Progressive Web App (PWA) capabilities

### Environment Configuration
- Database URL configuration for Neon
- Session secrets for security
- Replit-specific environment variables
- ISSUER_URL for OpenID Connect

### Hosting Considerations
- Server and client bundles built separately
- Express.js serves both API and static assets
- PostgreSQL database connection pooling
- Session persistence across deployments

## Changelog

- **July 09, 2025**: ✅ Complete No-Code Email Sequence Builder implemented
  - Full drag-and-drop interface using React Flow with enhanced UX
  - Large canvas area (95% viewport) for complex sequence building
  - Clear component labeling with auto-numbering (Email 1, Wait 2, etc.)
  - Database schema with sequences, steps, subscribers, and analytics tables
  - Complete API routes for CRUD operations and analytics tracking
  - Professional visual design with connection handles and visual feedback
  - **CONFIRMED**: Drag-and-drop functionality working perfectly
  - ✅ Sequence naming functionality with validation
  - ✅ Professional sequence templates: Welcome Series, Product Launch, Re-engagement Flow, Abandoned Cart, Educational Drip, Customer Feedback Loop
  - ✅ Contact segment templates with smart pre-built conditions for targeting specific audiences

- **July 08, 2025**: ✅ Email forwarding system fully operational
  - Created webhook endpoint at `/api/webhook/email` for Mailgun integration
  - Fixed middleware conflicts to allow external webhook access
  - Configured marketing@thegeektrepreneur.com → rfavors@gmail.com forwarding
  - Verified webhook functionality with Mailgun test requests
  - **CONFIRMED**: Live email forwarding working (test email delivered successfully)
  - Production-ready email infrastructure with Mailgun integration complete

- July 07, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.