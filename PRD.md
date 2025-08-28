# Product Requirements Document (PRD)
##  TindahanKO - Customized and  flexible POS - user friendly best UI and UX - Web and Mobile App for Retailers and whole sellers

**Version:** 1.0
**Date:** August 2025
**Author:** Product Team
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Product Overview
A comprehensive Point of Sale (POS) mobile web application designed specifically for peddlers, small retailers, and agrivet businesses. The app provides an intuitive interface for managing inventory, processing sales transactions, and tracking business operations through a mobile-first responsive design.

### 1.2 Business Objectives
- **Primary Goal:** Enable small business owners to efficiently manage sales and inventory from mobile devices
- **Target Market:** Peddlers, small retail shops, agrivet stores, and sari-sari stores in the Philippines
- **Key Success Metrics:**
  - Transaction processing speed < 3 seconds
  - Inventory accuracy > 98%
  - User adoption rate > 80% within first month
  - Support for offline/online hybrid operations

### 1.3 Technology Stack
- **Framework:** Next.js 15 with App Router, typescript
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS
- **State Management:** React Hooks
- **Package Manager:** pnpm
- **Deployment:** Vercel (pinoygym-1432 account)
- supabase, prisma, supabase auth,


---

## 2. User Personas

### 2.1 Primary Persona: Maria the Sari-Sari Store Owner
- **Age:** 35-50 years old
- **Tech Savviness:** Basic smartphone user
- **Business Size:** 50-200 SKUs
- **Pain Points:**
  - Manual inventory tracking
  - No systematic pricing for bulk orders
  - Difficulty tracking credit/utang customers
  - Limited record keeping

### 2.2 Secondary Persona: Juan the Mobile Peddler
- **Age:** 25-40 years old
- **Tech Savviness:** Moderate smartphone user
- **Business Size:** 20-50 SKUs
- **Pain Points:**
  - Need for mobile solution while on the go
  - Quick transaction processing
  - Multiple unit pricing complexity
  - Cash flow management

### 2.3 Tertiary Persona: Ana the Agrivet Store Manager
- **Age:** 30-45 years old
- **Tech Savviness:** Good with technology
- **Business Size:** 100-500 SKUs
- **Pain Points:**
  - Complex unit conversions (pieces, boxes, sacks)
  - Wholesale vs retail pricing
  - Inventory replenishment tracking
  - Customer credit management

---

## 3. Core Features & User Stories

### 3.1 Dashboard
**User Story:** As a store owner, I want to see my business overview at a glance so I can make quick decisions.

**Features:**
- Quick access tiles for main functions (POS, Inventory, Products, Reports)
- Sales summary widgets
- Low stock alerts
- Recent transactions
- Quick actions for common tasks

**UI Components:**
- Grid layout with colorful action cards
- Bottom navigation bar for primary screens
- Floating action button for quick product addition

### 3.2 Point of Sale (POS) Screen

#### 3.2.1 Product Selection
**User Story:** As a cashier, I want to quickly find and add products to cart so I can serve customers efficiently.

**Features:**
- Category-based product filtering (sidebar navigation)
- Real-time search functionality
- Visual product cards with images
- Quick quantity adjustment (decimal support)
- Stock level indicators
- Barcode scanning support

**UI Elements:**
- Left sidebar with categories (All, Baby Powder, Coffee and Creamer, Powder Drink)
- Product tiles with image, name, stock count, and price
- Green quantity indicator with +/- controls
- Bottom search bar with scan option

#### 3.2.2 Cart Review
**User Story:** As a cashier, I want to review the cart before payment to ensure accuracy.

**Features:**
- Cart item list with quantity controls
- Line item pricing
- Running total display
- Remove item functionality
- Customer details capture
- Notes and special instructions

**UI Elements:**
- Purple gradient review button showing total amount and quantity
- Expandable customer details section
- Item list with inline quantity adjustment
- Grand total display

