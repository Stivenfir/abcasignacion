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


  const enriquecerReservasConPuesto = async (reservasBase, catalogoPisos, headers) => {
    if (!Array.isArray(reservasBase) || !reservasBase.length) return [];

    const necesitaEnriquecer = reservasBase.some(
      (r) =>
        r?.IdPiso == null ||
        r?.NumeroPiso == null ||
        r?.UbicacionX == null ||
        r?.UbicacionY == null ||
        !r?.NombreArea,
    );

    if (!necesitaEnriquecer) return reservasBase;

    const pisosLista = Array.isArray(catalogoPisos) ? catalogoPisos : [];
    if (!pisosLista.length) return reservasBase;

    const indicePuestos = new Map();

    for (const piso of pisosLista) {
      try {
        const resAreas = await fetchConTimeout(`${API}/api/areas/piso/${piso.IDPiso}`, { headers });
        if (!resAreas.ok) continue;

        const areas = await resAreas.json();
        const listaAreas = Array.isArray(areas) ? areas : [];

        const respuestasPuestos = await Promise.all(
          listaAreas
            .filter((a) => a?.IdAreaPiso)
            .map((a) =>
              fetchConTimeout(`${API}/api/puestos/area/${a.IdAreaPiso}`, { headers })
                .then((r) => (r.ok ? r.json() : []))
                .catch(() => []),
            ),
        );

        for (let i = 0; i < listaAreas.length; i += 1) {
          const area = listaAreas[i];
          const puestosArea = Array.isArray(respuestasPuestos[i]) ? respuestasPuestos[i] : [];

          for (const puesto of puestosArea) {
            const idPuesto = Number(puesto?.IdPuestoTrabajo);
            if (!idPuesto || indicePuestos.has(idPuesto)) continue;

            indicePuestos.set(idPuesto, {
              IdPiso: Number(piso.IDPiso),
              NumeroPiso: piso.NumeroPiso ?? piso.IDPiso,
              Bodega: piso.Bodega ?? null,
              IdArea: area?.IdArea ?? null,
              IdAreaPiso: area?.IdAreaPiso ?? null,
              NombreArea: area?.NombreArea ?? null,
              UbicacionX: puesto?.UbicacionX ?? null,
              UbicacionY: puesto?.UbicacionY ?? null,
              Disponible: puesto?.Disponible,
            });
          }
        }
      } catch {
        // noop
      }
    }

    return reservasBase.map((reserva) => {
      const idPuesto = Number(reserva?.IdPuestoTrabajo);
      const info = idPuesto ? indicePuestos.get(idPuesto) : null;
      if (!info) return reserva;

      return {
        ...info,
        ...reserva,
        IdPiso: reserva?.IdPiso ?? info.IdPiso,
        NumeroPiso: reserva?.NumeroPiso ?? info.NumeroPiso,
        IdArea: reserva?.IdArea ?? info.IdArea,
        IdAreaPiso: reserva?.IdAreaPiso ?? info.IdAreaPiso,
        NombreArea: reserva?.NombreArea || info.NombreArea,
        UbicacionX: reserva?.UbicacionX ?? info.UbicacionX,
        UbicacionY: reserva?.UbicacionY ?? info.UbicacionY,
      };
    });
  };

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
        fetchConTimeout(`${API}/api/pisos`, { headers }),
      ]);

      const catalogoPisos =
        resCatalogoPisos.status === "fulfilled" && resCatalogoPisos.value.ok
          ? await resCatalogoPisos.value.json()
          : [];

      if (resPisos.status === "fulfilled" && resPisos.value.ok) {
        const dataPisos = await resPisos.value.json();
        const pisosHabilitadosBase = Array.isArray(dataPisos)
          ? dataPisos
          : Array.isArray(dataPisos?.pisos)
            ? dataPisos.pisos
            : [];

        const mapaCatalogo = new Map(
          (Array.isArray(catalogoPisos) ? catalogoPisos : []).map((piso) => [
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
        const reservasBase = Array.isArray(dataReservas) ? dataReservas : [];
        const reservasEnriquecidas = await enriquecerReservasConPuesto(
          reservasBase,
          catalogoPisos,
          headers,
        );
        setReservas(reservasEnriquecidas);
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
