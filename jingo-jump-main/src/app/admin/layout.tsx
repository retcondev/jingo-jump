"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  FolderOpen,
} from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Categories", href: "/admin/categories", icon: FolderOpen },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Subscribers", href: "/admin/subscribers", icon: Mail },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const allowedRoles = ["ADMIN", "MANAGER", "STAFF"];

function Sidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className={`flex h-full w-full flex-col bg-white border-r border-gray-200 ${mobile ? "w-72" : ""}`}>
      {/* Logo */}
      <div className="flex h-20 items-center justify-between px-6 border-b border-gray-100">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary-500/30">
            JJ
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900">Jingo Jump</span>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </Link>
        {mobile && onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          Back to Store
        </Link>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();

  // Check if user has admin access
  const hasAccess = session?.user?.role && allowedRoles.includes(session.user.role);

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative mx-auto">
            <div className="h-16 w-16 rounded-full border-4 border-gray-200"></div>
            <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-6 text-sm font-medium text-gray-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-[0_20px_40px_rgba(15,23,42,0.1)]">
          <div className="mx-auto h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
            <ShieldAlert className="h-10 w-10 text-amber-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Sign In Required</h1>
          <p className="mt-2 text-gray-500">
            You need to sign in to access the admin panel.
          </p>
          <Link href="/api/auth/signin?callbackUrl=/admin">
            <Button className="mt-6 w-full" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!hasAccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-[0_20px_40px_rgba(15,23,42,0.1)]">
          <div className="mx-auto h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
            <ShieldAlert className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-500">
            You don&apos;t have permission to access the admin panel.
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Your role: <span className="font-semibold text-gray-600">{session?.user?.role ?? "None"}</span>
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Go Home
              </Button>
            </Link>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => void signOut({ callbackUrl: "/" })}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72">
            <Sidebar mobile onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-20 items-center gap-4 border-b border-gray-200 bg-white/80 backdrop-blur-lg px-4 shadow-sm lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 items-center justify-end gap-4">
            {/* User menu */}
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-2.5">
              <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <span className="text-sm font-bold text-white">
                  {session.user.name?.charAt(0).toUpperCase() ?? "A"}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{session.user.name ?? "Admin"}</p>
                <p className="text-xs text-gray-500">{session.user.role}</p>
              </div>
            </div>
            <button
              onClick={() => void signOut({ callbackUrl: "/" })}
              className="rounded-xl p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
