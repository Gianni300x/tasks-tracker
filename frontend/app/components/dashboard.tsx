"use client";

import { useMemo, useState } from "react";
import { BookOpen, Clock, AlertCircle, Calendar, CheckCircle2 } from "lucide-react";
import {
  Tarea,
  diasHastaVencimiento,
  estaCompletada,
  formatearFecha,
  etiquetaVencimiento,
} from "../lib/classroom";

type Tab = "pendientes" | "urgentes" | "semana" | "completadas";

const COLORES_CURSO = [
  "text-indigo-600",
  "text-sky-600",
  "text-amber-600",
  "text-emerald-600",
  "text-rose-600",
  "text-cyan-600",
];

function colorParaCurso(nombre: string, listaCursos: string[]): string {
  const indice = listaCursos.indexOf(nombre);
  return COLORES_CURSO[indice % COLORES_CURSO.length];
}

function colorEtiquetaVencimiento(dias: number | null): string {
  if (dias === null) return "bg-slate-100 text-slate-500";
  if (dias < 0) return "bg-red-50 text-red-700 border border-red-200";
  if (dias <= 1) return "bg-orange-50 text-orange-700 border border-orange-200";
  return "bg-slate-100 text-slate-600";
}

export default function Dashboard({ tareas }: { tareas: Tarea[] }) {
  const [tab, setTab] = useState<Tab>("pendientes");
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string | null>(null);

  const nombresCursos = useMemo(
    () => Array.from(new Set(tareas.map((t) => t.curso))),
    [tareas]
  );

  const conteoPorCurso = useMemo(() => {
    const conteo: Record<string, number> = {};
    for (const tarea of tareas) {
      if (!estaCompletada(tarea)) {
        conteo[tarea.curso] = (conteo[tarea.curso] ?? 0) + 1;
      }
    }
    return conteo;
  }, [tareas]);

  const tareasFiltradasPorCurso = useMemo(
    () =>
      cursoSeleccionado
        ? tareas.filter((t) => t.curso === cursoSeleccionado)
        : tareas,
    [tareas, cursoSeleccionado]
  );

  const pendientes = tareasFiltradasPorCurso.filter((t) => !estaCompletada(t));
  const vencidas = pendientes.filter((t) => {
    const dias = diasHastaVencimiento(t.vencimiento);
    return dias !== null && dias < 0;
  });
  const estaSemana = pendientes.filter((t) => {
    const dias = diasHastaVencimiento(t.vencimiento);
    return dias !== null && dias >= 0 && dias <= 7;
  });
  const urgentes = pendientes.filter((t) => {
    const dias = diasHastaVencimiento(t.vencimiento);
    return dias !== null && dias <= 1;
  });
  const completadas = tareasFiltradasPorCurso.filter(estaCompletada);

  const tareasDelTab =
    tab === "pendientes"
      ? pendientes
      : tab === "urgentes"
      ? urgentes
      : tab === "semana"
      ? estaSemana
      : completadas;

  const ordenadas = [...tareasDelTab].sort((a, b) => {
    const diasA = diasHastaVencimiento(a.vencimiento) ?? Infinity;
    const diasB = diasHastaVencimiento(b.vencimiento) ?? Infinity;
    return diasA - diasB;
  });

  const hoy = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <BookOpen size={20} />
          </div>
          <span className="font-semibold text-lg text-slate-900">Agenda Escolar</span>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-400 tracking-wider mb-3">
            MIS CURSOS
          </p>
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setCursoSeleccionado(null)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                cursoSeleccionado === null
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <BookOpen size={16} />
              Todos los cursos
            </button>
            {nombresCursos.map((nombre) => (
              <button
                key={nombre}
                onClick={() => setCursoSeleccionado(nombre)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  cursoSeleccionado === nombre
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <span className={colorParaCurso(nombre, nombresCursos)}>
                  {nombre}
                </span>
                {conteoPorCurso[nombre] > 0 && (
                  <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                    {conteoPorCurso[nombre]}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-slate-900">
            {cursoSeleccionado ?? "Todas las tareas"}
          </h1>
          <p className="text-sm text-slate-500 capitalize">{hoy}</p>
        </div>

        {/* Tarjetas de stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard
            icono={<Clock size={18} className="text-indigo-600" />}
            valor={pendientes.length}
            etiqueta="Pendientes"
            fondo="bg-white border-l-4 border-l-indigo-500"
          />
          <StatCard
            icono={<AlertCircle size={18} className="text-red-600" />}
            valor={vencidas.length}
            etiqueta="Vencidas"
            fondo="bg-white border-l-4 border-l-red-500"
          />
          <StatCard
            icono={<Calendar size={18} className="text-amber-600" />}
            valor={estaSemana.length}
            etiqueta="Esta semana"
            fondo="bg-white border-l-4 border-l-amber-500"
          />
          <StatCard
            icono={<CheckCircle2 size={18} className="text-emerald-600" />}
            valor={completadas.length}
            etiqueta="Completadas"
            fondo="bg-white border-l-4 border-l-emerald-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(
            [
              ["pendientes", "Pendientes"],
              ["urgentes", "Urgentes"],
              ["semana", "Esta semana"],
              ["completadas", "Completadas"],
            ] as [Tab, string][]
          ).map(([valor, etiqueta]) => (
            <button
              key={valor}
              onClick={() => setTab(valor)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === valor
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {etiqueta}
            </button>
          ))}
        </div>

        {/* Grid de tareas */}
        {ordenadas.length === 0 ? (
          <p className="text-slate-500 text-sm">No hay tareas en esta categoría.</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {ordenadas.map((tarea, i) => {
              const dias = diasHastaVencimiento(tarea.vencimiento);
              return (
                <a
                  key={i}
                  href={tarea.link}
                  target="_blank"
                  rel="noreferrer"
                  className="block bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-medium ${colorParaCurso(
                        tarea.curso,
                        nombresCursos
                      )}`}
                    >
                      {tarea.curso}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${colorEtiquetaVencimiento(
                        dias
                      )}`}
                    >
                      {estaCompletada(tarea) ? "Entregada" : etiquetaVencimiento(dias)}
                    </span>
                  </div>
                  <h3 className="font-medium mb-1 text-slate-900">{tarea.titulo}</h3>
                  {tarea.descripcion && (
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                      {tarea.descripcion}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{formatearFecha(tarea.vencimiento)}</span>
                    {tarea.puntos !== null && <span>{tarea.puntos} pts</span>}
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({
  icono,
  valor,
  etiqueta,
  fondo,
}: {
  icono: React.ReactNode;
  valor: number;
  etiqueta: string;
  fondo: string;
}) {
  return (
    <div className={`${fondo} border border-slate-200 shadow-sm rounded-xl p-4 flex items-center gap-3`}>
      <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200">
        {icono}
      </div>
      <div>
        <p className="text-xl font-semibold text-slate-900">{valor}</p>
        <p className="text-xs text-slate-500">{etiqueta}</p>
      </div>
    </div>
  );
}
