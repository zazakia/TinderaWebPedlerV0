# TindahanKO POS - Deployment Guide

**Version:** 1.0  
**Date:** August 29, 2025  
**Status:** Production Ready  

---

## 📋 **Table of Contents**

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Application Deployment](#application-deployment)
5. [Production Configuration](#production-configuration)
6. [Performance Optimization](#performance-optimization)
7. [Security Setup](#security-setup)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup Strategy](#backup-strategy)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 **Prerequisites**

### **System Requirements**
- **Node.js:** 18.17.0 or higher
- **NPM/PNPM:** Latest stable version
- **Git:** For version control
- **Modern Browser:** Chrome 90+, Firefox 88+, Safari 14+

### **Accounts & Services**
- ✅ **Supabase Account** - Database & Auth
- ✅ **Vercel Account** - Frontend hosting
- ✅ **Domain Name** (optional) - Custom domain
- 📱 **SSL Certificate** - For HTTPS (auto-provided by Vercel)

---

## 🔧 **Environment Setup**

### **1. Clone Repository**
```bash
git clone https://github.com/your-username/pos-mobile-app4Pedler.git
cd pos-mobile-app4Pedler
```

### **2. Install Dependencies**
```bash
# Using PNPM (recommended)
pnpm install

# Or using NPM
npm install
```

### **3. Environment Variables**
Create `.env.local` file in project root:

```env
# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=TindahanKO POS
NEXT_PUBLIC_APP_VERSION=1.0.0

# Business Configuration
NEXT_PUBLIC_BUSINESS_NAME=Your Business Name
NEXT_PUBLIC_BUSINESS_ADDRESS=Your Business Address
NEXT_PUBLIC_BUSINESS_PHONE=Your Phone Number
NEXT_PUBLIC_BUSINESS_EMAIL=your-email@domain.com

# Feature Flags
NEXT_PUBLIC_ENABLE_BARCODE_SCANNER=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
NEXT_PUBLIC_ENABLE_MULTI_LOCATION=false

# Security
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=https://your-domain.com

# Development
NODE_ENV=production
```

### **4. Supabase Configuration**
```env
# Additional Supabase Settings
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_DB_PASSWORD=your-database-password
```

---

## 🗄️ **Database Configuration**

### **1. Supabase Project Setup**

#### **Create New Project**
```bash
# Using Supabase CLI (optional)
npx supabase login
npx supabase init
npx supabase start
```

#### **Manual Setup via Dashboard**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and API keys
4. Configure database settings

### **2. Database Schema Deployment**

#### **Run Migrations**
Execute the following SQL files in order:

1. **Core Schema** (`supabase/migrations/`)
   ```sql
   -- Execute in Supabase SQL Editor
   \i 20250829000001_initial_schema.sql
   \i 20250829000002_enhanced_products.sql  
   \i 20250829000003_inventory_transaction_system.sql
   \i 20250829000004_inventory_transaction_system_complete.sql
   ```

2. **Seed Data** (optional)
   ```sql
   -- Insert sample data for testing
   \i supabase/seed.sql
   ```

#### **Verify Schema**
```bash
# Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

# Check RLS policies
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public';
```

### **3. Database Security**

#### **Row Level Security (RLS)**
```sql
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ... (repeat for all tables)

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated read" ON products
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated write" ON products  
FOR ALL TO authenticated USING (true);
-- ... (repeat for all tables)
```

#### **API Key Management**
- 🔐 **Anon Key** - Public, client-side access
- 🔐 **Service Role Key** - Server-side, full access
- 🔐 **JWT Secret** - Token signing

---

## 🚀 **Application Deployment**

### **1. Vercel Deployment (Recommended)**

#### **Automatic Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Follow prompts:
# ? Set up and deploy "pos-mobile-app4Pedler"? [Y/n] Y
# ? Which scope do you want to deploy to? [Select your account]
# ? Link to existing project? [N/y] N
# ? What's your project's name? tindahanko-pos
# ? In which directory is your code located? ./
```

#### **Manual Deployment**
1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Configure environment variables
4. Deploy automatically on push

#### **Production Environment Variables**
In Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

### **2. Alternative Deployment Options**

#### **Netlify**
```bash
# Build command
npm run build

# Publish directory  
out

# Environment variables (same as above)
```

#### **Self-Hosted (VPS/Docker)**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Deploy with Docker
docker build -t tindahanko-pos .
docker run -p 3000:3000 tindahanko-pos
```

---

## ⚙️ **Production Configuration**

### **1. Next.js Configuration**
Update `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Performance
  swcMinify: true,
  
  // Images
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options', 
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ]
  },
  
  // PWA Support
  experimental: {
    appDir: true,
  }
}

export default nextConfig
```

### **2. PWA Configuration**
Create `public/manifest.json`:

```json
{
  "name": "TindahanKO POS",
  "short_name": "TindahanKO",
  "description": "Point of Sale System for Small Businesses",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#8b5cf6",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icon-512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### **3. Service Worker**
Create `public/sw.js`:

```javascript
// Service Worker for offline functionality
const CACHE_NAME = 'tindahanko-pos-v1'
const OFFLINE_URL = '/offline.html'

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.add(OFFLINE_URL))
  )
})

