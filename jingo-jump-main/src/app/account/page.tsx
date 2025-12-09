"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Package,
  MapPin,
  DollarSign,
  Clock,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { api } from "~/trpc/react";

export default function AccountDashboard() {
  const { data: session } = useSession();
  const { data: dashboard, isLoading } = api.account.getDashboard.useQuery();

  const stats = [
    {
      name: "Total Orders",
      value: dashboard?.totalOrders ?? 0,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      name: "Total Spent",
      value: `$${(dashboard?.totalSpent ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      name: "Saved Addresses",
      value: dashboard?.savedAddresses ?? 0,
      icon: MapPin,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {session?.user?.name?.split(" ")[0] ?? "there"}!
        </h1>
        <p className="mt-1 text-slate-600">
          Here&apos;s an overview of your account activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div
                className={`${stat.color} rounded-lg p-3 text-white shadow-lg`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-600">{stat.name}</p>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? "..." : stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Orders
            </h2>
          </div>
          <Link
            href="/account/orders"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-lg" />
              ))}
            </div>
          </div>
        ) : dashboard?.recentOrders && dashboard.recentOrders.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {dashboard.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-slate-500">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""} •{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">
                    ${order.totalAmount.toLocaleString()}
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
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
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No orders yet
            </h3>
            <p className="text-slate-600 mb-4">
              Start shopping to see your orders here.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/account/profile"
          className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-primary-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-primary-600">
                Update Profile
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Manage your personal information
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          href="/account/addresses"
          className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-primary-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-primary-600">
                Manage Addresses
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Add or edit shipping addresses
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>
    </div>
  );
}
