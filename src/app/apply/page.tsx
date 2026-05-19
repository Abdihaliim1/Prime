"use client";

import { useState, useRef } from "react";

type Lang = "en" | "so";

const t = {
  en: {
    companyName: "Prime Trucking LLC",
    usdot: "USDOT #4341809",
    tagline: "Driver Employment Application",
    subtitle: "Complete all sections. Information is kept confidential.",
    langToggle: "Somali",
    steps: ["Personal Info", "License & Experience", "Employment History", "Safety Record", "Drug & Alcohol", "Documents"],
    next: "Next",
    back: "Back",
    submit: "Submit Application",
    submitting: "Submitting…",
    required: "Required",
    yes: "Yes",
    no: "No",

    // Step 1
    s1Title: "Personal Information",
    firstName: "First Name",
    middleName: "Middle Name",
    lastName: "Last Name",
    dob: "Date of Birth",
    ssn: "Social Security Number",
    phone: "Phone Number",
    email: "Email Address",
    address: "Street Address",
    city: "City",
    state: "State",
    zip: "ZIP Code",
    yearsAtAddress: "Years at Current Address",
    prevAddress: "Previous Address (if less than 3 years at current)",

    // Step 2
    s2Title: "License & Driving Experience",
    cdlNumber: "CDL Number",
    cdlState: "Issuing State",
    cdlClass: "CDL Class",
    cdlExpiry: "CDL Expiration Date",
    endorsements: "Endorsements (select all that apply)",
    licenseEver: "Has any license ever been denied, suspended, revoked, or cancelled?",
    licenseStates: "List all states where you have held a CDL in the past 5 years",
    expTypes: "Types of Equipment Operated",
    expYears: "Total Years of Commercial Driving Experience",

    // Step 3
    s3Title: "Employment History (past 3 years)",
    s3Note: "List all employers starting with most recent. Include gaps.",
    empName: "Employer / Company Name",
    empAddress: "Address",
    empPhone: "Phone",
    empPosition: "Position / Title",
    empStart: "Start Date",
    empEnd: "End Date (or Present)",
    empLeave: "Reason for Leaving",
    empFmcsa: "Were you subject to FMCSA regulations?",
    empDrug: "Were you subject to DOT drug/alcohol testing?",
    addEmployer: "+ Add Another Employer",

    // Step 4
    s4Title: "Safety Record",
    accNote: "List all accidents in the past 3 years.",
    noAcc: "No accidents to report",
    accDate: "Date",
    accLocation: "Location",
    accDesc: "Description",
    accFatal: "Fatalities",
    accInj: "Injuries",
    addAcc: "+ Add Accident",
    violNote: "List all traffic violations in the past 3 years.",
    noViol: "No traffic violations to report",
    violDate: "Date",
    violLocation: "Location",
    violCharge: "Violation / Charge",
    violPenalty: "Penalty",
    addViol: "+ Add Violation",

    // Step 5
    s5Title: "Drug & Alcohol History",
    s5Note: "Per 49 CFR Part 382, all answers are required.",
    positiveTest: "Have you ever tested positive for drugs or alcohol on a DOT-required test?",
    refusedTest: "Have you ever refused to submit to a DOT drug or alcohol test?",
    returnDuty: "Are you currently subject to a return-to-duty plan or follow-up testing?",
    sapdInfo: "If yes to any above, provide details (employer, date, substance):",

    // Step 6
    s6Title: "Document Upload",
    s6Note: "Upload clear photos or scans. PDF, JPG, PNG accepted (max 10 MB each).",
    docCdlFront: "CDL — Front",
    docCdlBack: "CDL — Back",
    docMedical: "DOT Medical Certificate",
    docMvr: "Motor Vehicle Record (MVR)",
    docOther: "Other Supporting Documents",
    chooseFile: "Choose file",
    noFile: "No file chosen",
    certTitle: "Certification",
    certText: "I certify that all information provided in this application is true, complete, and accurate. I understand that falsification of any information may result in denial of employment or termination.",
    sigName: "Full Name (acts as signature)",
    sigDate: "Date",
    // Validation
    fieldsMissing: "Please complete all required fields before continuing.",
    filesMissing: "Please upload required documents (CDL front, CDL back, Medical Certificate) and fill in all required fields.",
    // New doc fields
    medicalExpiry: "DOT Medical Certificate Expiration Date",
    mvrDate: "MVR Date (most recent)",

    // Success
    successTitle: "Application Submitted!",
    successText: "Thank you. Prime Trucking LLC will review your application and contact you within 2–3 business days.",
    successRef: "Reference Number",
  },
  so: {
    companyName: "Prime Trucking LLC",
    usdot: "USDOT #4341809",
    tagline: "Codsiga Shaqada Wadaha",
    subtitle: "Buuxi dhammaan qaybaha. Macluumaadka waa sir ahaan la hayn doonaa.",
    langToggle: "English",
    steps: ["Xogta Shakhsiga", "Rukhsadda & Khibradda", "Taariikhda Shaqada", "Diiwaanka Ammaanka", "Daroogada & Khamriga", "Dukumiintiyada"],
    next: "Xiga",
    back: "Hore",
    submit: "Gudbi Codsiga",
    submitting: "Waa la gudbinayaa…",
    required: "Waajib",
    yes: "Haa",
    no: "Maya",

    // Step 1
    s1Title: "Xogta Shakhsiga",
    firstName: "Magaca Hore",
    middleName: "Magaca Dhexe",
    lastName: "Magaca Dambe",
    dob: "Taariikhda Dhalashada",
    ssn: "Nambarka Amniga Bulshada (SSN)",
    phone: "Nambarka Telefoonka",
    email: "Cinwaanka Iimaaylka",
    address: "Cinwaanka Jidka",
    city: "Magaalada",
    state: "Gobolka",
    zip: "Koodhka Boostada",
    yearsAtAddress: "Sanadaha Cinwaanka Hadda",
    prevAddress: "Cinwaanka Hore (haddii ka yar 3 sano)",

    // Step 2
    s2Title: "Rukhsadda & Khibradda Wadista",
    cdlNumber: "Nambarka CDL",
    cdlState: "Gobolka Soo Saaray",
    cdlClass: "Fasalka CDL",
    cdlExpiry: "Taariikhda Dhicitaanka CDL",
    endorsements: "Oggolaanshiyaaha Dheeraadka (dooro kuwa kugu dhaca)",
    licenseEver: "Ma leedahay rukhsad la diidey, la joojiyey, la baajiyey, ama la kaansalay?",
    licenseStates: "Liis gobolada aad CDL ku haysay 5 sanadood ee la soo dhaafay",
    expTypes: "Noocyada Gaadhiyaasha Aad Wajahahay",
    expYears: "Wadarta Sanadaha Khibradda Wadista Ganacsiga",

    // Step 3
    s3Title: "Taariikhda Shaqada (3 Sanadood ee la soo dhaafay)",
    s3Note: "Liis dhammaan shaqo-bixiyayaasha, billow kan ugu dambeeyay. Ku dar xilligii shaqo la'aanta.",
    empName: "Magaca Shirkadda / Shaqo-bixiyaha",
    empAddress: "Cinwaanka",
    empPhone: "Telefoonka",
    empPosition: "Xilka / Xirfadda",
    empStart: "Taariikhda Bilowga",
    empEnd: "Taariikhda Dhamaadka (ama Hadda)",
    empLeave: "Sababta Ka Tagnida",
    empFmcsa: "Ma aheyd mid lagu dabaqay xeerarka FMCSA?",
    empDrug: "Ma aheyd mid baaritaan daroogada/khamriga DOT lagugu sameeyo?",
    addEmployer: "+ Ku Dar Shaqo-bixiye Kale",

    // Step 4
    s4Title: "Diiwaanka Ammaanka",
    accNote: "Liis dhammaan shilalka 3 sanadood ee la soo dhaafay.",
    noAcc: "Ma jiraan shilal aan soo gudbino",
    accDate: "Taariikhda",
    accLocation: "Goobta",
    accDesc: "Sharaxaadda",
    accFatal: "Dhimashooyin",
    accInj: "Dhaawacyo",
    addAcc: "+ Ku Dar Shil",
    violNote: "Liis dhammaan xadgudubyada taraafikada 3 sanadood ee la soo dhaafay.",
    noViol: "Ma jiraan xadgudub taraafikada aan soo gudbino",
    violDate: "Taariikhda",
    violLocation: "Goobta",
    violCharge: "Xadgudubyada / Dacwadda",
    violPenalty: "Ciqaabta",
    addViol: "+ Ku Dar Xadgudub",

    // Step 5
    s5Title: "Taariikhda Daroogada & Khamriga",
    s5Note: "Sida lagu sheegay 49 CFR Qaybta 382, dhammaan jawaabaha waa waajib.",
    positiveTest: "Ma hore u noqotay mid natiijada baarista daroogada ama khamriga ee DOT wanaagsan ahayd?",
    refusedTest: "Ma hore u diiday inaad baarista daroogada ama khamriga ee DOT ku qabato?",
    returnDuty: "Ma jirtaa hadda qorshe aad ku soo noqonayso xilka ama baaritaan raadraac ah?",
    sapdInfo: "Haddii jawaabtu tahay Haa wax ka mid ah kore, faahfaahin (shaqo-bixiye, taariikh, maadada):",

    // Step 6
    s6Title: "Soo Rar Dukumiintiyada",
    s6Note: "Soo rar sawirro cad ama skaan. PDF, JPG, PNG (ugu badan 10 MB kasta).",
    docCdlFront: "CDL — Dhinaca Hore",
    docCdlBack: "CDL — Dhinaca Gadaal",
    docMedical: "Shahaadada Caafimaadka DOT",
    docMvr: "Diiwaanka Gaadhiga (MVR)",
    docOther: "Dukumiintiyada Kale",
    chooseFile: "Dooro fayl",
    noFile: "Fayl lama dooran",
    certTitle: "Xaqiijinta",
    certText: "Waxaan xaqiijinayaa in dhammaan macluumaadka codsigan ku jira ay run tahay, buuxda, oo saxsan. Waxaan fahamsan ahay in been sheegidda macluumaadka kasta ay keeni karto diidmada shaqada ama joojinta.",
    sigName: "Magaca Buuxa (u adeegta saxiixa)",
    sigDate: "Taariikhda",
    // Validation
    fieldsMissing: "Fadlan buuxi dhammaan goobaha loo baahan yahay ka hor intaadan sii wadin.",
    filesMissing: "Fadlan soo rar dukumiintiyada loo baahan yahay (CDL hore, CDL gadaal, Shahaadada Caafimaadka) oo buuxi dhammaan goobaha loo baahan yahay.",
    // New doc fields
    medicalExpiry: "Taariikhda Dhicitaanka Shahaadada Caafimaadka DOT",
    mvrDate: "Taariikhda MVR (ugu dambeeyay)",

    // Success
    successTitle: "Codsiga Waa La Gudbiyay!",
    successText: "Mahadsanid. Prime Trucking LLC ayaa codsigeega dib u eegi doona oo kula soo xiriiri doona 2–3 maalmood shaqo gudahood.",
    successRef: "Nambarka Tixraaca",
  },
};

