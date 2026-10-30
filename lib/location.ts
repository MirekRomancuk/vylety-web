export function hasValidCoordinates(lat: unknown, lng: unknown): boolean {
  return typeof lat === "number" && typeof lng === "number" &&
    Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

export function getMapyRouteUrl(destination: { lat: number; lng: number }, start?: { lat: number; lng: number }) {
  if (!hasValidCoordinates(destination.lat, destination.lng) ||
      (start && !hasValidCoordinates(start.lat, start.lng))) {
    throw new Error("Invalid route coordinates");
  }
  const url = new URL("https://mapy.com/fnc/v1/route");
  url.searchParams.set("end", `${destination.lng},${destination.lat}`);
  if (start) url.searchParams.set("start", `${start.lng},${start.lat}`);
  url.searchParams.set("routeType", "car_fast");
  return url.toString();
}

export function assessRouteStart(destination: { lat: number; lng: number }, start: { lat: number; lng: number }, accuracy: number) {
  if (!hasValidCoordinates(destination.lat, destination.lng) || !hasValidCoordinates(start.lat, start.lng)) {
    throw new Error("Invalid route coordinates");
  }
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const a = Math.sin(radians(destination.lat - start.lat) / 2) ** 2 +
    Math.cos(radians(start.lat)) * Math.cos(radians(destination.lat)) *
    Math.sin(radians(destination.lng - start.lng) / 2) ** 2;
  const distanceKm = 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, a))));
  const accurate = Number.isFinite(accuracy) && accuracy >= 0 && accuracy <= 1000;
  return { distanceKm, accurate, distant: distanceKm > 300 };
}

export function getMapLinks(place: { name: string; address: string; lat: number; lng: number }) {
  const valid = hasValidCoordinates(place.lat, place.lng);
  const query = `${place.name}, ${place.address}`;
  return {
    google: valid
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${place.lat},${place.lng}`)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    mapy: valid
      ? `https://mapy.com/fnc/v1/showmap?center=${place.lng},${place.lat}&zoom=15&marker=true`
      : `https://mapy.com/fnc/v1/search?query=${encodeURIComponent(query)}`,
  };
}
