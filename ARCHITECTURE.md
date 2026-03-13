# Universal Product Catalogue Management System - Architecture

## Project Overview
A scalable, headless product catalogue admin application for managing products, categories, attributes, variants, inventory, pricing rules, and multi-store catalogues with CSV import/export capabilities.

---

## Technology Stack

### Frontend
- **React 19** - UI framework
- **Redux Toolkit** - State management
- **React Router v7** - Client-side routing
- **Tailwind CSS** - Styling (responsive design)
- **Chart.js** - Analytics dashboards
- **PapaParse** - CSV parsing
- **Axios** - HTTP client
- **React Icons** - Icon library
- **React Helmet** - SEO metadata

### Backend
- **Google Apps Script** - REST API
- **Google Sheets** - Database

### Architecture Pattern
- **Service Layer** - Centralized API communication
- **Redux Toolkit** - Predictable state management with slices
- **Component-Driven** - Reusable, modular components
- **Hooks Pattern** - Custom hooks for business logic
- **Utility Functions** - Pure functions for data transformation

---

## Folder Structure

```
src/
├── pages/              # Page components
│   ├── admin/         # Admin pages
│   │   ├── dashboard/
│   │   ├── categories/
│   │   ├── attributes/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── price-rules/
│   │   ├── stores/
│   │   ├── import/
│   │   ├── analytics/
│   │   └── settings/
│   └── storefront/    # Public pages
│
├── admin/             # Admin-specific components
│   ├── layout/        # Layout wrapper (sidebar, header)
│   ├── forms/         # Admin forms
│   ├── tables/        # Admin tables
│   ├── modals/        # Modal dialogs
│   └── charts/        # Analytics charts
│
├── components/        # Shared components
│   ├── common/        # Common UI (buttons, inputs, etc.)
│   ├── forms/         # Reusable form components
│   ├── tables/        # Reusable tables
│   ├── badges/        # Status badges
│   └── modals/        # Modal dialogs
│
├── hooks/             # Custom React hooks
│   ├── useForm.js
│   ├── useFetch.js
│   ├── useSearch.js
│   ├── useSort.js
│   ├── useValidate.js
│   └── usePagination.js
│
├── redux/             # State management
│   ├── store.js
│   └── slices/
│       ├── authSlice.js
│       ├── categorySlice.js
│       ├── attributeSlice.js
│       ├── productSlice.js
│       ├── variantSlice.js
│       ├── inventorySlice.js
│       ├── priceRuleSlice.js
│       ├── storeSlice.js
│       ├── csvImportSlice.js
│       ├── analyticsSlice.js
│       └── settingsSlice.js
│
├── services/          # API & Service layer
│   ├── api/
│   │   ├── categoryApi.js
│   │   ├── attributeApi.js
│   │   ├── productApi.js
│   │   ├── variantApi.js
│   │   ├── inventoryApi.js
│   │   ├── priceRuleApi.js
│   │   ├── storeApi.js
│   │   ├── csvApi.js
│   │   ├── analyticsApi.js
│   │   └── authApi.js
│   └── apiClient.js   # Centralized HTTP client
│
├── utils/             # Utility functions
│   ├── csvParser.js
│   ├── csvAnalysis.js
│   ├── csvMapping.js
│   ├── csvExport.js
│   ├── variantGenerator.js
│   ├── validators.js
│   ├── formatters.js
│   ├── helpers.js
│   └── constants.js
│
├── config.js          # Configuration
├── App.js
└── index.js
```

---

## Redux Architecture

### Slices Overview

| Slice | Purpose | Key Entities |
|-------|---------|--------------|
| `authSlice` | Authentication state | user, token, permissions |
| `categorySlice` | Category management | categories, selectedCategory |
| `attributeSlice` | Attribute system | attributes, attributeValues |
| `productSlice` | Product management | products, productDetails, filters |
| `variantSlice` | Product variants | variants, variantsByProduct |
| `inventorySlice` | Stock management | inventory, stockHistory, alerts |
| `priceRuleSlice` | Pricing rules | rules, activeRules, discounts |
| `storeSlice` | Multi-store setup | stores, storeConfig |
| `csvImportSlice` | CSV operations | importJobs, preview, validation |
| `analyticsSlice` | Dashboard metrics | metrics, charts, reports |
| `settingsSlice` | App settings | appConfig, theme, preferences |

