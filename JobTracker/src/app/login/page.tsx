"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Briefcase, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get("error");
      if (urlError) setError(urlError);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setSuccessMsg("Check your email for the confirmation link.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Logo mark */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
          }}
        >
          <Briefcase size={18} color="#fff" />
        </div>
        <h1
          style={{
            fontSize: "1.375rem",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
            marginBottom: 4,
          }}
        >
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0 }}>
          {isLogin
            ? "Sign in to continue to JobTracker"
            : "Start tracking your job applications"}
        </p>
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          backgroundColor: "var(--bg-raised)",
          border: "0.5px solid var(--border)",
          borderRadius: 10,
          padding: 28,
        }}
      >
        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Error */}
          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 6,
                border: "0.5px solid var(--danger-border)",
                backgroundColor: "var(--danger-bg)",
                color: "var(--danger-text)",
                fontSize: "0.8125rem",
                fontWeight: 400,
              }}
            >
              {error}
            </div>
          )}

          {/* Success */}
          {successMsg && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 6,
                border: "0.5px solid var(--success-border)",
                backgroundColor: "var(--success-bg)",
                color: "var(--success-text)",
                fontSize: "0.8125rem",
                fontWeight: 400,
              }}
            >
              {successMsg}
            </div>
          )}

          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              htmlFor="email"
              style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-secondary)" }}
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base focus-ring"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              htmlFor="password"
              style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-secondary)" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base focus-ring"
              placeholder="••••••••"
            />
          </div>

          {/* Submit */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "10px 16px", marginTop: 4 }}
          >
            {loading ? (
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              isLogin ? "Sign in" : "Create account"
            )}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "20px 0",
          }}
        >
          <div style={{ flex: 1, height: "0.5px", backgroundColor: "var(--border)" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>or</span>
          <div style={{ flex: 1, height: "0.5px", backgroundColor: "var(--border)" }} />
        </div>

        {/* Toggle */}
        <button
          id="auth-toggle-btn"
          onClick={() => { setIsLogin(!isLogin); setError(null); setSuccessMsg(null); }}
          className="btn-ghost"
          style={{ width: "100%", justifyContent: "center", padding: "10px 16px" }}
        >
          {isLogin ? "Create a new account" : "Sign in to existing account"}
        </button>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
