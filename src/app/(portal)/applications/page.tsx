import type { Metadata } from "next";

export const metadata: Metadata = { title: "Applications – Prime Trucking" };

type Status = "new" | "reviewing" | "approved" | "rejected";

const applications = [
  { id: "PT-A3F2K1", name: "Mohamed Hassan", submitted: "May 19, 2026", cdlClass: "Class A", state: "MN", status: "new" as Status, phone: "(612) 555-0182", email: "m.hassan@email.com" },
  { id: "PT-B9X4M7", name: "Abdullahi Warsame", submitted: "May 18, 2026", cdlClass: "Class A", state: "MN", status: "new" as Status, phone: "(952) 555-0341", email: "a.warsame@email.com" },
  { id: "PT-C2L8R3", name: "Linda Nguyen", submitted: "May 17, 2026", cdlClass: "Class B", state: "MN", status: "reviewing" as Status, phone: "(763) 555-0094", email: "l.nguyen@email.com" },
  { id: "PT-D7K1P9", name: "Carlos Rivera", submitted: "May 14, 2026", cdlClass: "Class A", state: "TX", status: "approved" as Status, phone: "(214) 555-0276", email: "c.rivera@email.com" },
  { id: "PT-E5N3Q2", name: "Fatuma Ali", submitted: "May 12, 2026", cdlClass: "Class A", state: "MN", status: "rejected" as Status, phone: "(612) 555-0509", email: "f.ali@email.com" },
];

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  new: { label: "New", color: "text-blue-700", bg: "bg-blue-100" },
  reviewing: { label: "Reviewing", color: "text-amber-700", bg: "bg-amber-100" },
  approved: { label: "Approved", color: "text-green-700", bg: "bg-green-100" },
  rejected: { label: "Rejected", color: "text-red-700", bg: "bg-red-100" },
};

const summary = [
  { label: "Total", value: applications.length },
  { label: "New", value: applications.filter((a) => a.status === "new").length },
  { label: "Reviewing", value: applications.filter((a) => a.status === "reviewing").length },
  { label: "Approved", value: applications.filter((a) => a.status === "approved").length },
];

export default function ApplicationsPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Driver Applications</h1>
          <p className="text-sm text-gray-500 mt-1">Review and process incoming driver applications</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-2 rounded-lg text-gray-600 self-start sm:self-auto">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="font-mono font-medium text-gray-900 text-xs">/apply</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3 md:px-5 md:py-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className="text-3xl font-semibold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {applications.map((app) => {
          const cfg = statusConfig[app.status];
          return (
            <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-semibold shrink-0">
                    {app.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{app.name}</p>
                    <p className="text-xs text-gray-400">{app.email}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${cfg.bg} ${cfg.color}`}>
                  {cfg.label}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{app.cdlClass} · {app.state} · {app.submitted}</p>
                  <p className="text-xs font-mono text-gray-400 mt-0.5">{app.id}</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs text-gray-600 px-3 py-1.5 border border-gray-200 rounded-lg">Review</button>
                  {(app.status === "new" || app.status === "reviewing") && (
                    <button className="text-xs text-white bg-orange-500 px-3 py-1.5 rounded-lg">Approve</button>
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">CDL Class</th>
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
                          {app.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{app.name}</p>
                          <p className="text-xs text-gray-400">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-gray-500">{app.id}</td>
                    <td className="px-4 py-4 text-gray-700">{app.cdlClass} · {app.state}</td>
                    <td className="px-4 py-4 text-gray-500">{app.submitted}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">Review</button>
                        {(app.status === "new" || app.status === "reviewing") && (
                          <button className="text-xs text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg transition-colors">Approve</button>
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
    </div>
  );
}
