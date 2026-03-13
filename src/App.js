import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AdminLayout from './admin/layout/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductEditorPage from './pages/admin/AdminProductEditorPage';
import AdminProductViewPage from './pages/admin/AdminProductViewPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminAttributesPage from './pages/admin/AdminAttributesPage';
import AdminVariantsPage from './pages/admin/AdminVariantsPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminPriceRulesPage from './pages/admin/AdminPriceRulesPage';
import AdminStoresPage from './pages/admin/AdminStoresPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminImportPage from './pages/admin/AdminImportPage';
import CataloguePage from './pages/storefront/CataloguePage';
import ProductDetailPage from './pages/storefront/ProductDetailPage';
import ProductPage from './pages/ProductPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CataloguePage />} />
        <Route path="/product/:productId" element={<ProductDetailPage />} />
        {/* legacy/admin record link uses generic page */}
        <Route path="/record/:productId" element={<ProductPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="catalogue" element={<AdminProductsPage />} />
          <Route path="products/new" element={<AdminProductEditorPage />} />
          <Route path="products/:productId" element={<AdminProductEditorPage />} />
          <Route path="products/:productId/view" element={<AdminProductViewPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="attributes" element={<AdminAttributesPage />} />
          <Route path="variants" element={<AdminVariantsPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="price-rules" element={<AdminPriceRulesPage />} />
          <Route path="stores" element={<AdminStoresPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="import" element={<AdminImportPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
