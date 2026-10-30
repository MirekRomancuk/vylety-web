export type LocationResult = { label: string; lat: number; lng: number };

// GeoJSON uses longitude first, unlike the fields in the place form.
export function parseLocations(data: unknown): LocationResult[] {
  if (!data || typeof data !== "object" || !("features" in data) || !Array.isArray(data.features)) {
    throw new Error("Invalid geocoder response");
  }

  const results: LocationResult[] = [];
  for (const feature of data.features) {
    const coordinates = feature?.geometry?.coordinates;
    const properties = feature?.properties;
    if (feature?.geometry?.type !== "Point" || !Array.isArray(coordinates) || !properties) continue;
    const [lng, lat] = coordinates;
    if (typeof lat !== "number" || typeof lng !== "number" ||
        !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) continue;

    const street = [properties.street, properties.housenumber].filter(Boolean).join(" ");
    const label = [...new Set([properties.name, street, properties.postcode, properties.city,
      properties.district, properties.state, properties.country]
      .filter((part): part is string => typeof part === "string" && part.length > 0))].join(", ");
    if (label && !results.some((result) => result.lat === lat && result.lng === lng)) {
      results.push({ label, lat, lng });
    }
  }
  return results;
}

const cache = new Map<string, LocationResult[]>();

export async function findLocations(query: string, signal: AbortSignal): Promise<LocationResult[]> {
  const cached = cache.get(query);
  if (cached) return cached;

  const url = new URL(process.env.NEXT_PUBLIC_GEOCODING_URL || "https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "5");
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Geocoder unavailable");
  const results = parseLocations(await response.json());
  if (cache.size >= 50) cache.clear();
  cache.set(query, results);
  return results;
}