type Employer = { name: string; address: string; phone: string; position: string; start: string; end: string; leave: string; fmcsa: string; drug: string };
type Accident = { date: string; location: string; desc: string; fatal: string; inj: string };
type Violation = { date: string; location: string; charge: string; penalty: string };

const ENDORSEMENTS = ["H – Hazardous Materials", "N – Tank Vehicles", "P – Passenger", "S – School Bus", "T – Double/Triple Trailers", "X – Combination H+N"];
const EQUIPMENT = ["Semi Truck / 18-Wheeler", "Flatbed", "Refrigerated / Reefer", "Tanker", "Dry Van", "Dump Truck", "Box Truck", "Doubles / Triples"];
const CDL_CLASSES = ["Class A", "Class B", "Class C"];
const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

function FileInput({ label, lang, onFile }: { label: string; lang: Lang; onFile?: (f: File | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const tr = t[lang];
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1.5">{label}</p>
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 transition-colors"
        >
          {tr.chooseFile}
        </button>
        <span className="text-sm text-gray-500">{name || tr.noFile}</span>
        <input
          ref={ref}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setName(f?.name ?? "");
            onFile?.(f);
          }}
        />
      </div>
    </div>
  );
}

async function uploadFile(file: File, label: string, appId: string): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("label", label);
  fd.append("appId", appId);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) return null;
  const { url } = await res.json();
  return url as string;
}

