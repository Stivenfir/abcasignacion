import { motion } from "framer-motion";

export default function ReservasSidebar({
  pisos,
  pisoSeleccionado,
  onSeleccionarPiso,
}) {
  if (!pisos.length) {
    return (
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pisos habilitados
          </h2>
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
            No hay pisos disponibles para tu área.
          </div>
        </div>
      </div>
    );
  }

  const pisosPorBodega = pisos.reduce((acc, piso) => {
    if (!acc[piso.Bodega]) acc[piso.Bodega] = [];
    acc[piso.Bodega].push(piso);
    return acc;
  }, {});

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Pisos habilitados
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Solo se muestran pisos de tu área para reservar automáticamente.
        </p>

        {Object.entries(pisosPorBodega).map(([bodega, pisosBodega]) => (
          <div key={bodega} className="mb-6 last:mb-0">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Bodega {bodega}
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
                      {piso.TotalPuestosArea} puestos de tu área
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
