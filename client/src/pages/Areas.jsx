// client/src/pages/Areas.jsx (COMPONENTE PRINCIPAL SIMPLIFICADO COMPLETO)
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAreas } from "./hooks/useAreas";
import AreasSidebar from "./components/areas/AreasSidebar";
import AreasPanel from "./components/areas/AreasPanel";

export default function Areas() {
  const navigate = useNavigate();
  const areasData = useAreas();

  if (areasData.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/home")}
              className="text-gray-600 hover:text-gray-900 transition"
            >
              ← Volver
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Áreas
              </h1>
              <p className="text-sm text-gray-500">
                Asignación de áreas por piso
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              ABC
            </div>
            <span className="text-sm font-medium text-blue-900">
              Desk Booking
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Mensaje de feedback */}
        {areasData.mensaje && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg border ${
              areasData.mensaje.tipo === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {areasData.mensaje.texto}
          </motion.div>
        )}

        {/* Grid principal */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar de pisos */}
          <AreasSidebar
            pisos={areasData.pisos}
            pisoSeleccionado={areasData.pisoSeleccionado}
            onSeleccionarPiso={(piso) => {
              areasData.setPisoSeleccionado(piso);
              areasData.cargarAreasPiso(piso.IDPiso);
            }}
          />

          {/* Panel principal de áreas */}
          <AreasPanel
            pisoSeleccionado={areasData.pisoSeleccionado}
            areas={areasData.areas}
            areasPiso={areasData.areasPiso}
            loadingAreas={areasData.loadingAreas}
            delimitaciones={areasData.delimitaciones}
            onAsignarArea={areasData.handleAsignarArea}
            onEliminarArea={areasData.handleEliminarArea}
            onCrearDelimitacion={areasData.crearDelimitacion}
            onEditarDelimitacion={areasData.editarDelimitacion}
            onEliminarDelimitacion={areasData.eliminarDelimitacion}
            

          />
        </div>
      </main>
    </div>
  );
}
