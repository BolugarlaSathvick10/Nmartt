"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { SHOP_LOCATION } from "@/lib/locations";
import { getMockUserLocation } from "@/lib/locations";
import "leaflet/dist/leaflet.css";

const shopIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="background:#22c55e;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">🛒</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});
const userIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="background:#3b82f6;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">📍</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});
const riderIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="background:#f59e0b;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">🏍️</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function FitBounds({ userLat, userLng }: { userLat: number; userLng: number }) {
  const map = useMap();
  useEffect(() => {
    const shop: [number, number] = [SHOP_LOCATION.lat, SHOP_LOCATION.lng];
    const user: [number, number] = [userLat, userLng];
    map.fitBounds([shop, user], { padding: [50, 50], maxZoom: 14 });
  }, [map, userLat, userLng]);
  return null;
}

import type { OrderStatus as FullOrderStatus } from "@/types";

/** Statuses we use for rider position on the map; others treated as pending */
const TRACKING_STATUSES = ["pending", "accepted", "out_for_delivery", "delivered"] as const;
type TrackingStatus = (typeof TRACKING_STATUSES)[number];

function toTrackingStatus(s: FullOrderStatus): TrackingStatus {
  return TRACKING_STATUSES.includes(s as TrackingStatus) ? (s as TrackingStatus) : "pending";
}

export interface OrderTrackingMapProps {
  userAddress: string;
  status: FullOrderStatus;
  orderId: string;
  className?: string;
  height?: string;
}

export function OrderTrackingMap({
  userAddress,
  status,
  orderId,
  className = "",
  height = "320px",
}: OrderTrackingMapProps) {
  const user = getMockUserLocation(userAddress);
  const trackingStatus = toTrackingStatus(status);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [riderPosition, setRiderPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    const shop = `${SHOP_LOCATION.lng},${SHOP_LOCATION.lat}`;
    const dest = `${user.lng},${user.lat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${shop};${dest}?overview=full&geometries=geojson`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "Ok" && data.routes?.[0]?.geometry?.coordinates?.length) {
          const coords = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
          setRouteCoords(coords);
        }
      })
      .catch(() => {});
  }, [user.lat, user.lng]);

  // Rider position: 0 = at shop, 1 = at user. Animate only when out_for_delivery.
  const statusProgress: Record<TrackingStatus, number> = {
    pending: 0,
    accepted: 0,
    out_for_delivery: 1,
    delivered: 1,
  };
  const targetProgress = statusProgress[trackingStatus];
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (routeCoords.length < 2) return;
    if (trackingStatus === "out_for_delivery") {
      setDisplayProgress(0);
      const duration = 10000;
      const startTime = Date.now();
      const tick = () => {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        setDisplayProgress(eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      const id = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(id);
    }
    setDisplayProgress(targetProgress);
  }, [routeCoords.length, trackingStatus, targetProgress]);

  useEffect(() => {
    if (routeCoords.length < 2) return;
    const p = Math.max(0, Math.min(1, displayProgress));
    const idx = p * (routeCoords.length - 1);
    const i = Math.floor(idx);
    const frac = idx - i;
    const a = routeCoords[i] ?? routeCoords[0]!;
    const b = routeCoords[Math.min(i + 1, routeCoords.length - 1)] ?? routeCoords[routeCoords.length - 1]!;
    const lat = a[0] + (b[0] - a[0]) * frac;
    const lng = a[1] + (b[1] - a[1]) * frac;
    setRiderPosition([lat, lng]);
  }, [routeCoords, displayProgress]);

  const showRider = trackingStatus !== "pending" && riderPosition;

  return (
    <div className={className} style={{ height }}>
      <div style={{ position: "relative", height: "100%", width: "100%" }}>
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
            <Popup>Your delivery address</Popup>
          </Marker>
        {routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: "hsl(var(--primary))", weight: 4, opacity: 0.7 }}
          />
        )}
          {showRider && riderPosition && (
            <Marker position={riderPosition} icon={riderIcon}>
              <Popup>Delivery partner</Popup>
            </Marker>
          )}
        </MapContainer>
        {/* From/To Address Labels */}
        <div style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          zIndex: 400,
          pointerEvents: "none"
        }}>
          <div style={{
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "bold",
            marginBottom: "8px"
          }}>
            🛒 From: {SHOP_LOCATION.label}
          </div>
          <div style={{
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "bold"
          }}>
            📍 To: {userAddress}
          </div>
        </div>
      </div>
    </div>
  );
}
