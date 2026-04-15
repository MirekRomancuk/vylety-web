import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background:
          "linear-gradient(180deg, #f8fafc 0%, #eef2ff 35%, #f8fafc 100%)",
        fontFamily: "Arial, sans-serif",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 700,
          width: "100%",
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 24,
          padding: 32,
          boxShadow: "0 20px 40px rgba(15,23,42,0.08)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "8px 12px",
            borderRadius: 999,
            background: "#eef2ff",
            color: "#1d4ed8",
            fontWeight: 800,
            marginBottom: 16,
          }}
        >
          Chyba 404
        </div>

        <h1 style={{ marginTop: 0, marginBottom: 12, fontSize: 36 }}>
          Stránka nebyla nalezena
        </h1>

        <p style={{ color: "#64748b", lineHeight: 1.7, marginBottom: 24 }}>
          Tato stránka neexistuje nebo byla přesunuta.
        </p>

        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 18px",
            borderRadius: 14,
            background: "#111827",
            color: "white",
            textDecoration: "none",
            fontWeight: 800,
          }}
        >
          Zpět na homepage
        </Link>
      </div>
    </main>
  );
}