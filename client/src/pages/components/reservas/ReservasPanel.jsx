// client/src/pages/components/reservas/ReservasPanel.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CalendarioReservas from "./CalendarioReservas";
import ReservasLista from "./ReservasLista";

export default function ReservasPanel({
  pisoSeleccionado,
  reservas,
  loadingReservas,
  onSolicitarReserva,
  onCancelarReserva,
}) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [vistaActual, setVistaActual] = useState("calendario");

  if (!pisoSeleccionado) {
    return (
      <div className="lg:col-span-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏢</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Selecciona un piso
            </h3>
            <p className="text-gray-500">
              Elige un piso habilitado de tu área para reservar automáticamente
              un puesto
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-white to-blue-50/40 rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Piso {pisoSeleccionado.NumeroPiso}
                </h3>
                <p className="text-sm text-gray-500">
                  Bodega {pisoSeleccionado.Bodega} • Asignación automática por
                  área
                </p>
              </div>
            </div>

            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setVistaActual("calendario")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  vistaActual === "calendario"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                📅 Calendario
              </button>
              <button
                onClick={() => setVistaActual("lista")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  vistaActual === "lista"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                📋 Mis Reservas
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {vistaActual === "calendario" ? (
            <motion.div
              key="calendario"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <CalendarioReservas
                pisoSeleccionado={pisoSeleccionado}
                fechaSeleccionada={fechaSeleccionada}
                onSeleccionarFecha={setFechaSeleccionada}
                onSolicitarReserva={onSolicitarReserva}
              />
            </motion.div>
          ) : (
            <motion.div
              key="lista"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <ReservasLista
                reservas={reservas}
                loadingReservas={loadingReservas}
                onCancelarReserva={onCancelarReserva}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
