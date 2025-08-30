# TindahanKO POS - Codebase Overview

**Version:** 1.0 (As of August 29, 2025)
**Status:** In Development (Approaching MVP)

---

## 1. Overview

This document provides a comprehensive overview of the `pos-mobile-app4Pedler` codebase. The project is a **Point of Sale (POS) mobile web application** called "TindahanKO," designed for small retailers, peddlers, and agrivet businesses, primarily in the Philippines.

The application is built with a modern technology stack and follows a mobile-first design philosophy. It aims to provide an intuitive and efficient way to manage sales, inventory, products, and customers.

## 2. Technology Stack

The project leverages the following technologies:

- **Framework:** Next.js 15 (with App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **UI Library:** shadcn/ui, built on Radix UI primitives
- **Styling:** Tailwind CSS
- **State Management:**
    - **Global:** Zustand
    - **Local:** React Hooks (`useState`, `useEffect`, etc.)
- **Package Manager:** pnpm
- **Testing:**
    - Jest (Test Runner)
    - React Testing Library (Component Testing)
- **Deployment:** Configured for Vercel and Netlify

## 3. Project Structure

The codebase is organized into the following key directories:

```
/
├── app/                    # Next.js App Router: Main pages and layout
├── components/             # Reusable React components
│   ├── ui/                 # shadcn/ui components
│   └── ...                 # Custom application components
├── lib/                    # Core logic, utilities, and hooks
│   ├── hooks/              # Custom React hooks for data fetching
│   └── supabase.ts         # Supabase client and type definitions
├── store/                  # Zustand state management stores
├── supabase/               # Database schema, functions, and migrations
├── public/                 # Static assets (images, icons)
├── styles/                 # Global CSS styles
├── types/                  # TypeScript type definitions
└── ...                     # Config files (next.js, jest, tsconfig, etc.)
```

## 4. Core Features & Components

### 4.1. Main Application (`app/page.tsx` & `app/pos-enhanced.tsx`)

The primary user interface is a single-page application that dynamically renders different "screens" based on user interaction. The main screens include:

- **Dashboard:** The main landing page with quick stats and navigation.
- **POS Screen:** The interface for creating new sales transactions.
- **Inventory Screen:** For managing product stock levels.
- **Products Screen:** For CRUD operations on products.
- **Add/Edit Product Screen:** A detailed form for managing product information, including multi-unit pricing.

### 4.2. Key Components

- **`payment-processor.tsx`:** Handles the logic for processing payments (cash, credit, split).
- **`customer-manager.tsx`:** Manages customer data and credit.
- **`inventory-manager.tsx`:** Provides tools for inventory transactions (receiving, returns, adjustments).
- **`receipt-generator.tsx`:** Creates digital and printable receipts.
- **`barcode-scanner.tsx`:** Integrates with the device camera for scanning barcodes.

## 5. State Management

State is managed using a combination of two approaches:

- **Zustand (`store/cartStore.ts`):** Used for managing global application state that needs to be shared across multiple components, such as the contents of the shopping cart.
- **React Hooks (`useState`, `useEffect`):** Used for managing local component state that is not needed elsewhere in the application.

## 6. Database (Supabase)

The application is tightly integrated with Supabase for its backend and database needs.

### 6.1. Schema (`supabase/schema.sql`)

The database schema is well-defined and includes tables for:
- `products`, `categories`, `product_units`
- `customers`, `suppliers`
- `transactions`, `transaction_items`
- `stock_movements`, `inventory_adjustments`
- `system_settings`, `receipt_settings`, `audit_logs`

It supports critical features like multi-unit pricing, customer credit, and a full inventory transaction audit trail.

### 6.2. Data Access (`lib/hooks/`)

Data is fetched and manipulated through a set of custom React hooks that encapsulate the Supabase client logic. This provides a clean and reusable way to interact with the database from the frontend.

- `useProducts()`: Manages all CRUD operations for products.
- `useCategories()`: Manages categories.
- `useTransactions()`: Handles the creation of sales transactions.
- `useCustomers()`: Manages customer data.

## 7. Testing

The project is set up for testing using **Jest** and **React Testing Library**.

- **Configuration:** `jest.config.js` and `jest.setup.js` are configured for a React environment. The `moduleNameMapper` is set up to resolve path aliases (`@/*`).
- **Current Tests:**
    - `components/ui/button.test.tsx`: A test suite for the primary `Button` component, verifying rendering and functionality.

The testing framework is in place to be expanded with more component, hook, and integration tests.

## 8. Development Workflow

### 8.1. Setup

1.  Clone the repository.
2.  Install dependencies: `pnpm install`
3.  Set up a Supabase project.
4.  Configure environment variables in `.env.local` with your Supabase URL and anon key.
5.  Run the database schema and functions from the `/supabase` directory in the Supabase SQL Editor.

### 8.2. Running the Application

- **Development:** `pnpm dev`
- **Testing:** `pnpm test`

### 8.3. Database Switching

The project includes scripts to switch between a local and remote Supabase instance:
- `pnpm db:local`
- `pnpm db:remote`
- `pnpm db:status`

## 9. Deployment

The application is configured for deployment on modern hosting platforms.

- **Vercel:** A `vercel.json` file is present, and the project uses the `@vercel/next` build utility.
- **Netlify:** A `netlify.toml` file is included with the necessary build and redirect configurations.

The `DEPLOYMENT_GUIDE.md` provides detailed, step-by-step instructions for a production deployment.
