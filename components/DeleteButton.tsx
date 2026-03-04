"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

interface Props {
  action: () => Promise<{ error?: string; success?: boolean }>;
  confirm: string;
}

export default function DeleteButton({ action, confirm }: Props) {
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
        className="text-gray-400 hover:text-red-500 transition p-1 rounded"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="font-bold text-gray-900 mb-2">Are you sure?</h2>
            <p className="text-sm text-gray-500 mb-6">{confirm}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button onClick={handleConfirm} className="btn-danger flex-1 justify-center">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
