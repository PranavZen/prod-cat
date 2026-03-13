import { useState } from "react";
import { Button, Checkbox } from "../common/index";

/**
 * Generic DataTable component
 */
export function DataTable({
  columns = [],
  data = [],
  loading = false,
  sortable = true,
  selectable = false,
  pagination = { page: 1, pageSize: 20, total: 0, totalPages: 1 },
  onSort,
  onSelection,
  onPageChange,
  onRowClick,
  actions = [],
  rowClassName = "",
}) {
  const [sorted, setSorted] = useState({ field: null, order: "asc" });
  const [selected, setSelected] = useState(new Set());

  const handleSort = (column) => {
    if (!sortable || !column.sortable) return;
    const newOrder = sorted.field === column.key && sorted.order === "asc" ? "desc" : "asc";
    setSorted({ field: column.key, order: newOrder });
    onSort?.({ field: column.key, order: newOrder });
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
    onSelection?.([...newSelected]);
  };

  const handleSelectAll = () => {
    if (selected.size === data.length) {
      setSelected(new Set());
      onSelection?.([]);
    } else {
      const newSelected = new Set(data.map((item) => item.id || item.product_id));
      setSelected(newSelected);
      onSelection?.([...newSelected]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <p>No data found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {selectable && (
              <th className="px-4 py-3 text-left">
                <Checkbox checked={selected.size === data.length} onChange={handleSelectAll} />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {sortable && column.sortable !== false && (
                    <span>
                      {sorted.field === column.key && (sorted.order === "asc" ? "↑" : "↓")}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {actions.length > 0 && <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row.id || row.product_id || index}
              className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${rowClassName}`}
              onClick={() => onRowClick?.(row)}
            >
              {selectable && (
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(row.id || row.product_id)}
                    onChange={() => handleSelectRow(row.id || row.product_id)}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-gray-800">
                  {column.render ? column.render(row[column.key], row) : row[column.key] || "-"}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2 justify-end">
                    {actions.map((action) => (
                      <Button
                        key={action.id}
                        variant={action.variant || "ghost"}
                        size="sm"
                        onClick={() => action.onClick?.(row)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              disabled={pagination.page === 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Status Badge component
 */
export function StatusBadge({ status, variants = {} }) {
  const defaultVariants = {
    active: "success",
    inactive: "secondary",
    draft: "warning",
    published: "success",
    pending: "warning",
    failed: "danger",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${
        {
          success: "bg-green-100 text-green-800",
          warning: "bg-yellow-100 text-yellow-800",
          danger: "bg-red-100 text-red-800",
          secondary: "bg-gray-100 text-gray-800",
          primary: "bg-blue-100 text-blue-800",
        }[variants[status] || defaultVariants[status] || "secondary"]
      }`}
    >
      {status}
    </span>
  );
}

/**
 * Empty State component
 */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {Icon && <Icon className="w-16 h-16 text-gray-400 mb-4" />}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      {action && action}
    </div>
  );
}

/**
 * List Item component
 */
export function ListItem({ left, title, description, right, onClick }) {
  return (
    <div
      className="flex items-center gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      {left && <div className="flex-shrink-0">{left}</div>}
      <div className="flex-grow">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  );
}

/**
 * Timeline component
 */
export function Timeline({ items = [] }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              item.status === "completed" ? "bg-green-500" :
              item.status === "current" ? "bg-blue-500" :
              "bg-gray-300"
            }`}></div>
            {index < items.length - 1 && <div className="w-0.5 h-8 bg-gray-300"></div>}
          </div>
          <div className="pb-4">
            <h4 className="font-semibold text-gray-900">{item.title}</h4>
            {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
            {item.timestamp && <p className="text-xs text-gray-500 mt-1">{item.timestamp}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Progress Bar component
 */
export function ProgressBar({ value = 0, max = 100, label, showLabel = true, variant = "primary" }) {
  const percentage = (value / max) * 100;
  const variantClasses = {
    primary: "bg-blue-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
  };

  return (
    <div>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-medium text-gray-700">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${variantClasses[variant]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

/**
 * Stat Card component
 */
export function StatCard({ label, value, change, icon: Icon, trend = "up" }) {
  const trendColor = trend === "up" ? "text-green-600" : "text-red-600";
  const trendSymbol = trend === "up" ? "↑" : "↓";

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && <p className={`text-sm font-semibold mt-2 ${trendColor}`}>{trendSymbol} {change}</p>}
        </div>
        {Icon && <Icon className="w-12 h-12 text-gray-400" />}
      </div>
    </div>
  );
}
