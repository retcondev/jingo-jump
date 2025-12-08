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
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isPositive ? "+" : ""}
                {change.toFixed(1)}%
              </span>
              {changeLabel && (
                <span className="text-sm text-slate-500">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={`rounded-lg ${iconBg} p-3`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

function RecentOrdersTable() {
  const { data: orders, isLoading } = api.adminOrders.getRecent.useQuery({ limit: 5 });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 rounded bg-slate-100" />
        ))}
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">No recent orders</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
            <th className="pb-3 pr-4">Order</th>
            <th className="pb-3 pr-4">Customer</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order) => (
            <tr key={order.id} className="text-sm">
              <td className="py-3 pr-4">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-medium text-primary-600 hover:text-primary-700"
                >
                  {order.orderNumber}
                </Link>
              </td>
              <td className="py-3 pr-4 text-slate-600">
                {order.customer.firstName} {order.customer.lastName}
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    order.status === "DELIVERED"
                      ? "bg-green-100 text-green-700"
                      : order.status === "SHIPPED"
                        ? "bg-blue-100 text-blue-700"
                        : order.status === "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="py-3 text-right font-medium text-slate-900">
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
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 rounded bg-slate-100" />
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <p className="py-4 text-center text-sm text-slate-500">
        All products well stocked
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-slate-900">{product.name}</p>
              <p className="text-xs text-slate-500">SKU: {product.sku}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-red-600">
              {product.stockQuantity} left
            </p>
            <p className="text-xs text-slate-500">
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
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
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
          iconColor="text-green-500"
          iconBg="bg-green-50"
        />
        <StatCard
          title="Orders"
          value={isLoading ? "..." : stats?.orders.total ?? 0}
          icon={ShoppingCart}
          iconColor="text-blue-500"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Products"
          value={isLoading ? "..." : stats?.products.active ?? 0}
          icon={Package}
          iconColor="text-purple-500"
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Customers"
          value={isLoading ? "..." : stats?.customers.total ?? 0}
          icon={Users}
          iconColor="text-orange-500"
          iconBg="bg-orange-50"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Today&apos;s Revenue</p>
            <DollarSign className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            ${(stats?.revenue.today ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Pending Orders</p>
            <ShoppingCart className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {stats?.orders.pending ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Low Stock Items</p>
            <AlertTriangle className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {stats?.products.lowStock ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Email Subscribers</p>
            <Mail className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {stats?.subscribers.activeEmail ?? 0}
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <RecentOrdersTable />
        </div>

        {/* Low Stock Alert */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Low Stock Alert</h2>
            <Link
              href="/admin/products"
              className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Manage inventory
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <LowStockAlert />
        </div>
      </div>
    </div>
  );
}
