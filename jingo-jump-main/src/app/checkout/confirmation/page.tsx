"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  Package,
  Mail,
  MapPin,
  ArrowRight,
  Loader2,
  AlertCircle,
  Home,
  ShoppingBag,
} from "lucide-react";
import { api } from "~/trpc/react";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { data: session } = useSession();

  const { data: order, isLoading, error } = api.checkout.getOrder.useQuery(
    { orderId: orderId ?? "" },
    { enabled: !!orderId }
  );

  if (!orderId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">No order found</h1>
          <p className="text-slate-600 mb-6">We couldn&apos;t find an order to display.</p>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Order not found</h1>
          <p className="text-slate-600 mb-6">
            {error?.message ?? "We couldn't find this order."}
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const shippingAddress = JSON.parse(order.shippingAddress) as {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-black text-primary-500">
            JingoJump
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            Thank you for your order!
          </h1>
          <p className="text-lg text-slate-600">
            Your order <span className="font-bold">{order.orderNumber}</span> has been confirmed.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          {/* Order Header */}
          <div className="bg-slate-50 p-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-slate-600">Order number</p>
                <p className="text-xl font-bold text-slate-900">{order.orderNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  {order.status}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Order Info Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-200">
            {/* Email */}
            <div>
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">Confirmation sent to</span>
              </div>
              <p className="text-slate-900">{order.customer.email}</p>
            </div>

            {/* Shipping Address */}
            <div>
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Shipping address</span>
              </div>
              <p className="text-slate-900">
                {shippingAddress.firstName} {shippingAddress.lastName}
                <br />
                {shippingAddress.address1}
                {shippingAddress.address2 && <><br />{shippingAddress.address2}</>}
                <br />
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
              </p>
            </div>

            {/* Order Date */}
            <div>
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">Order date</span>
              </div>
              <p className="text-slate-900">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">Order items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-slate-900">
                    ${item.totalPrice.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="mt-6 pt-6 border-t border-slate-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-900">${order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Shipping</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax</span>
                <span className="text-slate-900">${order.taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                <span className="text-slate-900">Total</span>
                <span className="text-slate-900">${order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-blue-900 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-800">1</span>
              <span>You&apos;ll receive an email confirmation at {order.customer.email}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-800">2</span>
              <span>Our team will process your order within 1-2 business days</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-800">3</span>
              <span>You&apos;ll receive tracking information once your order ships</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {session ? (
            <Link
              href="/account/orders"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
            >
              <Package className="w-5 h-5" />
              View Your Orders
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href={`/register?callbackUrl=/account/orders`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
            >
              Create Account to Track Orders
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Home className="w-5 h-5" />
            Return to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
