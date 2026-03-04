"use client";

import { useState, useTransition } from "react";
import { createCycle } from "@/app/actions/cycles";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

export default function NewCyclePage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createCycle(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="max-w-md">
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
        <Link href="/admin" className="hover:text-[#2774AE] transition">Cycles</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium">New Cycle</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Interview Cycle</h1>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Cycle Name</label>
            <input
              name="name"
              className="input"
              placeholder="MSBA 2026 Second Round"
              required
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-1">
              You can configure dates and constraints after creating the cycle.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Link href="/admin" className="btn-secondary flex-1 justify-center">Cancel</Link>
            <button type="submit" disabled={isPending} className="btn-primary flex-1 justify-center">
              <Plus className="h-4 w-4" />
              {isPending ? "Creating…" : "Create Cycle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
