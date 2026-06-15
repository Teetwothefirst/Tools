import { KanbanBoard } from "@/components/features/KanbanBoard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden">
      <KanbanBoard userId={user.id} />
    </main>
  );
}
