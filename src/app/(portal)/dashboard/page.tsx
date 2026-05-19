import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Overview – Prime Trucking" };

const complianceSummary = [
  { label: "Total Drivers", value: "24", sub: "3 pending onboarding" },
  { label: "Fully Compliant", value: "18", sub: "75% of drivers", positive: true },
  { label: "Action Required", value: "4", sub: "Docs expiring / missing", positive: false },
  { label: "Non-Compliant", value: "2", sub: "Immediate attention needed", positive: false },
];

const expiringDocs = [
  { driver: "James Okonkwo", doc: "DOT Medical Certificate", expires: "Jun 2, 2026", daysLeft: 14, cdl: "CDL-A #TX-84921" },
  { driver: "Maria Santos", doc: "Annual Vehicle Inspection", expires: "Jun 15, 2026", daysLeft: 27, cdl: "CDL-B #TX-20381" },
  { driver: "Derek Holt", doc: "Commercial Driver's License", expires: "Jul 1, 2026", daysLeft: 43, cdl: "CDL-A #TX-11204" },
  { driver: "Priya Nair", doc: "Hazmat Endorsement", expires: "Jul 10, 2026", daysLeft: 52, cdl: "CDL-A #TX-93847" },
];

const recentActivity = [
  { driver: "Carlos Mendez", action: "Uploaded Drug Test Results", time: "2 hours ago" },
  { driver: "James Okonkwo", action: "Profile updated", time: "Yesterday" },
  { driver: "Sarah Kim", action: "Medical certificate renewed", time: "May 17" },
  { driver: "Derek Holt", action: "Added to system", time: "May 15" },
];

const nonCompliant = [
  { driver: "Tony Reeves", cdl: "CDL-A #TX-48201", issue: "Medical cert expired May 1", avatar: "TR" },
  { driver: "Amanda Brooks", cdl: "CDL-B #TX-30912", issue: "Missing IFTA license", avatar: "AB" },
];

export default function OverviewPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Compliance Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Monday, May 19 · 24 drivers in system</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {complianceSummary.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3 md:px-5 md:py-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-tight">{s.label}</p>
            <p className="text-2xl md:text-3xl font-semibold text-gray-900 mt-1">{s.value}</p>
            <p className={`text-xs mt-1 ${s.positive === true ? "text-green-600" : s.positive === false ? "text-red-500" : "text-gray-400"}`}>
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {nonCompliant.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-5">
          <h2 className="text-sm font-semibold text-red-800 mb-3">Non-Compliant — Immediate Action Required</h2>
          <div className="space-y-2">
            {nonCompliant.map((d) => (
              <div key={d.driver} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border border-red-100 rounded-lg px-4 py-3 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-semibold shrink-0">
                    {d.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{d.driver}</p>
                    <p className="text-xs text-gray-500">{d.cdl}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pl-11 sm:pl-0 sm:gap-4">
                  <p className="text-xs text-red-600">{d.issue}</p>
                  <Link href="/documents" className="text-xs font-medium text-red-700 underline underline-offset-2 ml-4 shrink-0">
                    Resolve
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Expiring Documents</h2>
            <Link href="/documents" className="text-xs text-orange-500 hover:underline font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {expiringDocs.map((item) => (
              <div key={item.driver + item.doc} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0 pr-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.driver}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{item.doc}</p>
                  <p className="text-xs text-gray-400">{item.cdl}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.daysLeft <= 14 ? "bg-red-100 text-red-700" : item.daysLeft <= 30 ? "bg-amber-100 text-amber-700" : "bg-yellow-50 text-yellow-700"}`}>
                    {item.daysLeft}d
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{item.expires}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0 mt-0.5">
                  {item.driver.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{item.driver}</span>
                    <span className="text-gray-500"> · {item.action}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
