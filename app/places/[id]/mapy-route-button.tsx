"use client";

import { useEffect, useRef, useState } from "react";
import { assessRouteStart, getMapyRouteUrl } from "@/lib/location";

export default function MapyRouteButton({ lat, lng }: { lat: number; lng: number }) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [start, setStart] = useState<{
    lat: number; lng: number; accuracy: number; distanceKm: number; accurate: boolean; distant: boolean; url: string;
  } | null>(null);
  const active = useRef(true);
  const manualUrl = getMapyRouteUrl({ lat, lng });

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);

  function planRoute() {
    if (locating) return;
    setError("");
    setStart(null);
    if (!navigator.geolocation) {
      setError("Prohlížeč nepodporuje zjištění polohy. Zadej start ručně.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition((position) => {
      if (!active.current) return;
      try {
        const coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const assessment = assessRouteStart({ lat, lng }, coordinates, position.coords.accuracy);
        setStart({ ...coordinates, ...assessment, accuracy: position.coords.accuracy,
          url: getMapyRouteUrl({ lat, lng }, coordinates) });
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
    }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
  }

  return <div>
    <button type="button" onClick={planRoute} disabled={locating}
      title="Naplánovat trasu z mé aktuální polohy v Mapy.cz"
      style={{ display: "inline-block", padding: "12px 16px", borderRadius: 14,
        background: "#0f766e", color: "white", font: "inherit", fontWeight: 800, border: 0, cursor: locating ? "wait" : "pointer" }}>
      {locating ? "Zjišťuji polohu…" : start ? "Zjistit polohu znovu" : "Mapy.cz – trasa"}
    </button>
    <div role="status" style={{ maxWidth: 320, fontSize: 14, lineHeight: 1.5, color: "#475569", marginTop: 6 }}>
      {locating ? "Povol zjištění polohy. Použije se jako start trasy v Mapy.cz." : error}
    </div>
    {start && <div style={{ maxWidth: 360, marginTop: 10, padding: 12, borderRadius: 12,
      background: start.distant || !start.accurate ? "#fffbeb" : "#f0fdfa", color: "#334155", lineHeight: 1.5 }}>
      <strong>Zkontroluj start trasy</strong>
      <p style={{ margin: "6px 0" }}>Prohlížeč hlásí polohu {start.lat.toFixed(5)}, {start.lng.toFixed(5)}.
        {" "}Od cíle je vzdušnou čarou {start.distanceKm.toLocaleString("cs-CZ", { maximumFractionDigits: 1 })} km.</p>
      <p style={{ margin: "6px 0" }}>Odhadovaná přesnost: {Number.isFinite(start.accuracy) && start.accuracy >= 0
        ? `±${Math.round(start.accuracy).toLocaleString("cs-CZ")} m` : "neznámá"}.</p>
      {(start.distant || !start.accurate) && <p role="alert" style={{ color: "#92400e", margin: "6px 0" }}>
        {start.distant ? "Start je více než 300 km od cíle. " : ""}
        {!start.accurate ? "Poloha je nepřesná nebo její přesnost není známá. " : ""}
        Pokud neodpovídá skutečnosti, zadej start ručně v Mapy.cz.
      </p>}
      <a href={start.url} style={{ display: "inline-block", marginTop: 6, fontWeight: 700, color: "#0f766e" }}>
        Potvrdit start a otevřít trasu
      </a>
    </div>}
    <a href={manualUrl} style={{ display: "inline-block", marginTop: 8, fontSize: 14, color: "#0f766e" }}>
      Zadat start ručně v Mapy.cz
    </a>
  </div>;
}
