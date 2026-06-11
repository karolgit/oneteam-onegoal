import { getAppData } from "@/lib/database";
import { AccountsView } from "../views";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function AccountsPage() {
  return <AccountsView data={getAppData()} />;
}
