import { KanbanBoard } from "@/components/KanbanBoard";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <KanbanBoard userId={user.id} />
    </main>
  );
}
