// client/src/pages/components/reservas/DetalleReservaModal.jsx  
import { motion } from "framer-motion";  
  
export default function DetalleReservaModal({  
  reserva,  
  onClose,  
  onCancelar  
}) {  
  const formatearFecha = (fecha) => {  
    if (!fecha) return 'N/A';  
    return new Date(fecha).toLocaleDateString('es-ES', {  
      weekday: 'long',  
      year: 'numeric',  
      month: 'long',  
      day: 'numeric'  
    });  
  };  
  
  const formatearFechaHora = (fecha) => {  
    if (!fecha) return 'N/A';  
    return new Date(fecha).toLocaleString('es-ES', {  
      year: 'numeric',  
      month: 'long',  
      day: 'numeric',  
      hour: '2-digit',  
      minute: '2-digit'  
    });  
  };  
  
  const getEstadoBadge = (estado) => {  
    if (estado === 1 || estado === '1') {  
      return {  
        bg: 'bg-green-100',  
        text: 'text-green-700',  
        icon: '✅',  
        label: 'Activa'  
      };  
    }  
    return {  
      bg: 'bg-red-100',  
      text: 'text-red-700',  
      icon: '❌',  
      label: 'Cancelada'  
    };  
  };  
  
  const badge = getEstadoBadge(reserva.ReservaActiva);  
  
  return (  
    <div  
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"  
      onClick={onClose}  
    >  
      <motion.div  
        initial={{ opacity: 0, scale: 0.95 }}  
        animate={{ opacity: 1, scale: 1 }}  
        exit={{ opacity: 0, scale: 0.95 }}  
        onClick={(e) => e.stopPropagation()}  
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"  
      >  
        {/* Header */}  
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">  
          <div className="flex items-center justify-between">  
            <div className="flex items-center gap-3">  
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">  
                <span className="text-2xl">📋</span>  
              </div>  
              <div>  
                <h3 className="text-xl font-bold text-gray-900">  
                  Detalle de Reserva  
                </h3>  
                <p className="text-sm text-gray-600">  
                  ID: {reserva.IdEmpleadoPuestoTrabajo}  
                </p>  
              </div>  
            </div>  
            <button  
              onClick={onClose}  
              className="w-10 h-10 rounded-full hover:bg-white/80 flex items-center justify-center transition text-gray-600 hover:text-gray-900"  
            >  
              <span className="text-2xl">✕</span>  
            </button>  
          </div>  
        </div>  
  
        {/* Contenido con scroll */}  
        <div className="flex-1 overflow-y-auto p-6 space-y-6">  
          {/* Estado de la reserva */}  
          <div className={`${badge.bg} border-2 ${badge.bg.replace('100', '200')} rounded-xl p-4`}>  
            <div className="flex items-center gap-3">  
              <span className="text-3xl">{badge.icon}</span>  
              <div>  
                <p className="text-sm font-medium text-gray-600">Estado</p>  
                <p className={`text-xl font-bold ${badge.text}`}>  
                  {badge.label}  
                </p>  
              </div>  
            </div>  
          </div>  
  
          {/* Información del puesto */}  
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">  
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">  
              <span>🪑</span>  
              Información del Puesto  
            </h4>  
            <div className="space-y-2">  
              <div className="flex justify-between items-center">  
                <span className="text-sm text-gray-600">Número de Puesto:</span>  
                <span className="text-lg font-bold text-blue-900">  
                  #{reserva.NoPuesto || reserva.IdPuestoTrabajo}  
                </span>  
              </div>  
              {reserva.Clasificacion && (  
                <div className="flex justify-between items-center">  
                  <span className="text-sm text-gray-600">Clasificación:</span>  
                  <span className="text-sm font-medium text-gray-900">  
                    {reserva.Clasificacion}  
                  </span>  
                </div>  
              )}  
              {reserva.UbicacionX && reserva.UbicacionY && (  
                <div className="flex justify-between items-center">  
                  <span className="text-sm text-gray-600">Coordenadas:</span>  
                  <span className="text-sm font-medium text-gray-900">  
                    ({reserva.UbicacionX}, {reserva.UbicacionY})  
                  </span>  
                </div>  
              )}  
            </div>  
          </div>  
  
          {/* Detalles de la reserva */}  
          <div className="space-y-3">  
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">  
              <span>📅</span>  
              Detalles de la Reserva  
            </h4>  

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">  
                <div className="p-4 bg-gray-50 rounded-lg">  
                <p className="text-xs font-medium text-gray-500 mb-1">Fecha de Reserva</p>  
                <p className="text-sm font-semibold text-gray-900">  
                  {formatearFecha(reserva.FechaReserva)}  
                </p>  
              </div>  
  
              <div className="p-4 bg-gray-50 rounded-lg">  
                <p className="text-xs font-medium text-gray-500 mb-1">Estado</p>  
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${  
                  reserva.ReservaActiva === 1  
                    ? 'bg-green-100 text-green-800'  
                    : 'bg-red-100 text-red-800'  
                }`}>  
                  {reserva.ReservaActiva === 1 ? '✓ Activa' : '✕ Cancelada'}  
                </span>  
              </div>  
  
              {reserva.ReservaActiva === 0 && (  
                <>  
                  <div className="p-4 bg-gray-50 rounded-lg">  
                    <p className="text-xs font-medium text-gray-500 mb-1">Fecha de Cancelación</p>  
                    <p className="text-sm font-semibold text-gray-900">  
                      {formatearFecha(reserva.FechaCancelacionReserva)}  
                    </p>  
                  </div>  
  
                  <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">  
                    <p className="text-xs font-medium text-gray-500 mb-1">Motivo de Cancelación</p>  
                    <p className="text-sm text-gray-900">  
                      {reserva.ObservacionCancelacionReserva || 'Sin observaciones'}  
                    </p>  
                  </div>  
                </>  
              )}  
            </div>  
          </div>  
  
          {/* Información del puesto */}  
          {reserva.NoPuesto && (  
            <div className="space-y-3">  
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">  
                <span>🪑</span>  
                Información del Puesto  
              </h4>  
  
              <div className="grid grid-cols-2 gap-3">  
                <div className="p-4 bg-blue-50 rounded-lg">  
                  <p className="text-xs font-medium text-blue-600 mb-1">Número de Puesto</p>  
                  <p className="text-2xl font-bold text-blue-900">#{reserva.NoPuesto}</p>  
                </div>  
  
                <div className="p-4 bg-blue-50 rounded-lg">  
                  <p className="text-xs font-medium text-blue-600 mb-1">Clasificación</p>  
                  <p className="text-sm font-semibold text-blue-900">  
                    {reserva.ClasificacionDescripcion || 'Sin clasificación'}  
                  </p>  
                </div>  
              </div>  
            </div>  
          )}  
        </div>  
  
        {/* Footer con acciones */}  
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">  
          {reserva.ReservaActiva === 1 && (  
            <motion.button  
              whileHover={{ scale: 1.02 }}  
              whileTap={{ scale: 0.98 }}  
              onClick={() => {  
                if (confirm('¿Estás seguro de cancelar esta reserva?')) {  
                  onCancelarReserva(reserva.IdEmpleadoPuestoTrabajo, undefined, reserva.IdPuestoTrabajo);  
                  onClose();  
                }  
              }}  
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold"  
            >  
              🗑️ Cancelar Reserva  
            </motion.button>  
          )}  
  
          <motion.button  
            whileHover={{ scale: 1.02 }}  
            whileTap={{ scale: 0.98 }}  
            onClick={onClose}  
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition font-semibold"  
          >  
            ✕ Cerrar  
          </motion.button>  
        </div>  
      </motion.div>  
    </div>  
  );  
}