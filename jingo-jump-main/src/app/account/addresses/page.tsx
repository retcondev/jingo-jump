"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  Home,
  Building,
} from "lucide-react";
import { api } from "~/trpc/react";

type AddressType = "SHIPPING" | "BILLING";

interface AddressFormData {
  type: AddressType;
  isDefault: boolean;
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
}

const emptyAddress: AddressFormData = {
  type: "SHIPPING",
  isDefault: false,
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

export default function AddressesPage() {
  const utils = api.useUtils();
  const { data: addresses, isLoading } = api.account.getAddresses.useQuery();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(emptyAddress);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const addMutation = api.account.addAddress.useMutation({
    onSuccess: () => {
      void utils.account.getAddresses.invalidate();
      resetForm();
    },
  });

  const updateMutation = api.account.updateAddress.useMutation({
    onSuccess: () => {
      void utils.account.getAddresses.invalidate();
      resetForm();
    },
  });

  const deleteMutation = api.account.deleteAddress.useMutation({
    onSuccess: () => {
      void utils.account.getAddresses.invalidate();
      setDeleteConfirm(null);
    },
  });

  const resetForm = () => {
    setFormData(emptyAddress);
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleEdit = (address: NonNullable<typeof addresses>[0]) => {
    setFormData({
      type: address.type as AddressType,
      isDefault: address.isDefault,
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company ?? "",
      address1: address.address1,
      address2: address.address2 ?? "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone ?? "",
    });
    setEditingId(address.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      company: formData.company || undefined,
      address2: formData.address2 || undefined,
      phone: formData.phone || undefined,
    };

    if (editingId) {
      updateMutation.mutate({
        addressId: editingId,
        data,
      });
    } else {
      addMutation.mutate(data);
    }
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  const shippingAddresses = addresses?.filter((a) => a.type === "SHIPPING") ?? [];
  const billingAddresses = addresses?.filter((a) => a.type === "BILLING") ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Addresses</h1>
          <p className="mt-1 text-slate-600">
            Manage your shipping and billing addresses.
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Address
          </button>
        )}
      </div>

      {/* Address Form */}
      {isFormOpen && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingId ? "Edit Address" : "Add New Address"}
            </h2>
            <button
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Address Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Address Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="SHIPPING"
                    checked={formData.type === "SHIPPING"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as AddressType,
                      })
                    }
                    className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                  />
                  <Home className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Shipping</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="BILLING"
                    checked={formData.type === "BILLING"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as AddressType,
                      })
                    }
                    className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                  />
                  <Building className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Billing</span>
                </label>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Company (Optional)
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Address Lines */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.address1}
                onChange={(e) =>
                  setFormData({ ...formData, address1: e.target.value })
                }
                placeholder="Street address"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                value={formData.address2}
                onChange={(e) =>
                  setFormData({ ...formData, address2: e.target.value })
                }
                placeholder="Apt, suite, unit (optional)"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 mt-2"
              />
            </div>

            {/* City, State, Zip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, postalCode: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Default Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) =>
                  setFormData({ ...formData, isDefault: e.target.checked })
                }
                className="w-5 h-5 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-600">
                Set as default {formData.type.toLowerCase()} address
              </span>
            </label>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:bg-primary-400 transition-colors"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    {editingId ? "Update Address" : "Save Address"}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address Lists */}
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Shipping Addresses */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Home className="h-5 w-5 text-slate-400" />
              Shipping Addresses
            </h2>
            {shippingAddresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shippingAddresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={() => handleEdit(address)}
                    onDelete={() => setDeleteConfirm(address.id)}
                    isDeleting={deleteConfirm === address.id}
                    onConfirmDelete={() => deleteMutation.mutate({ addressId: address.id })}
                    onCancelDelete={() => setDeleteConfirm(null)}
                    deleteLoading={deleteMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No shipping addresses saved.</p>
            )}
          </div>

          {/* Billing Addresses */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Building className="h-5 w-5 text-slate-400" />
              Billing Addresses
            </h2>
            {billingAddresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {billingAddresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={() => handleEdit(address)}
                    onDelete={() => setDeleteConfirm(address.id)}
                    isDeleting={deleteConfirm === address.id}
                    onConfirmDelete={() => deleteMutation.mutate({ addressId: address.id })}
                    onCancelDelete={() => setDeleteConfirm(null)}
                    deleteLoading={deleteMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No billing addresses saved.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  isDeleting,
  onConfirmDelete,
  onCancelDelete,
  deleteLoading,
}: {
  address: {
    id: string;
    firstName: string;
    lastName: string;
    company: string | null;
    address1: string;
    address2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string | null;
    isDefault: boolean;
  };
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  deleteLoading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 relative">
      {address.isDefault && (
        <span className="absolute top-2 right-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
          Default
        </span>
      )}
      <div className="space-y-1 text-sm">
        <p className="font-medium text-slate-900">
          {address.firstName} {address.lastName}
        </p>
        {address.company && (
          <p className="text-slate-600">{address.company}</p>
        )}
        <p className="text-slate-600">{address.address1}</p>
        {address.address2 && (
          <p className="text-slate-600">{address.address2}</p>
        )}
        <p className="text-slate-600">
          {address.city}, {address.state} {address.postalCode}
        </p>
        {address.phone && (
          <p className="text-slate-600">{address.phone}</p>
        )}
      </div>

      {isDeleting ? (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700 mb-2">Delete this address?</p>
          <div className="flex gap-2">
            <button
              onClick={onConfirmDelete}
              disabled={deleteLoading}
              className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 disabled:bg-red-400"
            >
              {deleteLoading ? "Deleting..." : "Yes, Delete"}
            </button>
            <button
              onClick={onCancelDelete}
              className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
