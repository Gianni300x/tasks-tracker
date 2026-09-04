import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { fetchCorreoCompleto } from "@/app/lib/correos-server";
import { fetchNombresCursos } from "@/app/lib/tareas-server";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/correos/[id]">,
) {
  const session = await auth();

  if (!session?.access_token || session.error) {
    return NextResponse.json({ error: "no_autenticado" }, { status: 401 });
  }

  const { id } = await ctx.params;

  try {
    const cursos = await fetchNombresCursos(session.access_token);
    const correo = await fetchCorreoCompleto(session.access_token, id, cursos);
    return NextResponse.json(correo);
  } catch (error) {
    console.error("Error al leer el correo:", error);
    return NextResponse.json({ error: "error_gmail" }, { status: 502 });
  }
}
