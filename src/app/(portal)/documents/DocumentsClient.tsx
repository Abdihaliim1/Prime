"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

const CATEGORIES = ["Insurance", "Vehicle Registration", "IFTA", "Annual Inspection", "Drug & Alcohol Program", "Operating Authority", "Other"];

function statusFor(expires: string | null) {
  if (!expires) return { label: "Valid", color: "text-green-700", bg: "bg-green-100" };
  const days = Math.ceil((new Date(expires).getTime() - Date.now()) / 86400000);
  if (isNaN(days)) return { label: "Valid", color: "text-green-700", bg: "bg-green-100" };
  if (days < 0) return { label: "Expired", color: "text-red-700", bg: "bg-red-100" };
  if (days <= 30) return { label: `${days}d left`, color: "text-red-700", bg: "bg-red-100" };
  if (days <= 90) return { label: `${days}d left`, color: "text-amber-700", bg: "bg-amber-100" };
  return { label: "Valid", color: "text-green-700", bg: "bg-green-100" };
}

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DocumentsClient({ driverDocs, companyDocs, dbReady }: { driverDocs: DriverDoc[]; companyDocs: CompanyDoc[]; dbReady: boolean }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [expires, setExpires] = useState("");

  async function handleUpload() {
    if (!file || !name || !category) {
      setError("Please fill in document name, category, and choose a file.");
      return;
    }
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", name);
    fd.append("category", category);
    if (expires) fd.append("expires", expires);
    const res = await fetch("/api/company-documents", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(data.error ?? "Upload failed.");
      return;
    }
    setShowUpload(false);
    setFile(null);
    setName("");
    setCategory(CATEGORIES[0]);
    setExpires("");
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    await fetch(`/api/company-documents/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const allDocs = [
    ...driverDocs.map(d => ({ ...d, type: "driver" as const })),
    ...companyDocs.map(d => ({ ...d, type: "company" as const })),
  ];
  const expiring = allDocs.filter(d => {
    const exp = "expires" in d ? d.expires : null;
    if (!exp) return false;
    const days = Math.ceil((new Date(exp).getTime() - Date.now()) / 86400000);
    return !isNaN(days) && days >= 0 && days <= 90;
  });
  const expired = allDocs.filter(d => {
    const exp = "expires" in d ? d.expires : null;
    if (!exp) return false;
    const days = Math.ceil((new Date(exp).getTime() - Date.now()) / 86400000);
    return !isNaN(days) && days < 0;
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Documents & Compliance</h1>
          <p className="text-sm text-gray-500 mt-1">All driver and company DOT-required documents</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Company Document
        </button>
      </div>

      {!dbReady && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
          <strong>Database not ready.</strong> Visit <code className="font-mono">/api/setup</code> once.
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 md:px-5 md:py-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Docs</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">{driverDocs.length + companyDocs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 md:px-5 md:py-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Driver Docs</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">{driverDocs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 md:px-5 md:py-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expiring (90d)</p>
          <p className={`text-3xl font-semibold mt-1 ${expiring.length > 0 ? "text-amber-600" : "text-gray-900"}`}>{expiring.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 md:px-5 md:py-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expired</p>
          <p className={`text-3xl font-semibold mt-1 ${expired.length > 0 ? "text-red-600" : "text-gray-900"}`}>{expired.length}</p>
        </div>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowUpload(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl border border-gray-200 p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Company Document</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="e.g. Liability Insurance Policy" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiration Date (optional)</label>
                <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">File * (PDF, JPG, PNG · max 10 MB)</label>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full text-sm" />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
              <button onClick={() => setShowUpload(false)} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleUpload} disabled={uploading} className="px-4 py-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-60">{uploading ? "Uploading…" : "Upload"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Documents */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 md:px-6 pt-4 pb-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Driver Documents</h2>
          <p className="text-xs text-gray-500 mt-0.5">Uploaded via driver application forms</p>
        </div>
        {driverDocs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">No driver documents uploaded yet.</p>
            <p className="text-xs text-gray-400 mt-1">Documents appear here when drivers submit applications with files attached.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {driverDocs.map((doc, i) => {
              const cfg = statusFor(doc.expires);
              return (
                <div key={i} className="flex items-center gap-3 px-4 md:px-6 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.docType}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      <Link href={`/applications/${doc.appId}`} className="hover:text-orange-500 underline-offset-2 hover:underline">{doc.driverName}</Link>
                      {doc.expires && ` · expires ${doc.expires}`}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} shrink-0`}>{cfg.label}</span>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded border border-gray-200 hover:border-gray-300 transition-colors shrink-0">View</a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Company Documents */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 md:px-6 pt-4 pb-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Company Documents</h2>
          <p className="text-xs text-gray-500 mt-0.5">Insurance, registrations, IFTA, inspections</p>
        </div>
        {companyDocs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">No company documents uploaded yet.</p>
            <p className="text-xs text-gray-400 mt-1">Click &quot;Upload Company Document&quot; above to add insurance, IFTA, registrations, etc.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {companyDocs.map((doc) => {
              const cfg = statusFor(doc.expires);
              return (
                <div key={doc.id} className="flex items-center gap-3 px-4 md:px-6 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {doc.category}
                      {doc.expires && ` · expires ${doc.expires}`}
                      {doc.file_size && ` · ${formatSize(doc.file_size)}`}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} shrink-0`}>{cfg.label}</span>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded border border-gray-200 hover:border-gray-300 transition-colors shrink-0">View</a>
                  <button onClick={() => handleDelete(doc.id)} className="text-xs text-red-400 hover:text-red-600 px-2.5 py-1.5 border border-red-200 hover:border-red-400 rounded-lg transition-colors shrink-0">Delete</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
