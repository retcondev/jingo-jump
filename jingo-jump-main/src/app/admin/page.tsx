"use client";

import { api } from "~/trpc/react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Mail,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Card, Badge } from "~/components/ui";

function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "text-primary-500",
  iconBg = "bg-primary-50",
}: {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBg?: string;
}) {
  const isPositive = change && change >= 0;

  return (
    <Card variant="elevated">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1.5">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-sm font-semibold ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isPositive ? "+" : ""}
                {change.toFixed(1)}%
              </span>
              {changeLabel && (
                <span className="text-sm text-gray-500">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={`rounded-xl ${iconBg} p-3 shadow-sm`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </Card>
  );
}

function RecentOrdersTable() {
  const { data: orders, isLoading } = api.adminOrders.getRecent.useQuery({ limit: 5 });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">No recent orders</p>
    );
  }

  const statusVariants: Record<string, "success" | "info" | "error" | "warning"> = {
    DELIVERED: "success",
    SHIPPED: "info",
    CANCELLED: "error",
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
            <th className="pb-3 pr-4">Order</th>
            <th className="pb-3 pr-4">Customer</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => (
            <tr key={order.id} className="text-sm">
              <td className="py-3 pr-4">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-semibold text-primary-600 hover:text-primary-700"
                >
                  {order.orderNumber}
                </Link>
              </td>
              <td className="py-3 pr-4 text-gray-600">
                {order.customer.firstName} {order.customer.lastName}
              </td>
              <td className="py-3 pr-4">
                <Badge variant={statusVariants[order.status] ?? "warning"}>
                  {order.status}
                </Badge>
              </td>
              <td className="py-3 text-right font-semibold text-gray-900">
                ${order.totalAmount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LowStockAlert() {
  const { data: products, isLoading } = api.adminDashboard.getLowStockProducts.useQuery({
    limit: 5,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="flex flex-col items-center py-8">
        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
          <Package className="h-6 w-6 text-green-600" />
        </div>
        <p className="mt-3 text-sm font-medium text-gray-600">All products well stocked</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-3 transition-colors hover:bg-red-100"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{product.name}</p>
              <p className="text-xs text-gray-500">SKU: {product.sku}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-red-600">
              {product.stockQuantity} left
            </p>
            <p className="text-xs text-gray-500">
              Min: {product.lowStockThreshold}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = api.adminDashboard.getStats.useQuery();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here&apos;s what&apos;s happening with your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={
            isLoading
              ? "..."
              : `$${(stats?.revenue.total ?? 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}`
          }
          change={stats?.revenue.growthPercent}
          changeLabel="vs last month"
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatCard
          title="Orders"
          value={isLoading ? "..." : stats?.orders.total ?? 0}
          icon={ShoppingCart}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Products"
          value={isLoading ? "..." : stats?.products.active ?? 0}
          icon={Package}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <StatCard
          title="Customers"
          value={isLoading ? "..." : stats?.customers.total ?? 0}
          icon={Users}
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">Today&apos;s Revenue</p>
            <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            ${(stats?.revenue.today ?? 0).toFixed(2)}
          </p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">Pending Orders</p>
            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-600">
            {stats?.orders.pending ?? 0}
          </p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">Low Stock Items</p>
            <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-red-600">
            {stats?.products.lowStock ?? 0}
          </p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">Email Subscribers</p>
            <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {stats?.subscribers.activeEmail ?? 0}
          </p>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <RecentOrdersTable />
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Low Stock Alert</h2>
            <Link
              href="/admin/products"
              className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Manage inventory
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <LowStockAlert />
        </Card>
      </div>
    </div>
  );
}
