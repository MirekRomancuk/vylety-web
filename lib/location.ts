export function hasValidCoordinates(lat: unknown, lng: unknown): boolean {
  return typeof lat === "number" && typeof lng === "number" &&
    Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
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
