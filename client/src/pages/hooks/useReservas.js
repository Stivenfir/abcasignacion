import { useState, useEffect } from "react";

export function useReservas() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [pisos, setPisos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [pisoSeleccionado, setPisoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingReservas, setLoadingReservas] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setPisos([]);
        setReservas([]);
        return;
      }

      // Cargar solo pisos habilitados para el área del usuario
      const resPisos = await fetch(`${API}/api/reservas/pisos-habilitados`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resPisos.ok) throw new Error("Error al cargar pisos habilitados");
      const dataPisos = await resPisos.json();
      const pisosHabilitados = Array.isArray(dataPisos) ? dataPisos : [];

      setPisos(pisosHabilitados);

      // Si el piso seleccionado ya no está habilitado, seleccionar el primero
      setPisoSeleccionado((prev) => {
        if (!pisosHabilitados.length) return null;
        if (prev && pisosHabilitados.some((p) => p.IDPiso === prev.IDPiso)) {
          return prev;
        }
        return pisosHabilitados[0];
      });

      // Cargar reservas del usuario
      const resReservas = await fetch(`${API}/api/reservas/empleado`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resReservas.ok) {
        setReservas([]);
      } else {
        const dataReservas = await resReservas.json();
        setReservas(Array.isArray(dataReservas) ? dataReservas : []);
      }
    } catch (error) {
      console.error("Error en cargarDatos:", error);
      setMensaje({ tipo: "error", texto: "✗ Error al cargar datos de reservas" });
    } finally {
      setLoading(false);
    }
  };

  const cancelarReserva = async (idReserva, observacion) => {
    if (!confirm("¿Estás seguro de cancelar esta reserva?")) return false;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/api/reservas/${idReserva}/cancelar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          observacion: observacion || "Cancelada por el usuario",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al cancelar reserva");
      }

      setMensaje({ tipo: "success", texto: "✓ Reserva cancelada" });
      await cargarDatos();
      return true;
    } catch (error) {
      console.error("Error en cancelarReserva:", error);
      setMensaje({ tipo: "error", texto: `✗ ${error.message}` });
      return false;
    }
  };

  return {
    pisos,
    reservas,
    pisoSeleccionado,
    loading,
    loadingReservas,
    mensaje,
    cargarDatos,
    setPisoSeleccionado,
    setMensaje,
    cancelarReserva,
  };
}
