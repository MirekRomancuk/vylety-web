"use client";

import { useEffect, useRef, useState } from "react";
import { getMapyRouteUrl } from "@/lib/location";

export default function MapyRouteButton({ lat, lng }: { lat: number; lng: number }) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const active = useRef(true);
  const manualUrl = getMapyRouteUrl({ lat, lng });

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);

  function planRoute() {
    if (locating) return;
    setError("");
    if (!navigator.geolocation) {
      setError("Prohlížeč nepodporuje zjištění polohy. Zadej start ručně.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition((position) => {
      if (!active.current) return;
      try {
        const url = getMapyRouteUrl({ lat, lng }, {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        // Same-tab navigation also works after an asynchronous permission prompt.
        window.location.assign(url);
      } catch {
        setError("Zjištěná poloha není platná. Zkus to znovu nebo zadej start ručně.");
      } finally {
        setLocating(false);
      }
    }, (locationError) => {
      if (!active.current) return;
      setLocating(false);
      setError(locationError.code === 1
        ? "Přístup k poloze je zakázaný. Povol polohu pro tento web nebo zadej start ručně."
        : "Aktuální polohu se nepodařilo zjistit. Zkus to znovu nebo zadej start ručně.");
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  }

  return <div>
    <button type="button" onClick={planRoute} disabled={locating}
      title="Naplánovat trasu z mé aktuální polohy v Mapy.cz"
      style={{ display: "inline-block", padding: "12px 16px", borderRadius: 14,
        background: "#0f766e", color: "white", font: "inherit", fontWeight: 800, border: 0, cursor: locating ? "wait" : "pointer" }}>
      {locating ? "Zjišťuji polohu…" : "Mapy.cz – trasa"}
    </button>
    <div role="status" style={{ maxWidth: 320, fontSize: 14, lineHeight: 1.5, color: "#475569", marginTop: 6 }}>
      {locating ? "Povol zjištění polohy. Použije se jako start trasy v Mapy.cz." : error}
      {error && <> <a href={manualUrl}>Zadat start ručně v Mapy.cz</a></>}
    </div>
  </div>;
}
