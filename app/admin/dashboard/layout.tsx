/**
 * app/admin/dashboard/layout.tsx
 *
 * This layout is intentionally minimal. The AdminNavbar, AdminSidebar,
 * and auth guard all live in the parent app/admin/layout.tsx.
 * This file exists only so Next.js can nest the route correctly.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
