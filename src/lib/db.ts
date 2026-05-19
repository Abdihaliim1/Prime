import { sql } from "@vercel/postgres";

export { sql };

export async function createTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      submitted_at TIMESTAMPTZ DEFAULT NOW(),
      status TEXT DEFAULT 'new',

      -- Personal
      first_name TEXT,
      middle_name TEXT,
      last_name TEXT,
      dob TEXT,
      ssn_last4 TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      years_at_address TEXT,
      prev_address TEXT,

      -- License
      cdl_number TEXT,
      cdl_state TEXT,
      cdl_class TEXT,
      cdl_expiry TEXT,
      endorsements TEXT,
      license_ever TEXT,
      license_states TEXT,
      exp_types TEXT,
      exp_years TEXT,

      -- Employment history (JSON array)
      employers JSONB,

      -- Safety record
      no_accidents BOOLEAN,
      accidents JSONB,
      no_violations BOOLEAN,
      violations JSONB,

      -- Drug & alcohol
      positive_test TEXT,
      refused_test TEXT,
      return_duty TEXT,
      sapd_info TEXT,

      -- Signature
      sig_name TEXT,
      sig_date TEXT,

      -- Uploaded doc URLs (Vercel Blob)
      doc_cdl_front TEXT,
      doc_cdl_back TEXT,
      doc_medical TEXT,
      doc_mvr TEXT,
      doc_other TEXT,

      -- Doc expiry / dates
      medical_expiry TEXT,
      mvr_date TEXT
    );
  `;

  // Migrate existing tables — safe to run repeatedly
  await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS medical_expiry TEXT`;
  await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS mvr_date TEXT`;
}
