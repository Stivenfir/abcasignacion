// client/src/pages/components/reservas/AyudaReservas.jsx
import { motion } from "framer-motion";

export default function AyudaReservas({
  pisos,
  onSeleccionarPiso,
  scopePisos = "area",
}) {
  if (!pisos?.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900 mb-1">
              No hay pisos disponibles para reservar
            </h3>
            <p className="text-sm text-yellow-800">
              {scopePisos === "area"
                ? "Tu área todavía no tiene pisos parametrizados para reservas."
                : "No se encontraron pisos disponibles en este momento."}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const pisosSugeridos = pisos.slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-6 mt-4"
    >
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 mb-1">
              Pisos sugeridos para reservar
            </h3>
            <p className="text-xs text-green-700">
              {scopePisos === "area"
                ? "Mostrando pisos de tu área."
                : "Mostrando pisos disponibles mientras se completa la parametrización por área."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {pisosSugeridos.map((piso) => (
            <motion.button
              key={piso.IDPiso}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSeleccionarPiso(piso)}
              className="p-3 bg-white border-2 border-green-300 rounded-lg hover:border-green-500 hover:shadow-md transition text-left"
            >
              <div className="text-sm font-medium text-gray-900">
                🏢 Piso {piso.NumeroPiso} • Bodega {piso.Bodega}
              </div>
              {piso.TotalPuestosArea != null && (
                <div className="text-xs font-semibold text-green-700 bg-green-100 inline-block px-2 py-1 rounded-full mt-2">
                  {piso.TotalPuestosArea} puestos
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
