"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  ShoppingBag,
  Truck,
  CreditCard,
  Check,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useCart } from "~/context/CartContext";
import { api } from "~/trpc/react";

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

type AddressForm = {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
};

const emptyAddress: AddressForm = {
  firstName: "",
  lastName: "",
  company: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
  phone: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, totalPrice, clearCart } = useCart();
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState<AddressForm>(emptyAddress);
  const [billingAddress, setBillingAddress] = useState<AddressForm>(emptyAddress);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [customerNotes, setCustomerNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill email if logged in
  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
    if (session?.user?.name) {
      const nameParts = session.user.name.split(" ");
      setShippingAddress((prev) => ({
        ...prev,
        firstName: nameParts[0] ?? "",
        lastName: nameParts.slice(1).join(" ") || "",
      }));
    }
  }, [session]);

  const createOrderMutation = api.checkout.createOrder.useMutation({
    onSuccess: (data) => {
      clearCart();
      router.push(`/checkout/confirmation?orderId=${data.orderId}`);
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email";

    if (!shippingAddress.firstName) newErrors.shippingFirstName = "First name is required";
    if (!shippingAddress.lastName) newErrors.shippingLastName = "Last name is required";
    if (!shippingAddress.address1) newErrors.shippingAddress1 = "Address is required";
    if (!shippingAddress.city) newErrors.shippingCity = "City is required";
    if (!shippingAddress.state) newErrors.shippingState = "State is required";
    if (!shippingAddress.postalCode) newErrors.shippingPostalCode = "Postal code is required";

    if (!sameAsShipping) {
      if (!billingAddress.firstName) newErrors.billingFirstName = "First name is required";
      if (!billingAddress.lastName) newErrors.billingLastName = "Last name is required";
      if (!billingAddress.address1) newErrors.billingAddress1 = "Address is required";
      if (!billingAddress.city) newErrors.billingCity = "City is required";
      if (!billingAddress.state) newErrors.billingState = "State is required";
      if (!billingAddress.postalCode) newErrors.billingPostalCode = "Postal code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (items.length === 0) return;

    createOrderMutation.mutate({
      email,
      phone,
      shippingAddress,
      billingAddress: sameAsShipping ? undefined : billingAddress,
      sameAsShipping,
      items: items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        sku: item.product.id,
      })),
      customerNotes: customerNotes || undefined,
      paymentMethod: "test",
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h1>
          <p className="text-slate-600 mb-6">Add some products to continue to checkout.</p>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to shop</span>
            </Link>
            <Link href="/" className="text-2xl font-black text-primary-500">
              JingoJump
            </Link>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Test Mode Banner */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-800">Test Mode</p>
            <p className="text-sm text-yellow-700">
              This is a test checkout. No real payment will be processed. Orders will be marked as paid automatically.
            </p>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Mobile Order Summary Toggle */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-primary-500" />
                <span className="font-medium">
                  {isOrderSummaryOpen ? "Hide" : "Show"} order summary
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">${totalPrice.toLocaleString()}</span>
                {isOrderSummaryOpen ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </button>
            {isOrderSummaryOpen && (
              <div className="mt-2 p-4 bg-white rounded-xl border border-slate-200">
                <OrderSummary items={items} totalPrice={totalPrice} />
              </div>
            )}
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-primary-500 text-white text-sm font-bold rounded-full">
                    1
                  </span>
                  Contact Information
                </h2>

                {!session && (
                  <p className="text-sm text-slate-600 mb-4">
                    Already have an account?{" "}
                    <Link href="/signin?callbackUrl=/checkout" className="text-primary-600 hover:underline">
                      Sign in
                    </Link>
                  </p>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.email ? "border-red-300" : "border-slate-300"
                      }`}
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Phone number (optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-primary-500 text-white text-sm font-bold rounded-full">
                    2
                  </span>
                  <Truck className="w-5 h-5 text-slate-400" />
                  Shipping Address
                </h2>

                <AddressFormFields
                  address={shippingAddress}
                  setAddress={setShippingAddress}
                  errors={errors}
                  prefix="shipping"
                />
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-primary-500 text-white text-sm font-bold rounded-full">
                    3
                  </span>
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  Billing Address
                </h2>

                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700">Same as shipping address</span>
                </label>

                {!sameAsShipping && (
                  <AddressFormFields
                    address={billingAddress}
                    setAddress={setBillingAddress}
                    errors={errors}
                    prefix="billing"
                  />
                )}
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  Order Notes (optional)
                </h2>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Any special instructions for your order..."
                />
              </div>

              {/* Error Message */}
              {createOrderMutation.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{createOrderMutation.error.message}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 text-white font-bold text-lg rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Place Test Order - ${totalPrice.toLocaleString()}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary (Desktop) */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h2>
              <OrderSummary items={items} totalPrice={totalPrice} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function AddressFormFields({
  address,
  setAddress,
  errors,
  prefix,
}: {
  address: AddressForm;
  setAddress: React.Dispatch<React.SetStateAction<AddressForm>>;
  errors: Record<string, string>;
  prefix: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            First name *
          </label>
          <input
            type="text"
            value={address.firstName}
            onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors[`${prefix}FirstName`] ? "border-red-300" : "border-slate-300"
            }`}
          />
          {errors[`${prefix}FirstName`] && (
            <p className="mt-1 text-sm text-red-600">{errors[`${prefix}FirstName`]}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Last name *
          </label>
          <input
            type="text"
            value={address.lastName}
            onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors[`${prefix}LastName`] ? "border-red-300" : "border-slate-300"
            }`}
          />
          {errors[`${prefix}LastName`] && (
            <p className="mt-1 text-sm text-red-600">{errors[`${prefix}LastName`]}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Company (optional)
        </label>
        <input
          type="text"
          value={address.company}
          onChange={(e) => setAddress({ ...address, company: e.target.value })}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Address *
        </label>
        <input
          type="text"
          value={address.address1}
          onChange={(e) => setAddress({ ...address, address1: e.target.value })}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors[`${prefix}Address1`] ? "border-red-300" : "border-slate-300"
          }`}
          placeholder="Street address"
        />
        {errors[`${prefix}Address1`] && (
          <p className="mt-1 text-sm text-red-600">{errors[`${prefix}Address1`]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Apartment, suite, etc. (optional)
        </label>
        <input
          type="text"
          value={address.address2}
          onChange={(e) => setAddress({ ...address, address2: e.target.value })}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            City *
          </label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors[`${prefix}City`] ? "border-red-300" : "border-slate-300"
            }`}
          />
          {errors[`${prefix}City`] && (
            <p className="mt-1 text-sm text-red-600">{errors[`${prefix}City`]}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            State *
          </label>
          <select
            value={address.state}
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors[`${prefix}State`] ? "border-red-300" : "border-slate-300"
            }`}
          >
            <option value="">Select state</option>
            {US_STATES.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
          {errors[`${prefix}State`] && (
            <p className="mt-1 text-sm text-red-600">{errors[`${prefix}State`]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            ZIP code *
          </label>
          <input
            type="text"
            value={address.postalCode}
            onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors[`${prefix}PostalCode`] ? "border-red-300" : "border-slate-300"
            }`}
            placeholder="12345"
          />
          {errors[`${prefix}PostalCode`] && (
            <p className="mt-1 text-sm text-red-600">{errors[`${prefix}PostalCode`]}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Phone (optional)
          </label>
          <input
            type="tel"
            value={address.phone}
            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>
    </div>
  );
}

function OrderSummary({
  items,
  totalPrice,
}: {
  items: Array<{ product: { id: string; name: string; price: number; image?: string; gradient?: string }; quantity: number }>;
  totalPrice: number;
}) {
  return (
    <div className="space-y-4">
      {/* Items */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {items.map((item) => (
          <div key={item.product.id} className="flex gap-3">
            <div className="w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center bg-white border border-slate-200">
              {item.product.image ? (
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <ShoppingBag className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 text-sm truncate">{item.product.name}</p>
              <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
            </div>
            <p className="font-semibold text-slate-900">
              ${(item.product.price * item.quantity).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-medium">${totalPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Shipping</span>
          <span className="font-medium text-green-600">FREE</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Tax</span>
          <span className="font-medium">$0.00</span>
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-slate-200 pt-4">
        <div className="flex justify-between">
          <span className="text-lg font-bold text-slate-900">Total</span>
          <span className="text-lg font-bold text-slate-900">${totalPrice.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
