import { KanbanBoard } from "@/components/features/KanbanBoard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  let userId = "guest-user";

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      userId = data.user.id;
    } else {
      redirect("/login");
    }
  } catch (error) {
    console.warn("Supabase auth check fallback:", error);
  }

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden">
      <KanbanBoard userId={userId} />
    </main>
  );
}
