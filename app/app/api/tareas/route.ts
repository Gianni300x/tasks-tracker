import { auth } from "@/auth";
import { fetchTareasDesdeClassroom } from "@/app/lib/tareas-server";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.access_token) {
    return NextResponse.json({ error: "no_autenticado" }, { status: 401 });
  }

  const tareas = await fetchTareasDesdeClassroom(session.access_token);
  return NextResponse.json(tareas);
}
