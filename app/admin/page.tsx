"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import LogoutButton from "./logout-button";
import NewPlaceForm from "./new-place-form";
import PlacesManager from "./places-manager";

type UserState = {
  email?: string;
};

type Place = {
  id: string;
  name: string;
  short_description: string;
  long_description: string;
  address: string;
  lat: number;
  lng: number;
  trip_types: string[];
  visible: boolean;
};

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserState | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/admin/login");
        return;
      }

      setUser({ email: user.email ?? undefined });

      const { data: placesData } = await supabase
        .from("places")
        .select("*")
        .order("created_at", { ascending: false });

      setPlaces((placesData || []) as Place[]);
      setLoading(false);
    }

    init();
  }, [router]);

  useEffect(() => {
    async function reloadPlaces() {
      const { data } = await supabase
        .from("places")
        .select("*")
        .order("created_at", { ascending: false });

      setPlaces((data || []) as Place[]);
    }

    const onFocus = () => {
      reloadPlaces();
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #f8fafc 0%, #eef2ff 35%, #f8fafc 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "28px 20px 40px",
          }}
        >
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 24,
              background: "#ffffff",
              boxShadow: "0 20px 40px rgba(15,23,42,0.08)",
              padding: 24,
            }}
          >
            Ověřuji přihlášení...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f8fafc 0%, #eef2ff 35%, #f8fafc 100%)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "28px 20px 40px",
        }}
      >
        <section
          style={{
            background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
            color: "white",
            borderRadius: 28,
            padding: 28,
            boxShadow: "0 30px 60px rgba(15,23,42,0.20)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 20,
              gridTemplateColumns: "1.2fr 0.8fr",
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
                Administrace webu
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 40,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                Správa výletů
                <br />
                Polička a okolí
              </h1>

              <p
                style={{
                  marginTop: 14,
                  marginBottom: 0,
                  color: "rgba(255,255,255,0.78)",
                  fontSize: 18,
                  lineHeight: 1.6,
                  maxWidth: 640,
                }}
              >
                Přidávej nová místa, upravuj jejich obsah, nahrávej fotografie a
                spravuj veřejně viditelné lokality.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gap: 12,
                alignContent: "start",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 20,
                  padding: 18,
                }}
              >
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
                  Přihlášený uživatel
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }}>
                  {user?.email}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 20,
                  padding: 18,
                }}
              >
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
                  Počet míst
                </div>
                <div style={{ fontSize: 34, fontWeight: 800, marginTop: 4 }}>
                  {places.length}
                </div>
              </div>

              <div style={{ marginTop: 4 }}>
                <LogoutButton />
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            marginBottom: 24,
          }}
        >
          <NewPlaceForm />
        </section>

        <section
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 24,
            background: "#ffffff",
            boxShadow: "0 20px 40px rgba(15,23,42,0.08)",
            padding: 24,
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 26,
                color: "#111827",
              }}
            >
              Správa existujících míst
            </h2>
            <p
              style={{
                marginTop: 8,
                marginBottom: 0,
                color: "#64748b",
                lineHeight: 1.6,
              }}
            >
              Upravuj, maž a spravuj uložené lokality včetně jejich fotek.
            </p>
          </div>

          <PlacesManager places={places} />
        </section>
      </div>
    </main>
  );
}