// client/src/pages/components/puestos/MapearPuestoModal.jsx
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function MapearPuestoModal({
  pisoSeleccionado,
  areaSeleccionada,
  puestoAMapear,
  onClose,
  onMapear,
}) {
  const [planoUrl, setPlanoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState(null);
  const [puestosExistentes, setPuestosExistentes] = useState([]);
  const canvasRef = useRef(null);
  const imagenRef = useRef(null);
  const [mostrarGrilla, setMostrarGrilla] = useState(true);
  const [delimitaciones, setDelimitaciones] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const containerRef = useRef(null);

  // Cargar plano al montar
  useEffect(() => {
    if (pisoSeleccionado?.IDPiso) {
      cargarPlano();
    } else {
      setError("No se ha seleccionado un piso válido");
      setLoading(false);
    }
  }, [pisoSeleccionado]);

  // ✅ NUEVO: Cargar coordenadas existentes si el puesto ya está mapeado
  useEffect(() => {
    if (
      puestoAMapear?.UbicacionX &&
      puestoAMapear?.UbicacionY &&
      canvasRef.current
    ) {
      const x = Number(puestoAMapear.UbicacionX);
      const y = Number(puestoAMapear.UbicacionY);
      setPuntoSeleccionado({ x, y });
      dibujarPunto(x, y);
    }
  }, [puestoAMapear, planoUrl]);

  useEffect(() => {
    const cargarPuestosArea = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API}/api/puestos/area/${areaSeleccionada.IdAreaPiso}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        setPuestosExistentes(
          data.filter(
            (p) => p.IdPuestoTrabajo !== puestoAMapear.IdPuestoTrabajo,
          ),
        );
      } catch (error) {
        console.error("Error al cargar puestos:", error);
      }
    };

    if (areaSeleccionada) cargarPuestosArea();
  }, [areaSeleccionada, puestoAMapear]);

  const cargarPlano = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API}/api/pisos/plano/${pisoSeleccionado.IDPiso}`,
      );

      if (!res.ok) {
        throw new Error(`Error ${res.status}: No se pudo cargar el plano`);
      }

      const data = await res.json();

      if (data.success && data.ruta) {
        setPlanoUrl(`${API}${data.ruta}`);
        setError(null);
      } else {
        throw new Error("No se encontró el plano para este piso");
      }
    } catch (error) {
      console.error("Error al cargar plano:", error);
      setError(error.message || "No se pudo cargar el plano del piso");
    } finally {
      setLoading(false);
    }
  };

  const dibujarGrilla = () => {
    if (!canvasRef.current || !mostrarGrilla) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const gridSize = 20; // píxeles entre líneas

    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 0.5;

    // Líneas verticales
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Líneas horizontales
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  const handleCanvasClick = (e) => {
    if (!canvasRef.current || !imagenRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // ✅ CORRECTO: Calcular coordenadas relativas al canvas escalado
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    // Validar que esté dentro del área delimitada
    const dentroDeArea = delimitaciones.some(
      (d) =>
        x >= Number(d.PosicionX) &&
        x <= Number(d.PosicionX) + Number(d.Ancho) &&
        y >= Number(d.PosicionY) &&
        y <= Number(d.PosicionY) + Number(d.Alto),
    );

    if (!dentroDeArea && delimitaciones.length > 0) {
      alert(
        "⚠️ Debes seleccionar un punto dentro del área delimitada (zona azul)",
      );
      return;
    }

    setPuntoSeleccionado({ x, y });
    dibujarPunto(x, y);
  };

  const dibujarPunto = (x, y) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1️⃣ Dibujar grilla primero (fondo)
    dibujarGrilla();

    // 2️⃣ Dibujar delimitaciones
    dibujarDelimitaciones();

    // 3️⃣ Dibujar puestos existentes en gris
    puestosExistentes.forEach((p) => {
      if (p.UbicacionX && p.UbicacionY) {
        ctx.beginPath();
        ctx.arc(Number(p.UbicacionX), Number(p.UbicacionY), 8, 0, 2 * Math.PI);
        ctx.fillStyle = "#9CA3AF";
        ctx.fill();
        ctx.strokeStyle = "#6B7280";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Número del puesto existente
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.NoPuesto, Number(p.UbicacionX), Number(p.UbicacionY));
      }
    });

    // 4️⃣ Dibujar punto actual con sombra
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "#3B82F6";
    ctx.fill();

    ctx.shadowColor = "transparent"; // Reset shadow
    ctx.strokeStyle = "#1E40AF";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Dibujar número del puesto actual
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(puestoAMapear.NoPuesto, x, y);
  };

  const handleGuardar = async () => {
    if (!puntoSeleccionado) {
      alert("Por favor, selecciona una ubicación en el plano");
      return;
    }

    await onMapear(puntoSeleccionado.x, puntoSeleccionado.y);
    onClose();
  };

  const handleLimpiar = () => {
    setPuntoSeleccionado(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      dibujarGrilla();

      dibujarDelimitaciones();
      puestosExistentes.forEach((p) => {
        if (p.UbicacionX && p.UbicacionY) {
          ctx.beginPath();
          ctx.arc(
            Number(p.UbicacionX),
            Number(p.UbicacionY),
            8,
            0,
            2 * Math.PI,
          );
          ctx.fillStyle = "#9CA3AF";
          ctx.fill();
          ctx.strokeStyle = "#6B7280";
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 10px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.NoPuesto, Number(p.UbicacionX), Number(p.UbicacionY));
        }
      });
    }
  };

  useEffect(() => {
    const cargarDelimitaciones = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API}/api/areas/piso/${areaSeleccionada.IdAreaPiso}/delimitaciones`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();

        setDelimitaciones(data);

        // ✅ CRÍTICO: Redibujar SIEMPRE, no solo si hay punto seleccionado
        if (canvasRef.current && imagenRef.current) {
          if (puntoSeleccionado) {
            dibujarPunto(puntoSeleccionado.x, puntoSeleccionado.y);
          } else {
            // Dibujar solo delimitaciones y puestos existentes
            const ctx = canvasRef.current.getContext("2d");
            ctx.clearRect(
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height,
            );
            dibujarGrilla();
            dibujarDelimitaciones();

            // Dibujar puestos existentes
            puestosExistentes.forEach((p) => {
              if (p.UbicacionX && p.UbicacionY) {
                ctx.beginPath();
                ctx.arc(
                  Number(p.UbicacionX),
                  Number(p.UbicacionY),
                  8,
                  0,
                  2 * Math.PI,
                );
                ctx.fillStyle = "#9CA3AF";
                ctx.fill();
                ctx.strokeStyle = "#6B7280";
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = "#FFFFFF";
                ctx.font = "bold 10px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(
                  p.NoPuesto,
                  Number(p.UbicacionX),
                  Number(p.UbicacionY),
                );
              }
            });
          }
        }
      } catch (error) {
        console.error("❌ Error al cargar delimitaciones:", error);
      }
    };

    if (areaSeleccionada) {
      cargarDelimitaciones();
    }
  }, [areaSeleccionada, puestosExistentes]); // ✅ Agregar puestosExistentes como dependencia

  const dibujarDelimitaciones = () => {
    if (!canvasRef.current || delimitaciones.length === 0) return;

    const ctx = canvasRef.current.getContext("2d");

    delimitaciones.forEach((d) => {
      ctx.strokeStyle = "#3B82F6";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        Number(d.PosicionX),
        Number(d.PosicionY),
        Number(d.Ancho),
        Number(d.Alto),
      );
      ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
      ctx.fillRect(
        Number(d.PosicionX),
        Number(d.PosicionY),
        Number(d.Ancho),
        Number(d.Alto),
      );
      ctx.setLineDash([]);
    });
  };

  // Agregar useEffect para redibujar cuando cambia mostrarGrilla
  useEffect(() => {
    if (canvasRef.current && imagenRef.current && planoUrl) {
      if (puntoSeleccionado) {
        dibujarPunto(puntoSeleccionado.x, puntoSeleccionado.y);
      } else {
        // Redibujar solo delimitaciones y grilla
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        dibujarGrilla();
        dibujarDelimitaciones();

        // Dibujar puestos existentes
        puestosExistentes.forEach((p) => {
          if (p.UbicacionX && p.UbicacionY) {
            ctx.beginPath();
            ctx.arc(
              Number(p.UbicacionX),
              Number(p.UbicacionY),
              8,
              0,
              2 * Math.PI,
            );
            ctx.fillStyle = "#9CA3AF";
            ctx.fill();
            ctx.strokeStyle = "#6B7280";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bold 10px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
              p.NoPuesto,
              Number(p.UbicacionX),
              Number(p.UbicacionY),
            );
          }
        });
      }
    }
  }, [mostrarGrilla, delimitaciones, puestosExistentes]);

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
      >
        {/* Header fijo */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              📍 Mapear Puesto #{puestoAMapear.NoPuesto}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {areaSeleccionada?.NombreArea ||
                `Área ${areaSeleccionada?.IdArea}`}{" "}
              • Piso {pisoSeleccionado?.NumeroPiso}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(0.5, prev - 0.25))}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              🔍−
            </button>

            <span className="text-sm text-gray-600">
              {Math.round(zoomLevel * 100)}%
            </span>

            <button
              onClick={() => setZoomLevel((prev) => Math.min(3, prev + 0.25))}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              🔍+
            </button>

            <button
              onClick={() => {
                setZoomLevel(1);
                // Resetear scroll a posición inicial
                if (containerRef.current) {
                  containerRef.current.scrollTop = 0;
                  containerRef.current.scrollLeft = 0;
                }
              }}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              Reset
            </button>

            <button
              onClick={() => setMostrarGrilla(!mostrarGrilla)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                mostrarGrilla
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {mostrarGrilla ? "✓ Grilla" : "⊞ Grilla"}
            </button>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-white/80 flex items-center justify-center transition text-gray-600 hover:text-gray-900"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Estados de carga y error */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">
                Cargando plano del piso...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <p className="text-red-600 font-semibold mb-2">{error}</p>
              <p className="text-gray-500 text-sm mb-4">
                Verifica que el plano del piso esté cargado correctamente
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cargarPlano}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                🔄 Reintentar
              </motion.button>
            </div>
          )}

          {/* Plano cargado exitosamente */}
          {!loading && !error && planoUrl && (
            <>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800 font-medium">
                  💡 Haz clic en el plano para seleccionar la ubicación del
                  puesto
                </p>
                {puntoSeleccionado && (
                  <p className="text-sm text-gray-700 mt-2">
                    📍 Ubicación seleccionada: ({puntoSeleccionado.x},{" "}
                    {puntoSeleccionado.y})
                  </p>
                )}
              </div>

              <div
                ref={containerRef}
                className="relative inline-block border-2 border-gray-300 rounded-lg overflow-auto shadow-lg"
                style={{ maxHeight: "60vh" }}
              >
                <div
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: "top left",
                    transition: "transform 0.2s",
                    // ✅ CRÍTICO: Forzar que el contenedor crezca con el zoom
                    width: "fit-content",
                    height: "fit-content",
                  }}
                >
                  <img
                    ref={imagenRef}
                    src={planoUrl}
                    alt="Plano del piso"
                    className="max-w-full h-auto block"
                    onLoadStart={() =>
                      console.log("🟡 MAPEAR - Imagen comenzando a cargar")
                    }
                    onLoad={(e) => {
                      console.log("🔵 MAPEAR - onLoad EJECUTADO");
                      console.log(
                        "🔵 MAPEAR - canvasRef.current:",
                        canvasRef.current,
                      );
                      console.log("🔵 MAPEAR - e.target:", e.target);

                      if (canvasRef.current) {
                        console.log(
                          "MAPEAR - Dimensiones:",
                          e.target.naturalWidth,
                          e.target.naturalHeight,
                        );
                        console.log("MAPEAR - URL:", planoUrl);
                        canvasRef.current.width = e.target.naturalWidth;
                        canvasRef.current.height = e.target.naturalHeight;

                        if (puntoSeleccionado) {
                          dibujarPunto(
                            puntoSeleccionado.x,
                            puntoSeleccionado.y,
                          );
                        }
                      } else {
                        console.log("❌ MAPEAR - canvasRef.current es NULL");
                      }
                    }}
                    onError={() => {
                      setError("Error al cargar la imagen del plano");
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 cursor-crosshair"
                    onClick={handleCanvasClick}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer fijo con botones */}
        {!loading && !error && planoUrl && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGuardar}
              disabled={!puntoSeleccionado}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition font-semibold shadow-lg disabled:shadow-none"
            >
              💾 Guardar Ubicación
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLimpiar}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition font-semibold"
            >
              🗑️ Limpiar
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
