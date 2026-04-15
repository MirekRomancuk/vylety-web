"use client";

import { useState } from "react";

type Props = {
  placeId: string;
  placeName: string;
  shortDescription: string;
};

export default function SharePlaceButton({
  placeId,
  placeName,
  shortDescription,
}: Props) {
  const [message, setMessage] = useState("");

  async function handleShare() {
    const url = `${window.location.origin}/places/${placeId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: placeName,
          text: shortDescription,
          url,
        });

        setMessage("Místo bylo nasdíleno.");
        window.setTimeout(() => setMessage(""), 2000);
        return;
      }

      await navigator.clipboard.writeText(url);
      setMessage("Sdílení není podporované, odkaz byl zkopírován.");
      window.setTimeout(() => setMessage(""), 2500);
    } catch {
      setMessage("");
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button
        type="button"
        onClick={handleShare}
        style={{
          display: "inline-block",
          padding: "12px 16px",
          borderRadius: 12,
          background: "#7c3aed",
          color: "white",
          border: 0,
          textDecoration: "none",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Sdílet místo
      </button>

      {message && (
        <div
          style={{
            fontSize: 13,
            color: "#4b5563",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}