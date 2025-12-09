"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Mail,
  MapPin,
  Truck,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { api } from "~/trpc/react";

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  PENDING: { color: "bg-slate-100 text-slate-700", icon: <Clock className="w-4 h-4" />, label: "Pending" },
  CONFIRMED: { color: "bg-purple-100 text-purple-700", icon: <CheckCircle2 className="w-4 h-4" />, label: "Confirmed" },
  PROCESSING: { color: "bg-yellow-100 text-yellow-700", icon: <Package className="w-4 h-4" />, label: "Processing" },
  SHIPPED: { color: "bg-blue-100 text-blue-700", icon: <Truck className="w-4 h-4" />, label: "Shipped" },
  DELIVERED: { color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="w-4 h-4" />, label: "Delivered" },
  CANCELLED: { color: "bg-red-100 text-red-700", icon: <XCircle className="w-4 h-4" />, label: "Cancelled" },
  REFUNDED: { color: "bg-red-100 text-red-700", icon: <XCircle className="w-4 h-4" />, label: "Refunded" },
};

const paymentStatusConfig: Record<string, { color: string; label: string }> = {
  PENDING: { color: "bg-yellow-100 text-yellow-700", label: "Payment Pending" },
  PAID: { color: "bg-green-100 text-green-700", label: "Paid" },
  PARTIALLY_PAID: { color: "bg-orange-100 text-orange-700", label: "Partially Paid" },
  REFUNDED: { color: "bg-red-100 text-red-700", label: "Refunded" },
  FAILED: { color: "bg-red-100 text-red-700", label: "Payment Failed" },
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: order, isLoading, error } = api.account.getOrder.useQuery({ orderId: id });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Order not found</h2>
        <p className="text-slate-600 mb-6">{error?.message ?? "Unable to load this order."}</p>
        <Link
          href="/account/orders"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const shippingAddress = JSON.parse(order.shippingAddress) as {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };

  const billingAddress = JSON.parse(order.billingAddress) as {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };

  const orderStatus = statusConfig[order.status] ?? statusConfig.PENDING;
  const paymentStatus = paymentStatusConfig[order.paymentStatus] ?? paymentStatusConfig.PENDING;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/account/orders"
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order {order.orderNumber}</h1>
          <p className="text-slate-600">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-3">
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${orderStatus.color}`}>
          {orderStatus.icon}
          {orderStatus.label}
        </span>
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${paymentStatus.color}`}>
          <CreditCard className="w-4 h-4" />
          {paymentStatus.label}
        </span>
      </div>

      {/* Tracking Information */}
      {order.trackingNumber && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">Tracking Information</p>
              <p className="text-blue-800 mt-1">
                {order.shippingCarrier && <span className="font-medium">{order.shippingCarrier}: </span>}
                {order.trackingNumber}
              </p>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium mt-2"
                >
                  Track Package
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-slate-400" />
            Order Items
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <div key={item.id} className="p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {item.product?.images?.[0]?.url ? (
                  <img
                    src={item.product.images[0].url}
                    alt={item.name}
                    className="w-full h-full object-contain p-1 rounded-lg"
                  />
                ) : (
                  <Package className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-500">SKU: {item.sku}</p>
                <p className="text-sm text-slate-500">Qty: {item.quantity} × ${item.price.toLocaleString()}</p>
              </div>
              <p className="font-semibold text-slate-900">${item.totalPrice.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="text-slate-900">${order.subtotal.toLocaleString()}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Discount</span>
              <span className="text-green-600">-${order.discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Shipping</span>
            <span className="text-slate-900">
              {order.shippingAmount > 0 ? `$${order.shippingAmount.toLocaleString()}` : "FREE"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Tax</span>
            <span className="text-slate-900">${order.taxAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-3 border-t border-slate-200">
            <span className="text-slate-900">Total</span>
            <span className="text-slate-900">${order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-slate-400" />
            Shipping Address
          </h3>
          <address className="not-italic text-slate-600 space-y-1">
            <p className="font-medium text-slate-900">
              {shippingAddress.firstName} {shippingAddress.lastName}
            </p>
            {shippingAddress.company && <p>{shippingAddress.company}</p>}
            <p>{shippingAddress.address1}</p>
            {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
            <p>
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
            </p>
            <p>{shippingAddress.country}</p>
            {shippingAddress.phone && <p className="pt-2">{shippingAddress.phone}</p>}
          </address>
        </div>

        {/* Billing Address */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-slate-400" />
            Billing Address
          </h3>
          <address className="not-italic text-slate-600 space-y-1">
            <p className="font-medium text-slate-900">
              {billingAddress.firstName} {billingAddress.lastName}
            </p>
            {billingAddress.company && <p>{billingAddress.company}</p>}
            <p>{billingAddress.address1}</p>
            {billingAddress.address2 && <p>{billingAddress.address2}</p>}
            <p>
              {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}
            </p>
            <p>{billingAddress.country}</p>
            {billingAddress.phone && <p className="pt-2">{billingAddress.phone}</p>}
          </address>
        </div>
      </div>

      {/* Customer Notes */}
      {order.customerNotes && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-slate-400" />
            Order Notes
          </h3>
          <p className="text-slate-600">{order.customerNotes}</p>
        </div>
      )}

      {/* Need Help */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-2">Need help with this order?</h3>
        <p className="text-slate-600 mb-4">
          If you have questions about your order, please contact our support team.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
