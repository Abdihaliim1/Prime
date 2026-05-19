"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteApplicationButton({ appId, driverName }: { appId: string; driverName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = confirm(
      `Permanently delete this application?\n\nDriver: ${driverName}\nID: ${appId}\n\nThis removes the application record and all uploaded documents. This cannot be undone.`
    );
    if (!confirmed) return;
    setLoading(true);
    const res = await fetch(`/api/applications/${appId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/applications");
      router.refresh();
    } else {
      setLoading(false);
      alert("Failed to delete application.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-300 hover:border-red-600 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
      </svg>
      {loading ? "Deleting…" : "Delete Application"}
    </button>
  );
}
