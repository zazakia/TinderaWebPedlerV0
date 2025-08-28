# POS Mobile App for Peddlers & Small Retailers

A comprehensive Point of Sale (POS) mobile web application designed specifically for peddlers, small retailers, and agrivet businesses in the Philippines. Built with Next.js 15, Supabase, and shadcn/ui components.

## 🚀 Features

### ✅ Implemented Features

#### 📱 Dashboard
- Quick access to all major functions
- Today's sales summary
- Transaction count overview
- Mobile-first responsive design

#### 🛒 Point of Sale (POS)
- Real-time product search and filtering
- Category-based product browsing
- Shopping cart with quantity management
- Support for decimal quantities (0.5, 1.5, etc.)
- Quick add/remove items
- Multi-step checkout process
- Cash payment processing
- Automatic stock updates

#### 📦 Inventory Management
- Real-time stock level display
- Quick stock adjustments (+/- buttons)
- Category-wise inventory grouping
- Low stock alerts
- Inline stock editing
- Toggle stock visibility

#### 🛍️ Product Management
- Complete product catalog
- Add/Edit/Delete products
- Multi-unit pricing support
- Category organization
- Search and filter products
- Sort by name (A-Z, Z-A)
- Product details management (name, price, cost, stock, description)

#### 🏷️ Multi-Unit Support
- Base unit configuration (pieces, kg, liter, etc.)
- Additional units (box, case, dozen, pack, carton)
- Conversion factor setup
- Wholesale vs Retail pricing
- Auto-pricing calculations

#### 🗂️ Category Management
- Dynamic category creation
- Product grouping by categories
- Category-based inventory views

### 🔄 Database Integration
- **Supabase Backend**: Complete database integration
- **Real-time Data**: Live updates across all screens
- **CRUD Operations**: Full Create, Read, Update, Delete functionality
- **Transaction Management**: Complete transaction recording
- **Stock Management**: Automatic inventory updates

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Package Manager**: pnpm
- **TypeScript**: Full type safety

## 📱 Mobile-First Design

- Optimized for mobile devices (320px - 768px)
- Touch-friendly buttons and interfaces
- Bottom navigation for easy thumb access
- Maximum width: 400px for optimal mobile experience
- Responsive grid layouts

## 🎨 Design System

### Color Palette
- **Primary**: Purple (#9333ea) - Main brand color
- **Secondary**: Pink (#ec4899) - Accent color
- **Success**: Green (#10b981) - Success states
- **Warning**: Orange (#f59e0b) - Warning states
- **Error**: Red (#ef4444) - Error states

### UI Patterns
- Bottom navigation for primary screens
- Floating action buttons for quick actions
- Card-based layouts for content organization
- Modal dialogs for detailed forms

## 🗄️ Database Schema

### Core Tables
- **categories**: Product categories
- **products**: Product information with multi-unit support
- **transactions**: Sales transaction records
- **transaction_items**: Individual transaction line items
- **customers**: Customer information for credit sales

### Key Features
- UUID primary keys for all tables
- JSON support for flexible unit configurations
- Automatic timestamps
- Row Level Security (RLS) enabled
- Database functions for complex operations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pos-mobile-app4Pedler
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [https://supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Set up the database**
   - Go to your Supabase project dashboard
   - Open the SQL Editor
   - Run the contents of `supabase/schema.sql` to create tables and sample data
   - Run the contents of `supabase/functions.sql` to create helper functions

6. **Start the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

7. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - The app should load with sample data

## 📱 Usage Guide

### Dashboard
- Access all major functions from the main dashboard
- View today's sales summary
- Navigate to different sections using the cards

### Point of Sale
1. Click "Start Selling" from dashboard
2. Browse products by category or search
3. Add items to cart using the + button
4. Adjust quantities as needed
5. Click "View Cart" to review items
6. Complete the transaction with "Complete Payment"

### Inventory Management
1. Navigate to "Inventory" from dashboard
2. View products grouped by category
3. Use +/- buttons to adjust stock quickly
4. Click on stock numbers for direct editing
5. Toggle stock visibility using the switch

### Product Management
1. Go to "Products" from dashboard
2. View all products with search and sort options
3. Click the + icon to add new products
4. Use Edit/Delete buttons on existing products
5. Fill in product details including multi-unit pricing

## 📋 Development Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Database
# Run SQL files manually in Supabase dashboard
```

## 🗂️ Project Structure

```
pos-mobile-app4Pedler/
├── app/                    # Next.js App Router
│   └── page.tsx           # Main application component
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utilities and configurations
│   ├── hooks/            # Custom React hooks
│   │   ├── useProducts.ts    # Product management
│   │   ├── useCategories.ts  # Category management
│   │   ├── useTransactions.ts # Transaction handling
│   │   └── useCustomers.ts   # Customer management
│   ├── supabase.ts       # Supabase client setup
│   └── utils.ts          # Utility functions
├── supabase/             # Database schema and functions
│   ├── schema.sql        # Database table definitions
│   └── functions.sql     # SQL functions
├── public/               # Static assets
└── styles/               # Global styles
```

## 🔮 Roadmap (Future Features)

### Phase 2 (Next Release)
- [ ] User authentication and multi-user support
- [ ] Advanced reporting and analytics
- [ ] Receipt printing
- [ ] Barcode scanning
- [ ] Customer credit/utang management
- [ ] Supplier management
- [ ] Purchase order system

### Phase 3 (Advanced Features)
- [ ] Multi-branch support
- [ ] Employee management with permissions
- [ ] Loyalty programs and promotions
- [ ] Advanced inventory features (expiry tracking)
- [ ] Integration with accounting software
- [ ] Government compliance reporting

## 🏗️ Architecture Decisions

### Why Supabase?
- **Real-time capabilities**: Automatic UI updates
- **PostgreSQL**: Powerful relational database
- **Built-in auth**: Ready for user management
- **API generation**: Automatic REST and GraphQL APIs
- **Scalable**: Handles growth from small shops to enterprises

### Why Next.js 15?
- **App Router**: Modern file-based routing
- **React Server Components**: Better performance
- **TypeScript**: Type safety throughout
- **Vercel deployment**: Easy hosting and scaling

### Why shadcn/ui?
- **Accessible**: Built on Radix UI primitives
- **Customizable**: Easy to theme and modify
- **Modern**: Latest React patterns and best practices
- **Copy-paste friendly**: Own the code, not a dependency

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please:
1. Check the [Issues](../../issues) page for known problems
2. Search existing issues before creating new ones
3. Provide detailed information when reporting bugs
4. Include browser/device information for mobile issues

## 🙏 Acknowledgments

- Built for Filipino entrepreneurs and small business owners
- Designed with real-world sari-sari store workflows in mind
- Special thanks to the open-source community for the amazing tools

---

**Happy Selling! 🛒✨**