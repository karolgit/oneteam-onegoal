import { getAppData } from "@/lib/database";
import { DashboardView } from "../views";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function DashboardPage() {
  return <DashboardView data={getAppData()} />;
}
