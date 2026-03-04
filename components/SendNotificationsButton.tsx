"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";

interface Props {
  action: () => Promise<{ error?: string; success?: boolean; sent?: number; failed?: number }>;
  pendingCount: number;
}

export default function SendNotificationsButton({ action, pendingCount }: Props) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ sent?: number; failed?: number; error?: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleConfirm() {
    setShowConfirm(false);
    startTransition(async () => {
      const res = await action();
      setResult(res);
    });
  }

  if (pendingCount === 0) return null;

  return (
    <>
      <div className="flex flex-col items-end gap-2">
        <button onClick={() => setShowConfirm(true)} disabled={isPending} className="btn-primary">
          <Send className="h-4 w-4" />
          {isPending ? "Sending…" : `Send ${pendingCount} Notifications`}
        </button>
        {result?.error && <p className="text-sm text-red-600">{result.error}</p>}
        {result?.sent !== undefined && (
          <p className="text-sm text-green-600">
            {result.sent} emails sent{result.failed ? `, ${result.failed} failed` : ""}.
          </p>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="font-bold text-gray-900 mb-2">Send Match Notifications</h2>
            <p className="text-sm text-gray-500 mb-6">
              This will email every matched student and candidate their interview details.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button onClick={handleConfirm} className="btn-primary flex-1 justify-center">
                <Send className="h-4 w-4" />
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
