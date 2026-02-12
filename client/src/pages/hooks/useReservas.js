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


async function construirIndicePuestosPorPiso(API, headers, pisosFuente = []) {
  const indice = new Map();
  const pisos = (Array.isArray(pisosFuente) ? pisosFuente : []).filter((p) => p?.IDPiso != null);

  await Promise.all(
    pisos.map(async (piso) => {
      try {
        const resAreas = await fetchConTimeout(`${API}/api/areas/piso/${piso.IDPiso}`, { headers });
        if (!resAreas.ok) return;

        const areas = await resAreas.json();
        const listaAreas = Array.isArray(areas) ? areas : [];

        const respuestasPuestos = await Promise.all(
          listaAreas
            .filter((a) => a?.IdAreaPiso)
            .map((area) =>
              fetchConTimeout(`${API}/api/puestos/area/${area.IdAreaPiso}`, { headers })
                .then((r) => (r.ok ? r.json() : []))
                .catch(() => []),
            ),
        );

        respuestasPuestos.flat().forEach((puesto) => {
          const idPuesto = Number(puesto?.IdPuestoTrabajo);
          if (!Number.isFinite(idPuesto) || idPuesto <= 0) return;

          indice.set(idPuesto, {
            IdPiso: Number(piso.IDPiso),
            NumeroPiso: piso.NumeroPiso ?? piso.IDPiso,
            Bodega: piso.Bodega ?? null,
            IdArea: puesto?.IdArea ?? null,
            NombreArea: puesto?.NombreArea ?? null,
            UbicacionX: puesto?.UbicacionX ?? null,
            UbicacionY: puesto?.UbicacionY ?? null,
            NoPuesto: puesto?.NoPuesto ?? null,
            IdAreaPiso: puesto?.IdAreaPiso ?? null,
          });
        });
      } catch {
        // noop
      }
    }),
  );

  return indice;
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

      const [resPisos, resReservas, resCatalogoPisos] = await Promise.allSettled([
        fetchConTimeout(`${API}/api/reservas/pisos-habilitados`, { headers }),
        fetchConTimeout(`${API}/api/reservas/empleado`, { headers }),
        fetchConTimeout(`${API}/api/pisos`),
      ]);

      let catalogoPisos =
        resCatalogoPisos.status === "fulfilled" && resCatalogoPisos.value.ok
          ? await resCatalogoPisos.value.json()
          : [];
      catalogoPisos = Array.isArray(catalogoPisos) ? catalogoPisos : [];

      let pisosNormalizados = [];

      if (resPisos.status === "fulfilled" && resPisos.value.ok) {
        const dataPisos = await resPisos.value.json();
        const pisosHabilitadosBase = Array.isArray(dataPisos)
          ? dataPisos
          : Array.isArray(dataPisos?.pisos)
            ? dataPisos.pisos
            : [];

        const mapaCatalogo = new Map(
          catalogoPisos.map((piso) => [
            Number(piso.IDPiso),
            piso,
          ]),
        );

        const pisosHabilitados = pisosHabilitadosBase.map((piso) => {
          const catalogo = mapaCatalogo.get(Number(piso.IDPiso));
          return {
            ...piso,
            NumeroPiso: catalogo?.NumeroPiso ?? piso.NumeroPiso ?? piso.IDPiso,
            Bodega: catalogo?.Bodega ?? piso.Bodega ?? "Sin bodega",
          };
        });

        const scope = ["global", "all-pisos"].includes(dataPisos?.scope)
          ? dataPisos.scope
          : "area";

        pisosNormalizados = pisosHabilitados;
        setPisos(pisosHabilitados);
        setScopePisos(scope);

        setPisoSeleccionado((prev) => {
          if (!pisosHabilitados.length) return null;
          if (prev && pisosHabilitados.some((p) => p.IDPiso === prev.IDPiso)) {
            return prev;
          }
          return pisosHabilitados[0];
        });
      } else {
        setPisos([]);
        setScopePisos("area");
      }

      if (resReservas.status === "fulfilled" && resReservas.value.ok) {
        const dataReservas = await resReservas.value.json();
        let reservasBase = Array.isArray(dataReservas) ? dataReservas : [];

        if (reservasBase.length) {
          const pisosFuente = pisosNormalizados.length
            ? pisosNormalizados
            : catalogoPisos.map((p) => ({
                IDPiso: p.IDPiso,
                NumeroPiso: p.NumeroPiso,
                Bodega: p.Bodega,
              }));

          const indicePuestos = await construirIndicePuestosPorPiso(API, headers, pisosFuente);

          reservasBase = reservasBase.map((reserva) => {
            const detalle = indicePuestos.get(Number(reserva?.IdPuestoTrabajo));
            if (!detalle) return reserva;

            return {
              ...detalle,
              ...reserva,
              IdPiso: reserva?.IdPiso ?? detalle.IdPiso,
              NumeroPiso: reserva?.NumeroPiso ?? detalle.NumeroPiso,
              UbicacionX: reserva?.UbicacionX ?? detalle.UbicacionX,
              UbicacionY: reserva?.UbicacionY ?? detalle.UbicacionY,
              NombreArea: reserva?.NombreArea ?? detalle.NombreArea,
              IdArea: reserva?.IdArea ?? detalle.IdArea,
            };
          });
        }

        setReservas(reservasBase);
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
