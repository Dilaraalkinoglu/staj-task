"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "E-posta veya şifre hatalı.");
        return;
      }

      const data = await res.json();
      saveToken(data.token);
      localStorage.setItem("user_full_name", data.fullName ?? "");
      localStorage.setItem("user_email", data.email ?? "");
      localStorage.setItem("user_role", data.role ?? "");
      router.push("/dashboard");
    } catch {
      setError("Sunucuya bağlanılamadı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">F</div>
          <span className="login-logo-text">FinansApp</span>
        </div>

        <h1 className="login-title">Tekrar hoş geldiniz</h1>
        <p className="login-subtitle">
          Devam etmek için hesabınıza giriş yapın.
        </p>

        <form className="login-form" onSubmit={handleLogin}>
          <div>
            <label className="login-label" htmlFor="email">
              E-posta adresi
            </label>
            <input
              id="email"
              type="email"
              className="login-input"
              placeholder="ornek@sirket.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="login-label" htmlFor="password">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              className="login-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}