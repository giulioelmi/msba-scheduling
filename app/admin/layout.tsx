import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import Link from "next/link";
import { LogOut, LayoutDashboard } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="bg-[#003B5C] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 hover:opacity-90 transition">
            <div className="h-8 w-8 rounded-full bg-[#FFD100] flex items-center justify-center">
              <span className="text-[#003B5C] font-black text-xs">UCLA</span>
            </div>
            <span className="font-bold text-lg">MSBA Interview Scheduler</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-blue-200 text-sm hidden sm:block">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm text-blue-200 hover:text-white transition"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Gold accent bar */}
      <div className="h-1 bg-[#FFD100]" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
