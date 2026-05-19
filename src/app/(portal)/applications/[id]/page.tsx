import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { sql } from "@/lib/db";
import { ADMIN_AUTH_COOKIE, verifyAdminToken } from "@/lib/auth";

export const metadata: Metadata = { title: "Application Detail – Prime Trucking" };
export const dynamic = "force-dynamic";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "New", color: "text-blue-700", bg: "bg-blue-100" },
  reviewing: { label: "Reviewing", color: "text-amber-700", bg: "bg-amber-100" },
  approved: { label: "Approved", color: "text-green-700", bg: "bg-green-100" },
  rejected: { label: "Rejected", color: "text-red-700", bg: "bg-red-100" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value, flag }: { label: string; value: string | null | undefined; flag?: boolean }) {
  const isYes = value?.toLowerCase() === "yes";
  const highlight = flag && isYes;
  return (
    <div className={`flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-gray-50 last:border-0 rounded ${highlight ? "bg-red-50 border-red-100 px-3 -mx-3" : ""}`}>
      <span className="text-xs font-medium text-gray-400 sm:w-48 shrink-0">{label}</span>
      <span className={`text-sm mt-0.5 sm:mt-0 font-medium ${highlight ? "text-red-700" : "text-gray-900"}`}>
        {value ? (
          highlight ? <span className="flex items-center gap-1.5">⚠ {value.toUpperCase()}</span> : value
        ) : (
          <span className="text-gray-400 italic font-normal">—</span>
        )}
      </span>
    </div>
  );
}

