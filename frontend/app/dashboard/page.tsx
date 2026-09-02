import { redirect } from "next/navigation";
import { obtenerTareas } from "../lib/classroom";
import Dashboard from "../components/dashboard";

export default async function DashboardPage() {
  const tareas = await obtenerTareas();

  if (tareas === null) {
    redirect("/");
  }

  return <Dashboard tareas={tareas} />;
}