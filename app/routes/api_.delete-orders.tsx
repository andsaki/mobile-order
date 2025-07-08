import { json, type ActionFunction } from "@remix-run/node";
import { createClient } from "@supabase/supabase-js";

import {
  getSession,
  getTableIdFromSession,
} from "~/utils/business/session.server";

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!supabaseUrl || !supabaseKey) {
    return json(
      { error: "Database connection error: Missing configuration" },
      { status: 500 }
    );
  }

  const session = await getSession(request.headers.get("Cookie"));
  const tableId = getTableIdFromSession(session);

  if (!tableId || tableId.trim() === "") {
    return json({ error: "No table ID found in session" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("table_id", tableId);

  if (error) {
    console.error("Error deleting orders:", error);
    return json({ error: "Failed to delete orders" }, { status: 500 });
  }

  // 支払い完了後にテーブルの状態を「清掃が必要」に更新
  const { error: tableError } = await supabase
    .from("tables")
    .update({
      status: "needs_cleaning",
      last_updated: new Date().toISOString(),
    })
    .eq("table_id", tableId);

  if (tableError) {
    console.error("Error updating table status:", tableError);
    return json({ error: "Failed to update table status" }, { status: 500 });
  }

  return json({
    message: "Orders deleted and table status updated successfully",
  });
};
