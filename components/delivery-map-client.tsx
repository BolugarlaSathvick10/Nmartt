"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { DeliveryMapProps } from "./delivery-map";

const DeliveryMapInner = dynamic(
  () => import("./delivery-map").then((m) => m.DeliveryMap),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full rounded-lg" style={{ height: 280 }} />,
  }
);

export function DeliveryMapClient(props: DeliveryMapProps) {
  return <DeliveryMapInner {...props} />;
}
