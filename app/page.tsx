"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const PlacesMap = dynamic(() => import("./places-map"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        borderRadius: 28,
        background: "#ffffff",
        boxShadow: "0 12px 32px rgba(15,23,42,0.08)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "26px 28px 14px" }}>
        <h2
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 800,
            color: "#111827",
          }}
        >
          Interaktivní mapa
        </h2>
        <p
          style={{
            margin: "8px 0 0",
            color: "#6b7280",
            fontSize: 16,
          }}
        >
          Načítám mapu...
        </p>
      </div>
      <div
        style={{
          height: 460,
          background:
            "linear-gradient(135deg, rgba(226,232,240,0.7), rgba(241,245,249,0.9))",
        }}
      />
    </div>
  ),
});

type PlaceImage = {
  image_path: string;
  sort_order?: number;
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
  place_images?: PlaceImage[];
};

const BASE_LOCATION = {
  lat: 49.699706,
  lng: 16.318198,
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getImageUrl(path: string) {
  return `https://wdjgsfrvdsetyzdgsdux.supabase.co/storage/v1/object/public/place-images/${path}`;
}

function getMainImage(place: Place) {
  if (!place.place_images || place.place_images.length === 0) return null;

  const sorted = [...place.place_images].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  return sorted[0]?.image_path ?? null;
}

export default function HomePage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("Vše");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadPlaces() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("places")
        .select("*, place_images(image_path, sort_order)")
        .eq("visible", true)
        .order("name");

      if (cancelled) return;

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setPlaces((data || []) as Place[]);
      setLoading(false);
    }

    loadPlaces();

    return () => {
      cancelled = true;
    };
  }, []);

  const allTripTypes = useMemo(() => {
    const types = new Set<string>();

    places.forEach((place) => {
      (place.trip_types || []).forEach((type) => types.add(type));
    });

    return ["Vše", ...Array.from(types).sort((a, b) => a.localeCompare(b, "cs"))];
  }, [places]);

  const filteredPlaces = useMemo(() => {
    const term = search.trim().toLowerCase();

    return places.filter((place) => {
      const matchesSearch =
        !term ||
        place.name.toLowerCase().includes(term) ||
        place.short_description.toLowerCase().includes(term) ||
        place.address.toLowerCase().includes(term);

      const matchesType =
        selectedType === "Vše" ||
        (place.trip_types || []).includes(selectedType);

      return matchesSearch && matchesType;
    });
  }, [places, search, selectedType]);

  useEffect(() => {
    if (!selectedPlaceId) return;

    const stillVisible = filteredPlaces.some((place) => place.id === selectedPlaceId);
    if (!stillVisible) {
      setSelectedPlaceId(null);
    }
  }, [filteredPlaces, selectedPlaceId]);

  function handleCardSelect(placeId: string) {
    setSelectedPlaceId(placeId);
  }

  function handleMarkerClick(placeId: string) {
    setSelectedPlaceId(placeId);

    const cardElement = cardRefs.current[placeId];
    if (cardElement) {
      cardElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #eef2ff 0%, #eef2ff 10%, #f5f7fb 40%, #eef2f7 100%)",
        fontFamily:
          'Inter, Arial, Helvetica, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "26px 22px 64px",
        }}
      >
        <section
          style={{
            marginBottom: 24,
            borderRadius: 32,
            padding: 24,
            background:
              "linear-gradient(135deg, #111827 0%, #0f172a 35%, #14213d 65%, #1e293b 100%)",
            color: "white",
            boxShadow: "0 24px 48px rgba(15,23,42,0.22)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.35fr) minmax(280px, 0.85fr)",
              gap: 22,
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                padding: "4px 0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                minHeight: 190,
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignSelf: "flex-start",
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.10)",
                  color: "#f8fafc",
                  fontWeight: 700,
                  fontSize: 14,
                  marginBottom: 18,
                }}
              >
                Moderní průvodce výlety
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 56,
                  lineHeight: 0.96,
                  letterSpacing: "-0.03em",
                  fontWeight: 800,
                }}
              >
                Tipy na výlety
                <br />
                Polička a okolí
              </h1>

              <p
                style={{
                  marginTop: 18,
                  marginBottom: 0,
                  maxWidth: 720,
                  color: "rgba(255,255,255,0.88)",
                  fontSize: 18,
                  lineHeight: 1.65,
                }}
              >
                Interaktivní přehled míst, tras a zajímavostí. Filtruj podle typu
                výletu, procházej mapu a otevři detail každé lokality.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gap: 14,
                alignContent: "center",
              }}
            >
              <div
                style={{
                  borderRadius: 24,
                  padding: "18px 18px 16px",
                  background: "rgba(255,255,255,0.09)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  style={{
                    color: "rgba(255,255,255,0.72)",
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  Veřejných míst
                </div>
                <div
                  style={{
                    fontSize: 56,
                    lineHeight: 1,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {places.length}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 24,
                  padding: "18px 18px 16px",
                  background: "rgba(255,255,255,0.09)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  style={{
                    color: "rgba(255,255,255,0.72)",
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  Aktivní filtr
                </div>
                <div
                  style={{
                    fontSize: 30,
                    lineHeight: 1.1,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    wordBreak: "break-word",
                  }}
                >
                  {selectedType}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            marginBottom: 22,
            borderRadius: 28,
            padding: 20,
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(15,23,42,0.06)",
            boxShadow: "0 14px 34px rgba(15,23,42,0.06)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 18,
            }}
          >
            <div>
              <label
                htmlFor="search"
                style={{
                  display: "block",
                  marginBottom: 10,
                  fontWeight: 800,
                  fontSize: 16,
                  color: "#111827",
                }}
              >
                Vyhledávání
              </label>

              <input
                id="search"
                type="text"
                placeholder="Např. Svojanov, rozhledna, restaurace..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  height: 52,
                  padding: "0 16px",
                  borderRadius: 18,
                  border: "1px solid #d1d5db",
                  background: "#f8fafc",
                  outline: "none",
                  font: "inherit",
                  fontSize: 17,
                  color: "#111827",
                }}
              />
            </div>

            <div>
              <div
                style={{
                  marginBottom: 10,
                  fontWeight: 800,
                  fontSize: 16,
                  color: "#111827",
                }}
              >
                Typ výletu
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                {allTripTypes.map((type) => {
                  const active = selectedType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: 999,
                        border: active ? "1px solid #0f172a" : "1px solid #d1d5db",
                        background: active ? "#0f172a" : "#ffffff",
                        color: active ? "#ffffff" : "#111827",
                        fontWeight: 800,
                        fontSize: 15,
                        cursor: "pointer",
                        boxShadow: active ? "0 8px 18px rgba(15,23,42,0.18)" : "none",
                      }}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {errorMessage && (
          <div
            style={{
              marginBottom: 22,
              background: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fecaca",
              borderRadius: 18,
              padding: 16,
            }}
          >
            <strong>Chyba při načítání dat:</strong>
            <div>{errorMessage}</div>
          </div>
        )}

        {!loading && filteredPlaces.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <PlacesMap
              places={filteredPlaces}
              selectedPlaceId={selectedPlaceId}
              onMarkerClick={handleMarkerClick}
            />
          </div>
        )}

        {loading ? (
          <div
            style={{
              borderRadius: 28,
              padding: 24,
              background: "rgba(255,255,255,0.92)",
              boxShadow: "0 14px 34px rgba(15,23,42,0.06)",
            }}
          >
            Načítám místa...
          </div>
        ) : !filteredPlaces.length ? (
          <div
            style={{
              borderRadius: 28,
              padding: 24,
              background: "rgba(255,255,255,0.92)",
              boxShadow: "0 14px 34px rgba(15,23,42,0.06)",
            }}
          >
            Pro zadaný filtr nebyla nalezena žádná místa.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 22,
            }}
          >
            {filteredPlaces.map((place) => {
              const distance = getDistanceKm(
                BASE_LOCATION.lat,
                BASE_LOCATION.lng,
                place.lat,
                place.lng
              );

              const mainImage = getMainImage(place);
              const isSelected = selectedPlaceId === place.id;

              return (
                <div
                  key={place.id}
                  ref={(element) => {
                    cardRefs.current[place.id] = element;
                  }}
                  style={{
                    border: isSelected ? "2px solid #2563eb" : "1px solid rgba(15,23,42,0.08)",
                    borderRadius: 28,
                    background: "#ffffff",
                    boxShadow: isSelected
                      ? "0 0 0 4px rgba(37,99,235,0.12), 0 18px 34px rgba(15,23,42,0.08)"
                      : "0 18px 34px rgba(15,23,42,0.06)",
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                  }}
                >
                  {mainImage ? (
                    <img
                      src={getImageUrl(mainImage)}
                      alt={place.name}
                      style={{
                        width: "100%",
                        height: 230,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: 230,
                        display: "grid",
                        placeItems: "center",
                        background:
                          "linear-gradient(135deg, #dbeafe 0%, #e2e8f0 100%)",
                        color: "#334155",
                        fontWeight: 800,
                        fontSize: 18,
                      }}
                    >
                      Bez fotky
                    </div>
                  )}

                  <div
                    onClick={() => handleCardSelect(place.id)}
                    style={{
                      padding: 22,
                      cursor: "pointer",
                      background: isSelected ? "#f8fbff" : "#ffffff",
                    }}
                  >
                    <h2
                      style={{
                        marginTop: 0,
                        marginBottom: 10,
                        fontSize: 28,
                        lineHeight: 1.12,
                        color: "#0f172a",
                        fontWeight: 800,
                      }}
                    >
                      {place.name}
                    </h2>

                    <p
                      style={{
                        color: "#475569",
                        marginTop: 0,
                        marginBottom: 16,
                        lineHeight: 1.7,
                        minHeight: 82,
                        fontSize: 16,
                      }}
                    >
                      {place.short_description}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        marginBottom: 18,
                      }}
                    >
                      {place.trip_types?.map((type) => (
                        <span
                          key={type}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 999,
                            background: "#ecfdf5",
                            color: "#166534",
                            fontSize: 13,
                            fontWeight: 800,
                            border: "1px solid #bbf7d0",
                          }}
                        >
                          {type}
                        </span>
                      ))}
                    </div>

                    <div
                      style={{
                        color: "#64748b",
                        fontSize: 14,
                        lineHeight: 1.8,
                        marginBottom: 18,
                      }}
                    >
                      <div>
                        <strong>Adresa:</strong> {place.address}
                      </div>
                      <div>
                        <strong>Vzdálenost od Kamenec u Poličky 180:</strong>{" "}
                        {distance.toFixed(1)} km
                      </div>
                    </div>

                    <Link
                      href={`/places/${place.id}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "11px 16px",
                        borderRadius: 14,
                        background: "#0f172a",
                        color: "white",
                        textDecoration: "none",
                        fontWeight: 800,
                        boxShadow: "0 10px 20px rgba(15,23,42,0.16)",
                      }}
                    >
                      Otevřít detail
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}