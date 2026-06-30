import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as any)?.role;

      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnLogin = nextUrl.pathname === "/login";

      // 1. Unauthenticated users trying to access protected paths
      if (isOnAdmin || isOnDashboard) {
        if (!isLoggedIn) {
          return false; // Redirects to pages.signIn (/login)
        }
      }

      // 2. Authenticated users role-based protection & redirection
      if (isLoggedIn) {
        // Prevent GUEST from accessing admin paths
        if (isOnAdmin && role === "GUEST") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }

        // Prevent ADMIN/MANAGER/SUPERADMIN from accessing guest dashboard paths
        if (isOnDashboard && role !== "GUEST") {
          return Response.redirect(new URL("/admin/dashboard", nextUrl));
        }

        // Redirect base /admin route to /admin/dashboard
        if (nextUrl.pathname === "/admin" && role !== "GUEST") {
          return Response.redirect(new URL("/admin/dashboard", nextUrl));
        }

        // Redirect logged-in users away from /login
        if (isOnLogin) {
          if (role !== "GUEST") {
            return Response.redirect(new URL("/admin/dashboard", nextUrl));
          } else {
            return Response.redirect(new URL("/dashboard", nextUrl));
          }
        }
      }

      return true;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;

