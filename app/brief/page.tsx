import { getAppData } from "@/lib/database";
import { BriefGeneratorView } from "../views";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function BriefPage() {
  return <BriefGeneratorView data={getAppData()} />;
}
