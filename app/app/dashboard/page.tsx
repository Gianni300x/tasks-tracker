import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchTareasDesdeClassroom } from "../lib/tareas-server";
import Dashboard from "../components/dashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.access_token) {
    redirect("/");
  }

  const tareas = await fetchTareasDesdeClassroom(session.access_token);

  return <Dashboard tareas={tareas} />;
}