function DocLink({ label, url, expiry, required }: { label: string; url: string | null | undefined; expiry?: string | null; required?: boolean }) {
  const today = new Date();
  const expiryDate = expiry ? new Date(expiry) : null;
  const daysLeft = expiryDate ? Math.ceil((expiryDate.getTime() - today.getTime()) / 86400000) : null;
  const expiryStatus = daysLeft === null ? null : daysLeft < 0 ? "expired" : daysLeft <= 30 ? "critical" : daysLeft <= 90 ? "warning" : "ok";

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {expiry && (
          <p className={`text-xs mt-0.5 ${expiryStatus === "expired" ? "text-red-600" : expiryStatus === "critical" ? "text-red-500" : expiryStatus === "warning" ? "text-amber-600" : "text-gray-400"}`}>
            Expires {expiry}{daysLeft !== null && ` · ${daysLeft < 0 ? "EXPIRED" : `${daysLeft}d left`}`}
          </p>
        )}
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-orange-500 hover:text-orange-600 px-3 py-1.5 border border-orange-200 rounded-lg hover:border-orange-300 transition-colors shrink-0">
          View / Download
        </a>
      ) : (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${required ? "bg-red-100 text-red-600" : "text-gray-400 italic"}`}>
          {required ? "⚠ Missing" : "Not uploaded"}
        </span>
      )}
    </div>
  );
}

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const auth = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  if (!(await verifyAdminToken(auth))) return null;

  const { id } = await params;
  let app: Record<string, unknown> | null = null;

  try {
    const { rows } = await sql`SELECT * FROM applications WHERE id = ${id}`;
    if (!rows.length) notFound();
    app = rows[0];
  } catch {
    notFound();
  }

  const cfg = statusConfig[app.status as string] ?? statusConfig.new;
  const employers: Record<string, string>[] = Array.isArray(app.employers) ? app.employers as Record<string, string>[] : [];
  const accidents: Record<string, string>[] = Array.isArray(app.accidents) ? app.accidents as Record<string, string>[] : [];
  const violations: Record<string, string>[] = Array.isArray(app.violations) ? app.violations as Record<string, string>[] : [];
  const endorsements: string[] = Array.isArray(app.endorsements) ? app.endorsements as string[] : [];
  const expTypes: string[] = Array.isArray(app.exp_types) ? app.exp_types as string[] : [];

  const submittedAt = app.submitted_at
    ? new Date(app.submitted_at as string).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div className="p-4 md:p-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/applications" className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
              {app.first_name as string} {app.last_name as string}
            </h1>
            <p className="text-sm text-gray-500 font-mono mt-0.5">{id} · Submitted {submittedAt}</p>
          </div>
        </div>
        <span className={`text-sm font-medium px-3 py-1.5 rounded-full self-start sm:self-auto ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      {/* Documents — shown first since that's priority */}
      {(() => {
        const missingRequired = !app.doc_cdl_front || !app.doc_cdl_back || !app.doc_medical;
        return (
          <div className={`rounded-xl border p-5 md:p-6 ${missingRequired ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"}`}>
            <h2 className={`text-sm font-semibold uppercase tracking-wide mb-4 ${missingRequired ? "text-amber-700" : "text-gray-500"}`}>
              {missingRequired ? "⚠ Uploaded Documents — Required Docs Missing" : "Uploaded Documents"}
            </h2>
            <DocLink label="CDL — Front" url={app.doc_cdl_front as string} expiry={app.cdl_expiry as string} required />
            <DocLink label="CDL — Back" url={app.doc_cdl_back as string} required />
            <DocLink label="DOT Medical Certificate" url={app.doc_medical as string} expiry={app.medical_expiry as string} required />
            <DocLink label="Motor Vehicle Record (MVR)" url={app.doc_mvr as string} expiry={app.mvr_date as string} />
            {(app.doc_other as string | null) && <DocLink label="Other Document" url={app.doc_other as string} />}
          </div>
        );
      })()}

      {/* Personal Info */}
      <Section title="Personal Information">
        <Row label="Full Name" value={[app.first_name, app.middle_name, app.last_name].filter(Boolean).join(" ")} />
        <Row label="Date of Birth" value={app.dob as string} />
        <Row label="SSN" value={app.ssn as string} />
        <Row label="Phone" value={app.phone as string} />
        <Row label="Email" value={app.email as string} />
        <Row label="Address" value={[app.address, app.city, app.state, app.zip].filter(Boolean).join(", ")} />
        <Row label="Years at Address" value={app.years_at_address as string} />
        {(app.prev_address as string | null) && <Row label="Previous Address" value={app.prev_address as string} />}
      </Section>

      {/* License */}
      <Section title="License & Experience">
        <Row label="CDL Number" value={app.cdl_number as string} />
        <Row label="Issuing State" value={app.cdl_state as string} />
        <Row label="CDL Class" value={app.cdl_class as string} />
        <Row label="CDL Expiration" value={app.cdl_expiry as string} />
        <Row label="Endorsements" value={endorsements.length ? endorsements.join(", ") : "None"} />
        <Row label="Equipment Types" value={expTypes.length ? expTypes.join(", ") : "None"} />
        <Row label="Years of Experience" value={app.exp_years as string} />
        <Row label="License Ever Denied/Revoked" value={app.license_ever as string} />
        <Row label="CDL States (past 5 yr)" value={app.license_states as string} />
      </Section>

      {/* Employment */}
      {employers.length > 0 && (
        <Section title={`Employment History (${employers.length} employer${employers.length !== 1 ? "s" : ""})`}>
          {employers.map((emp, i) => (
            <div key={i} className={i > 0 ? "mt-5 pt-5 border-t border-gray-100" : ""}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Employer {i + 1}</p>
              <Row label="Company" value={emp.name} />
              <Row label="Address" value={emp.address} />
              <Row label="Phone" value={emp.phone} />
              <Row label="Position" value={emp.position} />
              <Row label="Dates" value={[emp.start, emp.end].filter(Boolean).join(" – ")} />
              <Row label="Reason for Leaving" value={emp.leave} />
              <Row label="Subject to FMCSA" value={emp.fmcsa} />
              <Row label="Subject to DOT Drug Testing" value={emp.drug} />
            </div>
          ))}
        </Section>
      )}

      {/* Safety Record */}
      {(() => {
        const hasAccidents = !app.no_accidents && accidents.length > 0;
        const hasViolations = !app.no_violations && violations.length > 0;
        const hasFatalOrInjury = accidents.some(a => parseInt(a.fatal || "0") > 0 || parseInt(a.inj || "0") > 0);
        const sectionFlag = hasFatalOrInjury ? "danger" : (hasAccidents || hasViolations) ? "warn" : "ok";
        return (
          <div className={`rounded-xl border p-5 md:p-6 ${sectionFlag === "danger" ? "bg-red-50 border-red-200" : sectionFlag === "warn" ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"}`}>
            <h2 className={`text-sm font-semibold uppercase tracking-wide mb-4 ${sectionFlag === "danger" ? "text-red-700" : sectionFlag === "warn" ? "text-amber-700" : "text-gray-500"}`}>
              {sectionFlag === "danger" ? "⚠ Safety Record — FATALITY / INJURY REPORTED" : sectionFlag === "warn" ? "⚠ Safety Record — Accidents / Violations Present" : "Safety Record"}
            </h2>

            {app.no_accidents ? (
              <p className="text-sm text-gray-500">No accidents reported</p>
            ) : accidents.length > 0 ? (
              accidents.map((acc, i) => {
                const fatal = parseInt(acc.fatal || "0");
                const inj = parseInt(acc.inj || "0");
                const accFlag = fatal > 0 || inj > 0;
                return (
                  <div key={i} className={`${i > 0 ? "mt-4 pt-4 border-t border-red-100" : ""} ${accFlag ? "bg-red-100 rounded-lg p-3 -mx-1" : ""}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${accFlag ? "text-red-700" : "text-gray-500"}`}>
                      {accFlag ? `⚠ Accident ${i + 1} — ${fatal > 0 ? `${fatal} FATALITY` : ""}${fatal > 0 && inj > 0 ? " · " : ""}${inj > 0 ? `${inj} INJURY` : ""}` : `Accident ${i + 1}`}
                    </p>
                    <Row label="Date" value={acc.date} />
                    <Row label="Location" value={acc.location} />
                    <Row label="Description" value={acc.desc} />
                    <Row label="Fatalities" value={acc.fatal} />
                    <Row label="Injuries" value={acc.inj} />
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">No accidents recorded</p>
            )}

            <div className="mt-5 pt-5 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Traffic Violations</p>
              {app.no_violations ? (
                <p className="text-sm text-gray-500">No violations reported</p>
              ) : violations.length > 0 ? (
                violations.map((viol, i) => (
                  <div key={i} className={`${i > 0 ? "mt-4 pt-4 border-t border-amber-100" : ""} bg-amber-50 rounded-lg p-3 -mx-1 mb-2`}>
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">⚠ Violation {i + 1}</p>
                    <Row label="Date" value={viol.date} />
                    <Row label="Location" value={viol.location} />
                    <Row label="Charge" value={viol.charge} />
                    <Row label="Penalty" value={viol.penalty} />
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No violations recorded</p>
              )}
            </div>
          </div>
        );
      })()}

      {/* Drug & Alcohol */}
      {(() => {
        const anyYes = [app.positive_test, app.refused_test, app.return_duty].some(v => (v as string)?.toLowerCase() === "yes");
        return (
          <div className={`rounded-xl border p-5 md:p-6 ${anyYes ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
            <h2 className={`text-sm font-semibold uppercase tracking-wide mb-4 ${anyYes ? "text-red-700" : "text-gray-500"}`}>
              {anyYes ? "⚠ Drug & Alcohol History — FLAGGED" : "Drug & Alcohol History"}
            </h2>
            <Row label="Tested positive (DOT)" value={app.positive_test as string} flag />
            <Row label="Refused DOT test" value={app.refused_test as string} flag />
            <Row label="Return-to-duty plan" value={app.return_duty as string} flag />
            {(app.sapd_info as string | null) && <Row label="Details" value={app.sapd_info as string} />}
          </div>
        );
      })()}

      {/* Signature */}
      <Section title="Certification & Signature">
        <Row label="Signed by" value={app.sig_name as string} />
        <Row label="Signature date" value={app.sig_date as string} />
      </Section>
    </div>
  );
}
