import type { Metadata } from "next";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import ApplicationsClient from "./ApplicationsClient";

export const metadata: Metadata = { title: "Applications – Prime Trucking" };
export const dynamic = "force-dynamic";

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

async function getApplications(): Promise<Application[]> {
  try {
    const { rows } = await sql<Application>`
      SELECT id, status, submitted_at,
             first_name, last_name, email, phone,
             cdl_class, cdl_state
      FROM applications
      ORDER BY submitted_at DESC
    `;
    return rows;
  } catch {
    // Database not yet provisioned — return empty
    return [];
  }
}

export default async function ApplicationsPage() {
  // Auth already enforced by proxy — double-check server-side
  const cookieStore = await cookies();
  const auth = cookieStore.get("pt-admin-auth")?.value;
  if (auth !== "1") return null;

  const applications = await getApplications();
  const dbReady = applications !== null;

  const summary = {
    total: applications.length,
    new: applications.filter((a) => a.status === "new").length,
    reviewing: applications.filter((a) => a.status === "reviewing").length,
    approved: applications.filter((a) => a.status === "approved").length,
  };

  return <ApplicationsClient applications={applications} summary={summary} dbReady={dbReady} />;
}
