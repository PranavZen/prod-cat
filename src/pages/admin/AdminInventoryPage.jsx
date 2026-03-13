import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInventory,
  adjustStock,
  setLowStockAlert,
} from "../../redux/slices/inventorySlice";
import { DataTable, StatCard, Timeline } from "../../components/tables/index";
import {
  Button,
  Modal,
  Input,
  Card,
  Alert,
  Badge,
} from "../../components/common/index";

/**
 * Admin Inventory Page - Manage stock and low stock alerts
 */
export default function AdminInventoryPage() {
  const dispatch = useDispatch();
  const { ids, entities, loading, error, lowStockItems } = useSelector(
    (state) => state.inventory,
  );
  const products = useSelector((state) =>
    Object.values(state.products.entities),
  );
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [adjustmentData, setAdjustmentData] = useState({
    quantity: "",
    reason: "manual_adjustment",
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  const inventory = ids.map((id) => entities[id]);

  const filteredInventory = inventory.filter((item) => {
    if (!item) return false;

    const matchesSearch = item.variant_name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (filterStatus === "low")
      return item.stock_available < item.low_stock_threshold;
    if (filterStatus === "out") return item.stock_available === 0;

    return matchesSearch;
  });

  const handleAdjustStock = async () => {
    if (!adjustmentData.quantity || !selectedVariant) return;

    try {
      await dispatch(
        adjustStock({
          variant_id: selectedVariant.variant_id,
          quantity: parseInt(adjustmentData.quantity),
          reason: adjustmentData.reason,
        }),
      ).unwrap();

      setShowAdjustModal(false);
      setSelectedVariant(null);
      setAdjustmentData({ quantity: "", reason: "manual_adjustment" });
    } catch (err) {
      console.error("Failed to adjust stock:", err);
    }
  };

  const columns = [
    {
      key: "variant_name",
      label: "Variant",
      render: (value) => <p className="font-semibold text-gray-900">{value}</p>,
    },
    {
      key: "stock_available",
      label: "Available",
      render: (value) => (
        <span className="text-lg font-bold text-green-600">{value}</span>
      ),
    },
    {
      key: "stock_reserved",
      label: "Reserved",
      render: (value) => <span className="text-gray-600">{value}</span>,
    },
    {
      key: "stock_total",
      label: "Total",
      render: (value) => (
        <span className="font-semibold text-gray-900">{value}</span>
      ),
    },
    {
      key: "low_stock_threshold",
      label: "Threshold",
      render: (value) => <span className="text-sm text-gray-500">{value}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (_, row) => {
        if (row.stock_available === 0) {
          return <Badge variant="danger">Out of Stock</Badge>;
        }
        if (row.stock_available < row.low_stock_threshold) {
          return <Badge variant="warning">Low Stock</Badge>;
        }
        return <Badge variant="success">In Stock</Badge>;
      },
    },
  ];

  const tableActions = [
    {
      id: "adjust",
      label: "Adjust Stock",
      onClick: (row) => {
        setSelectedVariant(row);
        setShowAdjustModal(true);
      },
    },
  ];

  const totalStock = inventory.reduce(
    (sum, item) => sum + (item?.stock_total || 0),
    0,
  );
  const outOfStock = inventory.filter(
    (item) => item?.stock_available === 0,
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Inventory Management
        </h1>
        <p className="text-gray-600 mt-1">
          Track stock levels, adjust inventory, and manage low stock alerts
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Stock"
          value={totalStock}
          icon={() => <span className="text-3xl">📊</span>}
        />
        <StatCard
          label="Out of Stock Items"
          value={outOfStock}
          icon={() => <span className="text-3xl">🚫</span>}
        />
        <StatCard
          label="Low Stock Warning"
          value={lowStockItems.length}
          icon={() => <span className="text-3xl">⚠️</span>}
        />
        <StatCard
          label="Total Variants"
          value={inventory.length}
          icon={() => <span className="text-3xl">📦</span>}
        />
      </div>

      {/* Error Alert */}
      {error && <Alert type="error" title="Error" message={error} />}

      {/* Filters & Search */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Search Variants"
            placeholder="Search by variant name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Items</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card>
        <DataTable
          columns={columns}
          data={filteredInventory}
          loading={loading}
          actions={tableActions}
        />
      </Card>

      {/* Low Stock Items Panel */}
      {lowStockItems.length > 0 && (
        <Card>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            ⚠️ Low Stock Alerts
          </h3>
          <div className="space-y-3">
            {lowStockItems.slice(0, 5).map((item) => (
              <div
                key={item.variant_id}
                className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {item.variant_name}
                  </p>
                  <p className="text-sm text-yellow-700">
                    Only {item.stock_available} in stock (Threshold:{" "}
                    {item.low_stock_threshold})
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedVariant(item);
                    setShowAdjustModal(true);
                  }}
                >
                  Add Stock
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={showAdjustModal}
        title={`Adjust Stock - ${selectedVariant?.variant_name}`}
        onClose={() => {
          setShowAdjustModal(false);
          setSelectedVariant(null);
          setAdjustmentData({ quantity: "", reason: "manual_adjustment" });
        }}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Stock:{" "}
              <span className="font-bold text-lg">
                {selectedVariant?.stock_available}
              </span>
            </label>
          </div>

          <Input
            label="Quantity to Adjust"
            type="number"
            value={adjustmentData.quantity}
            onChange={(e) =>
              setAdjustmentData({ ...adjustmentData, quantity: e.target.value })
            }
            placeholder="Enter positive or negative number"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Adjustment
            </label>
            <select
              value={adjustmentData.reason}
              onChange={(e) =>
                setAdjustmentData({ ...adjustmentData, reason: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="manual_adjustment">Manual Adjustment</option>
              <option value="received">Stock Received</option>
              <option value="damaged">Damaged</option>
              <option value="lost">Lost/Stolen</option>
              <option value="return">Customer Return</option>
              <option value="correction">Count Correction</option>
            </select>
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAdjustModal(false);
                setSelectedVariant(null);
                setAdjustmentData({
                  quantity: "",
                  reason: "manual_adjustment",
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAdjustStock}>Update Stock</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
