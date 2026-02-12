// client/src/pages/hooks/useReservas.js
import { useState, useEffect } from "react";

export function useReservas() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [pisos, setPisos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [pisoSeleccionado, setPisoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingReservas] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const obtenerFechaHoy = () => new Date().toISOString().split("T")[0];

  const cargarPisosDisponiblesPorArea = async (todosLosPisos, fecha) => {
    const token = localStorage.getItem("token");
    const resDisponibles = await fetch(`${API}/api/reservas/disponibles/${fecha}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!resDisponibles.ok) {
      return [];
    }

    const puestos = await resDisponibles.json();
    if (!Array.isArray(puestos)) return [];

    const conteoPorPiso = puestos.reduce((acc, puesto) => {
      const idPiso = Number(puesto.IdPiso);
      acc[idPiso] = (acc[idPiso] || 0) + 1;
      return acc;
    }, {});

    return todosLosPisos
      .filter((piso) => conteoPorPiso[Number(piso.IDPiso)] > 0)
      .map((piso) => ({
        ...piso,
        cantidadDisponibles: conteoPorPiso[Number(piso.IDPiso)] || 0,
      }));
  };

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem("token");

      const resPisos = await fetch(`${API}/api/pisos`);
      if (!resPisos.ok) throw new Error("Error al cargar pisos");
      const dataPisos = await resPisos.json();

      const pisosFiltrados = await cargarPisosDisponiblesPorArea(
        dataPisos,
        obtenerFechaHoy(),
      );
      setPisos(pisosFiltrados);

      setPisoSeleccionado((prev) => {
        if (!pisosFiltrados.length) return null;
        if (prev && pisosFiltrados.some((p) => p.IDPiso === prev.IDPiso)) {
          return prev;
        }
        return pisosFiltrados[0];
      });

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
      setMensaje({ tipo: "error", texto: "✗ Error al cargar datos" });
    } finally {
      setLoading(false);
    }
  };

  const obtenerPuestoDisponible = async (idPiso, fecha) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/reservas/disponibles/${fecha}?idPiso=${idPiso}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(
          `Error ${res.status}: No se pudieron obtener puestos disponibles`,
        );
      }

      const puestosDisponibles = await res.json();
      if (!Array.isArray(puestosDisponibles) || puestosDisponibles.length === 0) {
        setMensaje({
          tipo: "error",
          texto: "✗ No hay puestos disponibles para tu área en este piso/fecha",
        });
        return null;
      }

      // Auto-asignación por área: primer puesto disponible del piso elegido.
      return puestosDisponibles[0];
    } catch (error) {
      console.error("Error en obtenerPuestoDisponible:", error);
      setMensaje({
        tipo: "error",
        texto: "✗ Error al buscar puestos disponibles",
      });
      return null;
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
        body: JSON.stringify({ observacion: observacion || "Cancelada por el usuario" }),
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
    obtenerPuestoDisponible,
    cancelarReserva,
  };
}
