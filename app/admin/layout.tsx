import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminNavbar from "./dashboard/AdminNavbar";
import AdminSidebar from "./dashboard/AdminSidebar";

/**
 * app/admin/layout.tsx
 *
 * This is the single shared layout for ALL /admin/* routes.
 * - Auth guard runs here (Server Component).
 * - AdminNavbar + AdminSidebar are rendered here so every sub-page
 *   automatically gets the full shell without repeating it.
 * - Sub-pages receive `children` and can be pure Server Components.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If not authenticated or not a staff role, redirect to login
  if (!session) {
    redirect("/login");
  }
  const role = (session.user as any)?.role;
  if (role === "GUEST") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* ── Shared Top Navigation Bar ─────────────────────────────────────── */}
      <AdminNavbar user={session.user} />

      {/* ── Sidebar + Page Content ────────────────────────────────────────── */}
      <div className="flex flex-1 w-full overflow-x-hidden">
        {/* Sidebar rendered once for all admin sub-pages */}
        <AdminSidebar />

        {/* Each sub-page fills this area */}
        <main className="flex-1 min-h-[calc(100vh-60px)] bg-slate-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
