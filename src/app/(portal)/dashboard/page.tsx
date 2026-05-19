import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { ADMIN_AUTH_COOKIE, verifyAdminToken } from "@/lib/auth";

export const metadata: Metadata = { title: "Overview – Prime Trucking" };
export const dynamic = "force-dynamic";

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function OverviewPage() {
  const cookieStore = await cookies();
  const auth = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  if (!(await verifyAdminToken(auth))) return null;

  // All queries gracefully degrade if DB not provisioned
  let totalApps = 0, newApps = 0, reviewingApps = 0, approvedApps = 0;
  let expiringItems: { name: string; doc: string; expires: string; daysLeft: number; id: string }[] = [];
  let recentApps: { id: string; first_name: string | null; last_name: string | null; submitted_at: string; status: string }[] = [];
  let dbReady = true;

  try {
    const { rows: counts } = await sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'new')::int AS new_count,
        COUNT(*) FILTER (WHERE status = 'reviewing')::int AS reviewing_count,
        COUNT(*) FILTER (WHERE status = 'approved')::int AS approved_count
      FROM applications
    `;
    totalApps = counts[0].total;
    newApps = counts[0].new_count;
    reviewingApps = counts[0].reviewing_count;
    approvedApps = counts[0].approved_count;

    // Fetch all approved drivers' expiry info
    const { rows: drivers } = await sql`
      SELECT id, first_name, last_name, cdl_number, cdl_state, cdl_class, cdl_expiry, medical_expiry
      FROM applications
      WHERE status = 'approved'
    `;

    for (const d of drivers) {
      const name = [d.first_name, d.last_name].filter(Boolean).join(" ") || "Unknown";
      const cdlId = [d.cdl_class, d.cdl_state && d.cdl_number ? `${d.cdl_state}-${d.cdl_number}` : null].filter(Boolean).join(" ") || d.id;

      const cdlDays = daysUntil(d.cdl_expiry as string | null);
      if (cdlDays !== null && cdlDays <= 90) {
        expiringItems.push({ name, doc: "Commercial Driver's License", expires: d.cdl_expiry as string, daysLeft: cdlDays, id: d.id as string });
      }

      const medDays = daysUntil(d.medical_expiry as string | null);
      if (medDays !== null && medDays <= 90) {
        expiringItems.push({ name, doc: "DOT Medical Certificate", expires: d.medical_expiry as string, daysLeft: medDays, id: d.id as string });
      }

      void cdlId;
    }

    expiringItems.sort((a, b) => a.daysLeft - b.daysLeft);

    const { rows: recent } = await sql`
      SELECT id, first_name, last_name, submitted_at, status
      FROM applications
      ORDER BY submitted_at DESC
      LIMIT 5
    `;
    recentApps = recent as typeof recentApps;
  } catch {
    dbReady = false;
  }

  const complianceSummary = [
    { label: "Applications", value: totalApps.toString(), sub: `${newApps} new · ${reviewingApps} reviewing` },
    { label: "Approved Drivers", value: approvedApps.toString(), sub: approvedApps > 0 ? "Active in system" : "None yet", positive: approvedApps > 0 },
    { label: "Expiring (90d)", value: expiringItems.filter(i => i.daysLeft >= 0).length.toString(), sub: "CDL or medical cert", positive: expiringItems.filter(i => i.daysLeft >= 0).length === 0 },
    { label: "Expired", value: expiringItems.filter(i => i.daysLeft < 0).length.toString(), sub: "Needs immediate action", positive: false },
  ];

  const expired = expiringItems.filter(i => i.daysLeft < 0);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Compliance Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Prime Trucking LLC · USDOT #4341809</p>
      </div>

      {!dbReady && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
          <strong>Database not connected.</strong> Visit <code className="font-mono">/api/setup</code> once after provisioning Postgres.
        </div>
      )}

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

      {expired.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-5">
          <h2 className="text-sm font-semibold text-red-800 mb-3">Expired — Immediate Action Required</h2>
          <div className="space-y-2">
            {expired.map((item) => (
              <div key={item.id + item.doc} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border border-red-100 rounded-lg px-4 py-3 gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-red-600">{item.doc} expired {item.expires}</p>
                </div>
                <Link href={`/applications/${item.id}`} className="text-xs font-medium text-red-700 underline underline-offset-2 self-start sm:self-auto shrink-0">
                  View Application
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Expiring Soon (90 days)</h2>
            <Link href="/applications" className="text-xs text-orange-500 hover:underline font-medium">All applications</Link>
          </div>
          {expiringItems.filter(i => i.daysLeft >= 0).length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No documents expiring within 90 days</p>
          ) : (
            <div className="space-y-3">
              {expiringItems.filter(i => i.daysLeft >= 0).slice(0, 6).map((item) => (
                <Link key={item.id + item.doc} href={`/applications/${item.id}`} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded -mx-2 px-2 transition-colors">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{item.doc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.daysLeft <= 14 ? "bg-red-100 text-red-700" : item.daysLeft <= 30 ? "bg-amber-100 text-amber-700" : "bg-yellow-50 text-yellow-700"}`}>
                      {item.daysLeft}d
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{item.expires}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Applications</h2>
          {recentApps.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No applications yet</p>
          ) : (
            <div className="space-y-4">
              {recentApps.map((app) => {
                const name = [app.first_name, app.last_name].filter(Boolean).join(" ") || "Unknown";
                return (
                  <Link key={app.id} href={`/applications/${app.id}`} className="flex items-start gap-3 hover:bg-gray-50 rounded -mx-2 px-2 py-1 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                      {((app.first_name?.[0] ?? "") + (app.last_name?.[0] ?? "")).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium truncate">{name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(app.submitted_at)} · {app.status}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