### State Shape Example
```javascript
{
  auth: {
    user: { id, email, role },
    token: "...",
    isAuthenticated: false,
    loading: false
  },
  catalogue: {
    products: {
      ids: [...],
      entities: { id: product },
      pagination: { page, pageSize, total },
      filters: {},
      loading: false,
      error: null
    },
    categories: { ids: [...], entities: {...} },
    attributes: { ids: [...], entities: {...} },
    variants: { ids: [...], entities: {...} }
  },
  inventory: {
    stocks: { ids: [...], entities: {...} },
    history: [...],
    alerts: []
  }
}
```

---

## API Design

### Categories
- `GET /categories` - Fetch all categories
- `GET /categories/:id` - Fetch single category
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Attributes
- `GET /attributes` - Fetch all attributes
- `GET /attributes/:id` - Fetch single attribute
- `POST /attributes` - Create attribute
- `PUT /attributes/:id` - Update attribute
- `DELETE /attributes/:id` - Delete attribute
- `POST /attributes/:id/values` - Add attribute values

### Products
- `GET /products` - Fetch all products (with filters, pagination)
- `GET /products/:id` - Fetch product with variants
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `POST /products/:id/bulk-update` - Bulk update products

### Variants
- `GET /variants/:id` - Fetch variant
- `POST /variants` - Create variant
- `PUT /variants/:id` - Update variant
- `DELETE /variants/:id` - Delete variant
- `POST /products/:id/generate-variants` - Auto-generate variants

### Inventory
- `GET /inventory/:variantId` - Get stock status
- `POST /inventory/:variantId/adjust` - Adjust stock
- `GET /inventory/history` - Stock history logs
- `POST /inventory/alerts` - Configure low stock alerts

### Price Rules
- `GET /price-rules` - Fetch all rules
- `POST /price-rules` - Create rule
- `PUT /price-rules/:id` - Update rule
- `DELETE /price-rules/:id` - Delete rule

### Stores
- `GET /stores` - Fetch all stores
- `POST /stores` - Create store
- `PUT /stores/:id` - Update store
- `DELETE /stores/:id` - Delete store
- `POST /products/:id/stores/:storeId/pricing` - Store-specific pricing

### CSV Operations
- `POST /csv/upload` - Upload and validate CSV
- `POST /csv/preview` - Parse and preview CSV
- `POST /csv/import` - Import CSV data
- `GET /csv/export` - Export products to CSV
- `GET /csv/export/:categoryId` - Export by category

### Analytics
- `GET /analytics/dashboard` - Dashboard metrics
- `GET /analytics/products` - Product analytics
- `GET /analytics/inventory` - Inventory analytics
- `GET /analytics/sales` - Sales analytics

---

## Data Models

### Product
```javascript
{
  product_id: string,
  title: string,
  slug: string,
  description: string,
  brand: string,
  category_id: string,
  category: Category,
  attributes: {
    [attributePath]: value // e.g., color: "red", size: "M"
  },
  images: Image[],
  status: "active" | "inactive" | "draft",
  created_at: timestamp,
  updated_at: timestamp
}
```

