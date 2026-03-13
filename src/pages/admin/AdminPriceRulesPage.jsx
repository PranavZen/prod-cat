import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPriceRules,
  createPriceRule,
  updatePriceRule,
  deletePriceRule,
} from "../../redux/slices/priceRuleSlice";
import { DataTable, StatCard } from "../../components/tables/index";
import {
  Button,
  Modal,
  Input,
  Select,
  Card,
  Alert,
  Badge,
  Checkbox,
} from "../../components/common/index";
import PriceRuleForm from "../../admin/forms/PriceRuleForm";

/**
 * Admin Price Rules Page - Manage discount rules
 */
export default function AdminPriceRulesPage() {
  const dispatch = useDispatch();
  const { ids, entities, loading, error, activeRules } = useSelector(
    (state) => state.priceRules,
  );
  const categories = useSelector((state) =>
    Object.values(state.categories.entities),
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    dispatch(fetchPriceRules());
  }, [dispatch]);

  const rules = ids.map((id) => entities[id]);

  const filteredRules = rules.filter((rule) => {
    if (!rule) return false;

    const matchesSearch = rule.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" ? rule.active : !rule.active);

    return matchesSearch && matchesStatus;
  });

  const handleCreateRule = async (data) => {
    try {
      await dispatch(createPriceRule(data)).unwrap();
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create price rule:", err);
    }
  };

  const handleUpdateRule = async (data) => {
    try {
      await dispatch(
        updatePriceRule({
          price_rule_id: editingRule.price_rule_id,
          ...data,
        }),
      ).unwrap();
      setEditingRule(null);
    } catch (err) {
      console.error("Failed to update price rule:", err);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      await dispatch(deletePriceRule({ price_rule_id: ruleId })).unwrap();
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete price rule:", err);
    }
  };

  const getTargetLabel = (rule) => {
    if (rule.target_type === "all") return "All Products";
    if (rule.target_type === "category") {
      const cat = categories.find((c) => c.category_id === rule.target_id);
      return `Category: ${cat?.name || "Unknown"}`;
    }
    return `Product ID: ${rule.target_id}`;
  };

  const columns = [
    {
      key: "name",
      label: "Rule Name",
      render: (value) => <p className="font-semibold text-gray-900">{value}</p>,
    },
    {
      key: "type",
      label: "Type",
      render: (value) => (
        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
          {value === "percentage" ? "% Discount" : "₹ Fixed"}
        </span>
      ),
    },
    {
      key: "discount_value",
      label: "Discount",
      render: (value, row) => (
        <span className="font-bold text-lg">
          {row.type === "percentage" ? `${value}%` : `₹${value}`}
        </span>
      ),
    },
    {
      key: "target_type",
      label: "Target",
      render: (_, rule) => (
        <span className="text-sm text-gray-600">{getTargetLabel(rule)}</span>
      ),
    },
    {
      key: "active",
      label: "Status",
      render: (value) => (
        <Badge variant={value ? "success" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  const tableActions = [
    {
      id: "edit",
      label: "Edit",
      onClick: (row) => setEditingRule(row),
    },
    {
      id: "delete",
      label: "Delete",
      onClick: (row) => setDeleteConfirm(row),
    },
  ];

  const totalRules = rules.length;
  const activeCount = activeRules.length;
  const discountValue = rules.reduce(
    (sum, r) => sum + (r?.discount_value || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Price Rules</h1>
          <p className="text-gray-600 mt-1">
            Create and manage discount rules for products and categories
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} variant="primary">
          + Create Rule
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Rules"
          value={totalRules}
          icon={() => <span className="text-3xl">📋</span>}
        />
        <StatCard
          label="Active Rules"
          value={activeCount}
          icon={() => <span className="text-3xl">✅</span>}
        />
        <StatCard
          label="Avg Discount"
          value={
            totalRules > 0 ? `${(discountValue / totalRules).toFixed(1)}` : "0"
          }
          icon={() => <span className="text-3xl">💰</span>}
        />
        <StatCard
          label="Impact"
          value={`₹${discountValue}`}
          icon={() => <span className="text-3xl">📉</span>}
        />
      </div>

      {/* Error Alert */}
      {error && <Alert type="error" title="Error" message={error} />}

      {/* Filters & Search */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Search Rules"
            placeholder="Search by rule name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select
            label="Filter by Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <DataTable
          columns={columns}
          data={filteredRules}
          loading={loading}
          actions={tableActions}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || !!editingRule}
        title={editingRule ? "Edit Price Rule" : "Create New Price Rule"}
        onClose={() => {
          setShowCreateModal(false);
          setEditingRule(null);
        }}
        size="lg"
      >
        <PriceRuleForm
          rule={editingRule}
          onSubmit={editingRule ? handleUpdateRule : handleCreateRule}
          onCancel={() => {
            setShowCreateModal(false);
            setEditingRule(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        title="Delete Price Rule"
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
            onClick={() => handleDeleteRule(deleteConfirm.price_rule_id)}
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
