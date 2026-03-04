"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

interface Props {
  action: () => Promise<{ error?: string; success?: boolean }>;
  count: number;
}

export default function ClearMatchesButton({ action, count }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleConfirm() {
    setShowConfirm(false);
    startTransition(async () => {
      await action();
    });
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isPending}
        className="btn-secondary text-red-600 hover:bg-red-50 border-red-200"
      >
        <Trash2 className="h-4 w-4" />
        {isPending ? "Clearing…" : "Clear All"}
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="font-bold text-gray-900 mb-2">Clear all matches?</h2>
            <p className="text-sm text-gray-500 mb-6">
              This will delete all {count} matches. You can re-run the matching algorithm afterwards.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button onClick={handleConfirm} className="btn-danger flex-1 justify-center">
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
