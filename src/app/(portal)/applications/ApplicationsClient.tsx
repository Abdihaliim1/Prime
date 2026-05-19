"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Status = "new" | "reviewing" | "approved" | "rejected";

interface Application {
  id: string;
  status: Status;
  submitted_at: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  cdl_class: string | null;
  cdl_state: string | null;
}

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  new: { label: "New", color: "text-blue-700", bg: "bg-blue-100" },
  reviewing: { label: "Reviewing", color: "text-amber-700", bg: "bg-amber-100" },
  approved: { label: "Approved", color: "text-green-700", bg: "bg-green-100" },
  rejected: { label: "Rejected", color: "text-red-700", bg: "bg-red-100" },
};

function initials(first: string | null, last: string | null) {
  return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase() || "?";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ApplicationsClient({
  applications: initial,
  summary,
  dbReady,
}: {
  applications: Application[];
  summary: { total: number; new: number; reviewing: number; approved: number };
  dbReady: boolean;
}) {
  const router = useRouter();
  const [applications, setApplications] = useState(initial);
  const [updating, setUpdating] = useState<string | null>(null);

  async function updateStatus(id: string, status: Status) {
    setUpdating(id);
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    setUpdating(null);
    router.refresh();
  }

  const summaryItems = [
    { label: "Total", value: summary.total },
    { label: "New", value: summary.new },
    { label: "Reviewing", value: summary.reviewing },
    { label: "Approved", value: summary.approved },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Driver Applications</h1>
          <p className="text-sm text-gray-500 mt-1">Review and process incoming driver applications</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-2 rounded-lg text-gray-600 self-start">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Apply link: <span className="font-mono font-medium text-gray-900 text-xs">/apply</span>
        </div>
      </div>

      {!dbReady && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
          <strong>Database not connected.</strong> To enable real submissions, provision a Vercel Postgres database and visit <code className="font-mono">/api/setup</code> once.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summaryItems.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3 md:px-5 md:py-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className="text-3xl font-semibold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm font-medium text-gray-500">No applications yet</p>
          <p className="text-xs text-gray-400 mt-1">Share the <span className="font-mono">/apply</span> link with drivers</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {applications.map((app) => {
              const cfg = statusConfig[app.status];
              return (
                <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-semibold shrink-0">
                        {initials(app.first_name, app.last_name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{app.first_name} {app.last_name}</p>
                        <p className="text-xs text-gray-400">{app.email}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-xs text-gray-500">{app.cdl_class} · {app.cdl_state}</p>
                      <p className="text-xs font-mono text-gray-400">{app.id} · {formatDate(app.submitted_at)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/applications/${app.id}`} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600">View</Link>
                      {app.status === "new" && (
                        <button disabled={updating === app.id} onClick={() => updateStatus(app.id, "reviewing")} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600">Review</button>
                      )}
                      {(app.status === "new" || app.status === "reviewing") && (
                        <button disabled={updating === app.id} onClick={() => updateStatus(app.id, "approved")} className="text-xs text-white bg-orange-500 px-3 py-1.5 rounded-lg">Approve</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">All Applications</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Applicant</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Ref #</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">CDL</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Submitted</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {applications.map((app) => {
                    const cfg = statusConfig[app.status];
                    return (
                      <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-semibold shrink-0">
                              {initials(app.first_name, app.last_name)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{app.first_name} {app.last_name}</p>
                              <p className="text-xs text-gray-400">{app.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-gray-500">{app.id}</td>
                        <td className="px-4 py-4 text-gray-700">{app.cdl_class} · {app.cdl_state}</td>
                        <td className="px-4 py-4 text-gray-500">{formatDate(app.submitted_at)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/applications/${app.id}`} className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                              View
                            </Link>
                            {app.status === "new" && (
                              <button disabled={updating === app.id} onClick={() => updateStatus(app.id, "reviewing")} className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                                Review
                              </button>
                            )}
                            {(app.status === "new" || app.status === "reviewing") && (
                              <button disabled={updating === app.id} onClick={() => updateStatus(app.id, "approved")} className="text-xs text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg transition-colors">
                                Approve
                              </button>
                            )}
                            {app.status === "approved" && (
                              <button disabled={updating === app.id} onClick={() => updateStatus(app.id, "rejected")} className="text-xs text-gray-400 hover:text-red-600 px-3 py-1.5 border border-gray-200 rounded-lg transition-colors">
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