#### 3.2.3 Payment Processing
**User Story:** As a store owner, I want to offer multiple payment options to accommodate customer preferences.

**Features:**
- Payment method selection (Cash, Credit/Utang)
- Pay Later option for trusted customers
- Multi-payment support (split payments)
- Change calculation
- Receipt generation

**UI Elements:**
- Large amount display (₱ format)
- Toggle buttons for Pay Later/Multi Payment
- Full-screen payment buttons
- Visual payment confirmation

### 3.3 Inventory Management

#### 3.3.1 Inventory List
**User Story:** As a store owner, I want to track my inventory levels to avoid stockouts.

**Features:**
- Category-wise inventory grouping
- Real-time stock counts
- Quick stock adjustment (+/- buttons)
- Low stock indicators
- Toggle for POS stock visibility
- Category-level stock summaries

**UI Elements:**
- Tab navigation (Inventory List, Replenishment)
- Toggle switches for display preferences
- Category cards with product listings
- Inline edit capabilities
- Color-coded stock levels

#### 3.3.2 Multi-Unit Management
**User Story:** As a store owner, I want to sell products in different units (piece, box, dozen) with appropriate pricing.

**Features:**
- Base unit configuration
- Up to 6 units per product
- Conversion factor setup
- Wholesale vs Retail pricing
- Auto-pricing calculations
- Unit-specific stock tracking

**Configuration per Product:**
- Base unit selection (piece, kilogram, liter, etc.)
- Additional units (box, case, dozen, pack, carton)
- Conversion ratios (1 box = 12 pieces)
- Wholesale Price per unit with bulk discounts


### 3.4 Product Management

#### 3.4.1 Product Catalog
**User Story:** As a store owner, I want to manage my product catalog efficiently.

**Features:**
- Alphabetical sorting (A-Z, Z-A)
- Bulk edit mode
- Product duplication
- Quick edit inline
- Delete functionality
- Category-based organization

**UI Elements:**
- Search bar with filters
- Product cards with image, name, price, stock
- Action buttons (Edit, Delete, Duplicate)
- Bulk selection checkboxes

#### 3.4.2 Add/Edit Product
**User Story:** As a store owner, I want to add new products with complete details including multiple units.

**Features:**
- Product grouping (categories)
- Product naming and coding
- Image upload/camera capture
- Color coding for visual organization
- Base unit and pricing setup
- Cost tracking for profit calculation
- Stock and low stock level configuration
- Multi-unit configuration with:
  - Unit name selection
  - Conversion factor
  - Unit-specific pricing
  - Auto-price calculation
  - Retail/Wholesale designation
- Optional features:
  - Variants (sizes, colors)
  - Add-ons
  - Product notes
  - Descriptions
  - Selling methods
- Online store integration toggle

**UI Elements:**
- Visual product preview card
- Form sections for different attributes
- Unit configuration cards
- Toggle switches for optional features
- Auto-pricing buttons
- Save button with validation

### 3.5 Additional Features

#### 3.5.1 Customer Management
**User Story:** As a store owner, I want to track customer information for credit sales.

**Features:**
- Customer name, number, address capture
- Credit/utang tracking
- Payment history
- Notes per customer
- integrate to listbox in transactions related to customer like in POS

#### 3.5.2 Receipt Management
**User Story:** As a cashier, I want to provide receipts to customers.

**Features:**
- Digital receipt generation
- Receipt number tracking
- Date and time stamps
- Business name display
- Item details with quantities and prices
- Additional charges (service fee, delivery fee)
- Discount application per Item or per receipt or per transaction or per customer

#### 3.5.3 Non-Inventory Sales
**User Story:** As a cashier, I want to sell items not in the system.

**Features:**
- Quick add non-inventory items
- Custom pricing
- One-time sale items

---

## 4. Technical Requirements

### 4.1 Performance
- Page load time < 2 seconds on 3G connection
- Smooth scrolling and transitions
- Responsive design for 320px - 768px screens for phone and tablets
- skip this Offline capability for critical functions dont do this for now

