import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

export default function Areas() {
  const [pisos, setPisos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [areasPiso, setAreasPiso] = useState([]);
  const [pisoSeleccionado, setPisoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const navigate = useNavigate();
  const [busquedaArea, setBusquedaArea] = useState("");
  const [planoVisible, setPlanoVisible] = useState(false);
  const [planoUrl, setPlanoUrl] = useState(null);
  const [dibujando, setDibujando] = useState(false);
  const [rectangulo, setRectangulo] = useState(null);
  const [areaSeleccionada, setAreaSeleccionada] = useState(null);
  const canvasRef = useRef(null);
  const imagenRef = useRef(null);
  const [vistaMapaCompleto, setVistaMapaCompleto] = useState(false);
  const [modoDelimitacion, setModoDelimitacion] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rectanguloAnterior, setRectanguloAnterior] = useState(null);
  const [areaPisoSeleccionada, setAreaPisoSeleccionada] = useState(null);
  const normalizarRect = (r) => {
    const x = Math.min(r.startX, r.endX);
    const y = Math.min(r.startY, r.endY);
    const width = Math.abs(r.endX - r.startX);
    const height = Math.abs(r.endY - r.startY);
    return { x, y, width, height };
  };

  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Cargar pisos
      const resPisos = await fetch(`${API}/api/pisos`);
      const dataPisos = await resPisos.json();
      setPisos(dataPisos);

      // Cargar todas las áreas disponibles
      const resAreas = await fetch(`${API}/api/areas`);
      const dataAreas = await resAreas.json();

      // VALIDAR que sea un array
      if (Array.isArray(dataAreas)) {
        setAreas(dataAreas);
      } else {
        console.error("La respuesta de áreas no es un array:", dataAreas);
        setAreas([]);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setAreas([]);
      setPisos([]);
    } finally {
      setLoading(false); // ← ESTO ES CRÍTICO
    }
  };

  const cargarAreasPiso = async (idPiso) => {
    setLoadingAreas(true);
    try {
      const res = await fetch(`${API}/api/areas/piso/${idPiso}`);

      if (!res.ok) {
        console.error("Error HTTP:", res.status);
        setAreasPiso([]);
        setMensaje({ tipo: "error", texto: "Error al cargar áreas del piso" });
        return;
      }

      const data = await res.json();

      // VALIDAR que sea array
      if (Array.isArray(data)) {
        setAreasPiso(data);
      } else {
        console.error("La respuesta no es un array:", data);
        setAreasPiso([]);
        setMensaje({ tipo: "error", texto: "Formato de datos incorrecto" });
      }
    } catch (error) {
      console.error("Error al cargar áreas del piso:", error);
      setAreasPiso([]);
    } finally {
      setLoadingAreas(false);
    }
  };

  const handleSeleccionarPiso = (piso) => {
    setPisoSeleccionado(piso);
    cargarAreasPiso(piso.IDPiso);
    setMensaje(null);
  };

  const handleAsignarArea = async (idArea, nombreArea) => {
    // Confirmación antes de asignar
    if (!confirm(`¿Quieres añadir el área "${nombreArea}" a este piso?`))
      return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/api/areas/piso`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ idArea, idPiso: pisoSeleccionado.IDPiso }),
      });

      if (res.ok) {
        setMensaje({ tipo: "success", texto: "✓ Área asignada exitosamente" });
        cargarAreasPiso(pisoSeleccionado.IDPiso);
      } else if (res.status === 401) {
        setMensaje({
          tipo: "error",
          texto: "✗ No autorizado. Inicia sesión nuevamente",
        });
      } else {
        setMensaje({ tipo: "error", texto: "✗ Error al asignar área" });
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "✗ Error al asignar área" });
    }
  };

  const handleGuardarDelimitacion = async (idAreaPiso) => {
    if (!rectangulo) {
      setMensaje({
        tipo: "error",
        texto: "✗ Debes dibujar un rectángulo primero",
      });
      return;
    }

    const r =
      rectangulo.x !== undefined ? rectangulo : normalizarRect(rectangulo);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API}/api/areas/piso/${idAreaPiso}/delimitacion`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            coordX: Math.round(r.x),
            coordY: Math.round(r.y),
            ancho: Math.round(r.width),
            alto: Math.round(r.height),
          }),
        },
      );

      if (res.ok) {
        setMensaje({
          tipo: "success",
          texto: "✓ Delimitación guardada exitosamente",
        });
        await cargarAreasPiso(pisoSeleccionado.IDPiso);
        setModoDelimitacion(false);
        setAreaPisoSeleccionada(null);
        setAreaSeleccionada(null);

        setPlanoVisible(false);
        setRectangulo(null);
      } else {
        setMensaje({ tipo: "error", texto: "✗ Error al guardar delimitación" });
      }
    } catch (e) {
      setMensaje({ tipo: "error", texto: "✗ Error al guardar delimitación" });
    }
  };

  const handleEliminarArea = async (idAreaPiso) => {
    if (!confirm("¿Estás seguro de eliminar esta área del piso?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/api/areas/piso/${idAreaPiso}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setMensaje({ tipo: "success", texto: "✓ Área eliminada exitosamente" });
        cargarAreasPiso(pisoSeleccionado.IDPiso);
      } else if (res.status === 401) {
        setMensaje({
          tipo: "error",
          texto: "✗ No autorizado. Inicia sesión nuevamente",
        });
      } else {
        setMensaje({ tipo: "error", texto: "✗ Error al eliminar área" });
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "✗ Error al eliminar área" });
    }
  };

  const cargarPlano = async (idPiso) => {
    try {
      const res = await fetch(`${API}/api/pisos/plano/${idPiso}`);
      const data = await res.json();

      if (data.success) {
        setPlanoUrl(`${API}${data.ruta}`);
        return true;
      } else {
        setMensaje({
          tipo: "error",
          texto: "No hay plano disponible para este piso",
        });
        return false;
      }
    } catch (error) {
      console.error("Error al cargar plano:", error);
      setMensaje({ tipo: "error", texto: "Error al cargar el plano" });
      return false;
    }
  };

  const handleMouseDown = (e) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRectangulo({
      startX: x,
      startY: y,
      endX: x,
      endY: y,
    });
    setDibujando(true);
  };

  const handleMouseMove = (e) => {
    if (!dibujando || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    setRectangulo((prev) => ({
      ...prev,
      endX: e.clientX - rect.left,
      endY: e.clientY - rect.top,
    }));
  };

  const handleMouseUp = () => {
    setDibujando(false);
    const normalized = rectangulo ? normalizarRect(rectangulo) : null;

    if (normalized && (normalized.width < 20 || normalized.height < 20)) {
      setMensaje({
        tipo: "error",
        texto: "El área debe ser más grande (mínimo 20x20 px)",
      });
      setRectangulo(null);
      return;
    }

    if (rectangulo) {
      setRectanguloAnterior(rectangulo); // ✅ Guardar ANTES de actualizar
      setRectangulo(normalized);
    }
  };

  const dibujarRectangulo = () => {
    if (!canvasRef.current || !rectangulo) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const r =
      rectangulo.x !== undefined ? rectangulo : normalizarRect(rectangulo);

    ctx.strokeStyle = "#3B82F6";
    ctx.lineWidth = 3;
    ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
    ctx.fillRect(r.x, r.y, r.width, r.height);
    ctx.strokeRect(r.x, r.y, r.width, r.height);
  };

  useEffect(() => {
    if (rectangulo && dibujando) {
      dibujarRectangulo();
    }
  }, [rectangulo, dibujando]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && planoVisible) {
        const confirmar = rectangulo
          ? confirm("¿Descartar los cambios?")
          : true;

        if (confirmar) {
          setPlanoVisible(false);
          setRectangulo(null);
          setModoDelimitacion(false);
          setAreaSeleccionada(null);
          setAreaPisoSeleccionada(null);
        }
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [planoVisible, rectangulo]);

  const dibujarAreasExistentes = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colors = [
      { stroke: "#3B82F6", fill: "rgba(59, 130, 246, 0.15)" },
      { stroke: "#10B981", fill: "rgba(16, 185, 129, 0.15)" },
      { stroke: "#F59E0B", fill: "rgba(245, 158, 11, 0.15)" },
      { stroke: "#EF4444", fill: "rgba(239, 68, 68, 0.15)" },
      { stroke: "#8B5CF6", fill: "rgba(139, 92, 246, 0.15)" },
      { stroke: "#EC4899", fill: "rgba(236, 72, 153, 0.15)" },
    ];

    areasPiso.forEach((areaPiso, index) => {
      const area = areas.find((a) => a.IdArea === areaPiso.IdArea);
      const tieneCaja =
        areaPiso.PosicionX != null &&
        areaPiso.PosicionY != null &&
        Number(areaPiso.Ancho) > 0 &&
        Number(areaPiso.Alto) > 0;

      if (tieneCaja) {
        const color = colors[index % colors.length];

        ctx.strokeStyle = color.stroke;
        ctx.lineWidth = 3;
        ctx.fillStyle = color.fill;

        ctx.fillRect(
          Number(areaPiso.PosicionX),
          Number(areaPiso.PosicionY),
          Number(areaPiso.Ancho),
          Number(areaPiso.Alto),
        );
        ctx.strokeRect(
          Number(areaPiso.PosicionX),
          Number(areaPiso.PosicionY),
          Number(areaPiso.Ancho),
          Number(areaPiso.Alto),
        );

        ctx.fillText(
          area?.NombreArea || `Área ${areaPiso.IdArea}`,
          Number(areaPiso.PosicionX) + 5,
          Number(areaPiso.PosicionY) + 20,
        );
      }
    });
  };

  // Agrupar pisos por bodega
  const pisosPorBodega = pisos.reduce((acc, piso) => {
    if (!acc[piso.Bodega]) acc[piso.Bodega] = [];
    acc[piso.Bodega].push(piso);
    return acc;
  }, {});

  // Filtrar áreas disponibles (que no estén ya asignadas)
  const areasDisponiblesFiltradas = areas.filter((area) => {
    const matchBusqueda =
      busquedaArea === "" ||
      area.NombreArea.toLowerCase().includes(busquedaArea.toLowerCase());
    const noAsignada = !areasPiso.some((ap) => ap.IdArea === area.IdArea);
    return matchBusqueda && noAsignada;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/home")}
              className="text-gray-600 hover:text-gray-900 transition"
            >
              ← Volver
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Áreas
              </h1>
              <p className="text-sm text-gray-500">
                Asignación de áreas por piso
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              ABC
            </div>
            <span className="text-sm font-medium text-blue-900">
              Desk Booking
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Mensaje de feedback */}
        {mensaje && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg border ${
              mensaje.tipo === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {mensaje.texto}
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar - Lista de pisos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Seleccionar Piso
              </h2>

              {Object.entries(pisosPorBodega).map(([bodega, pisosBodega]) => (
                <div key={bodega} className="mb-6 last:mb-0">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Bodega {bodega}
                  </h3>
                  <div className="space-y-2">
                    {pisosBodega.map((piso) => (
                      <motion.button
                        key={piso.IDPiso}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSeleccionarPiso(piso)}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                          pisoSeleccionado?.IDPiso === piso.IDPiso
                            ? "border-blue-600 bg-blue-50 text-blue-900"
                            : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            Piso {piso.NumeroPiso}
                          </span>
                          {pisoSeleccionado?.IDPiso === piso.IDPiso && (
                            <span className="text-blue-600">✓</span>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel principal - Gestión de áreas */}
          <div className="lg:col-span-2">
            {!pisoSeleccionado ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📋</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Selecciona un piso
                  </h3>
                  <p className="text-gray-500">
                    Elige un piso de la lista para gestionar sus áreas
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Información del piso seleccionado */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📍</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Piso {pisoSeleccionado.NumeroPiso}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Bodega {pisoSeleccionado.Bodega} • ID:{" "}
                        {pisoSeleccionado.IDPiso}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Áreas asignadas */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Áreas asignadas ({areasPiso.length})
                    </h4>
                    {areasPiso.length > 0 && (
                      <button
                        onClick={async () => {
                          // 1) aseguro que NO quede el modal de edición debajo
                          setPlanoVisible(false);

                          // 2) limpio cosas de edición (opcional pero recomendado)
                          setRectangulo(null);
                          setModoDelimitacion(false);
                          setAreaSeleccionada(null);
                          setAreaPisoSeleccionada(null);

                          // 3) cargo plano y solo si ok abro el mapa completo
                          const ok = await cargarPlano(pisoSeleccionado.IDPiso);
                          if (ok) setVistaMapaCompleto(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition flex items-center gap-2"
                      >
                        <span>🗺️</span>
                        Ver mapa completo
                      </button>
                    )}
                  </div>

                  {loadingAreas ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : areasPiso.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <span className="text-4xl mb-2 block">📭</span>
                      No hay áreas asignadas a este piso
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {areasPiso.map((areaPiso) => {
                        const area = areas.find(
                          (a) => a.IdArea === areaPiso.IdArea,
                        );
                        const tieneDelimitacion =
                          areaPiso.TieneDelimitacion === 1 ||
                          areaPiso.TieneDelimitacion === true ||
                          (Number(areaPiso.Ancho) > 0 &&
                            Number(areaPiso.Alto) > 0);
                        return (
                          <motion.div
                            key={areaPiso.IdAreaPiso}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => {
                              const area = areas.find(
                                (a) => a.IdArea === areaPiso.IdArea,
                              );
                              setAreaSeleccionada(area?.IdArea);
                              setAreaPisoSeleccionada(areaPiso.IdAreaPiso);
                              setModoDelimitacion(true);

                              // Cargar rectángulo existente si tiene delimitación
                              if (
                                areaPiso.PosicionX != null &&
                                Number(areaPiso.Ancho) > 0
                              ) {
                                setRectangulo({
                                  x: Number(areaPiso.PosicionX),
                                  y: Number(areaPiso.PosicionY),
                                  width: Number(areaPiso.Ancho),
                                  height: Number(areaPiso.Alto),
                                });
                              }

                              (async () => {
                                // para que NO quede el mapa completo debajo
                                setVistaMapaCompleto(false);

                                const ok = await cargarPlano(
                                  pisoSeleccionado.IDPiso,
                                );
                                if (ok) setPlanoVisible(true);
                              })();
                            }}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">
                                  {area?.IdArea}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                  {area?.NombreArea || "Área desconocida"}
                                </span>
                                {tieneDelimitacion ? (
                                  <span className="text-xs text-green-600 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Delimitada en mapa
                                  </span>
                                ) : (
                                  <span className="text-xs text-orange-600 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                    Sin delimitar en mapa
                                  </span>
                                )}
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEliminarArea(areaPiso.IdAreaPiso);
                              }}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition"
                            >
                              ✕ Eliminar
                            </motion.button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Barra de búsqueda */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="🔍 Buscar área por nombre..."
                    value={busquedaArea}
                    onChange={(e) => setBusquedaArea(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    Mostrando {areasDisponiblesFiltradas.length} de{" "}
                    {areas.length} áreas disponibles
                  </div>
                </div>

                {/* Áreas disponibles para asignar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Asignar nueva área ({areasDisponiblesFiltradas.length}{" "}
                    disponibles)
                  </h4>

                  {areasDisponiblesFiltradas.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <span className="text-4xl mb-2 block">✅</span>
                      Todas las áreas ya están asignadas a este piso
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {areasDisponiblesFiltradas.map((area) => (
                        <motion.button
                          key={area.IdArea}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setAreaSeleccionada(area.IdArea);
                            setAreaPisoSeleccionada(null);
                            setModoDelimitacion(false);

                            (async () => {
                              const ok = await cargarPlano(
                                pisoSeleccionado.IDPiso,
                              );
                              if (ok) setPlanoVisible(true);
                            })();
                          }}
                          className="p-4 text-left border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition">
                              <span className="text-gray-600 group-hover:text-blue-600 font-bold text-sm">
                                {area.IdArea}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900 group-hover:text-blue-900 transition">
                              {area.NombreArea}
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Plano con Canvas */}
      {planoVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              const confirmar = rectangulo
                ? confirm("¿Descartar los cambios?")
                : true;

              if (confirmar) {
                setPlanoVisible(false);
                setRectangulo(null);
                setModoDelimitacion(false);
                setAreaSeleccionada(null);
                setAreaPisoSeleccionada(null);
              }
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                Delimitar Área - Piso {pisoSeleccionado?.NumeroPiso}
              </h3>
              <button
                onClick={() => {
                  setPlanoVisible(false);
                  setRectangulo(null);
                  setModoDelimitacion(false);
                  setAreaSeleccionada(null);
                  setAreaPisoSeleccionada(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 Haz clic y arrastra sobre el plano para dibujar un
                  rectángulo que delimite el área
                </p>
                {rectangulo && (
                  <p className="text-sm text-gray-700 mt-2">
                    📐 Dimensiones:{" "}
                    {Math.round(normalizarRect(rectangulo).width)} ×{" "}
                    {Math.round(normalizarRect(rectangulo).height)} px
                  </p>
                )}
              </div>

              <div className="relative inline-block">
                <img
                  ref={imagenRef}
                  src={planoUrl}
                  alt="Plano del piso"
                  className="max-w-full h-auto border border-gray-300 rounded"
                  onLoad={(e) => {
                    if (canvasRef.current) {
                      canvasRef.current.width = e.target.width;
                      canvasRef.current.height = e.target.height;
                      dibujarAreasExistentes(); // ✅ mostrar lo ya guardado
                    }
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 cursor-crosshair"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                />
              </div>

              <div className="mt-4 flex gap-3">
                {modoDelimitacion ? (
                  <button
                    onClick={() =>
                      handleGuardarDelimitacion(areaPisoSeleccionada)
                    }
                    disabled={!rectangulo}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Guardar Delimitación
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (areaSeleccionada) {
                        const area = areas.find(
                          (a) => a.IdArea === areaSeleccionada,
                        );
                        handleAsignarArea(areaSeleccionada, area?.NombreArea);
                        setPlanoVisible(false);
                        setRectangulo(null);
                        if (canvasRef.current) {
                          const ctx = canvasRef.current.getContext("2d");
                          ctx.clearRect(
                            0,
                            0,
                            canvasRef.current.width,
                            canvasRef.current.height,
                          );
                        }
                      }
                    }}
                    disabled={!rectangulo}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Asignar Área
                  </button>
                )}

                <button
                  onClick={() => {
                    setRectangulo(null);
                    if (canvasRef.current) {
                      dibujarAreasExistentes(); // ✅ Esto ya limpia y redibuja
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Vista Previa del Mapa Completo */}
      {vistaMapaCompleto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                Mapa Completo - Piso {pisoSeleccionado?.NumeroPiso}
              </h3>
              <button
                onClick={() => {
                  setVistaMapaCompleto(false);
                  setPlanoVisible(false); // por si acaso quedó abierto debajo
                  setRectangulo(null);
                  setModoDelimitacion(false);
                  setAreaSeleccionada(null);
                  setAreaPisoSeleccionada(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  🗺️ Vista previa de todas las áreas delimitadas en este piso
                </p>
              </div>

              <div className="relative inline-block">
                <img
                  ref={imagenRef}
                  src={planoUrl}
                  alt="Plano del piso"
                  className="max-w-full h-auto border border-gray-300 rounded"
                  onLoad={(e) => {
                    if (canvasRef.current) {
                      canvasRef.current.width = e.target.width;
                      canvasRef.current.height = e.target.height;
                      dibujarAreasExistentes(); // 👈 para ver lo ya guardado
                    }
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 pointer-events-none"
                />
              </div>

              {/* Leyenda de colores */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Áreas delimitadas:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {areasPiso
                    .filter(
                      (ap) =>
                        ap.PosicionX != null &&
                        ap.PosicionY != null &&
                        Number(ap.Ancho) > 0 &&
                        Number(ap.Alto) > 0,
                    )
                    .map((areaPiso, index) => {
                      const area = areas.find(
                        (a) => a.IdArea === areaPiso.IdArea,
                      );
                      const colors = [
                        "#3B82F6",
                        "#10B981",
                        "#F59E0B",
                        "#EF4444",
                        "#8B5CF6",
                        "#EC4899",
                      ];
                      const color = colors[index % colors.length];

                      return (
                        <div
                          key={areaPiso.IdAreaPiso}
                          className="flex items-center gap-2"
                        >
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: color }}
                          ></div>
                          <span className="text-sm text-gray-700">
                            {area?.NombreArea || `Área ${areaPiso.IdArea}`}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
