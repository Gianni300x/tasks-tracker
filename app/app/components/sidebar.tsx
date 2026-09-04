"use client";

import Link from "next/link";
import { BookOpen, ListChecks, Mail } from "lucide-react";

const COLORES_CURSO = [
  "text-sky-600",
  "text-amber-600",
  "text-emerald-600",
  "text-rose-600",
  "text-cyan-600",
  "text-violet-600",
];

export function colorParaCurso(nombre: string, listaCursos: string[]): string {
  const indice = listaCursos.indexOf(nombre);
  return COLORES_CURSO[indice % COLORES_CURSO.length];
}

export type Seccion = "tareas" | "correos";

export default function Sidebar({
  cursos,
  conteoPorCurso = {},
  cursoSeleccionado,
  onSeleccionarCurso,
  seccion,
}: {
  cursos: string[];
  conteoPorCurso?: Record<string, number>;
  cursoSeleccionado: string | null;
  onSeleccionarCurso: (curso: string | null) => void;
  seccion: Seccion;
}) {
  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white p-6 flex flex-col gap-8">
      <div className="flex items-center gap-3 text-indigo-600">
        <span className="font-bold text-lg">Syllo</span>
      </div>

      <nav className="flex flex-col gap-1">
        <EnlaceSeccion
          href="/dashboard"
          icono={<ListChecks size={16} />}
          etiqueta="Tareas"
          activo={seccion === "tareas"}
        />
        <EnlaceSeccion
          href="/dashboard/correos"
          icono={<Mail size={16} />}
          etiqueta="Correos"
          activo={seccion === "correos"}
        />
      </nav>

      <div>
        <p className="text-xs font-medium text-slate-900 tracking-wider mb-3">
          MIS CURSOS
        </p>
        <nav className="flex flex-col gap-1 text-slate-900">
          <button
            onClick={() => onSeleccionarCurso(null)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              cursoSeleccionado === null
                ? "bg-indigo-50 text-slate-900"
                : "text-slate-900 hover:bg-slate-100"
            }`}
          >
            <BookOpen size={16} />
            Todos los cursos
          </button>
          {cursos.map((nombre) => (
            <button
              key={nombre}
              onClick={() => onSeleccionarCurso(nombre)}
              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                cursoSeleccionado === nombre
                  ? "bg-indigo-50 text-slate-900"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <span className={colorParaCurso(nombre, cursos)}>{nombre}</span>
              {conteoPorCurso[nombre] > 0 && (
                <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full shrink-0">
                  {conteoPorCurso[nombre]}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}

function EnlaceSeccion({
  href,
  icono,
  etiqueta,
  activo,
}: {
  href: string;
  icono: React.ReactNode;
  etiqueta: string;
  activo: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        activo
          ? "bg-indigo-600 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {icono}
      {etiqueta}
    </Link>
  );
}
