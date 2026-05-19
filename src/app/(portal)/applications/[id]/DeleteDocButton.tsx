"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteDocButton({ appId, field, url }: { appId: string; field: string; url: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    setLoading(true);
    await fetch(`/api/applications/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleteDoc: field, url }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title="Delete document"
      className="text-xs text-red-400 hover:text-red-600 px-2.5 py-1.5 border border-red-200 hover:border-red-400 rounded-lg transition-colors disabled:opacity-40 shrink-0"
    >
      {loading ? "…" : "Delete"}
    </button>
  );
}
