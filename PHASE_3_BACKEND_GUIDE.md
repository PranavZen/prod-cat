# Phase 3: Backend Implementation & Testing Guide

**Status**: Ready to implement  
**Estimated Duration**: 3-5 days  
**Priority**: High - Required to enable all CRUD operations

---

## Overview

Phase 3 focuses on implementing the backend API using Google Apps Script and Google Sheets. All frontend code is complete and waiting for backend integration.

---

## 1. Google Apps Script Setup

### 1.1 Create Database Schema in Google Sheets

Create separate sheets for each entity:

```
Google Sheet Structure:
├── Products (Sheet)
│   ├── Columns: product_id, title, sku, description, category_id, price, compare_price, status, created_at, updated_at
│   └── Data rows: Product records
├── Categories (Sheet)
│   ├── Columns: category_id, name, slug, parent_id, description, image_url, status, order, created_at
├── Attributes (Sheet)
│   ├── Columns: attribute_id, name, type, values (JSON), is_filterable, is_visible
├── ProductAttributes (Sheet)
│   ├── Columns: product_id, attribute_id, value
├── Variants (Sheet)
│   ├── Columns: variant_id, product_id, sku, barcode, title, price, cost, stock, reserved
├── Inventory (Sheet)
│   ├── Columns: inventory_id, variant_id, stock_available, stock_reserved, location, low_stock_threshold
├── StockHistory (Sheet)
│   ├── Columns: history_id, variant_id, type, quantity, reason, created_at
├── PriceRules (Sheet)
│   ├── Columns: rule_id, name, type, discount_value, target_type, target_id, active, start_date, end_date
├── Stores (Sheet)
│   ├── Columns: store_id, name, currency, status, primary, tax_rate, shipping_cost
└── Users (Sheet)
    ├── Columns: user_id, email, password_hash, role, status, created_at
```

### 1.2 Scripts to Create

**File: `apps-script/productService.gs`**
```javascript
/**
 * Product Service - CRUD operations for products
 */

function getProducts(filters = {}) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  // Filter and return
  return { products: [...], success: true };
}

function getProductById(productId) {
  // Find product by ID
  // Return with variants
}

function createProduct(data) {
  // Validate data
  // Generate product_id
  // Add to sheet
  // Return created product
}

function updateProduct(productId, data) {
  // Find row
  // Update values
  // Return updated product
}

function deleteProduct(productId) {
  // Mark as deleted or remove row
  // Return success
}
```

**File: `apps-script/categoryService.gs`**
```javascript
function getCategories(filters = {}) {
  // Return categories with optional parent filtering
}

function getCategoryTree() {
  // Return nested category structure
}

function createCategory(data) {
  // Add category with parent_id support
}

function updateCategory(categoryId, data) {
  // Update category
}

function deleteCategory(categoryId) {
  // Delete category and adjust children
}
```

**File: `apps-script/variantService.gs`**
```javascript
function getVariantsByProductId(productId) {
  // Return all variants for product
}

function generateVariants(productId, attributes) {
  // Generate Cartesian product of attribute values
  // Create all variant combinations
}

function createVariant(data) {
  // Add variant to sheet
}

function updateVariant(variantId, data) {
  // Update variant stock, price, etc.
}

function deleteVariant(variantId) {
  // Remove variant
}
```

### 1.3 Utility Functions

**File: `apps-script/sheetRepository.gs`**
```javascript
/**
 * Utility functions for sheet operations
 */

function getSheetByName(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function appendRow(sheetName, values) {
  const sheet = getSheetByName(sheetName);
  sheet.appendRow(values);
}

function findRowById(sheetName, idColumnIndex, id) {
  const sheet = getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  return data.findIndex((row) => row[idColumnIndex] === id);
}

function updateRow(sheetName, rowIndex, values) {
  const sheet = getSheetByName(sheetName);
  const range = sheet.getRange(rowIndex + 1, 1, 1, values.length);
  range.setValues([values]);
}

function deleteRow(sheetName, rowIndex) {
  const sheet = getSheetByName(sheetName);
  sheet.deleteRow(rowIndex + 1);
}

function getNextId(sheetName, idPrefix = 'ID') {
  const sheet = getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const maxId = Math.max(...data.map((row) => parseInt(row[0].replace(idPrefix, '')) || 0));
  return `${idPrefix}${maxId + 1}`;
}
```

