import { db } from "@/db";
import { clientRequests } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  const rows = await db
    .select()
    .from(clientRequests)
    .orderBy(desc(clientRequests.createdAt))
    .limit(200);
  return Response.json({ requests: rows });
}
