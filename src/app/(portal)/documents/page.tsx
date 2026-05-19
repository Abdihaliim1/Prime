import type { Metadata } from "next";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { ADMIN_AUTH_COOKIE, verifyAdminToken } from "@/lib/auth";
import DocumentsClient from "./DocumentsClient";

export const metadata: Metadata = { title: "Documents & Compliance – Prime Trucking" };
export const dynamic = "force-dynamic";

interface DriverDoc {
  appId: string;
  driverName: string;
  docType: string;
  url: string;
  expires: string | null;
}

interface CompanyDoc {
  id: string;
  name: string;
  category: string;
  expires: string | null;
  url: string;
  uploaded_at: string;
  file_size: number | null;
}

export default async function DocumentsPage() {
  const cookieStore = await cookies();
  const auth = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  if (!(await verifyAdminToken(auth))) return null;

  const driverDocs: DriverDoc[] = [];
  let companyDocs: CompanyDoc[] = [];
  let dbReady = true;

  try {
    const { rows: apps } = await sql`
      SELECT id, first_name, last_name, status,
             doc_cdl_front, doc_cdl_back, doc_medical, doc_mvr, doc_other,
             cdl_expiry, medical_expiry, mvr_date
      FROM applications
      ORDER BY submitted_at DESC
    `;

    for (const a of apps) {
      const driverName = [a.first_name, a.last_name].filter(Boolean).join(" ") || "Unknown driver";
      if (a.doc_cdl_front) driverDocs.push({ appId: a.id as string, driverName, docType: "CDL — Front", url: a.doc_cdl_front as string, expires: (a.cdl_expiry as string) || null });
      if (a.doc_cdl_back) driverDocs.push({ appId: a.id as string, driverName, docType: "CDL — Back", url: a.doc_cdl_back as string, expires: null });
      if (a.doc_medical) driverDocs.push({ appId: a.id as string, driverName, docType: "DOT Medical Certificate", url: a.doc_medical as string, expires: (a.medical_expiry as string) || null });
      if (a.doc_mvr) driverDocs.push({ appId: a.id as string, driverName, docType: "Motor Vehicle Record", url: a.doc_mvr as string, expires: (a.mvr_date as string) || null });
      if (a.doc_other) driverDocs.push({ appId: a.id as string, driverName, docType: "Other Document", url: a.doc_other as string, expires: null });
    }
  } catch {
    dbReady = false;
  }

  try {
    const { rows } = await sql`SELECT * FROM company_documents ORDER BY uploaded_at DESC`;
    companyDocs = rows as unknown as CompanyDoc[];
  } catch {
    // Table may not exist yet — visit /api/setup
  }

  return <DocumentsClient driverDocs={driverDocs} companyDocs={companyDocs} dbReady={dbReady} />;
}
