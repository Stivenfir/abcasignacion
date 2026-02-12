import { useState, useRef, useEffect } from "react";  
import { motion } from "framer-motion";  

function pickFirst(raw, keys) {
  for (const key of keys) {
    if (raw?.[key] !== undefined && raw?.[key] !== null && raw?.[key] !== "") {
      return raw[key];
    }
  }
  return null;
}

function getReservaCoords(raw) {
  const xRaw = pickFirst(raw, [
    "UbicacionX",
    "ubicacionX",
    "PosicionX",
    "posicionX",
    "X",
    "x",
  ]);
  const yRaw = pickFirst(raw, [
    "UbicacionY",
    "ubicacionY",
    "PosicionY",
    "posicionY",
    "Y",
    "y",
  ]);

  const x = Number(xRaw);
  const y = Number(yRaw);
  const hasCoords = Number.isFinite(x) && Number.isFinite(y);

  return {
    hasCoords,
    x: hasCoords ? x : null,
    y: hasCoords ? y : null,
  };
}

function getReservaPuestoLabel(raw) {
  return pickFirst(raw, [
    "NoPuesto",
    "NumeroPuesto",
    "Puesto",
    "IdPuestoTrabajo",
    "IDPuestoTrabajo",
  ]);
}

function getReservaIdPuesto(raw) {
  const idRaw = pickFirst(raw, ["IdPuestoTrabajo", "IDPuestoTrabajo", "idPuestoTrabajo"]);
  const id = Number(idRaw);
  return Number.isFinite(id) ? id : null;
}
  
