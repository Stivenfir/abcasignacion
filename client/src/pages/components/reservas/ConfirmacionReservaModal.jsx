// client/src/pages/components/reservas/ConfirmacionReservaModal.jsx    
import { motion } from "framer-motion";    
import { formatearFechaDDMMAAAA } from "../../utils/dateUtils";  // ✅ Importar utilidad  
  
export default function ConfirmacionReservaModal({    
  pisoSeleccionado,    
  fechaSeleccionada,    
  puestoAsignado,    
  onConfirmar,    
  onCancelar    
}) {    
  return (    
    <div    
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"    
      onClick={onCancelar}    
    >    
      <motion.div    
        initial={{ opacity: 0, scale: 0.95 }}    
        animate={{ opacity: 1, scale: 1 }}    
        exit={{ opacity: 0, scale: 0.95 }}    
        onClick={(e) => e.stopPropagation()}    
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"    
      >    
        {/* Header */}    
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">    
          <div className="flex items-center justify-between">    
            <div className="flex items-center gap-3">    
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">    
                <span className="text-2xl">✅</span>    
              </div>    
              <div>    
                <h3 className="text-xl font-bold text-gray-900">    
                  Confirmar Reserva    
                </h3>    
                <p className="text-sm text-gray-600">    
                  Revisa los detalles antes de confirmar    
                </p>    
              </div>    
            </div>    
            <button    
              onClick={onCancelar}    
              className="w-10 h-10 rounded-full hover:bg-white/80 flex items-center justify-center transition text-gray-600 hover:text-gray-900"    
            >    
              <span className="text-2xl">✕</span>    
            </button>    
          </div>    
        </div>    
    
        {/* Contenido */}    
        <div className="p-6 space-y-4">    
          {/* Información del puesto */}    
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">    
            <div className="flex items-center gap-3 mb-3">    
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">    
                <span className="text-2xl text-white">🪑</span>    
              </div>    
              <div>    
                <p className="text-sm text-gray-600">Puesto Asignado</p>    
                <p className="text-2xl font-bold text-blue-900">    
                  #{puestoAsignado?.NoPuesto || 'N/A'}    
                </p>    
              </div>    
            </div>    
                
            {puestoAsignado?.IDClasificacionPuesto && (    
              <div className="flex items-center gap-2 text-sm text-gray-700">    
                <span>💻</span>    
                <span>Clasificación: {puestoAsignado.Clasificacion || 'Estándar'}</span>    
              </div>    
            )}    
          </div>    
    
          {/* Detalles de la reserva */}    
          <div className="space-y-3">    
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">    
              <span className="text-2xl">📅</span>    
              <div className="flex-1">    
                <p className="text-sm font-medium text-gray-600">Fecha</p>    
                <p className="text-base font-semibold text-gray-900">    
                  {formatearFechaDDMMAAAA(fechaSeleccionada)}  {/* ✅ Usar formato DD/MM/AAAA */}  
                </p>    
              </div>    
            </div>    
    
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">    
              <span className="text-2xl">🏢</span>    
              <div className="flex-1">    
                <p className="text-sm font-medium text-gray-600">Ubicación</p>    
                <p className="text-base font-semibold text-gray-900">    
                  Piso {pisoSeleccionado?.NumeroPiso} • Bodega {pisoSeleccionado?.Bodega}    
                </p>    
              </div>    
            </div>    
    
            {puestoAsignado?.UbicacionX && puestoAsignado?.UbicacionY && (    
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">    
                <span className="text-2xl">📍</span>    
                <div className="flex-1">    
                  <p className="text-sm font-medium text-gray-600">Coordenadas</p>    
                  <p className="text-base font-semibold text-gray-900">    
                    ({puestoAsignado.UbicacionX}, {puestoAsignado.UbicacionY})    
                  </p>    
                </div>    
              </div>    
            )}    
          </div>    
    
          {/* Nota informativa */}    
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">    
            <div className="flex gap-3">    
              <span className="text-xl">💡</span>    
              <div className="flex-1">    
                <p className="text-sm font-medium text-yellow-800 mb-1">    
                  Importante    
                </p>    
                <p className="text-xs text-yellow-700">    
                  El puesto ha sido asignado automáticamente por el sistema según disponibilidad.     
                  Podrás cancelar esta reserva desde "Mis Reservas" si es necesario.    
                </p>    
              </div>    
            </div>    
          </div>    
        </div>    
    
        {/* Footer con botones */}    
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3">    
          <motion.button    
            whileHover={{ scale: 1.02 }}    
            whileTap={{ scale: 0.98 }}    
            onClick={onConfirmar}    
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-lg"    
          >    
            ✅ Confirmar Reserva    
          </motion.button>    
          <motion.button    
            whileHover={{ scale: 1.02 }}    
            whileTap={{ scale: 0.98 }}    
            onClick={onCancelar}    
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition font-semibold"    
          >    
            ✕ Cancelar    
          </motion.button>    
        </div>    
      </motion.div>    
    </div>    
  );    
}