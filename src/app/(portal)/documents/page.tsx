"use client";

import { useState } from "react";
import type { Metadata } from "next";

type DocStatus = "valid" | "expiring" | "expired" | "missing";

interface Document {
  id: string;
  name: string;
  category: string;
  status: DocStatus;
  expires?: string;
  uploadedOn?: string;
  fileSize?: string;
}

const documents: Document[] = [
  {
    id: "1",
    name: "Commercial Driver's License",
    category: "License",
    status: "valid",
    expires: "2027-03-14",
    uploadedOn: "2024-03-15",
    fileSize: "1.2 MB",
  },
  {
    id: "2",
    name: "DOT Medical Certificate",
    category: "Medical",
    status: "expiring",
    expires: "2026-06-02",
    uploadedOn: "2024-06-03",
    fileSize: "840 KB",
  },
  {
    id: "3",
    name: "Annual Vehicle Inspection",
    category: "Vehicle",
    status: "expiring",
    expires: "2026-06-15",
    uploadedOn: "2025-06-15",
    fileSize: "2.1 MB",
  },
  {
    id: "4",
    name: "Drug & Alcohol Test Results",
    category: "Compliance",
    status: "valid",
    expires: undefined,
    uploadedOn: "2025-01-10",
    fileSize: "510 KB",
  },
  {
    id: "5",
    name: "Hazmat Endorsement",
    category: "License",
    status: "valid",
    expires: "2027-03-14",
    uploadedOn: "2024-03-15",
    fileSize: "650 KB",
  },
  {
    id: "6",
    name: "Cab Card / Registration",
    category: "Vehicle",
    status: "valid",
    expires: "2026-12-31",
    uploadedOn: "2026-01-04",
    fileSize: "310 KB",
  },
  {
    id: "7",
    name: "Proof of Insurance",
    category: "Vehicle",
    status: "expired",
    expires: "2026-04-30",
    uploadedOn: "2025-05-01",
    fileSize: "720 KB",
  },
  {
    id: "8",
    name: "IFTA License",
    category: "Compliance",
    status: "missing",
  },
];

const statusConfig: Record<DocStatus, { label: string; color: string; bg: string }> = {
  valid: { label: "Valid", color: "text-green-700", bg: "bg-green-100" },
  expiring: { label: "Expiring Soon", color: "text-amber-700", bg: "bg-amber-100" },
  expired: { label: "Expired", color: "text-red-700", bg: "bg-red-100" },
  missing: { label: "Missing", color: "text-gray-600", bg: "bg-gray-100" },
};

const categories = ["All", "License", "Medical", "Vehicle", "Compliance"];

function UploadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

export default function DocumentsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [dragging, setDragging] = useState(false);

  const filtered =
    activeCategory === "All"
      ? documents
      : documents.filter((d) => d.category === activeCategory);

  const summary = {
    valid: documents.filter((d) => d.status === "valid").length,
    expiring: documents.filter((d) => d.status === "expiring").length,
    expired: documents.filter((d) => d.status === "expired").length,
    missing: documents.filter((d) => d.status === "missing").length,
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Documents & Compliance</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your DOT-required documents and certifications</p>
        </div>
        <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <UploadIcon />
          Upload Document
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {(["valid", "expiring", "expired", "missing"] as DocStatus[]).map((status) => {
          const cfg = statusConfig[status];
          return (
            <div key={status} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide capitalize">{cfg.label}</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">{summary[status]}</p>
            </div>
          );
        })}
      </div>

      <div
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); setDragging(false); }}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragging ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-orange-500 cursor-pointer hover:underline">Click to upload</span>
            {" "}or drag and drop
          </p>
          <p className="text-xs text-gray-400">PDF, JPG, PNG up to 10 MB</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 pt-4 pb-0 border-b border-gray-100 flex gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeCategory === cat
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.map((doc) => {
            const cfg = statusConfig[doc.status];
            return (
              <div key={doc.id} className="flex items-center gap-4 px-6 py-4">
                <div className="shrink-0">
                  <FileIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {doc.uploadedOn ? `Uploaded ${doc.uploadedOn}` : "Not uploaded"}
                    {doc.fileSize ? ` · ${doc.fileSize}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  {doc.expires && (
                    <p className="text-xs text-gray-400">Expires {doc.expires}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {doc.status !== "missing" && (
                    <button className="text-xs text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded border border-gray-200 hover:border-gray-300 transition-colors">
                      View
                    </button>
                  )}
                  <button className="text-xs text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded border border-gray-200 hover:border-gray-300 transition-colors">
                    {doc.status === "missing" ? "Upload" : "Replace"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
