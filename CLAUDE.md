# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` or `pnpm dev` - Starts Next.js development server
- **Build**: `npm run build` or `pnpm build` - Creates production build
- **Lint**: `npm run lint` or `pnpm lint` - Runs ESLint
- **Start production**: `npm run start` or `pnpm start` - Starts production server

## Architecture Overview

This is a Next.js 15 Point of Sale (POS) mobile application built with:

- **Framework**: Next.js 15 with App Router
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theming support
- **State Management**: React hooks for local state
- **Package Manager**: Uses pnpm (lockfile present)

### Key Architecture Patterns

- **Component Structure**: All UI components are in `/components/ui/` following shadcn/ui conventions
- **Path Aliases**: Uses `@/*` alias mapping to root directory (configured in tsconfig.json)
- **Theme Provider**: Supports light/dark mode via `next-themes` with custom theme provider
- **Responsive Design**: Mobile-first approach with responsive layouts

### Application Structure

The main application (`app/page.tsx`) is a comprehensive POS system featuring:
- Product catalog with search and filtering
- Shopping cart with quantity management
- Multi-unit pricing (retail/wholesale)
- Inventory management
- Category-based organization

### UI Component System

- **Component Library**: Complete shadcn/ui implementation
- **Icons**: Uses Lucide React icon library
- **Form Handling**: React Hook Form with Zod validation
- **Styling Utilities**: Custom `cn()` utility in `/lib/utils.ts` for conditional classes

### Build Configuration

- **Next.js Config**: Build errors and ESLint ignored during builds for rapid development
- **TypeScript**: Strict mode enabled with modern ES6+ target
- **Images**: Unoptimized for development/deployment flexibility

### Project Context

This appears to be a v0.app generated project that syncs with Vercel deployments. The codebase follows modern React/Next.js patterns with a focus on rapid prototyping and UI development.