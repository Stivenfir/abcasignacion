import { useState, useEffect } from "react";

const REQUEST_TIMEOUT_MS = 10000;

async function fetchConTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export function useReservas() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [pisos, setPisos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [pisoSeleccionado, setPisoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingReservas, setLoadingReservas] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [scopePisos, setScopePisos] = useState("area");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setPisos([]);
        setReservas([]);
        setLoading(false);
        return;
      }

      setLoadingReservas(true);

      const headers = { Authorization: `Bearer ${token}` };

      const [resPisos, resReservas] = await Promise.allSettled([
        fetchConTimeout(`${API}/api/reservas/pisos-habilitados`, { headers }),
        fetchConTimeout(`${API}/api/reservas/empleado`, { headers }),
      ]);

      let pisosHabilitados = [];
      let scope = "area";

      if (resPisos.status === "fulfilled" && resPisos.value.ok) {
        const dataPisos = await resPisos.value.json();
        pisosHabilitados = Array.isArray(dataPisos)
          ? dataPisos
          : Array.isArray(dataPisos?.pisos)
            ? dataPisos.pisos
            : [];

        scope = ["global", "all-pisos"].includes(dataPisos?.scope)
          ? dataPisos.scope
          : "area";
      }

      // Fallback al comportamiento original: usar /api/pisos si el endpoint nuevo no trae datos
      if (!pisosHabilitados.length) {
        const resPisosOriginal = await fetchConTimeout(`${API}/api/pisos`);
        if (resPisosOriginal.ok) {
          const dataPisosOriginal = await resPisosOriginal.json();
          pisosHabilitados = Array.isArray(dataPisosOriginal)
            ? dataPisosOriginal
            : [];
          if (pisosHabilitados.length) {
            scope = "all-pisos";
          }
        }
      }

      setPisos(pisosHabilitados);
      setScopePisos(scope);

      setPisoSeleccionado((prev) => {
        if (!pisosHabilitados.length) return null;
        if (prev && pisosHabilitados.some((p) => p.IDPiso === prev.IDPiso)) {
          return prev;
        }
        return pisosHabilitados[0];
      });

      if (resReservas.status === "fulfilled" && resReservas.value.ok) {
        const dataReservas = await resReservas.value.json();
        setReservas(Array.isArray(dataReservas) ? dataReservas : []);
      } else {
        setReservas([]);
      }
    } catch (error) {
      const mensajeError =
        error.name === "AbortError"
          ? "✗ La consulta de reservas tardó demasiado. Intenta recargar."
          : "✗ Error al cargar datos de reservas";
      setMensaje({ tipo: "error", texto: mensajeError });
      setPisos([]);
      setReservas([]);
    } finally {
      setLoading(false);
      setLoadingReservas(false);
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
    scopePisos,
  };
}
