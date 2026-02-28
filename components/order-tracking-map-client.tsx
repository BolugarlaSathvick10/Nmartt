"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderTrackingMapProps } from "./order-tracking-map";

const OrderTrackingMapInner = dynamic(
  () => import("./order-tracking-map").then((m) => m.OrderTrackingMap),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full rounded-lg" style={{ height: 320 }} />,
  }
);

export function OrderTrackingMapClient(props: OrderTrackingMapProps) {
  return <OrderTrackingMapInner {...props} />;
}
