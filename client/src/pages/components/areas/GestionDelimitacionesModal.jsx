import { motion } from "framer-motion";

export default function GestionDelimitacionesModal({
  areaPiso,
  area,
  delimitaciones,
  onEditarDelimitacion,
  onEliminarDelimitacion,
  onClose,
}) {
  const delims = delimitaciones[areaPiso.IdAreaPiso] || [];
  console.log('🔍 Estructura de delimitaciones:', delims);  
console.log('🔍 Primera delimitación:', delims[0]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-6"
      >
        <h3 className="text-xl font-bold mb-4">
          Gestionar Delimitaciones - {area?.NombreArea}
        </h3>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {delims.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay delimitaciones para esta área
            </p>
          ) : (
            delims.map((delim, index) => (
              <div
                key={delim.IdDelimitacion || index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
              >
                <div>
                  <p className="font-medium">Delimitación #{index + 1}</p>
                  <p className="text-sm text-gray-600">
                    Posición: ({delim.PosicionX}, {delim.PosicionY}) | Tamaño:{" "}
                    {delim.Ancho}x{delim.Alto}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onClose(); // Cerrar modal de gestión
                      onEditarDelimitacion(areaPiso, delim); // ✅ Pasar la delimitación
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() =>
                      onEliminarDelimitacion(
                        areaPiso.IdAreaPiso,
                        delim.IdDelimitacion,
                      )
                    }
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 w-full"
        >
          Cerrar
        </button>
      </motion.div>
    </div>
  );
}
