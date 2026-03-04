"use client";

import { useState, useTransition } from "react";
import { Zap } from "lucide-react";

interface Props {
  action: () => Promise<{
    error?: string;
    success?: boolean;
    matched?: number;
    unmatched_candidates?: number;
    unmatched_students?: number;
  }>;
}

export default function RunMatchingButton({ action }: Props) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    matched?: number;
    unmatched_candidates?: number;
    error?: string;
  } | null>(null);

  function run() {
    setResult(null);
    startTransition(async () => {
      const res = await action();
      setResult(res);
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button onClick={run} disabled={isPending} className="btn-primary">
        <Zap className="h-4 w-4" />
        {isPending ? "Running…" : "Run Matching"}
      </button>
      {result?.error && (
        <p className="text-sm text-red-600">{result.error}</p>
      )}
      {result?.matched !== undefined && (
        <p className="text-sm text-green-600">
          {result.matched} matches generated
          {result.unmatched_candidates ? ` · ${result.unmatched_candidates} unmatched` : ""}.
        </p>
      )}
    </div>
  );
}
