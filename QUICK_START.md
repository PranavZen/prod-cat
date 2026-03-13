# Quick Start Guide - Get Running in 5 Minutes

## Step 1: Install & Start (1 minute)

```bash
cd /Users/macos/Downloads/prod-cat-app
npm install
npm start
```

Your browser should open to `http://localhost:3000`

## Step 2: Navigate to Admin (30 seconds)

Click on the URL bar and go to:
```
http://localhost:3000/admin
```

You'll see the Admin Dashboard with quick action cards.

## Step 3: Test Each Module (3 minutes)

### 🏠 Dashboard
- See KPI overview
- View recent activities
- Check low stock alerts
- Quick links to main modules

### 📦 Products
- Click "+ Create Product"
- Fill in: Title, SKU, Price, Category
- Click "Create Product"
- See it appear in the table
- Try editing it
- Try deleting it

### 📂 Categories
- Navigate to Categories
- Create category "Electronics"
- Create category "Clothing"
- See them appear in table
- Edit and delete to test CRUD

### ⚙️ Attributes
- Go to Attributes
- Create attribute "Color"
- Add values: "Red", "Blue", "Black"
- Create attribute "Size" 
- Add values: "S", "M", "L", "XL"

### 📊 Inventory
- Navigate to Inventory
- Click "Adjust Stock" on any item
- Enter quantity (e.g., +50)
- Select reason
- Click "Update Stock"

### 💰 Price Rules
- Go to Price Rules
- Create rule: "10% discount"
- Choose target: "All Products"
- Set as active
- See in table

### 🏪 Stores
- Navigate to Stores
- Create store "India Store"
- Select currency: INR
- Create store "US Store"
- Select currency: USD

### 📈 Analytics
- Click Analytics in sidebar
- See dashboard with metrics
- View category distribution
- See top products by value

### 📥 Import
- Go to Import
- See how to upload CSV
- Click on file upload
- See preview modal

## Step 4: Test Responsive Design (1 minute)

### Desktop
- The sidebar is visible on the left
- Navigation shows full menu labels

### Tablet (iPad size)
- Press F12 (DevTools)
- Click Device toggle
- Select iPad
- Sidebar should be visible

### Mobile (iPhone size)
- In DevTools, select iPhone X
- Sidebar collapses into ☰ hamburger menu
- Click hamburger to toggle menu
- Tables scroll horizontally

## Step 5: Check Redux Integration (30 seconds)

### Install Redux DevTools Extension
1. Install Redux DevTools Chrome extension
2. Go to http://localhost:3000/admin
3. Open DevTools (F12)
4. Click "Redux" tab
5. Try creating a product
6. Watch the Redux state update in real-time

## Step 6: Explore Advanced Features

### Search & Filter
- On Products page, search by name or SKU
- Filter by status (Active, Draft, Inactive)
- Filter by category

### Pagination
- Scroll to bottom of table
- Click next/previous page buttons
- Change items per page

### Validation
- On create form, try submitting empty
- See error messages
- Fill in required fields
- Notice "Create Product" button only enables when valid

### Modals
- Click any edit button
- Form opens in modal overlay
- Try different actions inside modal
- Click outside to close

## What Works Right Now ✅

- ✅ All 9 admin pages
- ✅ Forms with validation
- ✅ Redux state management
- ✅ Data tables and sorting
- ✅ Modal dialogs
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Hamburger menu on mobile
- ✅ Search and filtering

## What Needs Backend Implementation 🔄

- 🔄 Create/Edit/Delete operations (will call Google Apps Script)
- 🔄 CSV import processing
- 🔄 Real-time data persistence
- 🔄 Stock history tracking
- 🔄 Analytics data calculation

**See PHASE_3_BACKEND_GUIDE.md for backend implementation instructions**

## Common Issues & Solutions

### Q: "npm: command not found"
**A**: Install Node.js from nodejs.org

### Q: "Port 3000 is already in use"
**A**: Either kill the process or use: `npm start -- --port 3001`

### Q: "Components look weird/buttons don't work"
**A**: Wait for Tailwind CSS to compile (takes a few seconds), or:
```bash
npm install -D tailwindcss postcss autoprefixer
npm start
```

### Q: "Form not submitting"
**A**: Check browser console (F12) for errors. Ensure all required fields are filled.

### Q: "Redux DevTools not showing"
**A**: Install Redux DevTools Chrome extension from Chrome Web Store

## What to Try Next

1. **Create a complete product workflow:**
   - Create category "Electronics"
   - Create attribute "Brand"
   - Create attribute "Color"
   - Create product "iPhone"
   - Assign category and attributes
   - Auto-generate variants
   - Adjust stock for each variant
   - Create discount rule
   - Verify in analytics

2. **Test CSV import:**
   - Download sample CSV
   - Map columns to fields
   - Preview before importing
   - See products appear in table

3. **Explore mobile responsiveness:**
   - Test on actual phone/tablet
   - Or use DevTools device emulation
   - Click hamburger menu
   - Scroll through tables

## Getting Help

- Check ARCHITECTURE.md for system design
- Read PHASE_3_BACKEND_GUIDE.md for backend info
- Look at component comments for usage examples
- Inspect Redux state in DevTools

---

## Navigation Cheat Sheet

| Goal | Path |
|------|------|
| Dashboard | /admin |
| Products | /admin/products |
| Categories | /admin/categories |
| Attributes | /admin/attributes |
| Variants | /admin/variants |
| Inventory | /admin/inventory |
| Price Rules | /admin/price-rules |
| Stores | /admin/stores |
| Analytics | /admin/analytics |
| CSV Import | /admin/import |

---

**Ready to build? Check PHASE_3_BACKEND_GUIDE.md to implement the backend!** 🚀