---

## 2. API Routing Setup

**File: `apps-script/router.gs`** (Already exists - update with all endpoints)

```javascript
function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const { action, method, params } = payload;

  try {
    let response;

    // Product endpoints
    if (action === 'products') {
      if (method === 'GET') response = getProducts(params);
      if (method === 'GET_BY_ID') response = getProductById(params.productId);
      if (method === 'CREATE') response = createProduct(params);
      if (method === 'UPDATE') response = updateProduct(params.productId, params);
      if (method === 'DELETE') response = deleteProduct(params.productId);
    }

    // Category endpoints
    if (action === 'categories') {
      if (method === 'GET') response = getCategories(params);
      if (method === 'GET_TREE') response = getCategoryTree();
      if (method === 'CREATE') response = createCategory(params);
      if (method === 'UPDATE') response = updateCategory(params.categoryId, params);
      if (method === 'DELETE') response = deleteCategory(params.categoryId);
    }

    // Similar for variants, attributes, inventory, priceRules, stores

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message,
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## 3. Update API Clients

### Current State
All `src/services/api/*.js` files have template functions using `postAction()` wrapper.

### What to Do
No changes needed - the API clients are already set up to call Google Apps Script endpoints. The `postAction()` wrapper will send requests in the correct format.

Example from `src/services/api/productApi.js`:
```javascript
export const fetchProducts = async (filters = {}, pagination = {}, sort = {}) => {
  return postAction('products', 'GET', { filters, pagination, sort });
};
```

This already matches what Google Apps Script router expects.

---

## 4. Testing Checklist

### 4.1 Backend Testing

1. **Test each Google Apps Script function:**
   ```bash
   # Use Google Apps Script debugger
   # Run getProducts() → should return product list
   # Run createProduct({...}) → should add to sheet
   # Run getProductById('ID1') → should return product
   # etc.
   ```

2. **Test POST endpoint:**
   ```bash
   curl -X POST https://script.google.com/xyz \
     -H "Content-Type: application/json" \
     -d '{
       "action": "products",
       "method": "GET",
       "params": {}
     }'
   ```

### 4.2 Frontend Testing

1. **Test Dashboard:**
   - Open http://localhost:3000/admin
   - Should load without errors
   - Stats cards should show counts

2. **Test Categories Module:**
   - Navigate to /admin/categories
   - Click "+ Create Category"
   - Fill form and submit
   - Check Redux store (DevTools)
   - Category should appear in table

3. **Test Products Module:**
   - Navigate to /admin/products
   - Create product
   - Should associate with category
   - Edit product - should populate form
   - Delete product - should show confirmation

4. **Test Inventory:**
   - Navigate to /admin/inventory
   - Adjust stock
   - Should update in sheet
   - History should log change

### 4.3 Integration Testing

1. **End-to-end flow:**
   ```
   1. Create category "Electronics"
   2. Create attribute "Color" with values ["Red", "Blue"]
   3. Create product "Phone" in Electronics category
   4. Assign Color attribute to product
   5. Generate variants (2 variants created)
   6. Adjust stock for each variant
   7. Verify in sheets
   ```

---

## 5. Features to Implement

### 5.1 High Priority (Week 1)

- [ ] Implement productService.gs with full CRUD
- [ ] Implement categoryService.gs with nesting support
- [ ] Implement variantService.gs with variant generation
- [ ] Implement inventoryService.gs with stock tracking
- [ ] Test all CRUD operations through UI

### 5.2 Medium Priority (Week 2)

- [ ] Implement priceRuleApi with rule application logic
- [ ] Implement storeApi with multi-currency support
- [ ] Implement attribute API operations
- [ ] Add Toast notifications for all operations
- [ ] Implement CSV import with dynamic column detection

### 5.3 Lower Priority (Week 3+)

- [ ] User authentication and permissions
- [ ] Image upload and CDN integration
- [ ] Advanced filtering and faceted search
- [ ] Export functionality (PDF, Excel)
- [ ] Scheduled tasks (low stock alerts, price updates)

---

## 6. Common Implementation Patterns

### Pattern 1: Adding a New CRUD Module

```javascript
// In apps-script/newModuleService.gs
function getNewModules(filters = {}) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('NewModule');
  const data = sheet.getDataRange().getValues();
  
  // Filter by filters.status, filters.search, etc.
  const filtered = data.filter(row => {
    // Apply filters
    return true;
  });

  return {
    success: true,
    data: filtered.map(row => ({
      id: row[0],
      name: row[1],
      // ... other fields
    })),
  };
}

function createNewModule(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('NewModule');
  const id = getNextId('NewModule', 'NM');
  
  const newRow = [
    id,
    data.name,
    // ... other fields
    new Date(),
    new Date(),
  ];

  sheet.appendRow(newRow);

  return {
    success: true,
    message: 'Module created successfully',
    data: { id, ...data },
  };
}
```

### Pattern 2: Relationship Handling

```javascript
// For product variants
function createVariantWithInventory(variantData, inventoryData) {
  // 1. Create variant in Variants sheet
  const variantId = createVariant(variantData);
  
  // 2. Create inventory record
  inventoryData.variant_id = variantId;
  createInventory(inventoryData);
  
  // 3. Initialize stock history
  createStockHistory({
    variant_id: variantId,
    type: 'created',
    quantity: inventoryData.stock_available,
    reason: 'Initial stock',
  });

  return { success: true, variantId };
}
```

### Pattern 3: Validation

```javascript
function validateProductData(data) {
  const errors = [];

  if (!data.title || data.title.trim() === '') {
    errors.push('Product title is required');
  }
  if (!data.sku || data.sku.trim() === '') {
    errors.push('SKU is required');
  }
  if (data.price <= 0) {
    errors.push('Price must be greater than 0');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

---

## 7. Deployment Steps

1. **Copy code to Google Apps Script:**
   - Go to Google Apps Script editor
   - Create new files for each service
   - Paste code from apps-script/ folder

2. **Deploy as webapp:**
   - Deploy > New deployment
   - Type: Web app
   - Execute as: Your account
   - Who has access: Anyone

3. **Update API_BASE_URL:**
   ```javascript
   // In src/services/apiClient.js
   const API_BASE_URL = 'https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/usercallback';
   ```

4. **Test endpoints:**
   ```bash
   npm start
   # Navigate to http://localhost:3000/admin
   # Test CRUD operations
   ```

---

## 8. Troubleshooting

### Problem: "TypeError: Cannot read property 'getValues' of null"
**Solution**: Ensure sheet name matches exactly (case-sensitive)

### Problem: "URLFetchApp is not defined"
**Solution**: This shouldn't happen - it's built into Apps Script. Check method names.

### Problem: "CORS error" when calling API
**Solution**: Ensure deployment allows "Anyone" to access

### Problem: "Data not saving to sheet"
**Solution**: Check if script has edit permissions to sheet

---

## 9. Sample Data Setup

For testing, pre-populate sheets with sample data:

```javascript
function setupSampleData() {
  // Categories
  createCategory({ name: 'Electronics', description: 'Electronic devices' });
  createCategory({ name: 'Clothing', description: 'Apparel and fashion' });
  createCategory({ name: 'Home & Garden', description: 'Home products' });

  // Products
  createProduct({
    title: 'Wireless Headphones',
    sku: 'WH-001',
    category_id: 'CAT1',
    price: 2999,
    status: 'active',
  });

  // Attributes
  createAttribute({
    name: 'Color',
    type: 'select',
    values: ['Red', 'Blue', 'Black'],
  });

  // Stock
  createInventory({
    variant_id: 'VAR1',
    stock_available: 100,
    stock_reserved: 0,
  });
}
```

Run `setupSampleData()` in Apps Script debugger to populate test data.

---

## 10. Next Steps

1. **Week 1**: Implement core services (Product, Category, Variant, Inventory)
2. **Week 2**: Add remaining services (Attributes, PriceRules, Stores)
3. **Week 3**: Add advanced features (CSV import, Analytics, Export)
4. **Week 4**: Testing, optimization, deployment

---

**Estimated Total Backend Work**: 40-60 hours  
**Estimated Testing Time**: 10-20 hours  
**Total Phase 3**: 50-80 hours (1-2 weeks)

---

*This guide provides a roadmap for Phase 3 implementation. All frontend code is ready and waiting for backend integration.*
