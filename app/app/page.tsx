import { BookOpen, Info, Clock, CheckCircle2, Layers } from "lucide-react";
import { signIn } from "@/auth";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-800 flex flex-col items-center justify-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-sm mb-6">
        <BookOpen size={28} />
      </div>
      <h1 className="text-4xl font-bold mb-3 text-slate-900">Agenda Escolar</h1>
      <p className="text-slate-500 mb-10 text-center max-w-md">
        Conectá tu cuenta de Google Classroom y tené todas tus tareas
        pendientes, urgentes y por vencer organizadas en un solo lugar.
      </p>

      <div className="grid grid-cols-3 gap-4 max-w-xl w-full mb-10 text-center">
        <div className="flex flex-col items-center gap-2">
          <Layers className="text-indigo-600" size={22} />
          <p className="text-xs text-slate-500">Todos tus cursos juntos</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Clock className="text-amber-600" size={22} />
          <p className="text-xs text-slate-500">Vencimientos ordenados</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <CheckCircle2 className="text-emerald-600" size={22} />
          <p className="text-xs text-slate-500">Seguimiento de entregas</p>
        </div>
      </div>

      <div className="w-full max-w-md bg-white border border-slate-200 shadow-sm rounded-2xl p-8 text-center">
        <p className="text-slate-600 mb-6">
          Iniciá sesión con tu cuenta institucional para importar tus cursos y
          tareas automáticamente.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:border-indigo-400 hover:bg-slate-50 transition-colors rounded-xl py-3 font-medium text-slate-700"
          >
            <GoogleIcon />
            Continuar con Google
          </button>
        </form>
        <p className="flex items-start gap-2 text-xs text-slate-400 mt-6 text-left">
          <Info size={14} className="mt-0.5 flex-shrink-0" />
          Solo se accede a tu lista de cursos y tareas. No se modifica ningún
          contenido en Classroom.
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}