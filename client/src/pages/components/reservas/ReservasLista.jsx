// client/src/pages/components/reservas/ReservasLista.jsx  
import { motion } from "framer-motion";  
  
export default function ReservasLista({  
  reservas,  
  loadingReservas,  
  onCancelarReserva  
}) {  
  const getEstadoBadge = (estado) => {  
    const estados = {  
      activa: {  
        bg: "bg-green-100",  
        text: "text-green-700",  
        icon: "✓",  
        label: "Activa"  
      },  
      cancelada: {  
        bg: "bg-red-100",  
        text: "text-red-700",  
        icon: "✕",  
        label: "Cancelada"  
      },  
      pasada: {  
        bg: "bg-gray-100",  
        text: "text-gray-700",  
        icon: "⏱",  
        label: "Pasada"  
      }  
    };  
    return estados[estado] || estados.activa;  
  };  
  
  const determinarEstado = (reserva) => {  
    if (!reserva.ReservaActiva) return "cancelada";  
      
    const fechaReserva = new Date(reserva.FechaReserva);  
    const hoy = new Date();  
    hoy.setHours(0, 0, 0, 0);  
      
    if (fechaReserva < hoy) return "pasada";  
    return "activa";  
  };  
  
  const formatearFecha = (fecha) => {  
    return new Date(fecha).toLocaleDateString('es-ES', {  
      weekday: 'long',  
      day: 'numeric',  
      month: 'long',  
      year: 'numeric'  
    });  
  };  
  
  const puedeCancel = (reserva) => {  
    const estado = determinarEstado(reserva);  
    return estado === "activa";  
  };  
  
  if (loadingReservas) {  
    return (  
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">  
        <div className="text-center py-8">  
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>  
          <p className="text-gray-600 mt-4">Cargando reservas...</p>  
        </div>  
      </div>  
    );  
  }  
  
  if (reservas.length === 0) {  
    return (  
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">  
        <div className="text-center py-12">  
          <span className="text-6xl mb-4 block">📭</span>  
          <h4 className="text-lg font-semibold text-gray-900 mb-2">  
            No tienes reservas  
          </h4>  
          <p className="text-gray-500">  
            Selecciona una fecha en el calendario para crear tu primera reserva  
          </p>  
        </div>  
      </div>  
    );  
  }  
  
  return (  
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">  
      <div className="mb-4">  
        <h4 className="text-lg font-semibold text-gray-900">  
          Mis Reservas ({reservas.length})  
        </h4>  
      </div>  
  
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">  
        {reservas.map((reserva) => {  
          const estado = determinarEstado(reserva);  
          const badge = getEstadoBadge(estado);  
            
          return (  
            <motion.div  
              key={reserva.IdEmpleadoPuestoTrabajo}  
              initial={{ opacity: 0, scale: 0.95 }}  
              animate={{ opacity: 1, scale: 1 }}  
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition"  
            >  
              <div className="flex items-start justify-between mb-3">  
                <div className="flex items-center gap-3">  
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">  
                    <span className="text-blue-600 font-bold text-sm">  
                      #{reserva.NoPuesto || "?"}  
                    </span>  
                  </div>  
                  <div>  
                    <span className="font-medium text-gray-900 block">  
                      Puesto #{reserva.NoPuesto || "Sin asignar"}  
                    </span>  
                    <span className="text-xs text-gray-500">  
                      ID: {reserva.IdEmpleadoPuestoTrabajo}  
                    </span>  
                  </div>  
                </div>  
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>  
                  {badge.icon} {badge.label}  
                </span>  
              </div>  
  
              <div className="space-y-2 mb-3">  
                <div className="flex items-center gap-2 text-sm text-gray-700">  
                  <span>📅</span>  
                  <span className="font-medium">  
                    {formatearFecha(reserva.FechaReserva)}  
                  </span>  
                </div>  
                <div className="flex items-center gap-2 text-sm text-gray-600">  
                  <span>🏢</span>  
                  <span>Piso {reserva.NumeroPiso || "?"}</span>  
                </div>  
                {reserva.NombreArea && (  
                  <div className="flex items-center gap-2 text-sm text-gray-600">  
                    <span>📍</span>  
                    <span>{reserva.NombreArea}</span>  
                  </div>  
                )}  
              </div>  
  
              {estado === "cancelada" && reserva.ObservacionCancelacionReserva && (  
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">  
                  <p className="text-xs text-red-700">  
                    <span className="font-semibold">Motivo de cancelación:</span>{" "}  
                    {reserva.ObservacionCancelacionReserva}  
                  </p>  
                  {reserva.FechaCancelacionReserva && (  
                    <p className="text-xs text-red-600 mt-1">  
                      Cancelada el {new Date(reserva.FechaCancelacionReserva).toLocaleDateString('es-ES')}  
                    </p>  
                  )}  
                </div>  
              )}  
  
              {puedeCancel(reserva) && (  
                <motion.button  
                  whileHover={{ scale: 1.02 }}  
                  whileTap={{ scale: 0.98 }}  
                  onClick={() => {  
                    if (confirm("¿Estás seguro de cancelar esta reserva?")) {  
                      onCancelarReserva(reserva.IdEmpleadoPuestoTrabajo);  
                    }  
                  }}  
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"  
                >  
                  🗑️ Cancelar Reserva  
                </motion.button>  
              )}  
            </motion.div>  
          );  
        })}  
      </div>  
    </div>  
  );  
}