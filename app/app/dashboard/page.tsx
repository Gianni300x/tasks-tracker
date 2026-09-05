import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { fetchTareasDesdeClassroom } from "../lib/tareas-server";
import Dashboard from "../components/dashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.access_token) {
    redirect("/");
  }

  const tareas = await fetchTareasDesdeClassroom(session.access_token);

  const usuario = {
    name: session.user?.name,
    email: session.user?.email,
    image: session.user?.image,
  };

  return (
    <Dashboard
      tareas={tareas}
      usuario={usuario}
      onCerrarSesion={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    />
  );
}