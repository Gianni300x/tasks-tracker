import { auth } from "@/auth";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.access_token) {
    return NextResponse.json({ error: "no_autenticado" }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({ access_token: session.access_token });

  const classroom = google.classroom({ version: "v1", auth: oauth2Client });

  const cursosRes = await classroom.courses.list({ courseStates: ["ACTIVE"] });
  const cursos = cursosRes.data.courses ?? [];

  const tareasPromises = cursos.map(async (curso) => {
    const trabajosRes = await classroom.courses.courseWork.list({
      courseId: curso.id!,
    });
    const trabajos = trabajosRes.data.courseWork ?? [];

    const tareasCurso = await Promise.all(
      trabajos.map(async (trabajo) => {
        const entregasRes =
          await classroom.courses.courseWork.studentSubmissions.list({
            courseId: curso.id!,
            courseWorkId: trabajo.id!,
            userId: "me",
          });
        const entregas = entregasRes.data.studentSubmissions ?? [];
        const estado = entregas[0]?.state ?? "CREATED";

        return {
          curso: curso.name,
          titulo: trabajo.title,
          descripcion: trabajo.description ?? "",
          puntos: trabajo.maxPoints ?? null,
          vencimiento: trabajo.dueDate ?? null,
          estado,
          link: trabajo.alternateLink ?? "",
        };
      }),
    );

    return tareasCurso;
  });

  const todasLasTareas = (await Promise.all(tareasPromises)).flat();
  return NextResponse.json(todasLasTareas);
}
