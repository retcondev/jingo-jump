"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "~/context/CartContext";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
  } = useCart();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-primary-500" />
            <h2 className="text-xl font-black text-slate-900">Your Cart</h2>
            <span className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {totalItems}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-slate-600 mb-6">
                Add some products to get started!
              </p>
              <button
                onClick={closeCart}
                className="px-6 py-3 bg-primary-500 text-white font-bold rounded-full hover:bg-primary-600 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-4 bg-slate-50 rounded-xl"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-white border border-slate-200">
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <span className="text-slate-400 text-xs">[Image]</span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-slate-500 mb-2">
                      {item.product.category}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900">
                        ${item.product.price}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors ml-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 p-6 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-bold text-slate-900">
                ${totalPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Shipping</span>
              <span className="font-semibold text-green-600">FREE</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="font-bold text-slate-900">Total</span>
              <span className="text-2xl font-black text-slate-900">
                ${totalPrice.toLocaleString()}
              </span>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full py-4 bg-primary-500 hover:bg-primary-600 text-white text-center font-black uppercase tracking-wide rounded-xl transition-colors shadow-lg"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={closeCart}
              className="block w-full py-3 text-slate-600 text-center font-semibold hover:text-slate-900 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
