"use client";

import { useState, useRef } from "react";
import { api } from "~/trpc/react";
import {
  Search,
  Download,
  Upload,
  Plus,
  Trash2,
  Mail,
  Phone,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function SubscribersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [emailFilter, setEmailFilter] = useState<boolean | "">("");
  const [smsFilter, setSmsFilter] = useState<boolean | "">("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for new subscriber
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");

  const { data, isLoading, refetch } = api.adminSubscribers.list.useQuery({
    page,
    limit: 20,
    search: search || undefined,
    emailSubscribed: emailFilter === "" ? undefined : emailFilter,
    smsSubscribed: smsFilter === "" ? undefined : smsFilter,
  });

  const { data: stats } = api.adminSubscribers.getStats.useQuery();

  const createSubscriber = api.adminSubscribers.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowAddModal(false);
      setNewEmail("");
      setNewPhone("");
      setNewFirstName("");
      setNewLastName("");
    },
  });

  const deleteSubscriber = api.adminSubscribers.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const unsubscribe = api.adminSubscribers.unsubscribe.useMutation({
    onSuccess: () => refetch(),
  });

  const bulkImport = api.adminSubscribers.bulkImport.useMutation({
    onSuccess: (result) => {
      refetch();
      setShowImportModal(false);
      alert(`Import complete: ${result.created} created, ${result.updated} updated, ${result.errors.length} errors`);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());
        const headers = lines[0]?.toLowerCase().split(",").map((h) => h.trim());

        const subscribers = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
          const obj: Record<string, string> = {};
          headers?.forEach((h, i) => {
            obj[h] = values[i] ?? "";
          });
          return {
            email: obj.email ?? "",
            phone: obj.phone || null,
            firstName: obj.firstname || obj["first name"] || obj.first_name || null,
            lastName: obj.lastname || obj["last name"] || obj.last_name || null,
            emailSubscribed: true,
            smsSubscribed: !!obj.phone,
          };
        }).filter((s) => s.email);

        bulkImport.mutate({ subscribers, source: "csv_import" });
      } catch (error) {
        alert("Error parsing CSV file");
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = async (id: string, email: string) => {
    if (confirm(`Are you sure you want to delete ${email}?`)) {
      await deleteSubscriber.mutateAsync({ id });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscribers</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your mailing list and SMS subscribers
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Upload className="h-4 w-4" />
            Import
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
          >
            <Plus className="h-4 w-4" />
            Add Subscriber
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {stats?.totalSubscribers ?? 0}
              </p>
              <p className="text-xs text-slate-500">Total Subscribers</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <Mail className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {stats?.emailSubscribers ?? 0}
              </p>
              <p className="text-xs text-slate-500">Email Subscribers</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <Phone className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {stats?.smsSubscribers ?? 0}
              </p>
              <p className="text-xs text-slate-500">SMS Subscribers</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2">
              <CheckCircle className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {(stats?.activeRate ?? 0).toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500">Active Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email, name, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <select
            value={emailFilter === "" ? "" : emailFilter.toString()}
            onChange={(e) => {
              setEmailFilter(e.target.value === "" ? "" : e.target.value === "true");
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">All Email Status</option>
            <option value="true">Email Subscribed</option>
            <option value="false">Email Unsubscribed</option>
          </select>
          <select
            value={smsFilter === "" ? "" : smsFilter.toString()}
            onChange={(e) => {
              setSmsFilter(e.target.value === "" ? "" : e.target.value === "true");
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">All SMS Status</option>
            <option value="true">SMS Subscribed</option>
            <option value="false">SMS Unsubscribed</option>
          </select>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          </div>
        ) : !data?.subscribers.length ? (
          <div className="p-12 text-center">
            <Mail className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">No subscribers found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Start building your mailing list.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Subscriber</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Email Sub</th>
                    <th className="px-6 py-3">SMS Sub</th>
                    <th className="px-6 py-3">Source</th>
                    <th className="px-6 py-3">Joined</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {subscriber.firstName || subscriber.lastName
                            ? `${subscriber.firstName ?? ""} ${subscriber.lastName ?? ""}`.trim()
                            : "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {subscriber.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {subscriber.phone ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        {subscriber.emailSubscribed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {subscriber.smsSubscribed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-slate-300" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {subscriber.source ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(subscriber.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {(subscriber.emailSubscribed || subscriber.smsSubscribed) && (
                            <button
                              onClick={() =>
                                unsubscribe.mutate({
                                  id: subscriber.id,
                                  type: "both",
                                })
                              }
                              className="rounded p-1 text-slate-400 hover:bg-yellow-50 hover:text-yellow-600"
                              title="Unsubscribe"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleDelete(subscriber.id, subscriber.email)
                            }
                            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
                <p className="text-sm text-slate-500">
                  Showing {(page - 1) * 20 + 1} to{" "}
                  {Math.min(page * 20, data.pagination.total)} of{" "}
                  {data.pagination.total} subscribers
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= data.pagination.totalPages}
                    className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Subscriber Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Add Subscriber</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Email *
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  createSubscriber.mutate({
                    email: newEmail,
                    phone: newPhone || null,
                    firstName: newFirstName || null,
                    lastName: newLastName || null,
                    source: "admin",
                  })
                }
                disabled={!newEmail || createSubscriber.isPending}
                className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
              >
                {createSubscriber.isPending ? "Adding..." : "Add Subscriber"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Import Subscribers</h2>
            <p className="mt-2 text-sm text-slate-500">
              Upload a CSV file with columns: email, phone, firstname, lastname
            </p>
            <div className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-4 file:rounded file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
