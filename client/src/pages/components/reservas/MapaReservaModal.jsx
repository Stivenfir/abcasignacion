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
  ]);
  const yRaw = pickFirst(raw, [
    "UbicacionY",
    "ubicacionY",
    "PosicionY",
    "posicionY",
  ]);

  const x = Number(xRaw);
  const y = Number(yRaw);
  const coordsValidas = Number.isFinite(x) && Number.isFinite(y) && x >= 0 && y >= 0;
  const esEsquinaPorDefecto = coordsValidas && x === 0 && y === 0;
  const hasCoords = coordsValidas && !esEsquinaPorDefecto;

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

function syncCanvasWithImage(canvas, image) {
  if (!canvas || !image) return null;

  const displayWidth = image.clientWidth || image.width || 0;
  const displayHeight = image.clientHeight || image.height || 0;
  if (!displayWidth || !displayHeight) return null;

  // Misma referencia que se usa al mapear puestos (coordenadas en display)
  canvas.width = displayWidth;
  canvas.height = displayHeight;
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;

  return { displayWidth, displayHeight };
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
  const [delimitacionesArea, setDelimitacionesArea] = useState([]);
  const canvasRef = useRef(null);  
  const imagenRef = useRef(null);  
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";  

  useEffect(() => {
    setReservaRender(reserva || null);
  }, [reserva]);
  
  useEffect(() => {  
    if (pisoSeleccionado?.IDPiso) {  
      setLoading(true);
      cargarPlano();  
      return;
    }

    setPlanoUrl(null);
    setLoading(false);
  }, [pisoSeleccionado]);  


  const areaIdObjetivo = Number(
    reservaRender?.IdArea ?? reserva?.IdArea ?? areaAsignada?.IdArea,
  );

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
  
  useEffect(() => {
    const cargarDelimitacionesArea = async () => {
      if (!pisoSeleccionado?.IDPiso) {
        setDelimitacionesArea([]);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setDelimitacionesArea([]);
        return;
      }

      try {
        const resAreas = await fetch(`${API}/api/areas/piso/${pisoSeleccionado.IDPiso}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!resAreas.ok) {
          setDelimitacionesArea([]);
          return;
        }

        const areas = await resAreas.json();
        const listado = Array.isArray(areas) ? areas : [];

        const areaEncontrada = listado.find((a) => {
          if (Number.isFinite(areaIdObjetivo) && areaIdObjetivo > 0) {
            return Number(a?.IdArea) === areaIdObjetivo;
          }
          if (reservaRender?.IdAreaPiso != null) {
            return String(a?.IdAreaPiso) === String(reservaRender?.IdAreaPiso);
          }
          return false;
        });

        if (!areaEncontrada?.IdAreaPiso) {
          setDelimitacionesArea([]);
          return;
        }

        const resDel = await fetch(
          `${API}/api/areas/piso/${areaEncontrada.IdAreaPiso}/delimitaciones`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!resDel.ok) {
          setDelimitacionesArea([]);
          return;
        }

        const dataDel = await resDel.json();
        setDelimitacionesArea(Array.isArray(dataDel) ? dataDel : []);

        if (!areaAsignada?.NombreArea && areaEncontrada?.NombreArea) {
          setReservaRender((prev) => ({ ...(prev || {}), NombreArea: areaEncontrada.NombreArea }));
        }
      } catch {
        setDelimitacionesArea([]);
      }
    };

    cargarDelimitacionesArea();
  }, [API, pisoSeleccionado, areaIdObjetivo, reservaRender?.IdAreaPiso, areaAsignada?.NombreArea]);

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
    const canvas = canvasRef.current;
    const imagen = imagenRef.current;

    if (!canvas || !imagen) return;

    const metrics = syncCanvasWithImage(canvas, imagen);
    if (!metrics) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (Array.isArray(delimitacionesArea) && delimitacionesArea.length) {
      delimitacionesArea.forEach((d) => {
        const dx = Number(d?.PosicionX);
        const dy = Number(d?.PosicionY);
        const dw = Number(d?.Ancho);
        const dh = Number(d?.Alto);

        if (![dx, dy, dw, dh].every(Number.isFinite)) return;

        ctx.fillStyle = "rgba(251, 191, 36, 0.16)";
        ctx.strokeStyle = "rgba(245, 158, 11, 0.95)";
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 6]);
        ctx.fillRect(dx, dy, dw, dh);
        ctx.strokeRect(dx, dy, dw, dh);
        ctx.setLineDash([]);
      });
    }

    if (!coords.hasCoords) return;

    let x = coords.x;
    let y = coords.y;

    // Soporte solo para coordenadas display (mapeo actual) + normalizadas [0..1]
    const esNormalizado = x >= 0 && x <= 1 && y >= 0 && y <= 1;
    if (esNormalizado) {
      x = x * metrics.displayWidth;
      y = y * metrics.displayHeight;
    }

    x = Math.max(0, Math.min(metrics.displayWidth, x));
    y = Math.max(0, Math.min(metrics.displayHeight, y));

    // Marcador súper visible para que no se pierda en el plano
    ctx.shadowColor = "rgba(220, 38, 38, 0.55)";
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(220, 38, 38, 0.95)";
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 9, 0, 2 * Math.PI);
    ctx.fillStyle = "#DC2626";
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    const etiqueta = `Puesto #${getReservaPuestoLabel(reservaRender) ?? "?"}`;
    ctx.font = "bold 12px Arial";
    const textW = ctx.measureText(etiqueta).width;
    const boxW = textW + 14;
    const boxH = 24;
    const boxX = Math.max(4, Math.min(metrics.displayWidth - boxW - 4, x - boxW / 2));
    const boxY = Math.max(4, y - 44);

    ctx.fillStyle = "rgba(17, 24, 39, 0.92)";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(etiqueta, boxX + 7, boxY + boxH / 2);

    ctx.beginPath();
    ctx.moveTo(x, y - 10);
    ctx.lineTo(x, boxY + boxH);
    ctx.strokeStyle = "rgba(17, 24, 39, 0.92)";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  useEffect(() => {
    if (planoUrl) {
      dibujarPuestoAsignado();
    }
  }, [planoUrl, reservaRender, delimitacionesArea]);

  useEffect(() => {
    if (!planoUrl) return;

    const onResize = () => dibujarPuestoAsignado();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [planoUrl, reservaRender, delimitacionesArea]);
  
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
              {reservaRender?.NombreArea || areaAsignada?.NombreArea || `Área ${areaAsignada?.IdArea || "N/D"}`} • Puesto #{puestoLabel}
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
          ) : !pisoSeleccionado?.IDPiso ? (
            <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800">
              Esta reserva no trae piso asociado. No podemos ubicarla en un plano sin adivinar piso.
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
                  onLoad={() => {
                    dibujarPuestoAsignado();
                  }}
                />  
                <canvas  
                  ref={canvasRef}  
                  className="absolute top-0 left-0 pointer-events-none z-10"  
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