// Fetch event  
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.open(CACHE_NAME)
            .then((cache) => cache.match(OFFLINE_URL))
        })
    )
  }
})
```

---

## 🎯 **Performance Optimization**

### **1. Bundle Analysis**
```bash
# Analyze bundle size
npm run build
npm run analyze

# Check performance
npm run lighthouse
```

### **2. Image Optimization**
```javascript
// next.config.mjs
module.exports = {
  images: {
    domains: ['your-cdn.com'],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  }
}
```

### **3. Database Optimization**
```sql
-- Add indexes for performance
CREATE INDEX idx_transactions_date ON transactions(created_at);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_customers_search ON customers(name, phone_number);
CREATE INDEX idx_inventory_locations_product ON inventory_locations(product_id);
```

### **4. Caching Strategy**
```javascript
// lib/cache.ts
export const cacheConfig = {
  products: { ttl: 300 }, // 5 minutes
  customers: { ttl: 600 }, // 10 minutes  
  transactions: { ttl: 60 }, // 1 minute
  reports: { ttl: 1800 }, // 30 minutes
}
```

---

## 🔒 **Security Setup**

### **1. Environment Security**
```bash
# Production environment variables
NODE_ENV=production
NEXT_PUBLIC_VERCEL_ENV=production

# Security keys (generate new)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
SUPABASE_JWT_SECRET=$(openssl rand -base64 32)
```

### **2. Content Security Policy**
```javascript
// next.config.mjs
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  connect-src 'self' *.supabase.co;
  font-src 'self';
`

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  }
]
```

### **3. API Route Protection**
```javascript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect API routes
  if (req.nextUrl.pathname.startsWith('/api/') && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}
```

---

## 📊 **Monitoring & Logging**

### **1. Error Tracking**
```javascript
// lib/logger.ts
export const logger = {
  error: (message, extra = {}) => {
    console.error(message, extra)
    // Send to monitoring service
  },
  info: (message, extra = {}) => {
    console.info(message, extra)
  }
}
```

### **2. Performance Monitoring**
```javascript
// lib/analytics.ts
export const trackEvent = (eventName, properties = {}) => {
  if (typeof window !== 'undefined') {
    // Google Analytics or other service
    gtag('event', eventName, properties)
  }
}
```

### **3. Health Checks**
Create `pages/api/health.ts`:

```javascript
export default async function handler(req, res) {
  try {
    // Check database connection
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message 
    })
  }
}
```

---

## 💾 **Backup Strategy**

### **1. Database Backup**
```bash
# Daily automated backup (Supabase Dashboard)
# Configure in: Settings > Database > Automated Backups

# Manual backup
pg_dump "postgresql://user:password@host:port/database" > backup.sql
```