### 4.2 Data Management
- skip this Local storage for offline mode
- Real-time sync when online
- Data validation on all inputs
- Decimal support for quantities (0.5, 1.5, etc.)

### 4.3 Security
- Secure payment processing
- User authentication
- Data encryption for sensitive information
- Session management

### 4.4 Browser Support
- Chrome (latest 2 versions)
- Safari (iOS 14+)
- Firefox (latest 2 versions)
- Edge (latest 2 versions)

---

## 5. UI/UX Design Principles

### 5.1 Mobile-First Design
- Optimized for portrait orientation
- Touch-friendly buttons (minimum 44x44px)
- Thumb-reachable navigation
- Maximum width: 400px (max-w-sm)

### 5.2 Color Scheme
- **Primary:** Purple (#9333ea)
- **Secondary:** Pink (#ec4899)
- **Success:** Green (#10b981)
- **Warning:** Orange (#f59e0b)
- **Error:** Red (#ef4444)
- **Background:** Gray (#f3f4f6)

### 5.3 Typography
- Clear, readable fonts
- Hierarchical text sizes
- High contrast ratios

### 5.4 Navigation Pattern
- Bottom navigation bar (persistent)
- Floating action button for primary action
- Back button on all sub-screens
- Tab navigation for related content

---

## 6. User Flow Diagrams

### 6.1 Sale Transaction Flow
1. **Start:** Dashboard → POS Screen
2. **Product Selection:** Browse categories → Search/Scan → Add to cart
3. **Cart Review:** Adjust quantities → adjust unit of measure → Add customer details → Apply discounts
4. **Payment:** Select payment method → enter type of payment ex. utang → enter amount receive options "exact amount" other amount liek 10,20,50,100,200,500,1000 → Process payment → Generate receipt - print receipt
5. **End:** Return to POS or Dashboard

### 6.2 Product Addition Flow
1. **Start:** Any screen → Add Product (FAB or menu)
2. **Basic Info:** Enter product group, name, code
3. **Units Setup:** Configure base unit → Add additional units → Set conversions
4. **Pricing:** Set base price → Configure unit prices → Add cost
5. **Inventory:** Set initial stock → Define low stock alert
6. **Options:** Add variants/add-ons/notes (optional)
7. **Save:** Validate → Save to database → Return to previous screen

### 6.3 Inventory Management Flow
1. **Start:** Dashboard → Inventory
2. **View:** Toggle between list and replenishment views
3. **Adjust:** Quick +/- for stock adjustments must have a adjustment memo to trace all transactions.
4. **Edit:** Inline edit for major changes in all data
5. **Monitor:** View category totals and low stock alerts

---

## 7. Business Rules

### 7.1 Pricing Rules
- Base unit price is mandatory
- Additional unit prices can be auto-calculated or manually set
- Wholesale prices typically offer 10-15% discount or manually set
- Minimum markup calculation: (Price - Cost) / Cost * 100

### 7.2 Inventory Rules
- Stock cannot go negative (except for pre-orders if enabled)
- Low stock alerts trigger at defined threshold
- Stock adjustments require reason/note
- Multi-unit stock displayed in base unit equivalent but with options to view individual units on-hand qty amount.

### 7.3 Transaction Rules
- Receipt numbers are sequential and unique
- Credit sales require customer information
- Void transactions require authorization
- Daily closing reconciliation required

---

## 8. Integration Requirements

### 8.1 Third-Party Services
- skip later Payment gateways (future: GCash, PayMaya)
- SMS notifications (future: customer receipts)
- Cloud storage for backups
- Analytics services

### 8.2 Hardware Integration
- Barcode scanners (via camera or external)
- Receipt printers (future: Bluetooth/WiFi)
- Cash drawers (future)

---

## 9. Success Metrics & KPIs

### 9.1 User Adoption
- Daily Active Users (DAU)
- Transaction volume per day
- Products managed per store
- Feature utilization rates

### 9.2 Business Impact
- Average transaction time reduction
- Inventory accuracy improvement
- Credit collection rate
- Revenue per user

### 9.3 Technical Performance
- App crash rate < 0.1%
- API response time < 500ms
- Successful sync rate > 99%
- User satisfaction score > 4.5/5

---

## 10. Future Enhancements (Phase 2)

### 10.1 Advanced Features
- Multi-branch support
- Employee management and permissions
- Advanced reporting and analytics
- skip later Loyalty programs
- skip later Promotional campaigns
- Supplier management
- Purchase order system - optional but connected to receiving voucher
- Expiry date tracking

### 10.2 skip later Integration Expansions
- Accounting software integration
- E-commerce platform sync
- Social media selling integration
- Government compliance reporting
- Banking integration for reconciliation

### 10.3 Hardware Support
- Desktop/tablet responsive design
- Dedicated POS hardware support
- Weighing scale integration
- RFID support
- QR Code scanning and generation
- Barcode scanning and generation
---

## 11. Risks & Mitigation

### 11.1 Technical Risks
- **Risk:** Poor internet connectivity
  - **Mitigation:** Robust offline mode with queue-based sync

- **Risk:** Data loss
  - **Mitigation:** Regular auto-save and cloud backup

### 11.2 Business Risks
- **Risk:** User resistance to technology
  - **Mitigation:** Intuitive UI, training materials, support

- **Risk:** Competition from established POS systems
  - **Mitigation:** Focus on local market needs, competitive pricing

---

## 12. Timeline & Milestones

### Phase 1 (Current MVP)
- Core POS functionality
- Detailed inventory management. Transactions affecting on-hand qty or inventory quantity of products are Receiving voucher entry which is additional in inventory quantity, Customer Sales Return which is additional in inventory quantity, Inventory Adjustments in and out, Inventory Transfer in and out by branches or locations like warehouse. Sales in POS which is deduction in inventory quantity. Return Product voucher to Supplier which is a deduction in inventory quantity of the Products. We need to have all this transactions with complete functionality and CRUD.
- Preserve the current UI/UX designs in the application POS and related screens. Home screen also and Product.  Inventory screen will be removed.
- Multi-unit support. Products have Base unit of measurement and additional 6 unit of measure like pieces, kilograms, liters, etc. example  Base unit is kilo the 50 number of base unit in Sack, example2 50 pieces in box. Then add a field for Selling price for the units added.
- Product management with CRUD functionality. List view options. Fields sorting. and Arranging in the Display list.
- Payment processing
- Receipt generation
- Product category management with CRUD functionality. List view options. Fields sorting. and Arranging in the Display list.
- add additional data management to other data integrated in the application POS. with CRUD functionality. List view options. Fields sorting. and Arranging in the Display list.
- Data backup and recovery Cloud and can be downloaded locally.

### Phase 2 (Q2 2025)
- [ ] User authentication
- [ ] Cloud sync
- [ ] Reports and analytics
- [ ] Customer database
- [ ] Barcode scanning

### Phase 3 (Q3 2025)
- [ ] Multi-store support
- [ ] Advanced inventory features
- [ ] Integration APIs
- [ ] Mobile app versions


## 13. Appendix

### 13.1 Glossary
- **SKU:** Stock Keeping Unit
- **Utang:** Filipino term for credit/debt
- **Sari-sari store:** Small neighborhood retail store in the Philippines
- **Agrivet:** Agricultural and veterinary supply store
- **Tindahan:** Filipino term for store
- **Puhunan:** Filipino term for capital/cost
- **Presyo:** Filipino term for price

### 13.2 References
- Next.js Documentation: https://nextjs.org/docs
- shadcn/ui Components: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com
- Local market research data
- User interview insights

---

**Document Control:**
- Review Cycle: Quarterly
- Distribution: Development Team, Product Management, Stakeholders
- Feedback: zapwebapp007@gmail.com
