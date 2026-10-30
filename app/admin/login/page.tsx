"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setMessage("");
    try {
      if (recovery) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/admin/reset-password`,
        });
        if (error) {
          setErrorMessage("E-mail se nepodařilo odeslat. Zkus to za chvíli znovu.");
        } else {
          setMessage("Pokud je tento e-mail registrovaný, přijde na něj odkaz pro nastavení nového hesla. Otevři nejnovější zprávu a zkontroluj i spam.");
        }
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setErrorMessage("Přihlášení se nepodařilo. Zkontroluj e-mail a heslo.");
        return;
      }
      window.location.href = "/admin";
    } catch {
      setErrorMessage("Spojení se nezdařilo. Zkontroluj připojení a zkus to znovu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f8fafc 0%, #eef2ff 35%, #f8fafc 100%)",
        fontFamily: "Arial, sans-serif",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div className="login-grid login-shell"
        style={{
          width: "100%",
          maxWidth: 980,
          display: "grid",
          gap: 24,
          alignItems: "stretch",
        }}
      >
        <section className="login-intro"
          style={{
            background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
            color: "white",
            borderRadius: 28,
            padding: 32,
            boxShadow: "0 30px 60px rgba(15,23,42,0.20)",
            display: "grid",
            alignContent: "space-between",
            minHeight: 520,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                padding: "8px 12px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.10)",
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 14,
              }}
            >
              Admin přístup
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(28px, 5vw, 40px)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Správa webu
              <br />
              Tipy na výlety
            </h1>

            <p
              style={{
                marginTop: 16,
                color: "rgba(255,255,255,0.78)",
                fontSize: 18,
                lineHeight: 1.7,
                maxWidth: 520,
              }}
            >
              Přihlaste se do administrace a spravujte lokality, jejich popisy,
              fotografie a veřejné zobrazení.
            </p>
          </div>

          <div className="login-intro-details"
            style={{
              display: "grid",
              gap: 12,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 18,
                padding: 18,
              }}
            >
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
                Funkce administrace
              </div>
              <div style={{ marginTop: 8, lineHeight: 1.7 }}>
                Přidávání míst, editace, upload fotek, pořadí galerie a správa
                viditelnosti.
              </div>
            </div>
          </div>
        </section>

        <form className="login-form"
          onSubmit={handleLogin}
          style={{
            background: "#ffffff",
            borderRadius: 28,
            padding: 28,
            border: "1px solid #e5e7eb",
            boxShadow: "0 20px 40px rgba(15,23,42,0.08)",
            display: "grid",
            alignContent: "start",
            gap: 16,
          }}
        >
          <div>
            <h2
              style={{
                marginTop: 0,
                marginBottom: 8,
                fontSize: 28,
                color: "#111827",
              }}
            >
              {recovery ? "Obnovení hesla" : "Přihlášení"}
            </h2>
            <p
              style={{
                color: "#64748b",
                marginTop: 0,
                marginBottom: 0,
                lineHeight: 1.6,
              }}
            >
              {recovery ? "Zadej e-mail svého účtu. Pošleme ti odkaz pro nastavení nového hesla." : "Zadej svůj e-mail a heslo."}
            </p>
          </div>

          <div>
            <label
              htmlFor="login-email"
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 800,
                color: "#111827",
              }}
            >
              E-mail
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {!recovery && <div>
            <label
              htmlFor="login-password"
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 800,
                color: "#111827",
              }}
            >
              Heslo
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>}

          {message && <div role="status" style={{ color: "#166534", background: "#dcfce7", padding: 14, borderRadius: 16 }}>{message}</div>}

          {errorMessage && (
            <div
              role="alert"
              style={{
                color: "#b91c1c",
                background: "#fee2e2",
                border: "1px solid #fecaca",
                padding: 14,
                borderRadius: 16,
              }}
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 16,
              border: 0,
              background: "#111827",
              color: "white",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 12px 24px rgba(17,24,39,0.18)",
            }}
          >
            {loading ? (recovery ? "Odesílám…" : "Přihlašuji...") : (recovery ? "Poslat odkaz pro obnovu hesla" : "Přihlásit")}
          </button>
          <button type="button" disabled={loading} onClick={() => {
            setRecovery(!recovery);
            setPassword("");
            setMessage("");
            setErrorMessage("");
          }} style={{ background: "transparent", border: 0, color: "#1d4ed8", cursor: "pointer", padding: 8 }}>
            {recovery ? "Zpět na přihlášení" : "Zapomenuté heslo / nastavit nové heslo"}
          </button>
        </form>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 14,
  borderRadius: 16,
  border: "1px solid #d1d5db",
  font: "inherit",
  background: "#f8fafc",
};
