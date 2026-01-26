import { Link, useNavigate } from "react-router-dom";
import { clearToken } from "../auth";

export default function Home() {
  const navigate = useNavigate();

  const logout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto p-6 flex items-center justify-between">
          <div>
            <div className="text-xl font-bold">ABC Desk Booking</div>
            <div className="text-sm text-slate-300">Dashboard</div>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid md:grid-cols-2 gap-6">
        <Link
          to="/mapa"
          className="rounded-2xl border border-slate-800 p-6 hover:bg-slate-900 transition"
        >
          <div className="text-lg font-semibold">Mapa de puestos</div>
          <div className="text-slate-300 text-sm mt-1">
            Ver disponibilidad y reservar
          </div>
        </Link>

        <Link
          to="/mis-reservas"
          className="rounded-2xl border border-slate-800 p-6 hover:bg-slate-900 transition"
        >
          <div className="text-lg font-semibold">Mis reservas</div>
          <div className="text-slate-300 text-sm mt-1">
            Consultar o cancelar reservas
          </div>
        </Link>
      </main>
    </div>
  );
}