export default function MapaReservaModal({  
  reserva,  
  pisoSeleccionado,  
  areaAsignada,  
  onClose  
}) {  
  const [reservaRender, setReservaRender] = useState(reserva || null);
  const [planoUrl, setPlanoUrl] = useState(null);  
  const [loading, setLoading] = useState(true);  
  const [loadingUbicacion, setLoadingUbicacion] = useState(false);
  const canvasRef = useRef(null);  
  const imagenRef = useRef(null);  
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";  

  useEffect(() => {
    setReservaRender(reserva || null);
  }, [reserva]);
  
  useEffect(() => {  
    if (pisoSeleccionado?.IDPiso) {  
      cargarPlano();  
    }  
  }, [pisoSeleccionado]);  

  useEffect(() => {
    const resolverUbicacionReserva = async () => {
      if (!reserva) return;

      const coords = getReservaCoords(reserva);
      if (coords.hasCoords || !pisoSeleccionado?.IDPiso) {
        return;
      }

      const idPuesto = getReservaIdPuesto(reserva);
      if (!idPuesto) return;

      const token = localStorage.getItem("token");
      if (!token) return;

      setLoadingUbicacion(true);
      try {
        const resAreas = await fetch(`${API}/api/areas/piso/${pisoSeleccionado.IDPiso}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resAreas.ok) return;

        const areas = await resAreas.json();
        const areasValidas = (Array.isArray(areas) ? areas : []).filter((a) => a?.IdAreaPiso);
        if (!areasValidas.length) return;

        const respuestasPuestos = await Promise.all(
          areasValidas.map((area) =>
            fetch(`${API}/api/puestos/area/${area.IdAreaPiso}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((r) => (r.ok ? r.json() : []))
              .catch(() => []),
          ),
        );

        const puestos = respuestasPuestos.flat().filter(Boolean);
        const puesto = puestos.find((p) => Number(p?.IdPuestoTrabajo) === idPuesto);
        if (!puesto) return;

        setReservaRender((prev) => ({
          ...(prev || {}),
          ...puesto,
          NoPuesto: getReservaPuestoLabel(prev) ?? getReservaPuestoLabel(puesto),
        }));
      } finally {
        setLoadingUbicacion(false);
      }
    };

    resolverUbicacionReserva();
  }, [API, pisoSeleccionado, reserva]);
  
  const cargarPlano = async () => {  
    try {  
      const res = await fetch(`${API}/api/pisos/plano/${pisoSeleccionado.IDPiso}`);  
      const data = await res.json();  
        
      if (data.success && data.ruta) {  
        setPlanoUrl(`${API}${data.ruta}`);  
      }  
    } catch (error) {  
      console.error("Error al cargar plano:", error);  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  const dibujarPuestoAsignado = () => {  
    const coords = getReservaCoords(reservaRender);

    if (!canvasRef.current || !coords.hasCoords)
      return;  
  
    const canvas = canvasRef.current;  
    const ctx = canvas.getContext("2d");  
    ctx.clearRect(0, 0, canvas.width, canvas.height);  
  
    const { x, y } = coords;
  
    // Dibujar círculo verde brillante para el puesto asignado  
    ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';  
    ctx.shadowBlur = 10;  
    ctx.shadowOffsetX = 0;  
    ctx.shadowOffsetY = 0;  
  
    ctx.beginPath();  
    ctx.arc(x, y, 15, 0, 2 * Math.PI);  
    ctx.fillStyle = "#10B981";  
    ctx.fill();  
  
    ctx.shadowColor = 'transparent';  
    ctx.strokeStyle = "#059669";  
    ctx.lineWidth = 3;  
    ctx.stroke();  
  
    // Dibujar número del puesto  
    ctx.fillStyle = "#FFFFFF";  
    ctx.font = "bold 14px Arial";  
    ctx.textAlign = "center";  
    ctx.textBaseline = "middle";  
    ctx.fillText(getReservaPuestoLabel(reservaRender) ?? "#", x, y);  
  
    // Dibujar pulso animado  
    ctx.beginPath();  
    ctx.arc(x, y, 25, 0, 2 * Math.PI);  
    ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";  
    ctx.lineWidth = 2;  
    ctx.stroke();  
  };  
  
  const coordsReserva = getReservaCoords(reservaRender);
  const puestoLabel = getReservaPuestoLabel(reservaRender) ?? "N/D";

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"  
      >  
        {/* Header */}  
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">  
          <div>  
            <h3 className="text-xl font-bold text-gray-900">  
              ✅ Puesto Asignado  
            </h3>  
            <p className="text-sm text-gray-600 mt-1">  
              {areaAsignada?.NombreArea || `Área ${areaAsignada?.IdArea || "N/D"}`} • Puesto #{puestoLabel}
            </p>  
          </div>  
          <button  
            onClick={onClose}  
            className="w-10 h-10 rounded-full hover:bg-white/80 flex items-center justify-center transition text-gray-600 hover:text-gray-900"  
          >  
            <span className="text-2xl">✕</span>  
          </button>  
        </div>  
  
        {/* Contenido */}  
        <div className="flex-1 overflow-y-auto p-6">  
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">  
            <p className="text-sm text-green-800 font-medium">  
              🎉 Tu reserva ha sido confirmada. Este es tu puesto asignado en el plano.  
            </p>  
          </div>  

          {loadingUbicacion && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
              Buscando coordenadas reales del puesto reservado...
            </div>
          )}
  
          {loading ? (  
            <div className="flex justify-center py-16">  
              <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>  
            </div>  
          ) : !planoUrl ? (
            <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800">
              No se encontró plano para este piso.
            </div>
          ) : (  
            <div>
              {!coordsReserva.hasCoords ? (
                <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
                  Este registro no tiene coordenadas guardadas, pero puedes ubicarte por piso y área.
                </div>
              ) : null}
              <div className="relative inline-block border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg">  
                <img  
                  ref={imagenRef}  
                  src={planoUrl}  
                  alt="Plano del piso"  
                  className="max-w-full h-auto block"  
                  onLoad={(e) => {  
                    if (canvasRef.current) {  
                      canvasRef.current.width = e.target.width;  
                      canvasRef.current.height = e.target.height;  
                      dibujarPuestoAsignado();  
                    }  
                  }}  
                />  
                <canvas  
                  ref={canvasRef}  
                  className="absolute top-0 left-0 pointer-events-none"  
                />  
              </div>
            </div>
          )}  
        </div>  
  
        {/* Footer */}  
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">  
          <motion.button  
            whileHover={{ scale: 1.02 }}  
            whileTap={{ scale: 0.98 }}  
            onClick={onClose}  
            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-semibold shadow-lg"  
          >  
            Entendido  
          </motion.button>  
        </div>  
      </motion.div>  
    </div>  
  );  
}
