"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import EditPlaceForm from "./edit-place-form";

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

type Props = {
  places: Place[];
};

export default function PlacesManager({ places }: Props) {
  const router = useRouter();
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);

  const sortedPlaces = useMemo(
    () => [...places].sort((a, b) => a.name.localeCompare(b.name, "cs")),
    [places]
  );

  async function handleDelete(place: Place) {
    const confirmed = window.confirm(`Opravdu smazat místo "${place.name}"?`);
    if (!confirmed) return;

    const { error } = await supabase.from("places").delete().eq("id", place.id);

    if (error) {
      alert(`Chyba při mazání: ${error.message}`);
      return;
    }

    router.refresh();
  }

  return (
    <>
      <div style={{ display: "grid", gap: 16 }}>
        {sortedPlaces.map((place) => (
          <div
            key={place.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 22,
              padding: 20,
              display: "flex",
              justifyContent: "space-between",
              gap: 18,
              alignItems: "start",
              flexWrap: "wrap",
              background: "#ffffff",
              boxShadow: "0 12px 28px rgba(15,23,42,0.06)",
            }}
          >
            <div style={{ flex: 1, minWidth: 280 }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 24,
                    color: "#111827",
                    lineHeight: 1.2,
                  }}
                >
                  {place.name}
                </h3>

                <span
                  style={{
                    padding: "7px 11px",
                    borderRadius: 999,
                    background: place.visible ? "#dcfce7" : "#f3f4f6",
                    color: place.visible ? "#166534" : "#6b7280",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {place.visible ? "Veřejné" : "Skryté"}
                </span>
              </div>

              <p
                style={{
                  margin: "0 0 12px",
                  color: "#475569",
                  lineHeight: 1.6,
                }}
              >
                {place.short_description}
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                {place.trip_types?.map((type) => (
                  <span
                    key={type}
                    style={{
                      padding: "7px 11px",
                      borderRadius: 999,
                      background: "#eef2ff",
                      color: "#1d4ed8",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {type}
                  </span>
                ))}
              </div>

              <div
                style={{
                  fontSize: 14,
                  color: "#64748b",
                  lineHeight: 1.7,
                }}
              >
                <div>
                  <strong style={{ color: "#334155" }}>Adresa:</strong> {place.address}
                </div>
                <div>
                  <strong style={{ color: "#334155" }}>Souřadnice:</strong> {place.lat}, {place.lng}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: 10,
                minWidth: 180,
              }}
            >
              <button
                type="button"
                onClick={() => setEditingPlace(place)}
                style={{
                  padding: "12px 16px",
                  borderRadius: 16,
                  border: 0,
                  background: "#111827",
                  color: "white",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 10px 20px rgba(17,24,39,0.16)",
                }}
              >
                Upravit místo
              </button>

              <button
                type="button"
                onClick={() => handleDelete(place)}
                style={{
                  padding: "12px 16px",
                  borderRadius: 16,
                  border: 0,
                  background: "#b91c1c",
                  color: "white",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 10px 20px rgba(185,28,28,0.18)",
                }}
              >
                Smazat místo
              </button>
            </div>
          </div>
        ))}

        {!sortedPlaces.length && (
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 20,
              background: "#f8fafc",
              padding: 20,
              color: "#64748b",
            }}
          >
            Zatím nejsou uložena žádná místa.
          </div>
        )}
      </div>

      {editingPlace && (
        <EditPlaceForm
          place={editingPlace}
          onClose={() => setEditingPlace(null)}
        />
      )}
    </>
  );
}