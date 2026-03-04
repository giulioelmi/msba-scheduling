"use client";

import { useState, useTransition } from "react";
import { Upload } from "lucide-react";

interface Props {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean; count?: number }>;
  placeholder?: string;
}

export default function CsvImportForm({ action, placeholder }: Props) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; count?: number } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await action(formData);
      setResult(res);
      if (res.success) {
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        name="csv"
        className="input min-h-[120px] font-mono text-xs"
        placeholder={placeholder}
        required
      />
      {result?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{result.error}</p>
      )}
      {result?.count !== undefined && (
        <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
          {result.count} record{result.count !== 1 ? "s" : ""} imported successfully.
        </p>
      )}
      <button type="submit" disabled={isPending} className="btn-secondary">
        <Upload className="h-4 w-4" />
        {isPending ? "Importing…" : "Import"}
      </button>
    </form>
  );
}
