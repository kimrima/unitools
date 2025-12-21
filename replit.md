# UniTools

## Overview

UniTools is a comprehensive online utility platform offering 200+ browser-based tools across 8 categories (PDF, Image Convert, Image Edit, Video/Audio, Text, Social Media, Developer Tools, and Calculators). The application emphasizes client-side processing where files are handled directly in the browser without server uploads, prioritizing user privacy and speed.

The project follows a monorepo structure with a React frontend and Express backend, featuring internationalization support for Korean and English locales.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Internationalization**: i18next with browser language detection and URL-based locale routing (e.g., `/en/tool-name`, `/ko/tool-name`)
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **HTTP Server**: Node.js native `http` module wrapping Express
- **API Pattern**: RESTful routes prefixed with `/api`
- **Static Serving**: Production builds served from `dist/public`
- **Development**: Vite dev server middleware integration for HMR

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Validation**: Zod schemas generated from Drizzle schemas via `drizzle-zod`
- **Storage Abstraction**: Interface-based storage pattern (`IStorage`) with in-memory implementation for development

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/ui/  # shadcn/ui components
│   │   ├── i18n/          # Internationalization config and locales
│   │   ├── pages/         # Route components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and query client
├── server/           # Express backend
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Data access layer
│   └── vite.ts       # Vite dev server integration
├── shared/           # Shared code between client/server
│   └── schema.ts     # Drizzle database schemas
└── migrations/       # Database migrations
```

### Design System
- Material Design 3 principles adapted for utility workflows
- Typography: Inter for UI, JetBrains Mono for code
- Component patterns: Tool cards with icons, file drop zones, category navigation
- Responsive grid: 1-4 columns based on viewport

### URL Structure
- Locale-prefixed routes: `/:locale` for homepage, `/:locale/:toolId` for tools
- Automatic locale detection and redirect from root path

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migrations and schema pushing

### UI Component Libraries
- **Radix UI**: Headless accessible components (accordion, dialog, dropdown, tabs, etc.)
- **shadcn/ui**: Pre-styled Radix components with Tailwind
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel functionality
- **Vaul**: Drawer component
- **cmdk**: Command palette component

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: Zod integration with React Hook Form

### Data Fetching
- **TanStack React Query**: Async state management and caching

### Internationalization
- **i18next**: Core i18n framework
- **react-i18next**: React bindings
- **i18next-browser-languagedetector**: Automatic language detection

### Build & Development
- **Vite**: Frontend build tool
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development
- **@replit/vite-plugin-***: Replit-specific development plugins

### Utilities
- **date-fns**: Date manipulation
- **class-variance-authority**: Component variant management
- **clsx/tailwind-merge**: Conditional class composition