import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import CopyLinkButton from "./copy-link-button";
import SharePlaceButton from "./share-place-button";
import PlaceGallery from "./place-gallery";

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

function getGoogleMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${lat},${lng}`
  )}`;
}

function getMapyCzUrl(lat: number, lng: number) {
  return `https://mapy.cz/zakladni?x=${lng}&y=${lat}&z=15&source=coor&id=${lat}%2C${lng}`;
}

function getPublicImageUrl(path: string) {
  const { data } = supabase.storage.from("place-images").getPublicUrl(path);
  return data.publicUrl;
}

export default async function PlaceDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ data: placeData }, { data: imageData }] = await Promise.all([
    supabase.from("places").select("*").eq("id", id).single(),
    supabase
      .from("place_images")
      .select("*")
      .eq("place_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  if (!placeData) {
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
            maxWidth: 1000,
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
            <h1>Místo nebylo nalezeno</h1>
            <Link
              href="/"
              style={{
                color: "#111827",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              ← Zpět na přehled
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const place = placeData as Place;
  const images = (imageData || []) as PlaceImage[];
  const distance = getDistanceKm(
    BASE_LOCATION.lat,
    BASE_LOCATION.lng,
    place.lat,
    place.lng
  );

  const googleMapsUrl = getGoogleMapsUrl(place.lat, place.lng);
  const mapyCzUrl = getMapyCzUrl(place.lat, place.lng);
  const heroImage = images[0] ? getPublicImageUrl(images[0].image_path) : null;

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
          maxWidth: 1100,
          margin: "0 auto",
          padding: "28px 20px 40px",
        }}
      >
        <section
          style={{
            background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
            color: "white",
            borderRadius: 28,
            overflow: "hidden",
            boxShadow: "0 30px 60px rgba(15,23,42,0.20)",
            marginBottom: 24,
          }}
        >
          {heroImage ? (
            <div
              style={{
                position: "relative",
                height: 340,
                overflow: "hidden",
              }}
            >
              <img
                src={heroImage}
                alt={place.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(15,23,42,0.10) 0%, rgba(15,23,42,0.75) 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 24,
                  right: 24,
                  bottom: 24,
                }}
              >
                <Link
                  href="/"
                  style={{
                    display: "inline-block",
                    marginBottom: 14,
                    color: "white",
                    fontWeight: 800,
                    textDecoration: "none",
                    background: "rgba(255,255,255,0.10)",
                    padding: "10px 14px",
                    borderRadius: 14,
                    backdropFilter: "blur(6px)",
                  }}
                >
                  ← Zpět na přehled
                </Link>

                <h1
                  style={{
                    margin: 0,
                    fontSize: 42,
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {place.name}
                </h1>

                <p
                  style={{
                    color: "rgba(255,255,255,0.82)",
                    marginTop: 12,
                    marginBottom: 0,
                    fontSize: 18,
                    maxWidth: 760,
                    lineHeight: 1.6,
                  }}
                >
                  {place.short_description}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ padding: 28 }}>
              <Link
                href="/"
                style={{
                  display: "inline-block",
                  marginBottom: 14,
                  color: "white",
                  fontWeight: 800,
                  textDecoration: "none",
                  background: "rgba(255,255,255,0.10)",
                  padding: "10px 14px",
                  borderRadius: 14,
                }}
              >
                ← Zpět na přehled
              </Link>

              <h1
                style={{
                  margin: 0,
                  fontSize: 42,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                {place.name}
              </h1>

              <p
                style={{
                  color: "rgba(255,255,255,0.82)",
                  marginTop: 12,
                  marginBottom: 0,
                  fontSize: 18,
                  maxWidth: 760,
                  lineHeight: 1.6,
                }}
              >
                {place.short_description}
              </p>
            </div>
          )}
        </section>

        <section
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "1.15fr 0.85fr",
            marginBottom: 24,
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
                    background: "#eef2ff",
                    color: "#1d4ed8",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  {type}
                </span>
              ))}
            </div>

            <h2
              style={{
                marginTop: 0,
                marginBottom: 12,
                fontSize: 24,
                color: "#111827",
              }}
            >
              O místě
            </h2>

            <p
              style={{
                color: "#475569",
                lineHeight: 1.8,
                marginTop: 0,
                marginBottom: 0,
                fontSize: 16,
              }}
            >
              {place.long_description}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gap: 20,
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
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 16,
                  fontSize: 22,
                  color: "#111827",
                }}
              >
                Rychlé informace
              </h2>

              <div
                style={{
                  display: "grid",
                  gap: 14,
                  color: "#475569",
                  lineHeight: 1.7,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#64748b",
                      marginBottom: 4,
                      fontWeight: 700,
                    }}
                  >
                    ADRESA
                  </div>
                  <div style={{ color: "#111827", fontWeight: 700 }}>{place.address}</div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#64748b",
                      marginBottom: 4,
                      fontWeight: 700,
                    }}
                  >
                    SOUŘADNICE
                  </div>
                  <div style={{ color: "#111827", fontWeight: 700 }}>
                    {place.lat}, {place.lng}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#64748b",
                      marginBottom: 4,
                      fontWeight: 700,
                    }}
                  >
                    VZDÁLENOST OD KAMENEC U POLIČKY 180
                  </div>
                  <div style={{ color: "#111827", fontWeight: 800, fontSize: 20 }}>
                    {distance.toFixed(1)} km
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 24,
                background: "#ffffff",
                boxShadow: "0 20px 40px rgba(15,23,42,0.08)",
                padding: 24,
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 16,
                  fontSize: 22,
                  color: "#111827",
                }}
              >
                Akce
              </h2>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  alignItems: "start",
                }}
              >
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "12px 16px",
                    borderRadius: 14,
                    background: "#111827",
                    color: "white",
                    textDecoration: "none",
                    fontWeight: 800,
                  }}
                >
                  Google Maps
                </a>

                <a
                  href={mapyCzUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "12px 16px",
                    borderRadius: 14,
                    background: "#0f766e",
                    color: "white",
                    textDecoration: "none",
                    fontWeight: 800,
                  }}
                >
                  Mapy.cz
                </a>

                <CopyLinkButton placeId={place.id} />

                <SharePlaceButton
                  placeId={place.id}
                  placeName={place.name}
                  shortDescription={place.short_description}
                />
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 24,
            background: "#ffffff",
            boxShadow: "0 20px 40px rgba(15,23,42,0.08)",
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              padding: "20px 24px 12px",
              borderBottom: "1px solid #eef2f7",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 24,
                color: "#111827",
              }}
            >
              Mapa lokality
            </h2>
            <p
              style={{
                color: "#64748b",
                marginTop: 8,
                marginBottom: 0,
              }}
            >
              Přesné umístění místa v mapě.
            </p>
          </div>

          <div style={{ padding: 16 }}>
            <div
              style={{
                borderRadius: 20,
                overflow: "hidden",
                border: "1px solid #e5e7eb",
              }}
            >
              <iframe
                title={place.name}
                width="100%"
                height="420"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${place.lng - 0.02}%2C${place.lat - 0.02}%2C${place.lng + 0.02}%2C${place.lat + 0.02}&layer=mapnik&marker=${place.lat}%2C${place.lng}`}
              />
            </div>
          </div>
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
                fontSize: 24,
                color: "#111827",
              }}
            >
              Fotogalerie
            </h2>
            <p
              style={{
                color: "#64748b",
                marginTop: 8,
                marginBottom: 0,
              }}
            >
              Klikni na fotografii a otevře se galerie přes celou obrazovku.
            </p>
          </div>

          {!images.length ? (
            <div
              style={{
                borderRadius: 18,
                background: "#f8fafc",
                border: "1px solid #e5e7eb",
                padding: 20,
                color: "#64748b",
              }}
            >
              Zatím bez fotografií.
            </div>
          ) : (
            <PlaceGallery placeName={place.name} images={images} />
          )}
        </section>
      </div>
    </main>
  );
}