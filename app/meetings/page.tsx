import { getAppData } from "@/lib/database";
import { MeetingsView } from "../views";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function MeetingsPage() {
  return <MeetingsView data={getAppData()} />;
}
