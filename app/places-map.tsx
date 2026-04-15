"use client";

import { useEffect } from "react";
import Link from "next/link";
// @ts-ignore - v tomto projektu chybí deklarace pro leaflet
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

type Place = {
  id: string;
  name: string;
  short_description: string;
  address: string;
  lat: number;
  lng: number;
};

type Props = {
  places: Place[];
  selectedPlaceId: string | null;
  onMarkerClick: (placeId: string) => void;
};

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedMarkerIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FitBounds({ places }: { places: Place[] }) {
  const map = useMap();

  useEffect(() => {
    if (!places.length) return;

    if (places.length === 1) {
      map.setView([places[0].lat, places[0].lng], 13);
      return;
    }

    const bounds = L.latLngBounds(
      places.map((place) => [place.lat, place.lng] as [number, number])
    );

    map.fitBounds(bounds, { padding: [40, 40] });
  }, [places, map]);

  return null;
}

function MapSelectionController({
  places,
  selectedPlaceId,
}: {
  places: Place[];
  selectedPlaceId: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedPlaceId) return;

    const selectedPlace = places.find((place) => place.id === selectedPlaceId);
    if (!selectedPlace) return;

    map.flyTo([selectedPlace.lat, selectedPlace.lng], 14, {
      duration: 0.8,
    });
  }, [selectedPlaceId, places, map]);

  return null;
}

function MapClickReset() {
  useMapEvents({
    click() {
      // záměrně prázdné
    },
  });

  return null;
}

export default function PlacesMap({
  places,
  selectedPlaceId,
  onMarkerClick,
}: Props) {
  const defaultCenter: [number, number] = [49.7149, 16.2658];

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 24,
        background: "#ffffff",
        boxShadow: "0 20px 40px rgba(15,23,42,0.08)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: 16 }}>
        <div
          style={{
            height: 480,
            borderRadius: 20,
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          <MapContainer
            center={defaultCenter}
            zoom={11}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FitBounds places={places} />
            <MapSelectionController
              places={places}
              selectedPlaceId={selectedPlaceId}
            />
            <MapClickReset />

            {places.map((place) => {
              const isSelected = selectedPlaceId === place.id;

              return (
                <Marker
                  key={place.id}
                  position={[place.lat, place.lng]}
                  icon={isSelected ? selectedMarkerIcon : markerIcon}
                  eventHandlers={{
                    click: () => onMarkerClick(place.id),
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: 220 }}>
                      <strong style={{ display: "block", marginBottom: 8 }}>
                        {place.name}
                      </strong>
                      <div style={{ color: "#475569", fontSize: 14, marginBottom: 8 }}>
                        {place.short_description}
                      </div>
                      <div style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>
                        {place.address}
                      </div>
                      <Link
                        href={`/places/${place.id}`}
                        style={{
                          display: "inline-block",
                          padding: "8px 12px",
                          borderRadius: 12,
                          background: "#111827",
                          color: "white",
                          textDecoration: "none",
                          fontWeight: 700,
                        }}
                      >
                        Otevřít detail
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}