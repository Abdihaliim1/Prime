import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { ADMIN_AUTH_COOKIE, verifyAdminToken } from "@/lib/auth";

export const metadata: Metadata = { title: "Drivers – Prime Trucking" };
export const dynamic = "force-dynamic";

interface DriverRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  cdl_number: string | null;
  cdl_state: string | null;
  cdl_class: string | null;
  cdl_expiry: string | null;
  medical_expiry: string | null;
  submitted_at: string;
}

type ComplianceStatus = "compliant" | "action" | "noncompliant";

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

function statusFor(cdlExpiry: string | null, medicalExpiry: string | null): { status: ComplianceStatus; expiringCount: number } {
  const cdlDays = daysUntil(cdlExpiry);
  const medDays = daysUntil(medicalExpiry);

  // Expired = non-compliant
  if ((cdlDays !== null && cdlDays < 0) || (medDays !== null && medDays < 0)) {
    return { status: "noncompliant", expiringCount: 0 };
  }

  // Expiring within 90 days = action required
  let expiringCount = 0;
  if (cdlDays !== null && cdlDays <= 90) expiringCount++;
  if (medDays !== null && medDays <= 90) expiringCount++;

  if (expiringCount > 0) return { status: "action", expiringCount };
  return { status: "compliant", expiringCount: 0 };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function initials(first: string | null, last: string | null) {
  return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase() || "?";
}

const statusConfig: Record<ComplianceStatus, { label: string; color: string; bg: string }> = {
  compliant: { label: "Compliant", color: "text-green-700", bg: "bg-green-100" },
  action: { label: "Action Required", color: "text-amber-700", bg: "bg-amber-100" },
  noncompliant: { label: "Non-Compliant", color: "text-red-700", bg: "bg-red-100" },
};

export default async function DriversPage() {
  const cookieStore = await cookies();
  const auth = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  if (!(await verifyAdminToken(auth))) return null;

  let drivers: DriverRow[] = [];
  let dbReady = true;

  try {
    const { rows } = await sql<DriverRow>`
      SELECT id, first_name, last_name, email, cdl_number, cdl_state, cdl_class,
             cdl_expiry, medical_expiry, submitted_at
      FROM applications
      WHERE status = 'approved'
      ORDER BY submitted_at DESC
    `;
    drivers = rows;
  } catch {
    dbReady = false;
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Drivers</h1>
          <p className="text-sm text-gray-500 mt-1">
            {drivers.length} approved driver{drivers.length !== 1 ? "s" : ""} in system
          </p>
        </div>
        <Link
          href="/applications"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-2 md:px-4 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="hidden sm:inline">Review Applications</span>
        </Link>
      </div>

      {!dbReady && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
          <strong>Database not connected.</strong> Visit <code className="font-mono">/api/setup</code> once.
        </div>
      )}

      {drivers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-sm font-medium text-gray-500">No approved drivers yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Drivers appear here once you approve their application.
          </p>
          <Link href="/applications" className="inline-block mt-4 text-xs font-medium text-orange-500 hover:text-orange-600 underline-offset-2 hover:underline">
            Go to applications →
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {drivers.map((d) => {
              const { status, expiringCount } = statusFor(d.cdl_expiry, d.medical_expiry);
              const cfg = statusConfig[status];
              const cdlInfo = d.cdl_number ? `${d.cdl_class ?? ""} #${d.cdl_state ?? ""}-${d.cdl_number}`.trim() : (d.cdl_class ?? "—");
              return (
                <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-semibold shrink-0">
                        {initials(d.first_name, d.last_name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{d.first_name} {d.last_name}</p>
                        <p className="text-xs font-mono text-gray-400">{cdlInfo}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-400 truncate">Joined {formatDate(d.submitted_at)}</p>
                    <Link href={`/applications/${d.id}`} className="text-xs text-gray-600 px-3 py-1.5 border border-gray-200 rounded-lg shrink-0">View</Link>
                  </div>
                  {expiringCount > 0 && (
                    <p className="text-xs text-amber-600 font-medium mt-2">{expiringCount} document{expiringCount !== 1 ? "s" : ""} expiring soon</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
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
                    const { status, expiringCount } = statusFor(d.cdl_expiry, d.medical_expiry);
                    const cfg = statusConfig[status];
                    const cdlNumber = d.cdl_number ? `#${d.cdl_state ?? ""}-${d.cdl_number}` : "—";
                    return (
                      <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-semibold shrink-0">
                              {initials(d.first_name, d.last_name)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{d.first_name} {d.last_name}</p>
                              <p className="text-xs text-gray-400">{d.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-gray-700 font-mono text-xs">{cdlNumber}</p>
                          <p className="text-xs text-gray-400">{d.cdl_class} · {d.cdl_state}</p>
                        </td>
                        <td className="px-4 py-4 text-gray-500">{formatDate(d.submitted_at)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {expiringCount > 0 ? (
                            <span className="text-xs text-amber-600 font-medium">{expiringCount} expiring</span>
                          ) : status === "noncompliant" ? (
                            <span className="text-xs text-red-600 font-medium">Expired</span>
                          ) : (
                            <span className="text-xs text-gray-400">Up to date</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/applications/${d.id}`} className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                            View Profile
                          </Link>
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