export default function ApplyPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const tr = t[lang];

  // Form state
  const [personal, setPersonal] = useState({ firstName: "", middleName: "", lastName: "", dob: "", ssn: "", phone: "", email: "", address: "", city: "", state: "", zip: "", yearsAtAddress: "", prevAddress: "" });
  const [license, setLicense] = useState({ cdlNumber: "", cdlState: "", cdlClass: "", cdlExpiry: "", endorsements: [] as string[], licenseEver: "", licenseStates: "", expTypes: [] as string[], expYears: "" });
  const [employers, setEmployers] = useState<Employer[]>([{ name: "", address: "", phone: "", position: "", start: "", end: "", leave: "", fmcsa: "", drug: "" }]);
  const [noAccidents, setNoAccidents] = useState(false);
  const [accidents, setAccidents] = useState<Accident[]>([{ date: "", location: "", desc: "", fatal: "", inj: "" }]);
  const [noViolations, setNoViolations] = useState(false);
  const [violations, setViolations] = useState<Violation[]>([{ date: "", location: "", charge: "", penalty: "" }]);
  const [drug, setDrug] = useState({ positiveTest: "", refusedTest: "", returnDuty: "", sapdInfo: "" });
  const [sig, setSig] = useState({ name: "", date: "" });
  const [medicalExpiry, setMedicalExpiry] = useState("");
  const [mvrDate, setMvrDate] = useState("");
  const [stepError, setStepError] = useState("");

  // File state
  const [files, setFiles] = useState<Record<string, File | null>>({
    cdlFront: null, cdlBack: null, medical: null, mvr: null, other: null,
  });

  const TOTAL = 6;

  function formatSSN(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  }

  function validateStep(s: number): string {
    if (s === 0) {
      const missing = [
        !personal.firstName && tr.firstName,
        !personal.lastName && tr.lastName,
        !personal.dob && tr.dob,
        (personal.ssn.replace(/\D/g, "").length < 9) && tr.ssn,
        !personal.phone && tr.phone,
        !personal.address && tr.address,
        !personal.city && tr.city,
        !personal.state && tr.state,
        !personal.zip && tr.zip,
      ].filter(Boolean) as string[];
      return missing.length ? tr.fieldsMissing : "";
    }
    if (s === 1) {
      const missing = [
        !license.cdlNumber && tr.cdlNumber,
        !license.cdlState && tr.cdlState,
        !license.cdlClass && tr.cdlClass,
        !license.cdlExpiry && tr.cdlExpiry,
        !license.expYears && tr.expYears,
      ].filter(Boolean) as string[];
      return missing.length ? tr.fieldsMissing : "";
    }
    if (s === 4) {
      const missing = [
        !drug.positiveTest && tr.positiveTest,
        !drug.refusedTest && tr.refusedTest,
        !drug.returnDuty && tr.returnDuty,
      ].filter(Boolean) as string[];
      return missing.length ? tr.fieldsMissing : "";
    }
    if (s === 5) {
      if (!files.cdlFront || !files.cdlBack || !files.medical || !medicalExpiry || !sig.name || !sig.date) {
        return tr.filesMissing;
      }
    }
    return "";
  }

  function toggleArr(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  }

  async function handleSubmit() {
    const err = validateStep(5);
    if (err) { setStepError(err); return; }

    setLoading(true);
    setSubmitError("");
    setStepError("");

    // Generate ID client-side so files are organized under the applicant's folder
    const appId = "PT-" + Math.random().toString(36).slice(2, 8).toUpperCase();

    try {
      // Upload files concurrently (skip nulls)
      const [cdlFront, cdlBack, medical, mvr, other] = await Promise.all([
        files.cdlFront ? uploadFile(files.cdlFront, "cdl-front", appId) : Promise.resolve(null),
        files.cdlBack ? uploadFile(files.cdlBack, "cdl-back", appId) : Promise.resolve(null),
        files.medical ? uploadFile(files.medical, "medical", appId) : Promise.resolve(null),
        files.mvr ? uploadFile(files.mvr, "mvr", appId) : Promise.resolve(null),
        files.other ? uploadFile(files.other, "other", appId) : Promise.resolve(null),
      ]);

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: appId,
          personal, license, employers,
          noAccidents, accidents,
          noViolations, violations,
          drug, sig,
          docs: { cdlFront, cdlBack, medical, mvr, other, medicalExpiry, mvrDate },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");

      setRefId(data.id);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{tr.successTitle}</h2>
          <p className="text-sm text-gray-600 mb-6">{tr.successText}</p>
          <div className="bg-gray-50 rounded-lg px-5 py-3">
            <p className="text-xs text-gray-500">{tr.successRef}</p>
            <p className="text-lg font-mono font-semibold text-gray-900">{refId}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">{tr.companyName}</p>
              <p className="text-xs text-gray-400">{tr.usdot}</p>
            </div>
          </div>
          <button
            onClick={() => setLang(lang === "en" ? "so" : "en")}
            className="flex items-center gap-2 text-xs font-medium bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {tr.langToggle}
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">{tr.tagline}</h1>
          <p className="text-sm text-gray-500 mt-1">{tr.subtitle}</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {tr.steps.map((s, i) => (
              <div key={i} className={`flex flex-col items-center gap-1 flex-1 ${i < tr.steps.length - 1 ? "relative" : ""}`}>
                <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs font-semibold z-10 ${i < step ? "bg-orange-500 text-white" : i === step ? "bg-orange-500 text-white ring-4 ring-orange-100" : "bg-gray-200 text-gray-500"}`}>
                  {i < step ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i + 1}
                </div>
                {i < tr.steps.length - 1 && (
                  <div className={`absolute top-3 md:top-3.5 left-1/2 w-full h-0.5 -z-0 ${i < step ? "bg-orange-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mt-3">
            {lang === "en" ? `Step ${step + 1} of ${TOTAL}` : `Tallaabo ${step + 1} / ${TOTAL}`} — <span className="font-medium">{tr.steps[step]}</span>
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-8">

          {/* STEP 1 — Personal Info */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{tr.s1Title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label={tr.firstName} value={personal.firstName} onChange={(v) => setPersonal({ ...personal, firstName: v })} required />
                <Field label={tr.middleName} value={personal.middleName} onChange={(v) => setPersonal({ ...personal, middleName: v })} />
                <Field label={tr.lastName} value={personal.lastName} onChange={(v) => setPersonal({ ...personal, lastName: v })} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={tr.dob} value={personal.dob} onChange={(v) => setPersonal({ ...personal, dob: v })} type="date" required />
                <Field label={tr.ssn} value={personal.ssn} onChange={(v) => setPersonal({ ...personal, ssn: formatSSN(v) })} maxLength={11} placeholder="XXX-XX-XXXX" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={tr.phone} value={personal.phone} onChange={(v) => setPersonal({ ...personal, phone: v })} type="tel" required />
                <Field label={tr.email} value={personal.email} onChange={(v) => setPersonal({ ...personal, email: v })} type="email" />
              </div>
              <Field label={tr.address} value={personal.address} onChange={(v) => setPersonal({ ...personal, address: v })} required />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label={tr.city} value={personal.city} onChange={(v) => setPersonal({ ...personal, city: v })} required />
                <SelectField label={tr.state} value={personal.state} onChange={(v) => setPersonal({ ...personal, state: v })} options={US_STATES} required />
                <Field label={tr.zip} value={personal.zip} onChange={(v) => setPersonal({ ...personal, zip: v })} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={tr.yearsAtAddress} value={personal.yearsAtAddress} onChange={(v) => setPersonal({ ...personal, yearsAtAddress: v })} type="number" />
                <Field label={tr.prevAddress} value={personal.prevAddress} onChange={(v) => setPersonal({ ...personal, prevAddress: v })} />
              </div>
            </div>
          )}

          {/* STEP 2 — License & Experience */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{tr.s2Title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={tr.cdlNumber} value={license.cdlNumber} onChange={(v) => setLicense({ ...license, cdlNumber: v })} required />
                <SelectField label={tr.cdlState} value={license.cdlState} onChange={(v) => setLicense({ ...license, cdlState: v })} options={US_STATES} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField label={tr.cdlClass} value={license.cdlClass} onChange={(v) => setLicense({ ...license, cdlClass: v })} options={CDL_CLASSES} required />
                <Field label={tr.cdlExpiry} value={license.cdlExpiry} onChange={(v) => setLicense({ ...license, cdlExpiry: v })} type="date" required />
              </div>
              <CheckboxGroup label={tr.endorsements} options={ENDORSEMENTS} selected={license.endorsements} onChange={(v) => setLicense({ ...license, endorsements: toggleArr(license.endorsements, v) })} />
              <YesNo label={tr.licenseEver} value={license.licenseEver} onChange={(v) => setLicense({ ...license, licenseEver: v })} lang={lang} />
              <Field label={tr.licenseStates} value={license.licenseStates} onChange={(v) => setLicense({ ...license, licenseStates: v })} placeholder="e.g. MN, TX, CA" />
              <CheckboxGroup label={tr.expTypes} options={EQUIPMENT} selected={license.expTypes} onChange={(v) => setLicense({ ...license, expTypes: toggleArr(license.expTypes, v) })} />
              <Field label={tr.expYears} value={license.expYears} onChange={(v) => setLicense({ ...license, expYears: v })} type="number" required />
            </div>
          )}

          {/* STEP 3 — Employment */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{tr.s3Title}</h2>
                <p className="text-xs text-gray-500 mt-1">{tr.s3Note}</p>
              </div>
              {employers.map((emp, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-5 space-y-4">
                  <p className="text-sm font-semibold text-gray-700">{lang === "en" ? `Employer ${idx + 1}` : `Shaqo-bixiye ${idx + 1}`}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label={tr.empName} value={emp.name} onChange={(v) => { const a = [...employers]; a[idx].name = v; setEmployers(a); }} required />
                    <Field label={tr.empPhone} value={emp.phone} onChange={(v) => { const a = [...employers]; a[idx].phone = v; setEmployers(a); }} />
                  </div>
                  <Field label={tr.empAddress} value={emp.address} onChange={(v) => { const a = [...employers]; a[idx].address = v; setEmployers(a); }} />
                  <Field label={tr.empPosition} value={emp.position} onChange={(v) => { const a = [...employers]; a[idx].position = v; setEmployers(a); }} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label={tr.empStart} value={emp.start} onChange={(v) => { const a = [...employers]; a[idx].start = v; setEmployers(a); }} type="date" required />
                    <Field label={tr.empEnd} value={emp.end} onChange={(v) => { const a = [...employers]; a[idx].end = v; setEmployers(a); }} type="date" />
                  </div>
                  <Field label={tr.empLeave} value={emp.leave} onChange={(v) => { const a = [...employers]; a[idx].leave = v; setEmployers(a); }} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <YesNo label={tr.empFmcsa} value={emp.fmcsa} onChange={(v) => { const a = [...employers]; a[idx].fmcsa = v; setEmployers(a); }} lang={lang} />
                    <YesNo label={tr.empDrug} value={emp.drug} onChange={(v) => { const a = [...employers]; a[idx].drug = v; setEmployers(a); }} lang={lang} />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setEmployers([...employers, { name: "", address: "", phone: "", position: "", start: "", end: "", leave: "", fmcsa: "", drug: "" }])} className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                {tr.addEmployer}
              </button>
            </div>
          )}

          {/* STEP 4 — Safety Record */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{tr.s4Title}</h2>

              {/* Accidents */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">{tr.accNote}</p>
                <label className="flex items-center gap-2 text-sm text-gray-700 mb-4 cursor-pointer">
                  <input type="checkbox" checked={noAccidents} onChange={(e) => setNoAccidents(e.target.checked)} className="rounded" />
                  {tr.noAcc}
                </label>
                {!noAccidents && (
                  <div className="space-y-4">
                    {accidents.map((acc, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-4 space-y-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{lang === "en" ? `Accident ${idx + 1}` : `Shil ${idx + 1}`}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field label={tr.accDate} value={acc.date} onChange={(v) => { const a = [...accidents]; a[idx].date = v; setAccidents(a); }} type="date" />
                          <Field label={tr.accLocation} value={acc.location} onChange={(v) => { const a = [...accidents]; a[idx].location = v; setAccidents(a); }} />
                        </div>
                        <Field label={tr.accDesc} value={acc.desc} onChange={(v) => { const a = [...accidents]; a[idx].desc = v; setAccidents(a); }} textarea />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field label={tr.accFatal} value={acc.fatal} onChange={(v) => { const a = [...accidents]; a[idx].fatal = v; setAccidents(a); }} type="number" />
                          <Field label={tr.accInj} value={acc.inj} onChange={(v) => { const a = [...accidents]; a[idx].inj = v; setAccidents(a); }} type="number" />
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => setAccidents([...accidents, { date: "", location: "", desc: "", fatal: "", inj: "" }])} className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                      {tr.addAcc}
                    </button>
                  </div>
                )}
              </div>

              <hr className="border-gray-100" />

              {/* Violations */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">{tr.violNote}</p>
                <label className="flex items-center gap-2 text-sm text-gray-700 mb-4 cursor-pointer">
                  <input type="checkbox" checked={noViolations} onChange={(e) => setNoViolations(e.target.checked)} className="rounded" />
                  {tr.noViol}
                </label>
                {!noViolations && (
                  <div className="space-y-4">
                    {violations.map((viol, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-4 space-y-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{lang === "en" ? `Violation ${idx + 1}` : `Xadgudub ${idx + 1}`}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field label={tr.violDate} value={viol.date} onChange={(v) => { const a = [...violations]; a[idx].date = v; setViolations(a); }} type="date" />
                          <Field label={tr.violLocation} value={viol.location} onChange={(v) => { const a = [...violations]; a[idx].location = v; setViolations(a); }} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field label={tr.violCharge} value={viol.charge} onChange={(v) => { const a = [...violations]; a[idx].charge = v; setViolations(a); }} />
                          <Field label={tr.violPenalty} value={viol.penalty} onChange={(v) => { const a = [...violations]; a[idx].penalty = v; setViolations(a); }} />
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => setViolations([...violations, { date: "", location: "", charge: "", penalty: "" }])} className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                      {tr.addViol}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5 — Drug & Alcohol */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{tr.s5Title}</h2>
                <p className="text-xs text-gray-500 mt-1">{tr.s5Note}</p>
              </div>
              <YesNo label={tr.positiveTest} value={drug.positiveTest} onChange={(v) => setDrug({ ...drug, positiveTest: v })} lang={lang} required />
              <YesNo label={tr.refusedTest} value={drug.refusedTest} onChange={(v) => setDrug({ ...drug, refusedTest: v })} lang={lang} required />
              <YesNo label={tr.returnDuty} value={drug.returnDuty} onChange={(v) => setDrug({ ...drug, returnDuty: v })} lang={lang} required />
              {(drug.positiveTest === "yes" || drug.refusedTest === "yes" || drug.returnDuty === "yes") && (
                <Field label={tr.sapdInfo} value={drug.sapdInfo} onChange={(v) => setDrug({ ...drug, sapdInfo: v })} textarea />
              )}
            </div>
          )}

          {/* STEP 6 — Documents & Signature */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{tr.s6Title}</h2>
                <p className="text-xs text-gray-500 mt-1">{tr.s6Note}</p>
              </div>
              <div className="space-y-4">
                <FileInput label={tr.docCdlFront} lang={lang} onFile={(f) => setFiles((p) => ({ ...p, cdlFront: f }))} />
                <FileInput label={tr.docCdlBack} lang={lang} onFile={(f) => setFiles((p) => ({ ...p, cdlBack: f }))} />
                <FileInput label={tr.docMedical} lang={lang} onFile={(f) => setFiles((p) => ({ ...p, medical: f }))} />
                <Field label={tr.medicalExpiry} value={medicalExpiry} onChange={setMedicalExpiry} type="date" required />
                <FileInput label={tr.docMvr} lang={lang} onFile={(f) => setFiles((p) => ({ ...p, mvr: f }))} />
                <Field label={tr.mvrDate} value={mvrDate} onChange={setMvrDate} type="date" />
                <FileInput label={tr.docOther} lang={lang} onFile={(f) => setFiles((p) => ({ ...p, other: f }))} />
              </div>

              <hr className="border-gray-200" />

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{tr.certTitle}</h3>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4 leading-relaxed">{tr.certText}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={tr.sigName} value={sig.name} onChange={(v) => setSig({ ...sig, name: v })} required />
                <Field label={tr.sigDate} value={sig.date} onChange={(v) => setSig({ ...sig, date: v })} type="date" required />
              </div>
            </div>
          )}

          {(stepError || submitError) && (
            <p className="mt-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{stepError || submitError}</p>
          )}

          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {tr.back}
            </button>
            {step < TOTAL - 1 ? (
              <button
                type="button"
                onClick={() => {
                  const err = validateStep(step);
                  if (err) { setStepError(err); return; }
                  setStepError("");
                  setStep(step + 1);
                }}
                className="px-6 py-2.5 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                {tr.next}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-60"
              >
                {loading ? tr.submitting : tr.submit}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable field components
function Field({ label, value, onChange, type = "text", required, placeholder, maxLength, textarea }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string; maxLength?: number; textarea?: boolean;
}) {
  const cls = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder:text-gray-400 bg-white";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {textarea ? (
        <textarea className={cls + " resize-none"} rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className={cls} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} />
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">—</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function CheckboxGroup({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: string[]; onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={selected.includes(opt)} onChange={() => onChange(opt)} className="rounded accent-orange-500" />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

function YesNo({ label, value, onChange, lang, required }: {
  label: string; value: string; onChange: (v: string) => void; lang: Lang; required?: boolean;
}) {
  const tr = t[lang];
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </p>
      <div className="flex gap-4">
        {["yes", "no"].map((v) => (
          <label key={v} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="radio" name={label} value={v} checked={value === v} onChange={() => onChange(v)} className="accent-orange-500" />
            {v === "yes" ? tr.yes : tr.no}
          </label>
        ))}
      </div>
    </div>
  );
}
