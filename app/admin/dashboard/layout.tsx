import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminNavbar from "./AdminNavbar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Guard fallback in case middleware is bypassed
  if (!session) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-[#060b13] text-slate-100 flex flex-col">
      {/* Admin Navbar */}
      <AdminNavbar user={session.user} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
