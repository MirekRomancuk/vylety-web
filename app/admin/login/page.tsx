"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage("Přihlášení se nepodařilo. Zkontroluj e-mail a heslo.");
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <main
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
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          display: "grid",
          gridTemplateColumns: "1fr 420px",
          gap: 24,
          alignItems: "stretch",
        }}
      >
        <section
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
                fontSize: 40,
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

          <div
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

        <form
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
              Přihlášení
            </h2>
            <p
              style={{
                color: "#64748b",
                marginTop: 0,
                marginBottom: 0,
                lineHeight: 1.6,
              }}
            >
              Zadej svůj e-mail a heslo.
            </p>
          </div>

          <div>
            <label
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
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {errorMessage && (
            <div
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
            {loading ? "Přihlašuji..." : "Přihlásit"}
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