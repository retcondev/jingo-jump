"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import {
  ArrowLeft,
  Truck,
  Package,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { OrderStatus, PaymentStatus } from "../../../../../generated/prisma";
import { parseAddressFromJson } from "~/lib/validations/address";

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-slate-100 text-slate-600",
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [internalNote, setInternalNote] = useState("");

  const { data: order, isLoading, refetch } = api.adminOrders.get.useQuery({ id: orderId });

  const updateStatus = api.adminOrders.updateStatus.useMutation({
    onSuccess: () => void refetch(),
  });

  const updatePaymentStatus = api.adminOrders.updatePaymentStatus.useMutation({
    onSuccess: () => void refetch(),
  });

  const addTracking = api.adminOrders.addTracking.useMutation({
    onSuccess: () => {
      void refetch();
      setTrackingNumber("");
      setTrackingCarrier("");
      setTrackingUrl("");
    },
  });

  const addNote = api.adminOrders.addNote.useMutation({
    onSuccess: () => {
      void refetch();
      setInternalNote("");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-medium text-slate-900">Order not found</h2>
        <Link href="/admin/orders" className="mt-4 text-primary-600 hover:text-primary-700">
          Back to orders
        </Link>
      </div>
    );
  }

  const shippingAddress = parseAddressFromJson(order.shippingAddress);
  const billingAddress = parseAddressFromJson(order.billingAddress);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Order {order.orderNumber}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
              statusColors[order.status]
            }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Order Items</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="relative h-16 w-16 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">
                      SKU: {item.sku} • Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">
                      ${item.totalPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-500">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 px-6 py-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-900">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Shipping</span>
                  <span className="text-slate-900">${order.shippingAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tax</span>
                  <span className="text-slate-900">${order.taxAmount.toFixed(2)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Discount</span>
                    <span className="text-green-600">-${order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold">
                  <span className="text-slate-900">Total</span>
                  <span className="text-slate-900">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Shipping</h2>
            </div>
            <div className="p-6">
              {order.trackingNumber ? (
                <div className="mb-6 rounded-lg bg-green-50 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-700">Shipped</span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-slate-600">
                      <span className="font-medium">Carrier:</span>{" "}
                      {order.shippingCarrier ?? "N/A"}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-medium">Tracking:</span>{" "}
                      {order.trackingUrl ? (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          {order.trackingNumber}
                        </a>
                      ) : (
                        order.trackingNumber
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-medium text-slate-900">
                    Add Tracking Information
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Tracking Number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={trackingCarrier}
                        onChange={(e) => setTrackingCarrier(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="">Select Carrier</option>
                        <option value="USPS">USPS</option>
                        <option value="UPS">UPS</option>
                        <option value="FedEx">FedEx</option>
                        <option value="DHL">DHL</option>
                        <option value="Other">Other</option>
                      </select>
                      <input
                        type="url"
                        placeholder="Tracking URL (optional)"
                        value={trackingUrl}
                        onChange={(e) => setTrackingUrl(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <button
                      onClick={() =>
                        addTracking.mutate({
                          orderId: order.id,
                          trackingNumber,
                          shippingCarrier: trackingCarrier || undefined,
                          trackingUrl: trackingUrl || undefined,
                        })
                      }
                      disabled={!trackingNumber || addTracking.isPending}
                      className="w-full rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
                    >
                      {addTracking.isPending ? "Saving..." : "Add Tracking & Mark Shipped"}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-slate-900">
                    Shipping Address
                  </h3>
                  <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-medium text-slate-900">
                      {shippingAddress.firstName} {shippingAddress.lastName}
                    </p>
                    {shippingAddress.company && <p>{shippingAddress.company}</p>}
                    <p>{shippingAddress.address1}</p>
                    {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                    <p>
                      {shippingAddress.city}, {shippingAddress.state}{" "}
                      {shippingAddress.postalCode}
                    </p>
                    <p>{shippingAddress.country}</p>
                    {shippingAddress.phone && <p className="mt-2">{shippingAddress.phone}</p>}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-medium text-slate-900">
                    Billing Address
                  </h3>
                  <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-medium text-slate-900">
                      {billingAddress.firstName} {billingAddress.lastName}
                    </p>
                    {billingAddress.company && <p>{billingAddress.company}</p>}
                    <p>{billingAddress.address1}</p>
                    {billingAddress.address2 && <p>{billingAddress.address2}</p>}
                    <p>
                      {billingAddress.city}, {billingAddress.state}{" "}
                      {billingAddress.postalCode}
                    </p>
                    <p>{billingAddress.country}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Notes</h2>
            </div>
            <div className="p-6 space-y-4">
              {order.customerNotes && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-slate-900">
                    Customer Notes
                  </h3>
                  <p className="rounded-lg bg-yellow-50 p-4 text-sm text-slate-600">
                    {order.customerNotes}
                  </p>
                </div>
              )}
              <div>
                <h3 className="mb-2 text-sm font-medium text-slate-900">
                  Internal Notes
                </h3>
                {order.internalNotes && (
                  <div className="mb-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600 whitespace-pre-wrap">
                    {order.internalNotes}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add internal note..."
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <button
                    onClick={() =>
                      addNote.mutate({ orderId: order.id, note: internalNote })
                    }
                    disabled={!internalNote || addNote.isPending}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Customer</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-600">
                    {order.customer.firstName[0]}
                    {order.customer.lastName[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p className="text-sm text-slate-500">{order.customer.email}</p>
                </div>
              </div>
              {order.customer.phone && (
                <p className="mt-3 text-sm text-slate-600">
                  <span className="font-medium">Phone:</span> {order.customer.phone}
                </p>
              )}
              <Link
                href={`/admin/customers/${order.customer.id}`}
                className="mt-4 block text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                View Customer Profile →
              </Link>
            </div>
          </div>

          {/* Order Status */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Update Status</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Order Status
                </label>
                <select
                  value={order.status}
                  onChange={(e) =>
                    updateStatus.mutate({
                      orderId: order.id,
                      status: e.target.value as OrderStatus,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Status
                </label>
                <select
                  value={order.paymentStatus}
                  onChange={(e) =>
                    updatePaymentStatus.mutate({
                      orderId: order.id,
                      paymentStatus: e.target.value as PaymentStatus,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                  <option value="REFUNDED">Refunded</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Clock className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Created</p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {order.paidAt && (
                  <div className="flex gap-3">
                    <CreditCard className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Paid</p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.paidAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {order.shippedAt && (
                  <div className="flex gap-3">
                    <Truck className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Shipped</p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.shippedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Delivered</p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.deliveredAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {order.cancelledAt && (
                  <div className="flex gap-3">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Cancelled</p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.cancelledAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
