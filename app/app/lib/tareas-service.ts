/**
 * Capa de negocio: reglas sobre qué es "urgente", "pendiente", etc.
 * No sabe nada de Classroom/Gmail ni de cómo se renderiza en la UI.
 */
import { diasHastaVencimiento, estaCompletada, type Tarea } from "./classroom";

/** Una tarea deja de ser "urgente" cuando le quedan más de estos días. */
const LIMITE_DIAS_URGENTE = 3;
/** Ventana de "esta semana". */
const LIMITE_DIAS_SEMANA = 7;

export interface TareasClasificadas {
  /** No completadas y sin vencer (o sin fecha de vencimiento). */
  pendientes: Tarea[];
  /** No completadas, vencidas hace 0 o más días. */
  vencidas: Tarea[];
  /** Pendientes que vencen dentro de los próximos LIMITE_DIAS_URGENTE días. */
  urgentes: Tarea[];
  /** Pendientes que vencen dentro de los próximos LIMITE_DIAS_SEMANA días. */
  estaSemana: Tarea[];
  completadas: Tarea[];
}

export function clasificarTareas(tareas: Tarea[]): TareasClasificadas {
  const noCompletadas = tareas.filter((t) => !estaCompletada(t));

  const vencidas = noCompletadas.filter((t) => {
    const dias = diasHastaVencimiento(t.vencimiento);
    return dias !== null && dias < 0;
  });

  const pendientes = noCompletadas.filter((t) => {
    const dias = diasHastaVencimiento(t.vencimiento);
    return dias === null || dias >= 0;
  });

  const urgentes = pendientes.filter((t) => {
    const dias = diasHastaVencimiento(t.vencimiento);
    return dias !== null && dias >= 0 && dias <= LIMITE_DIAS_URGENTE;
  });

  const estaSemana = pendientes.filter((t) => {
    const dias = diasHastaVencimiento(t.vencimiento);
    return dias !== null && dias >= 0 && dias <= LIMITE_DIAS_SEMANA;
  });

  return {
    pendientes,
    vencidas,
    urgentes,
    estaSemana,
    completadas: tareas.filter(estaCompletada),
  };
}

/** Cuenta tareas no completadas por curso, para el contador del sidebar. */
export function contarPendientesPorCurso(tareas: Tarea[]): Record<string, number> {
  const conteo: Record<string, number> = {};
  for (const tarea of tareas) {
    if (!estaCompletada(tarea)) {
      conteo[tarea.curso] = (conteo[tarea.curso] ?? 0) + 1;
    }
  }
  return conteo;
}
