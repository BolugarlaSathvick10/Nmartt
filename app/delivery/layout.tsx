import { Layout } from "@/components/layout/Layout";

export const dynamic = "force-dynamic";

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}
