"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    // The client processes the recovery token from the email before getSession resolves.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setReady(Boolean(session));
    });
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      setReady(Boolean(data.session) && !sessionError);
      setChecking(false);
    }).catch(() => {
      if (active) {
        setReady(false);
        setChecking(false);
      }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!ready || saving) return;
    if (password.length < 8) {
      setError("Heslo musí mít alespoň 8 znaků.");
      return;
    }
    if (password !== confirmation) {
      setError("Zadaná hesla se neshodují.");
      return;
    }
    setSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setPassword("");
      setConfirmation("");
      setDone(true);
    } catch {
      setError("Heslo se nepodařilo uložit. Zkontroluj připojení a zkus to znovu.");
    } finally {
      setSaving(false);
    }
  }

  return <main style={{ minHeight: "100vh", padding: "48px 20px", background: "#f1f5f9", fontFamily: "Arial, sans-serif" }}>
    <section style={{ maxWidth: 480, margin: "0 auto", background: "white", padding: 28, borderRadius: 24, border: "1px solid #e5e7eb" }}>
      <h1 style={{ marginTop: 0, color: "#111827" }}>Nastavit nové heslo</h1>
      {checking ? <p role="status">Ověřuji odkaz…</p> : done ? <>
        <p role="status">Heslo bylo změněno. Příště se přihlas novým heslem.</p>
        <Link href="/admin">Pokračovat do administrace</Link>
      </> : !ready ? <>
        <p role="alert">Odkaz není platný nebo už vypršel. Vyžádej si nový odkaz a otevři nejnovější e-mail.</p>
        <Link href="/admin/login">Zpět na přihlášení a obnovu hesla</Link>
      </> : <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
        <p>Zvol heslo s alespoň 8 znaky.</p>
        <label htmlFor="new-password">Nové heslo</label>
        <input id="new-password" type="password" autoComplete="new-password" minLength={8} required
          disabled={saving} value={password} onChange={(event) => setPassword(event.target.value)} style={inputStyle} />
        <label htmlFor="confirm-password">Potvrzení nového hesla</label>
        <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required
          disabled={saving} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} style={inputStyle} />
        {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
        <button type="submit" disabled={saving} style={{ padding: 14, borderRadius: 14, background: "#111827", color: "white", border: 0, cursor: "pointer" }}>
          {saving ? "Ukládám…" : "Uložit nové heslo"}
        </button>
      </form>}
    </section>
  </main>;
}

const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: 14, borderRadius: 14, border: "1px solid #d1d5db", font: "inherit" };
