import { motion } from "framer-motion";

export default function ReservasSidebar({
  pisos,
  pisoSeleccionado,
  onSeleccionarPiso,
  scopePisos = "area",
}) {
  if (!pisos.length) {
    return (
      <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pisos habilitados
          </h2>
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
            No hay pisos disponibles para reservar en este momento.
          </div>
        </div>
      </motion.div>
    );
  }

  const pisosPorBodega = pisos.reduce((acc, piso) => {
    if (!acc[piso.Bodega]) acc[piso.Bodega] = [];
    acc[piso.Bodega].push(piso);
    return acc;
  }, {});

  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="lg:col-span-1">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Pisos habilitados
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          {scopePisos === "area"
            ? "Solo se muestran pisos de tu área para reservar automáticamente."
            : "Mostrando pisos generales mientras se parametriza la asignación por área."}
        </p>

        {Object.entries(pisosPorBodega).map(([bodega, pisosBodega], index) => (
          <motion.div key={bodega} className="mb-6 last:mb-0" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 flex items-center justify-between">
              <span>Bodega {bodega}</span>
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{pisosBodega.length} pisos</span>
            </h3>
            <div className="space-y-2">
              {pisosBodega.map((piso) => (
                <motion.button
                  key={piso.IDPiso}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSeleccionarPiso(piso)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                    pisoSeleccionado?.IDPiso === piso.IDPiso
                      ? "border-blue-600 bg-blue-50 text-blue-900"
                      : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Piso {piso.NumeroPiso}</span>
                    {pisoSeleccionado?.IDPiso === piso.IDPiso && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </div>
                  {piso.TotalPuestosArea != null && (
                    <div className="text-xs text-gray-500 mt-1">
                      {piso.TotalPuestosArea} puestos disponibles
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
