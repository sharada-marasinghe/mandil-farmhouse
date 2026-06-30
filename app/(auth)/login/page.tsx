"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaAnchor } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError("Please fill in all credentials.");
      setLoading(false);
      return;
    }

    try {
      // Sign in using NextAuth v5 client-side signIn hook.
      // We map the guest's email address directly to the credentials provider's username field.
      const res = await signIn("credentials", {
        username: email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email address or password.");
        setLoading(false);
      } else {
        setSuccess("Signed in successfully. Redirecting...");
        
        // Retrieve current session to dynamically check role and route destination
        const session = await getSession();
        const role = (session?.user as any)?.role;

        const searchParams = new URLSearchParams(window.location.search);
        const callbackUrl = searchParams.get("callbackUrl");

        setTimeout(() => {
          if (callbackUrl) {
            router.push(callbackUrl);
          } else if (role !== "GUEST") {
            router.push("/admin/dashboard");
          } else {
            router.push("/dashboard");
          }
          router.refresh();
        }, 1200);
      }
    } catch (err: any) {
      console.error("[Login] Authentication error:", err);
      setError("An unexpected authentication error occurred.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (err) {
      setError("Google authentication failed.");
    }
  };

  return (
    <main className="w-full min-h-screen bg-slate-50 flex items-stretch overflow-hidden">
      
      {/* ─── LEFT PANEL: Hero Banner & Taglines (Desktop Only) ─────────────── */}
      <section className="hidden md:flex md:w-1/2 relative flex-col justify-between p-12 bg-emerald-950 text-white overflow-hidden select-none">
        {/* Real high-res background image */}
        <Image
          src="/sunset-canopy.png"
          alt="Mandil Farmhouse Sunset Retreat"
          fill
          priority
          className="object-cover opacity-35 mix-blend-luminosity scale-102"
        />
        {/* Soft emerald wash overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950 via-emerald-900/80 to-teal-950/60" />

        {/* Top brand identity */}
        <Link href="/" className="relative z-10 flex items-center gap-2.5 group self-start">
          <div className="relative w-9 h-9 rounded-xl bg-emerald-650 flex items-center justify-center shadow-md">
            <FaAnchor className="text-white text-xs" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 flex items-center justify-center animate-pulse">
              <HiOutlineSparkles className="text-[6px] text-amber-900" />
            </div>
          </div>
          <div>
            <span className="font-display font-bold text-base text-white tracking-wide">
              Mandil
            </span>
            <span className="block text-[8px] font-bold tracking-widest text-emerald-400 uppercase leading-none mt-0.5">
              Lakeside Farmhouse
            </span>
          </div>
        </Link>

        {/* Dynamic center taglines */}
        <div className="relative z-10 space-y-4 max-w-md my-auto">
          <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded-full">
            Exclusive Lakeside Escapes
          </span>
          <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-white leading-tight">
            Your Premium Lakeside Escape Awaits.
          </h1>
          <p className="text-slate-200 text-xs leading-relaxed">
            Log in to manage your private luxury villa bookings, tailor family day-outs, and customize exclusive boat safaris across the peaceful waters of Bolgoda Lake.
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[10px] text-slate-400">
          © {new Date().getFullYear()} Mandil Farmhouse. All rights reserved.
        </div>
      </section>

      {/* ─── RIGHT PANEL: Credentials Form Workspace ─────────────────────── */}
      <section className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50 relative">
        
        {/* Floating background blobs for layout decoration */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />

        <div className="w-full max-w-md bg-white/85 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-slate-200/50 relative z-10 text-left">
          
          {/* Header Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Sign In</h2>
            <p className="text-slate-400 text-xs mt-1">Please enter your guest credentials to manage reservations.</p>
          </div>

          <form onSubmit={handleCredentialsLogin} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-semibold">
                <FiAlertCircle className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold">
                <FiCheckCircle className="flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-450">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FiMail /></span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#00966B] transition-colors text-xs"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-450">Password</label>
                <Link href="#" className="text-[10px] font-semibold text-[#00966B] hover:text-[#007c58] transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FiLock /></span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#00966B] transition-colors text-xs"
                  required
                />
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center gap-2 select-none pt-1">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#00966B] focus:ring-[#00966B] cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-slate-500 font-semibold cursor-pointer">
                Remember this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#00966B] hover:bg-[#007c58] active:bg-[#006447] text-white font-bold text-xs transition-colors shadow-sm hover:shadow-md active:scale-[0.985] flex items-center justify-center gap-2 cursor-pointer mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Sign In to Mandil"
              )}
            </button>
          </form>

          {/* Divider option */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">Or continue with</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* OAuth button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 bg-white hover:bg-slate-50 border border-slate-200 active:bg-slate-100 rounded-xl text-slate-650 font-bold text-xs transition-all duration-200 cursor-pointer shadow-2xs"
          >
            <FcGoogle className="text-base" />
            <span>Continue with Google</span>
          </button>

          {/* Route toggle link */}
          <div className="mt-8 text-center">
            <span className="text-xs text-slate-450 font-semibold">New to Mandil Farmhouse? </span>
            <Link href="/register" className="text-xs font-bold text-[#00966B] hover:text-[#007c58] transition-colors">
              Create an account
            </Link>
          </div>

        </div>
      </section>

    </main>
  );
}
