"use client";

import { useEffect, useState } from "react";
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

type PlaceImage = {
  id: string;
  place_id: string;
  image_path: string;
  sort_order: number;
};

type Props = {
  place: Place;
  onClose: () => void;
};

function getPublicImageUrl(path: string) {
  const { data } = supabase.storage.from("place-images").getPublicUrl(path);
  return data.publicUrl;
}

export default function EditPlaceForm({ place, onClose }: Props) {
  const router = useRouter();

  const [name, setName] = useState(place.name);
  const [shortDescription, setShortDescription] = useState(place.short_description);
  const [longDescription, setLongDescription] = useState(place.long_description);
  const [address, setAddress] = useState(place.address);
  const [lat, setLat] = useState(String(place.lat));
  const [lng, setLng] = useState(String(place.lng));
  const [selectedTripTypes, setSelectedTripTypes] = useState<string[]>(place.trip_types || []);
  const [visible, setVisible] = useState(place.visible);

  const [images, setImages] = useState<PlaceImage[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadImages() {
      const { data, error } = await supabase
        .from("place_images")
        .select("*")
        .eq("place_id", place.id)
        .order("sort_order", { ascending: true });

      if (!error) {
        setImages((data || []) as PlaceImage[]);
      }
    }

    loadImages();
  }, [place.id]);

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

    const { error } = await supabase
      .from("places")
      .update({
        name,
        short_description: shortDescription,
        long_description: longDescription,
        address,
        lat: Number(lat),
        lng: Number(lng),
        trip_types: selectedTripTypes,
        visible,
      })
      .eq("id", place.id);

    setSaving(false);

    if (error) {
      setMessage(`Chyba: ${error.message}`);
      return;
    }

    setMessage("Místo bylo upraveno.");
    router.refresh();
  }

  async function handleUploadPhotos() {
    if (!files || !files.length) {
      setMessage("Nejprve vyber fotky.");
      return;
    }

    setUploading(true);
    setMessage("");

    const startOrder = images.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${i}.${ext}`;
      const filePath = `${place.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("place-images")
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        setUploading(false);
        setMessage(`Chyba při uploadu fotky: ${uploadError.message}`);
        return;
      }

      const { error: imageInsertError } = await supabase
        .from("place_images")
        .insert({
          place_id: place.id,
          image_path: filePath,
          sort_order: startOrder + i,
        });

      if (imageInsertError) {
        setUploading(false);
        setMessage(`Chyba při ukládání fotky do databáze: ${imageInsertError.message}`);
        return;
      }
    }

    const fileInput = document.getElementById("edit-place-photos") as HTMLInputElement | null;
    if (fileInput) fileInput.value = "";
    setFiles(null);

    const { data } = await supabase
      .from("place_images")
      .select("*")
      .eq("place_id", place.id)
      .order("sort_order", { ascending: true });

    setImages((data || []) as PlaceImage[]);
    setUploading(false);
    setMessage("Fotky byly úspěšně nahrány.");
    router.refresh();
  }

  async function saveImageOrder(nextImages: PlaceImage[]) {
    for (let index = 0; index < nextImages.length; index++) {
      const image = nextImages[index];

      const { error } = await supabase
        .from("place_images")
        .update({ sort_order: index })
        .eq("id", image.id);

      if (error) {
        setMessage(`Chyba při ukládání pořadí fotek: ${error.message}`);
        return false;
      }
    }

    return true;
  }

  async function handleDeleteImage(image: PlaceImage) {
    const confirmed = window.confirm("Opravdu smazat tuto fotku?");
    if (!confirmed) return;

    const { error: dbError } = await supabase
      .from("place_images")
      .delete()
      .eq("id", image.id);

    if (dbError) {
      setMessage(`Chyba při mazání fotky z databáze: ${dbError.message}`);
      return;
    }

    const { error: storageError } = await supabase.storage
      .from("place-images")
      .remove([image.image_path]);

    if (storageError) {
      setMessage(`Fotka byla smazána z databáze, ale ne ze storage: ${storageError.message}`);
    } else {
      setMessage("Fotka byla smazána.");
    }

    const updatedImages = images
      .filter((item) => item.id !== image.id)
      .map((item, index) => ({
        ...item,
        sort_order: index,
      }));

    setImages(updatedImages);
    await saveImageOrder(updatedImages);
    router.refresh();
  }

  async function moveImage(imageId: string, direction: "up" | "down") {
    const currentIndex = images.findIndex((image) => image.id === imageId);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const nextImages = [...images];
    const temp = nextImages[currentIndex];
    nextImages[currentIndex] = nextImages[targetIndex];
    nextImages[targetIndex] = temp;

    const normalized = nextImages.map((image, index) => ({
      ...image,
      sort_order: index,
    }));

    setImages(normalized);

    const ok = await saveImageOrder(normalized);
    if (ok) {
      setMessage("Pořadí fotek bylo uloženo.");
      router.refresh();
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        display: "grid",
        placeItems: "center",
        padding: 24,
        zIndex: 1000,
        backdropFilter: "blur(6px)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 980,
          maxHeight: "92vh",
          overflow: "auto",
          background: "#ffffff",
          borderRadius: 28,
          padding: 24,
          boxShadow: "0 30px 60px rgba(15,23,42,0.24)",
          display: "grid",
          gap: 20,
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                padding: "8px 12px",
                borderRadius: 999,
                background: "#eef2ff",
                color: "#1d4ed8",
                fontSize: 13,
                fontWeight: 800,
                marginBottom: 12,
              }}
            >
              Editace lokality
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: 30,
                color: "#111827",
              }}
            >
              Upravit místo
            </h2>

            <p
              style={{
                margin: "8px 0 0",
                color: "#64748b",
                lineHeight: 1.6,
              }}
            >
              {place.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "12px 16px",
              borderRadius: 16,
              border: "1px solid #d1d5db",
              background: "#ffffff",
              cursor: "pointer",
              fontWeight: 800,
              color: "#111827",
            }}
          >
            Zavřít
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Název místa</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Krátký popis</label>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              required
              rows={3}
              style={textareaStyle}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Detailní popis</label>
            <textarea
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              required
              rows={5}
              style={textareaStyle}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Adresa / oblast</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

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

          <div style={{ gridColumn: "1 / -1" }}>
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
                      background: active ? "#111827" : "#ffffff",
                      color: active ? "#ffffff" : "#111827",
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

          <div style={{ gridColumn: "1 / -1" }}>
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

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 22,
            padding: 20,
            background: "#f8fafc",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: 16,
              fontSize: 22,
              color: "#111827",
            }}
          >
            Správa fotek
          </h3>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Přidat nové fotky</label>
            <input
              id="edit-place-photos"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              style={inputStyle}
            />
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                onClick={handleUploadPhotos}
                disabled={uploading}
                style={{
                  padding: "12px 16px",
                  borderRadius: 16,
                  border: 0,
                  background: "#111827",
                  color: "white",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 12px 24px rgba(17,24,39,0.18)",
                }}
              >
                {uploading ? "Nahrávám..." : "Nahrát fotky"}
              </button>
            </div>
          </div>

          <div>
            <h4
              style={{
                marginTop: 0,
                marginBottom: 14,
                fontSize: 18,
                color: "#111827",
              }}
            >
              Existující fotky
            </h4>

            {!images.length ? (
              <div
                style={{
                  borderRadius: 18,
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  padding: 18,
                  color: "#64748b",
                }}
              >
                Zatím bez fotek.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: 16,
                }}
              >
                {images.map((image) => (
                  <div
                    key={image.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 20,
                      background: "#ffffff",
                      padding: 12,
                      boxShadow: "0 10px 22px rgba(15,23,42,0.05)",
                    }}
                  >
                    <img
                      src={getPublicImageUrl(image.image_path)}
                      alt={place.name}
                      style={{
                        width: "100%",
                        height: 150,
                        objectFit: "cover",
                        borderRadius: 14,
                        display: "block",
                        marginBottom: 12,
                      }}
                    />

                    <div
                      style={{
                        fontSize: 13,
                        color: "#64748b",
                        marginBottom: 10,
                        fontWeight: 700,
                      }}
                    >
                      Pořadí: {image.sort_order}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => moveImage(image.id, "up")}
                        style={secondaryButtonStyle}
                      >
                        Nahoru
                      </button>

                      <button
                        type="button"
                        onClick={() => moveImage(image.id, "down")}
                        style={secondaryButtonStyle}
                      >
                        Dolů
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 14,
                        border: 0,
                        background: "#b91c1c",
                        color: "white",
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 10px 20px rgba(185,28,28,0.16)",
                      }}
                    >
                      Smazat fotku
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {message && (
          <div
            style={{
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

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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
            {saving ? "Ukládám..." : "Uložit změny"}
          </button>

          <button
            type="button"
            onClick={onClose}
            style={secondaryButtonStyle}
          >
            Zavřít
          </button>
        </div>
      </form>
    </div>
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
  background: "#ffffff",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: 14,
  borderRadius: 16,
  border: "1px solid #d1d5db",
  font: "inherit",
  background: "#ffffff",
  resize: "vertical",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  fontWeight: 800,
  cursor: "pointer",
};