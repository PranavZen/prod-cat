import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAnalytics,
  fetchProductAnalytics,
} from "../../redux/slices/analyticsSlice";
import { StatCard, ProgressBar } from "../../components/tables/index";
import { Card, Alert } from "../../components/common/index";

/**
 * Admin Analytics Dashboard - Key metrics and KPIs
 */
export default function AdminAnalyticsPage() {
  const dispatch = useDispatch();
  const { dashboard, products, loading, error } = useSelector(
    (state) => state.analytics,
  );
  const [dateRange, setDateRange] = useState("month");

  useEffect(() => {
    dispatch(fetchAnalytics({ range: dateRange }));
    dispatch(fetchProductAnalytics());
  }, [dispatch, dateRange]);

  if (loading) {
    return <div className="p-6 text-center">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Track key metrics and business performance
        </p>
      </div>

      {/* Error Alert */}
      {error && <Alert type="error" title="Error" message={error} />}

      {/* Time Range Selector */}
      <Card>
        <div className="flex gap-2">
          {["week", "month", "quarter", "year"].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                dateRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </Card>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={dashboard?.totalProducts || 0}
          trend="+12%"
          icon={() => <span className="text-3xl">📦</span>}
        />
        <StatCard
          label="Total Categories"
          value={dashboard?.totalCategories || 0}
          trend="+5%"
          icon={() => <span className="text-3xl">📂</span>}
        />
        <StatCard
          label="Low Stock Items"
          value={dashboard?.lowStockProducts || 0}
          trend="-3%"
          icon={() => <span className="text-3xl">⚠️</span>}
        />
        <StatCard
          label="Total Inventory Value"
          value={`₹${(dashboard?.totalRevenueValue || 0).toLocaleString()}`}
          trend="+8%"
          icon={() => <span className="text-3xl">💰</span>}
        />
      </div>

      {/* Inventory Status */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          📊 Inventory Status
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-medium">In Stock</span>
              <span className="text-green-600 font-bold">75%</span>
            </div>
            <ProgressBar value={75} variant="success" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-medium">Low Stock</span>
              <span className="text-yellow-600 font-bold">15%</span>
            </div>
            <ProgressBar value={15} variant="warning" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-medium">Out of Stock</span>
              <span className="text-red-600 font-bold">10%</span>
            </div>
            <ProgressBar value={10} variant="danger" />
          </div>
        </div>
      </Card>

      {/* Top Products */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          🏆 Top Products by Value
        </h3>
        <div className="space-y-3">
          {(products?.slice(0, 5) || []).map((product, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-semibold text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-600">
                  {product.stock} units in stock
                </p>
              </div>
              <span className="font-bold text-lg text-green-600">
                ₹{product.value?.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Category Distribution */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          📈 Products by Category
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "Electronics", count: 145, value: "₹2,50,000" },
            { name: "Clothing", count: 230, value: "₹1,80,000" },
            { name: "Home & Garden", count: 89, value: "₹95,000" },
            { name: "Sports", count: 67, value: "₹75,000" },
          ].map((cat, idx) => (
            <div
              key={idx}
              className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
            >
              <p className="font-semibold text-gray-900">{cat.name}</p>
              <p className="text-sm text-gray-600">{cat.count} products</p>
              <p className="text-lg font-bold text-green-600 mt-2">
                {cat.value}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
