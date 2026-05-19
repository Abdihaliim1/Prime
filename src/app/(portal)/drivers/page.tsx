import type { Metadata } from "next";

export const metadata: Metadata = { title: "Drivers – Prime Trucking" };

type Status = "compliant" | "action" | "noncompliant";

const drivers = [
  { id: "1", name: "James Okonkwo", cdl: "CDL-A #TX-84921", cdlClass: "Class A", state: "TX", status: "action" as Status, phone: "(214) 555-0102", email: "j.okonkwo@email.com", joined: "Jan 12, 2024", docsExpiring: 1 },
  { id: "2", name: "Maria Santos", cdl: "CDL-B #TX-20381", cdlClass: "Class B", state: "TX", status: "action" as Status, phone: "(214) 555-0283", email: "m.santos@email.com", joined: "Mar 5, 2024", docsExpiring: 1 },
  { id: "3", name: "Derek Holt", cdl: "CDL-A #TX-11204", cdlClass: "Class A", state: "TX", status: "action" as Status, phone: "(972) 555-0047", email: "d.holt@email.com", joined: "Feb 18, 2024", docsExpiring: 1 },
  { id: "4", name: "Carlos Mendez", cdl: "CDL-A #MN-30921", cdlClass: "Class A", state: "MN", status: "compliant" as Status, phone: "(612) 555-0391", email: "c.mendez@email.com", joined: "Nov 3, 2023", docsExpiring: 0 },
  { id: "5", name: "Sarah Kim", cdl: "CDL-A #MN-58203", cdlClass: "Class A", state: "MN", status: "compliant" as Status, phone: "(651) 555-0174", email: "s.kim@email.com", joined: "Sep 22, 2023", docsExpiring: 0 },
  { id: "6", name: "Tony Reeves", cdl: "CDL-A #TX-48201", cdlClass: "Class A", state: "TX", status: "noncompliant" as Status, phone: "(469) 555-0038", email: "t.reeves@email.com", joined: "Aug 7, 2023", docsExpiring: 0 },
  { id: "7", name: "Amanda Brooks", cdl: "CDL-B #TX-30912", cdlClass: "Class B", state: "TX", status: "noncompliant" as Status, phone: "(817) 555-0229", email: "a.brooks@email.com", joined: "Oct 14, 2023", docsExpiring: 0 },
  { id: "8", name: "Priya Nair", cdl: "CDL-A #TX-93847", cdlClass: "Class A", state: "TX", status: "action" as Status, phone: "(214) 555-0510", email: "p.nair@email.com", joined: "Dec 1, 2023", docsExpiring: 1 },
];

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  compliant: { label: "Compliant", color: "text-green-700", bg: "bg-green-100" },
  action: { label: "Action Required", color: "text-amber-700", bg: "bg-amber-100" },
  noncompliant: { label: "Non-Compliant", color: "text-red-700", bg: "bg-red-100" },
};

export default function DriversPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Drivers</h1>
          <p className="text-sm text-gray-500 mt-1">{drivers.length} drivers in system</p>
        </div>
        <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Driver
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Driver</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">CDL</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Joined</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Compliance</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Docs</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {drivers.map((d) => {
              const cfg = statusConfig[d.status];
              return (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-semibold shrink-0">
                        {d.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{d.name}</p>
                        <p className="text-xs text-gray-400">{d.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-gray-700 font-mono text-xs">{d.cdl}</p>
                    <p className="text-xs text-gray-400">{d.cdlClass} · {d.state}</p>
                  </td>
                  <td className="px-4 py-4 text-gray-500">{d.joined}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {d.docsExpiring > 0 ? (
                      <span className="text-xs text-amber-600 font-medium">{d.docsExpiring} expiring</span>
                    ) : (
                      <span className="text-xs text-gray-400">Up to date</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      View Profile
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