### **2. Application Backup**
```bash
# Git repository backup
git remote add backup git@backup-server:repo.git
git push backup main

# File system backup  
tar -czf pos-app-backup-$(date +%Y%m%d).tar.gz /path/to/app
```

### **3. Recovery Testing**
```bash
# Test restore procedure
psql "postgresql://connection-string" < backup.sql

# Verify data integrity
SELECT count(*) FROM products;
SELECT count(*) FROM transactions;
```

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **1. Database Connection Issues**
```bash
# Check Supabase connection
curl -X GET 'https://your-project-id.supabase.co/rest/v1/products' \
     -H 'apikey: your-anon-key'

# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### **2. Build Failures**
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Check TypeScript errors
npm run type-check

# Fix linting issues
npm run lint -- --fix
```

#### **3. Performance Issues**
```bash
# Bundle analysis
npm run analyze

# Check lighthouse scores
npx lighthouse https://your-app-url.com

# Monitor memory usage
node --inspect npm start
```

#### **4. Authentication Issues**
```bash
# Verify JWT token
jwt-cli decode $JWT_TOKEN

# Check Supabase Auth settings
# Dashboard > Authentication > Settings
```

### **Debug Commands**
```bash
# Application logs
vercel logs your-deployment-url

# Database logs  
# Available in Supabase Dashboard > Logs

# Performance metrics
npm run analyze
npm run test:performance
```

---

## 📈 **Post-Deployment Checklist**

### **✅ Immediate (Day 1)**
- [ ] Verify all pages load correctly
- [ ] Test complete POS transaction flow
- [ ] Confirm database connectivity
- [ ] Check SSL certificate
- [ ] Test mobile responsiveness
- [ ] Verify payment processing
- [ ] Test receipt generation
- [ ] Confirm barcode scanning (if enabled)

### **✅ Short-term (Week 1)**
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Test backup/restore procedures
- [ ] Verify security headers
- [ ] Test offline functionality
- [ ] User acceptance testing
- [ ] Staff training completion

### **✅ Long-term (Month 1)**
- [ ] Performance optimization
- [ ] User feedback implementation
- [ ] Security audit
- [ ] Backup verification
- [ ] Analytics setup
- [ ] Feature usage analysis
- [ ] Plan next release

---

## 📞 **Support & Resources**

### **Documentation**
- 📚 [Next.js Documentation](https://nextjs.org/docs)
- 🗄️ [Supabase Documentation](https://supabase.io/docs)
- 🚀 [Vercel Documentation](https://vercel.com/docs)

### **Community Support**
- 💬 GitHub Issues: [Create Issue](https://github.com/your-repo/issues)
- 📧 Email Support: support@tindahanko.com
- 📱 Discord Community: [Join Server](https://discord.gg/tindahanko)

### **Professional Support**
- 🏢 **Enterprise Support**: Available for production deployments
- 🛠️ **Custom Development**: Feature customization and integration
- 📊 **Consulting Services**: Business process optimization

---

## 🔄 **Version History**

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-08-29 | Initial production release |
| 0.9.0 | 2024-08-28 | Beta release with core features |
| 0.8.0 | 2024-08-27 | Alpha release for testing |

---

## 📄 **License & Copyright**

**TindahanKO POS System**  
Copyright © 2024 Your Company Name  
Licensed under MIT License  

For production use, ensure compliance with all applicable laws and regulations for point-of-sale systems in your jurisdiction.

---

**🎉 Congratulations!** Your TindahanKO POS system is now ready for production deployment. The system includes all critical features for daily business operations including inventory management, customer credit tracking, payment processing, and comprehensive reporting.

**Next Steps:**
1. Complete the deployment following this guide
2. Train your staff on the new system
3. Monitor performance and user feedback
4. Plan for feature enhancements based on business needs

**Happy Selling!** 🏪✨