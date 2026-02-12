// client/src/pages/MisReservas.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useReservas } from "./hooks/useReservas";
import ReservasSidebar from "./components/reservas/ReservasSidebar";
import ReservasPanel from "./components/reservas/ReservasPanel";
import ConfirmacionReservaModal from "./components/reservas/ConfirmacionReservaModal";
import VisualizarPuestoModal from "./components/reservas/VisualizarPuestoModal";
import AyudaReservas from "./components/reservas/AyudaReservas";

export default function MisReservas() {
  const navigate = useNavigate();
  const reservasData = useReservas();

  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [modalVisualizacion, setModalVisualizacion] = useState(false);
  const [reservaPendiente, setReservaPendiente] = useState(null);

  const handleSolicitarReserva = async (fechaSeleccionada) => {
    try {
      if (!reservasData.pisoSeleccionado?.IDPiso) {
        reservasData.setMensaje({
          tipo: "error",
          texto: "✗ Debes seleccionar un piso habilitado primero",
        });
        return;
      }

      if (!fechaSeleccionada) {
        throw new Error("Debe seleccionar una fecha válida");
      }

      const fechaFormateada =
        fechaSeleccionada instanceof Date
          ? fechaSeleccionada.toISOString().split("T")[0]
          : fechaSeleccionada;

      const puestoAsignado = await reservasData.obtenerPuestoDisponible(
        reservasData.pisoSeleccionado.IDPiso,
        fechaFormateada,
      );

      if (!puestoAsignado) return;

      setReservaPendiente({
        fecha: fechaSeleccionada,
        puestoAsignado,
        pisoSeleccionado: reservasData.pisoSeleccionado,
      });

      setModalConfirmacion(true);
    } catch (error) {
      console.error("Error en handleSolicitarReserva:", error);
      reservasData.setMensaje({
        tipo: "error",
        texto: `✗ ${error.message}`,
      });
    }
  };

  const handleConfirmarReserva = async () => {
    try {
      if (!reservaPendiente?.puestoAsignado?.IdPuestoTrabajo) {
        throw new Error("No se pudo obtener el ID del puesto");
      }

      if (!reservaPendiente?.fecha) {
        throw new Error("No se pudo obtener la fecha de reserva");
      }

      const token = localStorage.getItem("token");

      const fechaFormateada =
        reservaPendiente.fecha instanceof Date
          ? reservaPendiente.fecha.toISOString().split("T")[0]
          : reservaPendiente.fecha;

      const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API}/api/reservas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idPuestoTrabajo: Number(reservaPendiente.puestoAsignado.IdPuestoTrabajo),
          fecha: fechaFormateada,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al crear la reserva");
      }

      reservasData.setMensaje({
        tipo: "success",
        texto: "✓ Reserva creada exitosamente (puesto auto-asignado por área)",
      });

      setModalConfirmacion(false);
      setReservaPendiente(null);

      await reservasData.cargarDatos();
    } catch (error) {
      console.error("Error al confirmar reserva:", error);
      reservasData.setMensaje({
        tipo: "error",
        texto: `✗ ${error.message}`,
      });
    }
  };

  const handleVerMapa = () => {
    setModalVisualizacion(true);
  };

  if (reservasData.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📋 Mis Reservas</h1>
              <p className="text-sm text-gray-600 mt-1">
                Auto-asignación inteligente por área y pisos habilitados
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              ← Volver
            </button>
          </div>
        </div>
      </header>

      {reservasData.mensaje && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`mx-6 mt-4 p-4 rounded-xl ${
            reservasData.mensaje.tipo === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <p className="font-medium">{reservasData.mensaje.texto}</p>
        </motion.div>
      )}

      <main className="p-6">
        <AyudaReservas
          pisos={reservasData.pisos}
          onSeleccionarPiso={reservasData.setPisoSeleccionado}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ReservasSidebar
            pisos={reservasData.pisos}
            pisoSeleccionado={reservasData.pisoSeleccionado}
            onSeleccionarPiso={reservasData.setPisoSeleccionado}
          />

          <ReservasPanel
            pisoSeleccionado={reservasData.pisoSeleccionado}
            reservas={reservasData.reservas}
            loadingReservas={reservasData.loadingReservas}
            onSolicitarReserva={handleSolicitarReserva}
            onCancelarReserva={reservasData.cancelarReserva}
          />
        </div>
      </main>

      {modalConfirmacion && reservaPendiente && (
        <ConfirmacionReservaModal
          pisoSeleccionado={reservaPendiente.pisoSeleccionado}
          fechaSeleccionada={reservaPendiente.fecha}
          puestoAsignado={reservaPendiente.puestoAsignado}
          onConfirmar={handleConfirmarReserva}
          onVerMapa={handleVerMapa}
          onCancelar={() => {
            setModalConfirmacion(false);
            setReservaPendiente(null);
          }}
        />
      )}

      {modalVisualizacion && reservaPendiente && (
        <VisualizarPuestoModal
          puestoAsignado={reservaPendiente.puestoAsignado}
          pisoSeleccionado={reservaPendiente.pisoSeleccionado}
          onClose={() => setModalVisualizacion(false)}
        />
      )}
    </div>
  );
}
