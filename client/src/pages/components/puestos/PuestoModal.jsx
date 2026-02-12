// client/src/pages/components/puestos/PuestoModal.jsx
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function PuestoModal({
  pisoSeleccionado,
  areaSeleccionada,
  puestoAEditar,
  clasificaciones,
  onClose,
  onGuardar,
}) {
  const [planoUrl, setPlanoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modoCreacion, setModoCreacion] = useState("con-mapeo");
  const [puntoSeleccionado, setPuntoSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    noPuesto: puestoAEditar?.NoPuesto || "",
    disponible: puestoAEditar?.Disponible || "SI",
    idClasificacion: puestoAEditar?.IDClasificacionPuesto || "",
  });

  const canvasRef = useRef(null);
  const imagenRef = useRef(null);
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [mostrarGrilla, setMostrarGrilla] = useState(true);
  const [delimitaciones, setDelimitaciones] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [puestosExistentes, setPuestosExistentes] = useState([]);
  const containerRef = useRef(null);

  // Cargar plano al montar
  useEffect(() => {
    cargarPlano();
  }, [pisoSeleccionado]);

  // Pre-cargar punto si estamos editando
  useEffect(() => {
    if (
      puestoAEditar &&
      puestoAEditar.UbicacionX !== null &&
      puestoAEditar.UbicacionY !== null
    ) {
      setPuntoSeleccionado({
        x: Number(puestoAEditar.UbicacionX),
        y: Number(puestoAEditar.UbicacionY),
      });
      setModoCreacion("con-mapeo");
    }
  }, [puestoAEditar]);

  // Cargar delimitaciones del área
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

        if (canvasRef.current && puntoSeleccionado) {
          dibujarPunto();
        }
      } catch (error) {
        console.error("Error al cargar delimitaciones:", error);
      }
    };

    if (areaSeleccionada) cargarDelimitaciones();
  }, [areaSeleccionada]);

  // Cargar puestos existentes del área
  useEffect(() => {
    const cargarPuestosArea = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API}/api/puestos/area/${areaSeleccionada.IdAreaPiso}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();

        // Filtrar el puesto actual si estamos editando
        const puestosFiltrados = puestoAEditar
          ? data.filter(
              (p) => p.IdPuestoTrabajo !== puestoAEditar.IdPuestoTrabajo,
            )
          : data;

        setPuestosExistentes(puestosFiltrados);
      } catch (error) {
        console.error("Error al cargar puestos:", error);
      }
    };

    if (areaSeleccionada && modoCreacion === "con-mapeo") {
      cargarPuestosArea();
    }
  }, [areaSeleccionada, modoCreacion]);

  // ✅ NUEVO: Dibujar delimitaciones y puestos cuando se cargan
  useEffect(() => {
    if (
      canvasRef.current &&
      planoUrl &&
      delimitaciones.length > 0 &&
      modoCreacion === "con-mapeo"
    ) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dibujar grilla
      dibujarGrilla();

      // Dibujar delimitaciones
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
          ctx.fillText(p.NoPuesto, Number(p.UbicacionX), Number(p.UbicacionY));
        }
      });
    }
  }, [
    delimitaciones,
    puestosExistentes,
    planoUrl,
    modoCreacion,
    mostrarGrilla,
  ]);

  // Redibujar cuando cambia mostrarGrilla
  useEffect(() => {
    if (puntoSeleccionado && canvasRef.current) {
      dibujarPunto();
    }
  }, [mostrarGrilla]);

  // Dibujar punto cuando cambia
  useEffect(() => {
    if (puntoSeleccionado && canvasRef.current) {
      dibujarPunto();
    }
  }, [puntoSeleccionado]);

  const cargarPlano = async () => {
    if (!pisoSeleccionado?.IDPiso) {
      setError("No se ha seleccionado un piso válido");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${API}/api/pisos/plano/${pisoSeleccionado.IDPiso}`,
      );
      const data = await res.json();

      if (data.success) {
        setPlanoUrl(`${API}${data.ruta}`);
        setError(null);
      } else {
        throw new Error("No se encontró el plano");
      }
    } catch (error) {
      console.error("Error al cargar plano:", error);
      setError("No se pudo cargar el plano del piso");
    } finally {
      setLoading(false);
    }
  };

  const handleCanvasClick = (e) => {
    if (!canvasRef.current || modoCreacion === "sin-mapeo") return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
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
  };

  const dibujarGrilla = () => {
    if (!canvasRef.current || !mostrarGrilla) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const gridSize = 20;

    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 0.5;

    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  const dibujarDelimitaciones = () => {
    if (!canvasRef.current || delimitaciones.length === 0) return;

    const ctx = canvasRef.current.getContext("2d");

    delimitaciones.forEach((d) => {
      ctx.strokeStyle = "#3B82F6";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.fillStyle = "rgba(59, 130, 246, 0.1)";

      ctx.fillRect(
        Number(d.PosicionX),
        Number(d.PosicionY),
        Number(d.Ancho),
        Number(d.Alto),
      );

      ctx.strokeRect(
        Number(d.PosicionX),
        Number(d.PosicionY),
        Number(d.Ancho),
        Number(d.Alto),
      );

      ctx.setLineDash([]);
    });
  };

  const dibujarPunto = () => {
    if (!canvasRef.current || !puntoSeleccionado) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1️⃣ Dibujar grilla
    dibujarGrilla();

    // 2️⃣ Dibujar delimitaciones
    dibujarDelimitaciones();

    // 3️⃣ Dibujar puestos existentes
    puestosExistentes.forEach((p) => {
      if (p.UbicacionX && p.UbicacionY) {
        ctx.beginPath();
        ctx.arc(Number(p.UbicacionX), Number(p.UbicacionY), 8, 0, 2 * Math.PI);
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

    // 4️⃣ Dibujar punto actual
    ctx.beginPath();
    ctx.arc(puntoSeleccionado.x, puntoSeleccionado.y, 15, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(59, 130, 246, 0.3)";
    ctx.fill();
    ctx.strokeStyle = "#3B82F6";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#1E40AF";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      formData.noPuesto || "?",
      puntoSeleccionado.x,
      puntoSeleccionado.y,
    );
  };

  const handleGuardar = async () => {
    // Validaciones
    if (!formData.noPuesto) {
      alert("Por favor ingresa el número del puesto");
      return;
    }

    if (!formData.idClasificacion) {
      alert("Por favor selecciona una clasificación");
      return;
    }

    if (modoCreacion === "con-mapeo" && !puntoSeleccionado) {
      alert("Por favor selecciona una ubicación en el plano");
      return;
    }

    // Preparar datos
    const datosGuardar = {
      idAreaPiso: areaSeleccionada.IdAreaPiso,
      noPuesto: formData.noPuesto,
      disponible: formData.disponible,
      idClasificacion: formData.idClasificacion,
      ubicacionX:
        modoCreacion === "con-mapeo" && puntoSeleccionado
          ? puntoSeleccionado.x
          : null,
      ubicacionY:
        modoCreacion === "con-mapeo" && puntoSeleccionado
          ? puntoSeleccionado.y
          : null,
      tieneMapeo: modoCreacion === "con-mapeo" && puntoSeleccionado ? 1 : 0,
    };

    // ✅ Si estamos editando, pasar el ID como segundo parámetro
    if (puestoAEditar) {
      await onGuardar(datosGuardar, puestoAEditar.IdPuestoTrabajo);
    } else {
      await onGuardar(datosGuardar);
    }

    onClose();
  };

  // Auto-generar número de puesto al crear uno nuevo
  useEffect(() => {
    if (!puestoAEditar && areaSeleccionada) {
      calcularSiguienteNumeroPuesto();
    }
  }, [areaSeleccionada, puestoAEditar]);

  const calcularSiguienteNumeroPuesto = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API}/api/puestos/area/${areaSeleccionada.IdAreaPiso}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const puestos = await res.json();

      // Encontrar el número más alto y sumar 1
      const maxNoPuesto =
        puestos.length > 0
          ? Math.max(...puestos.map((p) => Number(p.NoPuesto) || 0))
          : 0;

      setFormData((prev) => ({
        ...prev,
        noPuesto: String(maxNoPuesto + 1),
      }));
    } catch (error) {
      console.error("Error al calcular siguiente número:", error);
      setFormData((prev) => ({ ...prev, noPuesto: "1" }));
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {puestoAEditar ? "✏️ Editar Puesto" : "✨ Crear Nuevo Puesto"}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Piso {pisoSeleccionado?.NumeroPiso} •{" "}
                {areaSeleccionada?.NombreArea ||
                  `Área ${areaSeleccionada?.IdArea}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Formulario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Número de puesto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Número de Puesto *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.noPuesto}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-700 cursor-not-allowed"
                  placeholder="Auto-generado..."
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  🔒 Auto
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                El número se asigna automáticamente
              </p>
            </div>

            {/* Disponibilidad */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Disponibilidad *
              </label>
              <select
                value={formData.disponible}
                onChange={(e) =>
                  setFormData({ ...formData, disponible: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="SI">✅ Disponible</option>
                <option value="NO">❌ No Disponible</option>
              </select>
            </div>

            {/* Clasificación */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Clasificación de Equipo *
              </label>
              <select
                value={formData.idClasificacion}
                onChange={(e) =>
                  setFormData({ ...formData, idClasificacion: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Selecciona una clasificación...</option>
                {clasificaciones.map((c) => (
                  <option key={c.IdClasificacion} value={c.IdClasificacion}>
                    {c.Descripcion}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Modo de creación */}
          {!puestoAEditar && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Modo de Creación
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setModoCreacion("con-mapeo")}
                  className={`p-4 rounded-xl border-2 transition ${
                    modoCreacion === "con-mapeo"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="text-2xl mb-2">📍</div>
                  <div className="font-semibold">Con Mapeo</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Asignar ubicación ahora
                  </div>
                </button>
                <button
                  onClick={() => {
                    setModoCreacion("sin-mapeo");
                    setPuntoSeleccionado(null);
                  }}
                  className={`p-4 rounded-xl border-2 transition ${
                    modoCreacion === "sin-mapeo"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="text-2xl mb-2">⏭️</div>
                  <div className="font-semibold">Sin Mapeo</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Mapear después
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Plano interactivo */}
          {modoCreacion === "con-mapeo" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Ubicación en el Plano
              </label>

              {loading && (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-600">Cargando plano...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center justify-center h-64 bg-red-50 rounded-xl border-2 border-red-200">
                  <div className="text-center">
                    <span className="text-5xl mb-3 block">⚠️</span>
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {!loading && !error && planoUrl && (
                <div>
                  <div className="mb-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                      💡 Haz clic en el plano para seleccionar la ubicación del
                      puesto
                    </p>
                    {puntoSeleccionado && (
                      <p className="text-sm text-gray-700 mt-2">
                        📐 Coordenadas: ({Math.round(puntoSeleccionado.x)},{" "}
                        {Math.round(puntoSeleccionado.y)})
                      </p>
                    )}
                  </div>

                  <div className="relative inline-block border-2 border-gray-300 rounded-xl overflow-hidden">
                    <img
                      ref={imagenRef}
                      src={planoUrl}
                      alt="Plano del piso"
                      className="max-w-full h-auto"
                      onLoad={(e) => {
                        console.log("🔵 PUESTO MODAL - onLoad EJECUTADO");
                        console.log(
                          "🔵 PUESTO MODAL - canvasRef.current:",
                          canvasRef.current,
                        );
                        console.log("🔵 PUESTO MODAL - e.target:", e.target);

                        if (canvasRef.current) {
                          console.log(
                            "🔵 PUESTO MODAL - Dimensiones:",
                            e.target.naturalWidth,
                            e.target.naturalHeight,
                          );
                          console.log("🔵 PUESTO MODAL - URL:", planoUrl);
                          console.log(
                            "🔵 PUESTO MODAL - Dimensiones renderizadas (width/height):",
                            e.target.width,
                            e.target.height,
                          );

                          canvasRef.current.width = e.target.naturalWidth;
                          canvasRef.current.height = e.target.naturalHeight;

                          // ✅ AGREGAR: Dibujar inmediatamente si hay delimitaciones
                          if (delimitaciones.length > 0) {
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
                                console.log(
                                  "🔵 PUESTO MODAL - Dibujando puesto existente:",
                                  p.NoPuesto,
                                  "en",
                                  p.UbicacionX,
                                  p.UbicacionY,
                                );
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

                          // Si hay punto seleccionado (modo edición), dibujarlo
                          if (puntoSeleccionado) {
                            console.log(
                              "🔵 PUESTO MODAL - Dibujando punto seleccionado:",
                              puntoSeleccionado,
                            );
                            dibujarPunto();
                          }
                        } else {
                          console.log(
                            "❌ PUESTO MODAL - canvasRef.current es NULL",
                          );
                        }
                      }}
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 cursor-crosshair"
                      onClick={handleCanvasClick}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGuardar}
            disabled={
              !formData.noPuesto ||
              !formData.idClasificacion ||
              (modoCreacion === "con-mapeo" && !puntoSeleccionado)
            }
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-indigo-600"
          >
            {puestoAEditar ? "💾 Actualizar Puesto" : "✨ Crear Puesto"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition font-semibold"
          >
            ✕ Cancelar
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
