"use client";

import { useEffect, useId, useRef, useState } from "react";
import { findLocations, type LocationResult } from "@/lib/geocoding";
import { hasValidCoordinates } from "@/lib/location";

type Coordinates = { address: string; lat: string; lng: string };

export function usePlaceLocation(initial: Coordinates = { address: "", lat: "", lng: "" }) {
  const [value, setValue] = useState(initial);
  const [searching, setSearching] = useState(false);
  const initialValid = initial.lat.trim() !== "" && initial.lng.trim() !== "" &&
    hasValidCoordinates(Number(initial.lat), Number(initial.lng));
  const [message, setMessage] = useState(initial.address && !initialValid
    ? "Uložené souřadnice nejsou platné. Vyhledej adresu znovu nebo zadej desetinné stupně (např. 49.700306, 16.180018)." : "");
  const [results, setResults] = useState<LocationResult[]>([]);
  const request = useRef<AbortController | null>(null);
  const lastQuery = useRef(initialValid ? initial.address.trim() : "");

  useEffect(() => () => request.current?.abort(), []);

  function cancelSearch() {
    request.current?.abort();
    request.current = null;
    setSearching(false);
    setResults([]);
    setMessage("");
  }

  function changeAddress(address: string) {
    cancelSearch();
    lastQuery.current = "";
    setValue({ address, lat: "", lng: "" });
  }

  function changeCoordinate(field: "lat" | "lng", coordinate: string) {
    cancelSearch();
    // Leaving the address field to enter coordinates should not overwrite manual input.
    lastQuery.current = value.address.trim();
    setValue((previous) => ({ ...previous, [field]: coordinate }));
  }

  function selectResult(result: LocationResult) {
    setValue((previous) => ({ ...previous, lat: result.lat.toFixed(6), lng: result.lng.toFixed(6) }));
    setResults([]);
    setMessage(`Souřadnice doplněny: ${result.label}. Zkontroluj, že jde o správné místo.`);
  }

  async function search(force = false) {
    const query = value.address.trim();
    if (query.length < 3 || (!force && query === lastQuery.current)) return;
    cancelSearch();
    const controller = new AbortController();
    request.current = controller;
    lastQuery.current = query;
    setSearching(true);
    setMessage("Hledám souřadnice…");
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const locations = await findLocations(query, controller.signal);
      if (request.current !== controller || controller.signal.aborted) return;
      if (locations.length === 1) selectResult(locations[0]);
      else if (locations.length > 1) {
        setResults(locations);
        setMessage("Nalezeno více míst. Vyber správnou lokalitu pro doplnění souřadnic.");
      } else {
        setMessage("Adresa nebyla nalezena. Upřesni ji o obec nebo zadej souřadnice ručně.");
      }
    } catch {
      if (request.current === controller) {
        lastQuery.current = "";
        setMessage("Souřadnice se nepodařilo načíst. Zkus hledání znovu nebo je zadej ručně.");
      }
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) {
        request.current = null;
        setSearching(false);
      }
    }
  }

  function reset() {
    cancelSearch();
    lastQuery.current = "";
    setValue({ address: "", lat: "", lng: "" });
  }

  return { ...value, searching, message, results, changeAddress, changeCoordinate, search, selectResult, reset };
}

export default function LocationFields({ location, disabled = false }: {
  location: ReturnType<typeof usePlaceLocation>;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div style={{ gridColumn: "1 / -1", display: "grid", gap: 16 }}>
      <div>
        <label htmlFor={`${id}-address`} style={labelStyle}>Adresa / oblast</label>
        <input
          id={`${id}-address`}
          value={location.address}
          onChange={(event) => location.changeAddress(event.target.value)}
          onBlur={() => { if (!disabled) void location.search(); }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void location.search(true);
            }
          }}
          placeholder="Např. Karlštejn 172, Karlštejn"
          aria-describedby={`${id}-help ${id}-status`}
          required
          disabled={disabled}
          style={inputStyle}
        />
        <p id={`${id}-help`} style={{ color: "#64748b", fontSize: 14, margin: "8px 0" }}>
          Po dokončení adresy a opuštění pole se vyhledají souřadnice. Můžeš je také zadat ručně.
        </p>
        <button type="button" disabled={disabled || location.searching || location.address.trim().length < 3}
          onClick={() => void location.search(true)} style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #d1d5db" }}>
          {location.searching ? "Hledám…" : "Vyhledat souřadnice"}
        </button>
        <p id={`${id}-status`} role="status" style={{ color: "#334155", marginBottom: 0 }}>{location.message}</p>
        {location.results.length > 0 && (
          <ul style={{ paddingLeft: 20 }}>
            {location.results.map((result) => (
              <li key={`${result.lat},${result.lng}`} style={{ marginTop: 8 }}>
                <button type="button" disabled={disabled} onClick={() => location.selectResult(result)}
                  style={{ padding: 10, textAlign: "left", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, cursor: "pointer" }}>
                  {result.label}
                </button>
              </li>
            ))}
          </ul>
        )}
        <small style={{ color: "#64748b" }}>
          Vyhledávání: <a href="https://photon.komoot.io" target="_blank" rel="noreferrer">Photon</a>
          {" · © "}<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>
        </small>
      </div>
      <div className="coordinates-grid" style={{ display: "grid", gap: 16 }}>
        {(["lat", "lng"] as const).map((field) => (
          <div key={field}>
            <label htmlFor={`${id}-${field}`} style={labelStyle}>
              {field === "lat" ? "Zeměpisná šířka (Latitude)" : "Zeměpisná délka (Longitude)"}
            </label>
            <input id={`${id}-${field}`} type="number" step="any" min={field === "lat" ? -90 : -180}
              max={field === "lat" ? 90 : 180} value={location[field]}
              onChange={(event) => location.changeCoordinate(field, event.target.value)}
              disabled={disabled} required style={inputStyle} />
          </div>
        ))}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", marginBottom: 8, fontWeight: 800, color: "#111827" };
const inputStyle: React.CSSProperties = {
  width: "100%", padding: 14, borderRadius: 16, border: "1px solid #d1d5db", font: "inherit", background: "#f8fafc",
};
