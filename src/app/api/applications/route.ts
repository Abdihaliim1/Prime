import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// POST /api/applications — public, called when driver submits the apply form
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const id =
      "PT-" + Math.random().toString(36).slice(2, 8).toUpperCase();

    await sql`
      INSERT INTO applications (
        id, status,
        first_name, middle_name, last_name, dob, ssn_last4,
        phone, email, address, city, state, zip,
        years_at_address, prev_address,
        cdl_number, cdl_state, cdl_class, cdl_expiry,
        endorsements, license_ever, license_states, exp_types, exp_years,
        employers,
        no_accidents, accidents, no_violations, violations,
        positive_test, refused_test, return_duty, sapd_info,
        sig_name, sig_date,
        doc_cdl_front, doc_cdl_back, doc_medical, doc_mvr, doc_other
      ) VALUES (
        ${id}, 'new',
        ${body.personal?.firstName ?? null},
        ${body.personal?.middleName ?? null},
        ${body.personal?.lastName ?? null},
        ${body.personal?.dob ?? null},
        ${body.personal?.ssn ?? null},
        ${body.personal?.phone ?? null},
        ${body.personal?.email ?? null},
        ${body.personal?.address ?? null},
        ${body.personal?.city ?? null},
        ${body.personal?.state ?? null},
        ${body.personal?.zip ?? null},
        ${body.personal?.yearsAtAddress ?? null},
        ${body.personal?.prevAddress ?? null},
        ${body.license?.cdlNumber ?? null},
        ${body.license?.cdlState ?? null},
        ${body.license?.cdlClass ?? null},
        ${body.license?.cdlExpiry ?? null},
        ${JSON.stringify(body.license?.endorsements ?? [])},
        ${body.license?.licenseEver ?? null},
        ${body.license?.licenseStates ?? null},
        ${JSON.stringify(body.license?.expTypes ?? [])},
        ${body.license?.expYears ?? null},
        ${JSON.stringify(body.employers ?? [])},
        ${body.noAccidents ?? false},
        ${JSON.stringify(body.accidents ?? [])},
        ${body.noViolations ?? false},
        ${JSON.stringify(body.violations ?? [])},
        ${body.drug?.positiveTest ?? null},
        ${body.drug?.refusedTest ?? null},
        ${body.drug?.returnDuty ?? null},
        ${body.drug?.sapdInfo ?? null},
        ${body.sig?.name ?? null},
        ${body.sig?.date ?? null},
        ${body.docs?.cdlFront ?? null},
        ${body.docs?.cdlBack ?? null},
        ${body.docs?.medical ?? null},
        ${body.docs?.mvr ?? null},
        ${body.docs?.other ?? null}
      )
    `;

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("Application submit error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// GET /api/applications — admin only
export async function GET(req: NextRequest) {
  const auth = req.cookies.get("pt-admin-auth")?.value;
  if (auth !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { rows } = await sql`
      SELECT
        id, status, submitted_at,
        first_name, last_name,
        email, phone,
        cdl_class, cdl_state,
        sig_name
      FROM applications
      ORDER BY submitted_at DESC
    `;
    return NextResponse.json({ applications: rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
