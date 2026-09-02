import { google } from "googleapis";
import type { Tarea } from "./classroom";

export async function fetchTareasDesdeClassroom(
  accessToken: string,
): Promise<Tarea[]> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({ access_token: accessToken });

  const classroom = google.classroom({ version: "v1", auth: oauth2Client });

  const cursosRes = await classroom.courses.list({ courseStates: ["ACTIVE"] });
  const cursos = cursosRes.data.courses ?? [];

  const tareasPromises = cursos.map(async (curso) => {
    const trabajosRes = await classroom.courses.courseWork.list({
      courseId: curso.id!,
    });
    const trabajos = trabajosRes.data.courseWork ?? [];

    return Promise.all(
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
        } satisfies Tarea;
      }),
    );
  });

  return (await Promise.all(tareasPromises)).flat();
}
