import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { obtenerTareas } from "../lib/classroom";
import Dashboard from "../components/dashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const tareas = await obtenerTareas();

  if (tareas === null) {
    redirect("/");
  }

  return <Dashboard tareas={tareas} />;
}