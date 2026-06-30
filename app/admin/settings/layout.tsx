import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminNavbar from "../dashboard/AdminNavbar";

export default async function AdminSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Admin Navbar */}
      <AdminNavbar user={session?.user} />

      {/* Full width sidebar container */}
      <div className="flex-1 flex flex-row w-full overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