### Category
```javascript
{
  category_id: string,
  name: string,
  slug: string,
  description: string,
  parent_id: string | null,
  image_url: string,
  status: "active" | "inactive",
  order: number,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Attribute
```javascript
{
  attribute_id: string,
  name: string,
  slug: string,
  type: "text" | "select" | "multiselect" | "checkbox",
  values: {
    value_id: string,
    label: string,
    color: string // for color attributes
  }[],
  is_filterable: boolean,
  is_visible: boolean,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Variant
```javascript
{
  variant_id: string,
  product_id: string,
  sku: string,
  barcode: string,
  title: string,
  attribute_values: { [attr]: value },
  price: number,
  compare_price: number,
  cost: number,
  images: Image[],
  stock: number,
  reserved: number,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Inventory
```javascript
{
  inventory_id: string,
  variant_id: string,
  stock_available: number,
  stock_reserved: number,
  stock_total: number,
  low_stock_threshold: number,
  last_restock: timestamp,
  location: string,
  history: StockHistory[]
}

StockHistory {
  id: string,
  type: "add" | "remove" | "adjust" | "reserved",
  quantity: number,
  reason: string,
  timestamp: timestamp,
  user: User
}
```

### Price Rule
```javascript
{
  rule_id: string,
  name: string,
  description: string,
  type: "percentage" | "fixed",
  discount_value: number,
  target: {
    type: "category" | "product" | "all",
    id: string | null
  },
  active_from: timestamp,
  active_to: timestamp,
  status: "active" | "inactive",
  priority: number,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Store
```javascript
{
  store_id: string,
  name: string,
  currency: "INR" | "USD" | "AED" | "GBP" | "EUR",
  country: string,
  status: "active" | "inactive",
  primary: boolean,
  config: {
    tax_rate: number,
    shipping_cost: number,
    min_order_value: number
  },
  created_at: timestamp,
  updated_at: timestamp
}
```

---

## Component Architecture

### Page Structure
Each page follows this pattern:
1. **Container** - Manages state, data fetching
2. **Header** - Title, actions, filters
3. **Content** - Main content area
4. **Footer** - Pagination, info

### Component Types

#### Tables
- `DataTable` - Generic table with sorting, filtering, pagination
- `ProductTable` - Product listing
- `CategoryTable` - Category listing
- `InventoryTable` - Inventory status

#### Forms
- `ProductForm` - Create/edit products
- `CategoryForm` - Create/edit categories
- `AttributeForm` - Create/edit attributes
- `VariantForm` - Create/edit variants
- `PriceRuleForm` - Create/edit rules

#### Charts
- `ProductDistributionChart` - Pie chart
- `InventoryStatusChart` - Bar chart
- `SalesChart` - Line chart
- `StockTrendChart` - Area chart

#### Modals
- `ConfirmDialog` - Confirmation dialogs
- `BulkActionModal` - Bulk operations
- `VariantPreviewModal` - Variant preview
- `ImportPreviewModal` - CSV import preview

---

## Development Steps

### Phase 1: Foundation & Architecture
- [x] Core Redux setup
- [x] API client & routing
- [x] Admin layout & responsive design
- [ ] Create all Redux slices
- [ ] Establish utility functions
- [ ] Create reusable UI components

### Phase 2: Core Modules
- [x] Category management
- [x] Product management
- [x] Attribute system
- [x] Variant system
- [ ] Complete forms & validation
- [ ] Complete table views
- [ ] Add edit/delete functionality

### Phase 3: Advanced Features
- [ ] Inventory tracking system
- [ ] Price rules engine
- [ ] Multi-store support
- [ ] Stock history logs
- [ ] Low stock alerts

### Phase 4: CSV & Import
- [x] CSV parser
- [x] CSV validation
- [x] Import preview
- [ ] Enhanced CSV mapping
- [ ] Export functionality
- [ ] Batch import/export

### Phase 5: Analytics & Dashboards
- [ ] Dashboard analytics
- [ ] Sales charts
- [ ] Inventory analytics
- [ ] Category performance
- [ ] Custom reports

### Phase 6: UI/UX & Polish
- [ ] Responsive design (mobile-first)
- [ ] Error handling & validation
- [ ] Loading states
- [ ] Toast notifications
- [ ] Accessibility improvements
- [ ] Performance optimization

### Phase 7: Google Apps Script Backend
- [ ] Complete API endpoints
- [ ] Database schema design
- [ ] Authentication & authorization
- [ ] Error handling
- [ ] Logging & monitoring

---

## Key Features

### 1. Category Management
- Hierarchical categories (parent-child relationships)
- Nested category support
- Category images
- SEO-friendly slugs
- Bulk operations

### 2. Product Attributes
- Create custom attributes
- Multiple attribute types (text, select, multiselect)
- Attribute values
- Filterable attributes
- Attribute grouping

### 3. Variant System
- Auto-generate variants from attributes
- SKU management
- Variant-level pricing & images
- Bulk variant operations
- Variant templates

### 4. Inventory Management
- Real-time stock tracking
- Stock history logs
- Reserved stock management
- Low stock alerts
- Multi-location support

### 5. Pricing Rules
- Percentage & fixed discounts
- Category-based rules
- Product-based rules
- Date-range based rules
- Priority-based rule application

### 6. Multi-Store Catalog
- Store-specific pricing
- Store-specific availability
- Currency support
- Store configuration
- Independent inventory per store

### 7. CSV Import/Export
- Smart CSV mapping
- Dynamic column detection
- Validation & error handling
- Bulk import
- Template export

### 8. Analytics Dashboard
- Product performance
- Inventory metrics
- Sales trends
- Category distribution
- Custom date ranges

---

## Best Practices

### Code Quality
- **Single Responsibility** - Each component/function has one job
- **DRY Principle** - Reuse utilities and components
- **Naming Conventions** - Clear, descriptive names
- **Error Handling** - Try-catch, graceful fallback
- **Testing** - Unit tests for critical logic

### Performance
- **Code Splitting** - Lazy load pages
- **Memoization** - useMemo, useCallback for expensive computations
- **Pagination** - Handle large datasets with pagination
- **Caching** - Redux cache strategy
- **Image Optimization** - Lazy loading, compression

### Responsive Design
- **Mobile First** - Design for mobile, enhance for larger screens
- **Tailwind Utilities** - sm:, md:, lg:, xl: breakpoints
- **Flexible Layouts** - CSS Grid, Flexbox
- **Touch-friendly** - Large touch targets (44x44 min)
- **Readable Text** - 16px minimum font size

### Security
- **Input Validation** - Sanitize all inputs
- **API Key Protection** - Use environment variables
- **CORS Handling** - Proper CORS setup
- **XSS Prevention** - React escaping
- **Authentication** - Token-based auth

### State Management
- **Normalization** - Normalize complex data
- **Entity Adapters** - Use createEntityAdapter
- **Async Thunks** - Handle async operations
- **Error States** - Track errors separately
- **Loading States** - UI feedback during async

---

## Environment Setup

```bash
# Install dependencies
npm install

# Development server
npm start

# Build for production
npm build

# Run tests
npm test
```

### Environment Variables
```
REACT_APP_API_URL=https://script.google.com/macros/d/...
REACT_APP_ADMIN_API_KEY=your_api_key
REACT_APP_MAX_FILE_SIZE=5242880
REACT_APP_ACCEPTED_FILE_TYPES=.csv,.xlsx
```

---

## Database Schema (Google Sheets)

### Sheets Structure
1. **Products** - Product records
2. **Categories** - Category hierarchy
3. **Attributes** - Attribute definitions
4. **Variants** - Product variants
5. **Inventory** - Stock levels
6. **PriceRules** - Pricing rules
7. **Stores** - Store configuration
8. **StockHistory** - Inventory logs

---

## Quality Assurance

### Testing Strategy
- **Unit Tests** - Business logic, utilities
- **Component Tests** - UI components
- **Integration Tests** - API integration
- **E2E Tests** - User workflows

### Code Review Checklist
- [ ] Code follows conventions
- [ ] No console errors/warnings
- [ ] Responsive design verified
- [ ] Performance acceptable
- [ ] Security considered
- [ ] Tests pass

---

## Future Enhancements

1. **Advanced Analytics**
   - Custom date ranges
   - Cohort analysis
   - Predictive analytics

2. **AI Features**
   - Product recommendations
   - Smart pricing
   - Demand forecasting

3. **Integrations**
   - Shopify sync
   - WooCommerce sync
   - Payment gateways

4. **Mobile App**
   - React Native app
   - Offline support
   - Mobile-optimized inventory

5. **Advanced Inventory**
   - Multi-warehouse support
   - Transfer orders
   - Barcode scanning

6. **B2B Features**
   - Wholesale pricing
   - Tiered discounts
   - Custom catalogs

---

## Documentation

- API Documentation: [docs/API.md](docs/API.md)
- Component Guide: [docs/COMPONENTS.md](docs/COMPONENTS.md)
- Testing Guide: [docs/TESTING.md](docs/TESTING.md)
- Deployment Guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

**Last Updated:** March 10, 2026
**Status:** In Development
