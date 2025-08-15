# 🛍️ Tindera POS Mobile App

A modern, feature-rich Point of Sale (POS) mobile application built with Next.js 15, TypeScript, and Tailwind CSS. Designed specifically for mobile-first retail operations with comprehensive inventory management and multi-unit pricing support.

![Peddlr POS](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Latest-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🏪 **Point of Sale (POS)**
- **Mobile-First Design**: Optimized for smartphone and tablet use
- **Product Catalog**: Browse products by categories with search functionality
- **Shopping Cart**: Add/remove items with quantity management
- **Multi-Unit Pricing**: Support for retail and wholesale pricing
- **Payment Processing**: Cash and Credit payment options
- **Receipt Generation**: Digital receipts with customer details

### 📦 **Inventory Management**
- **Real-Time Stock Tracking**: Live inventory updates
- **Category Organization**: Products grouped by categories
- **Stock Adjustments**: Quick +/- stock level controls
- **Low Stock Alerts**: Configurable low stock level warnings
- **Bulk Operations**: Edit multiple products simultaneously
- **Scrollable Interface**: Handle large inventory lists efficiently

### 🏷️ **Product Management**
- **Advanced Add Product Form**: Comprehensive product creation
- **Multi-Unit Support**: Configure up to 5 different units per product
- **Auto-Pricing**: Automatic price calculation based on conversion factors
- **Wholesale/Retail Types**: Separate pricing for different customer types
- **Product Variants**: Support for product variations
- **Notes & Descriptions**: Detailed product information

### 🎨 **User Interface**
- **Modern Design**: Clean, intuitive mobile interface
- **Dark/Light Themes**: Theme switching support
- **Responsive Layout**: Adaptive design for all screen sizes
- **Smooth Animations**: Polished user experience
- **Touch-Friendly**: Large buttons and easy navigation

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Forms**: React Hook Form with Zod validation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/peddlr-pos-mobile.git
   cd peddlr-pos-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Application Structure

### Main Screens
- **Dashboard**: Overview with quick actions and navigation
- **POS**: Point of sale interface for transactions
- **Inventory**: Stock management and product editing
- **Products**: Product catalog and management
- **Add Product**: Comprehensive product creation form
- **Payment**: Payment confirmation and processing
- **Receipt**: Digital receipt generation

### Key Components
- **AddProduct**: Advanced product creation with multi-unit support
- **ProductCard**: Product display with pricing and stock info
- **Cart**: Shopping cart management
- **PaymentScreen**: Payment processing interface
- **InventoryList**: Scrollable inventory management

## 🔧 Configuration

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

### Environment Setup
The application runs with default settings. For production deployment, ensure:
- Proper image optimization settings
- Database connections (if using external data)
- Payment gateway integrations

## 📊 Features Overview

### Multi-Unit System
- **Base Units**: piece, bottle, pack, etc.
- **Conversion Factors**: Automatic unit conversions
- **Pricing Tiers**: Retail vs. wholesale pricing
- **Auto-Calculation**: Smart price calculations

### Inventory Features
- **Stock Tracking**: Real-time inventory levels
- **Category Management**: Organized product categories
- **Quick Actions**: Fast stock adjustments
- **Edit Mode**: In-line product editing

### POS Capabilities
- **Cart Management**: Add/remove/modify items
- **Customer Details**: Optional customer information
- **Payment Options**: Multiple payment methods
- **Receipt Generation**: Formatted digital receipts

## 🎯 Target Users

- **Small Retailers**: Independent shops and stores
- **Mobile Vendors**: On-the-go sales operations
- **Market Stalls**: Temporary retail setups
- **Service Businesses**: Businesses with mobile sales needs

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔮 Future Enhancements

- [ ] Offline mode support
- [ ] Data synchronization
- [ ] Advanced reporting
- [ ] Barcode scanning
- [ ] Customer management
- [ ] Sales analytics
- [ ] Multi-store support
- [ ] Cloud backup

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review existing issues and discussions

---

**Built with ❤️ for modern retail operations**
