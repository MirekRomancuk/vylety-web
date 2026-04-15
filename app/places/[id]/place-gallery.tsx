"use client";

import { useMemo, useState } from "react";

type PlaceImage = {
  id: string;
  image_path: string;
  sort_order: number;
};

type Props = {
  placeName: string;
  images: PlaceImage[];
};

function getImageUrl(path: string) {
  return `https://wdjgsfrvdsetyzdgsdux.supabase.co/storage/v1/object/public/place-images/${path}`;
}

export default function PlaceGallery({ placeName, images }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const sortedImages = useMemo(
    () => [...images].sort((a, b) => a.sort_order - b.sort_order),
    [images]
  );

  function openImage(index: number) {
    setActiveIndex(index);
  }

  function closeLightbox() {
    setActiveIndex(null);
  }

  function showPrev() {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex - 1 + sortedImages.length) % sortedImages.length);
  }

  function showNext() {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex + 1) % sortedImages.length);
  }

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        {sortedImages.map((image, index) => {
          const imageUrl = getImageUrl(image.image_path);

          return (
            <button
              key={image.id}
              type="button"
              onClick={() => openImage(index)}
              style={{
                padding: 0,
                border: 0,
                background: "transparent",
                cursor: "zoom-in",
              }}
            >
              <img
                src={imageUrl}
                alt={`${placeName} ${index + 1}`}
                style={{
                  width: "100%",
                  height: 220,
                  objectFit: "cover",
                  borderRadius: 16,
                  border: "1px solid #ddd",
                  display: "block",
                }}
              />
            </button>
          );
        })}
      </div>

      {activeIndex !== null && (
        <div
          onClick={closeLightbox}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "grid",
            placeItems: "center",
            padding: 24,
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(1100px, 100%)",
              display: "grid",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                color: "white",
              }}
            >
              <div style={{ fontWeight: 700 }}>
                {placeName} — fotka {activeIndex + 1} z {sortedImages.length}
              </div>

              <button
                type="button"
                onClick={closeLightbox}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.08)",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Zavřít
              </button>
            </div>

            <div
              style={{
                position: "relative",
                display: "grid",
                placeItems: "center",
              }}
            >
              <img
                src={getImageUrl(sortedImages[activeIndex].image_path)}
                alt={`${placeName} ${activeIndex + 1}`}
                style={{
                  maxWidth: "100%",
                  maxHeight: "75vh",
                  objectFit: "contain",
                  borderRadius: 16,
                  display: "block",
                }}
              />

              {sortedImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPrev}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      padding: "12px 14px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.25)",
                      background: "rgba(0,0,0,0.35)",
                      color: "white",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    ←
                  </button>

                  <button
                    type="button"
                    onClick={showNext}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      padding: "12px 14px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.25)",
                      background: "rgba(0,0,0,0.35)",
                      color: "white",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    →
                  </button>
                </>
              )}
            </div>

            {sortedImages.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  overflowX: "auto",
                  paddingBottom: 4,
                }}
              >
                {sortedImages.map((image, index) => {
                  const imageUrl = getImageUrl(image.image_path);
                  const selected = index === activeIndex;

                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      style={{
                        padding: 0,
                        border: selected
                          ? "2px solid #22c55e"
                          : "2px solid transparent",
                        borderRadius: 12,
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    >
                      <img
                        src={imageUrl}
                        alt={`${placeName} náhled ${index + 1}`}
                        style={{
                          width: 90,
                          height: 70,
                          objectFit: "cover",
                          borderRadius: 10,
                          display: "block",
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}