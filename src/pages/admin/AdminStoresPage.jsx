import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStores,
  createStore,
  updateStore,
  deleteStore,
} from "../../redux/slices/storeSlice";
import { DataTable, StatCard } from "../../components/tables/index";
import {
  Button,
  Modal,
  Input,
  Select,
  Card,
  Alert,
  Badge,
} from "../../components/common/index";
import StoreForm from "../../admin/forms/StoreForm";

/**
 * Admin Stores Page - Multi-store configuration
 */
export default function AdminStoresPage() {
  const dispatch = useDispatch();
  const { ids, entities, loading, error } = useSelector((state) => state.store);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    dispatch(fetchStores());
  }, [dispatch]);

  const stores = ids.map((id) => entities[id]);

  const handleCreateStore = async (data) => {
    try {
      await dispatch(createStore(data)).unwrap();
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create store:", err);
    }
  };

  const handleUpdateStore = async (data) => {
    try {
      await dispatch(
        updateStore({
          store_id: editingStore.store_id,
          ...data,
        }),
      ).unwrap();
      setEditingStore(null);
    } catch (err) {
      console.error("Failed to update store:", err);
    }
  };

  const handleDeleteStore = async (storeId) => {
    try {
      await dispatch(deleteStore({ store_id: storeId })).unwrap();
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete store:", err);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Store Name",
      render: (value, row) => (
        <div>
          <p className="font-semibold text-gray-900">{value}</p>
          {row.primary && <Badge variant="success">Primary Store</Badge>}
        </div>
      ),
    },
    {
      key: "currency",
      label: "Currency",
      render: (value) => (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
          {value}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge variant={value === "active" ? "success" : "secondary"}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
  ];

  const tableActions = [
    {
      id: "edit",
      label: "Edit",
      onClick: (row) => setEditingStore(row),
    },
    {
      id: "delete",
      label: "Delete",
      onClick: (row) => setDeleteConfirm(row),
    },
  ];

  const activeStores = stores.filter((s) => s?.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Management</h1>
          <p className="text-gray-600 mt-1">
            Configure multiple stores with different currencies and pricing
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} variant="primary">
          + Add Store
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Stores"
          value={stores.length}
          icon={() => <span className="text-3xl">🏪</span>}
        />
        <StatCard
          label="Active Stores"
          value={activeStores}
          icon={() => <span className="text-3xl">✅</span>}
        />
        <StatCard
          label="Currencies"
          value={[...new Set(stores.map((s) => s?.currency))].length}
          icon={() => <span className="text-3xl">💱</span>}
        />
      </div>

      {/* Error Alert */}
      {error && <Alert type="error" title="Error" message={error} />}

      {/* Table */}
      <Card>
        <DataTable
          columns={columns}
          data={stores}
          loading={loading}
          actions={tableActions}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || !!editingStore}
        title={editingStore ? "Edit Store" : "Add New Store"}
        onClose={() => {
          setShowCreateModal(false);
          setEditingStore(null);
        }}
        size="lg"
      >
        <StoreForm
          store={editingStore}
          onSubmit={editingStore ? handleUpdateStore : handleCreateStore}
          onCancel={() => {
            setShowCreateModal(false);
            setEditingStore(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        title="Delete Store"
        onClose={() => setDeleteConfirm(null)}
        size="sm"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>
          ?
        </p>
        <div className="flex gap-4">
          <Button
            variant="danger"
            onClick={() => handleDeleteStore(deleteConfirm.store_id)}
          >
            Delete
          </Button>
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
