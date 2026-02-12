// client/src/pages/components/reservas/ReservasLista.jsx
import { motion } from "framer-motion";
import { convertirYYYYMMDDaDDMMAAAA } from "../../utils/dateUtils";

export default function ReservasLista({
  reservas,
  loadingReservas,
  onCancelarReserva,
  onVerMapaReserva,
  pisoSeleccionado,
}) {
  const getEstadoBadge = (estado) => {
    const estados = {
      activa: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: "✓",
        label: "Activa",
      },
      cancelada: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: "✕",
        label: "Cancelada",
      },
      pasada: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        icon: "⏱",
        label: "Pasada",
      },
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
          const numeroPuesto =
            reserva.NoPuesto ?? reserva.IdPuestoTrabajo ?? "Sin dato";
          const textoPiso =
            reserva.NumeroPiso != null
              ? `Piso ${reserva.NumeroPiso}`
              : "Piso no identificado";

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
                      #{numeroPuesto}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 block">
                      Puesto #{numeroPuesto}
                    </span>
                    <span className="text-xs text-gray-500">
                      Reserva ID: {reserva.IdEmpleadoPuestoTrabajo}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
                >
                  {badge.icon} {badge.label}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>📅</span>
                  <span className="font-medium">
                    {convertirYYYYMMDDaDDMMAAAA(reserva.FechaReserva)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>🏢</span>
                  <span>{textoPiso}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>🗺️</span>
                  <span>
                    {reserva.UbicacionX != null && reserva.UbicacionY != null
                      ? `Ubicación (${reserva.UbicacionX}, ${reserva.UbicacionY})`
                      : "Ubicación exacta no disponible en esta reserva"}
                  </span>
                </div>
                {reserva.NombreArea && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📍</span>
                    <span>{reserva.NombreArea}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onVerMapaReserva?.(reserva)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  🗺️ Ver mapa
                </motion.button>

                {puedeCancel(reserva) ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onCancelarReserva(reserva.IdEmpleadoPuestoTrabajo)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    🗑️ Cancelar Reserva
                  </motion.button>
                ) : (
                  <div className="w-full px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-center text-sm">
                    No cancelable
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
