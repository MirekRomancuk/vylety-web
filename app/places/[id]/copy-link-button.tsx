"use client";

import { useState } from "react";

type Props = {
  placeId: string;
};

export default function CopyLinkButton({ placeId }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/places/${placeId}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
      alert("Odkaz se nepodařilo zkopírovat.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        display: "inline-block",
        padding: "12px 16px",
        borderRadius: 12,
        background: copied ? "#166534" : "#1d4ed8",
        color: "white",
        border: 0,
        textDecoration: "none",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {copied ? "Odkaz zkopírován" : "Kopírovat odkaz na místo"}
    </button>
  );
}