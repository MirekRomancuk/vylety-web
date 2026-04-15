"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const tripTypes = [
  "Přírodní zajímavost",
  "Zajímavá trasa",
  "Historické místo",
  "Rozhledna a výhled",
  "Atrakce pro děti",
  "Jiné aktivity",
  "Restaurace",
];

export default function NewPlaceForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [selectedTripTypes, setSelectedTripTypes] = useState<string[]>([]);
  const [visible, setVisible] = useState(true);
  const [files, setFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function toggleTripType(type: string) {
    setSelectedTripTypes((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { data: placeData, error: placeError } = await supabase
      .from("places")
      .insert({
        name,
        short_description: shortDescription,
        long_description: longDescription,
        address,
        lat: Number(lat),
        lng: Number(lng),
        trip_types: selectedTripTypes,
        visible,
      })
      .select()
      .single();

    if (placeError || !placeData) {
      setSaving(false);
      setMessage(`Chyba při ukládání místa: ${placeError?.message ?? "Neznámá chyba"}`);
      return;
    }

    const placeId = placeData.id;

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}-${i}.${ext}`;
        const filePath = `${placeId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("place-images")
          .upload(filePath, file, {
            upsert: false,
          });

        if (uploadError) {
          setSaving(false);
          setMessage(`Chyba při uploadu fotky: ${uploadError.message}`);
          return;
        }

        const { error: imageInsertError } = await supabase
          .from("place_images")
          .insert({
            place_id: placeId,
            image_path: filePath,
            sort_order: i,
          });

        if (imageInsertError) {
          setSaving(false);
          setMessage(`Chyba při ukládání fotky do databáze: ${imageInsertError.message}`);
          return;
        }
      }
    }

    setSaving(false);
    setMessage("Místo i fotky byly úspěšně uloženy.");

    setName("");
    setShortDescription("");
    setLongDescription("");
    setAddress("");
    setLat("");
    setLng("");
    setSelectedTripTypes([]);
    setVisible(true);
    setFiles(null);

    const fileInput = document.getElementById("place-photos") as HTMLInputElement | null;
    if (fileInput) fileInput.value = "";

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 24,
        background: "#ffffff",
        boxShadow: "0 20px 40px rgba(15,23,42,0.08)",
        padding: 24,
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{
            marginTop: 0,
            marginBottom: 8,
            fontSize: 26,
            color: "#111827",
          }}
        >
          Přidat nové místo
        </h2>
        <p
          style={{
            margin: 0,
            color: "#64748b",
            lineHeight: 1.6,
          }}
        >
          Vyplň informace o nové lokalitě a případně hned nahraj i fotografie.
        </p>
      </div>

      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <label style={labelStyle}>Název místa</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Krátký popis</label>
          <textarea
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            required
            rows={3}
            style={textareaStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Detailní popis</label>
          <textarea
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            required
            rows={5}
            style={textareaStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Adresa / oblast</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <div>
            <label style={labelStyle}>Latitude</label>
            <input
              type="number"
              step="0.000001"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Longitude</label>
            <input
              type="number"
              step="0.000001"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Typy výletu</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {tripTypes.map((type) => {
              const active = selectedTripTypes.includes(type);

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleTripType(type)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 999,
                    border: active ? "1px solid #111827" : "1px solid #d1d5db",
                    background: active ? "#111827" : "white",
                    color: active ? "white" : "#111827",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: active
                      ? "0 8px 20px rgba(17,24,39,0.18)"
                      : "none",
                  }}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Fotky</label>
          <input
            id="place-photos"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            style={inputStyle}
          />
          <div
            style={{
              marginTop: 8,
              color: "#64748b",
              fontSize: 14,
            }}
          >
            Můžeš vybrat jednu nebo více fotografií.
          </div>
        </div>

        <div>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontWeight: 800,
              color: "#111827",
            }}
          >
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
            />
            <span>Zobrazit veřejně</span>
          </label>
        </div>
      </div>

      {message && (
        <div
          style={{
            marginTop: 18,
            padding: 14,
            borderRadius: 16,
            background: message.startsWith("Chyba") ? "#fee2e2" : "#dcfce7",
            color: message.startsWith("Chyba") ? "#991b1b" : "#166534",
            border: message.startsWith("Chyba")
              ? "1px solid #fecaca"
              : "1px solid #bbf7d0",
          }}
        >
          {message}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "13px 18px",
            borderRadius: 16,
            border: 0,
            background: "#111827",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 12px 24px rgba(17,24,39,0.18)",
          }}
        >
          {saving ? "Ukládám..." : "Uložit místo"}
        </button>
      </div>
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  fontWeight: 800,
  color: "#111827",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 14,
  borderRadius: 16,
  border: "1px solid #d1d5db",
  font: "inherit",
  background: "#f8fafc",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: 14,
  borderRadius: 16,
  border: "1px solid #d1d5db",
  font: "inherit",
  background: "#f8fafc",
  resize: "vertical",
};