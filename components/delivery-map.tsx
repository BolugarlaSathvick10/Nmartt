"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { SHOP_LOCATION } from "@/lib/locations";
import "leaflet/dist/leaflet.css";

// Fix default marker icons in Next.js (Leaflet expects them in a path that doesn't exist in bundle)
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
const shopIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="background:#22c55e;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);">🛒</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});
const userIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="background:#3b82f6;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

L.Marker.prototype.options.icon = defaultIcon;

export interface DeliveryMapProps {
  /** User/delivery location. If not provided, uses a default point for demo. */
  userLocation?: { lat: number; lng: number };
  /** Show route line from shop to user (uses OSRM public API). */
  showRoute?: boolean;
  className?: string;
  height?: string;
}

function FitBounds({ userLat, userLng }: { userLat: number; userLng: number }) {
  const map = useMap();
  useEffect(() => {
    const shop = [SHOP_LOCATION.lat, SHOP_LOCATION.lng] as [number, number];
    const user = [userLat, userLng] as [number, number];
    map.fitBounds([shop, user], { padding: [40, 40], maxZoom: 14 });
  }, [map, userLat, userLng]);
  return null;
}

export function DeliveryMap({
  userLocation,
  showRoute = true,
  className = "",
  height = "280px",
}: DeliveryMapProps) {
  const user = userLocation ?? { lat: 19.0825, lng: 72.8811 };
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  useEffect(() => {
    if (!showRoute) return;
    const shop = `${SHOP_LOCATION.lng},${SHOP_LOCATION.lat}`;
    const dest = `${user.lng},${user.lat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${shop};${dest}?overview=full&geometries=geojson`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "Ok" && data.routes?.[0]?.geometry?.coordinates?.length) {
          const coords = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
          setRouteCoords(coords);
          setRouteError(null);
        } else {
          setRouteError("Route unavailable");
        }
      })
      .catch(() => setRouteError("Could not load route"));
  }, [showRoute, user.lat, user.lng]);

  return (
    <div className={className} style={{ height }}>
      <MapContainer
        center={[(SHOP_LOCATION.lat + user.lat) / 2, (SHOP_LOCATION.lng + user.lng) / 2]}
        zoom={12}
        style={{ height: "100%", width: "100%", borderRadius: "8px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds userLat={user.lat} userLng={user.lng} />
        <Marker position={[SHOP_LOCATION.lat, SHOP_LOCATION.lng]} icon={shopIcon}>
          <Popup>
          {SHOP_LOCATION.label}
          <br />
          <a href={SHOP_LOCATION.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-xs underline">
            Open in Google Maps
          </a>
        </Popup>
        </Marker>
        <Marker position={[user.lat, user.lng]} icon={userIcon}>
          <Popup>Delivery location</Popup>
        </Marker>
        {routeCoords && routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: "hsl(var(--primary))", weight: 4, opacity: 0.8 }}
          />
        )}
      </MapContainer>
      {routeError && (
        <p className="text-xs text-muted-foreground mt-1">{routeError}</p>
      )}
    </div>
  );
}
