"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { login, isLoggedIn } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) router.replace("/admin/dashboard");
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const ok = login(email.trim(), password);
      if (ok) {
        router.replace("/admin/dashboard");
      } else {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
      }
    }, 700);
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-4"
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #14532d 100%)",
      }}
    >
      {/* Ambient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-[480px] w-[480px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #22c55e, transparent 70%)" }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/15 p-10 shadow-2xl backdrop-blur-2xl"
        style={{ background: "rgba(15, 23, 42, 0.82)" }}
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div
            className="grid size-16 place-items-center rounded-2xl shadow-xl"
            style={{
              background: "linear-gradient(135deg, #1e40af, #16a34a)",
            }}
          >
            <Shield size={30} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black text-white">Admin Portal</h1>
            <p className="mt-1 text-sm text-white/60">
              Constituency Project Management
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-white/60">
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="eckintosh@gmail.com"
              className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3.5 text-sm font-semibold text-white placeholder:text-white/30 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-white/60">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3.5 pr-12 text-sm font-semibold text-white placeholder:text-white/30 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/12 px-4 py-3 text-sm text-red-300">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            id="admin-login-btn"
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl py-4 text-sm font-black text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
            style={{
              background: loading
                ? "rgba(30,64,175,0.5)"
                : "linear-gradient(135deg, #1e40af, #16a34a)",
            }}
          >
            {loading ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Verifying…
              </>
            ) : (
              <>
                <LogIn size={17} />
                Sign In to Admin
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/30">
          Restricted access — authorised personnel only
        </p>
      </div>
    </main>
  );
}
