import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Mapa() {
  const [pisos, setPisos] = useState([]);
  const [planos, setPlanos] = useState({});
  const [modoEdicion, setModoEdicion] = useState(null);
  const [planoVisualizando, setPlanoVisualizando] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos"); // 'todos', 'con-plano', 'sin-plano'
  const [zoomLevel, setZoomLevel] = useState(1);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    cargarPisos();
  }, []);

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setPlanoVisualizando(null);
        setZoomLevel(1);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const cargarPisos = async () => {
    try {
      const res = await fetch(`${API}/api/pisos`);
      const data = await res.json();
      setPisos(data);

      for (const piso of data) {
        cargarPlano(piso.IDPiso);
      }
    } catch (error) {
      console.error("Error al cargar pisos:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarPlano = async (idPiso) => {
    try {
      const res = await fetch(`${API}/api/pisos/plano/${idPiso}`);
      if (res.ok) {
        const data = await res.json();
        setPlanos((prev) => ({ ...prev, [idPiso]: data.ruta }));
      }
    } catch (error) {
      // No hay plano para este piso
    }
  };

  const handleGuardar = async () => {
    if (!archivo || !modoEdicion) return;

    setUploading(true);
    setMensaje(null);
    const formData = new FormData();
    formData.append("plano", archivo);

    try {
      const method = planos[modoEdicion] ? "PUT" : "POST";
      const res = await fetch(`${API}/api/pisos/plano/${modoEdicion}`, {
        method,
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setMensaje({ tipo: "success", texto: `✓ ${data.mensaje}` });
        await cargarPlano(modoEdicion);
        setArchivo(null);
        setModoEdicion(null);
      } else {
        setMensaje({ tipo: "error", texto: "✗ Error al guardar el plano" });
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "✗ Error al guardar el plano" });
    } finally {
      setUploading(false);
    }
  };

  const handleEliminar = async (idPiso) => {
    if (!confirm("¿Estás seguro de eliminar este plano?")) return;

    try {
      const res = await fetch(`${API}/api/pisos/plano/${idPiso}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPlanos((prev) => {
          const nuevo = { ...prev };
          delete nuevo[idPiso];
          return nuevo;
        });
        setMensaje({
          tipo: "success",
          texto: "✓ Plano eliminado exitosamente",
        });
      } else {
        setMensaje({ tipo: "error", texto: "✗ Error al eliminar el plano" });
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "✗ Error al eliminar el plano" });
    }
  };

  // Filtrado de pisos
  const pisosFiltrados = pisos.filter((piso) => {
    // Filtro por búsqueda
    const matchBusqueda =
      busqueda === "" ||
      piso.NumeroPiso.includes(busqueda) ||
      piso.Bodega.includes(busqueda);

    // Filtro por estado
    const matchEstado =
      filtroEstado === "todos" ||
      (filtroEstado === "con-plano" && planos[piso.IDPiso]) ||
      (filtroEstado === "sin-plano" && !planos[piso.IDPiso]);

    return matchBusqueda && matchEstado;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pisos...</p>
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
                Gestión de Planos
              </h1>
              <p className="text-sm text-gray-500">Panel de Administración</p>
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

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar piso o bodega
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Ej: Piso 2, Bodega 45..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">
                  🔍
                </span>
              </div>
            </div>

            {/* Filtros rápidos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por estado
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFiltroEstado("todos")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filtroEstado === "todos"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Todos ({pisos.length})
                </button>
                <button
                  onClick={() => setFiltroEstado("con-plano")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filtroEstado === "con-plano"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Con plano ({Object.keys(planos).length})
                </button>
                <button
                  onClick={() => setFiltroEstado("sin-plano")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filtroEstado === "sin-plano"
                      ? "bg-gray-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Sin plano ({pisos.length - Object.keys(planos).length})
                </button>
              </div>
            </div>
          </div>

          {/* Contador de resultados */}
          {(busqueda || filtroEstado !== "todos") && (
            <div className="mt-4 text-sm text-gray-600">
              Mostrando {pisosFiltrados.length} de {pisos.length} pisos
            </div>
          )}
        </div>

        {/* Tabla CRUD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Gestión de Planos por Piso
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Administra los planos de cada piso
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Piso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bodega
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pisosFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="text-4xl mb-2">🔍</div>
                      No se encontraron pisos con los filtros aplicados
                    </td>
                  </tr>
                ) : (
                  pisosFiltrados.map((piso) => (
                    <tr
                      key={piso.IDPiso}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-bold">
                              {piso.NumeroPiso}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            Piso {piso.NumeroPiso}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Bodega {piso.Bodega}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {planos[piso.IDPiso] ? (
                          <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full inline-flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Con plano
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full inline-flex items-center">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                            Sin plano
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {planos[piso.IDPiso] ? (
                          <button
                            onClick={() =>
                              setPlanoVisualizando({
                                idPiso: piso.IDPiso,
                                ruta: planos[piso.IDPiso],
                              })
                            }
                            className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center"
                          >
                            <span className="mr-1">📄</span>
                            Ver plano
                          </button>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                        {!planos[piso.IDPiso] ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setModoEdicion(piso.IDPiso)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm inline-flex items-center"
                          >
                            <span className="mr-1">+</span>
                            Añadir
                          </motion.button>
                        ) : (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setModoEdicion(piso.IDPiso)}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition shadow-sm inline-flex items-center"
                            >
                              <span className="mr-1">✎</span>
                              Editar
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEliminar(piso.IDPiso)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm inline-flex items-center"
                            >
                              <span className="mr-1">✕</span>
                              Eliminar
                            </motion.button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info adicional */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex gap-3">
            <span className="text-blue-600 text-xl">💡</span>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Recomendaciones
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Usa imágenes de alta calidad para mejor visualización</li>
                <li>• Formatos recomendados: PNG o SVG</li>
                <li>• Asegúrate de que el plano esté actualizado</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de visualización de plano con zoom */}
      <AnimatePresence>
        {planoVisualizando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setPlanoVisualizando(null);
              setZoomLevel(1);
            }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-xl p-4 max-w-6xl max-h-[90vh] overflow-auto"
            >
              {/* Header del modal */}
              <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10 pb-2 border-b">
                <h3 className="text-lg font-bold text-gray-900">
                  Plano - Piso{" "}
                  {
                    pisos.find((p) => p.IDPiso === planoVisualizando.idPiso)
                      ?.NumeroPiso
                  }
                  (Bodega{" "}
                  {
                    pisos.find((p) => p.IDPiso === planoVisualizando.idPiso)
                      ?.Bodega
                  }
                  )
                </h3>
                <div className="flex items-center gap-2">
                  {/* Controles de zoom */}
                  <button
                    onClick={() =>
                      setZoomLevel((prev) => Math.max(0.5, prev - 0.25))
                    }
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                  >
                    🔍−
                  </button>
                  <span className="text-sm text-gray-600">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() =>
                      setZoomLevel((prev) => Math.min(3, prev + 0.25))
                    }
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                  >
                    🔍+
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => {
                      setPlanoVisualizando(null);
                      setZoomLevel(1);
                    }}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                  >
                    ✕ Cerrar
                  </button>
                </div>
              </div>

              {/* Imagen del plano */}
              <div className="overflow-auto">
                <img
                  src={`${API}${planoVisualizando.ruta}`}
                  alt={`Plano piso ${planoVisualizando.idPiso}`}
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: "top left",
                  }}
                  className="transition-transform duration-200"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de edición/añadir */}
      {modoEdicion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {planos[modoEdicion] ? "Editar" : "Añadir"} Plano
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Piso seleccionado
              </label>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-900 font-medium">
                  Piso {pisos.find((p) => p.IDPiso === modoEdicion)?.NumeroPiso}{" "}
                  - Bodega {pisos.find((p) => p.IDPiso === modoEdicion)?.Bodega}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivo del plano
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setArchivo(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📤</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {archivo
                      ? archivo.name
                      : "Haz clic para seleccionar archivo"}
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, SVG hasta 10MB
                  </p>
                </label>
              </div>
            </div>

            {archivo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100"
              >
                <span className="text-2xl">📄</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    {archivo.name}
                  </p>
                  <p className="text-xs text-blue-600">
                    {(archivo.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => setArchivo(null)}
                  className="text-blue-600 hover:text-blue-800 transition"
                >
                  ✕
                </button>
              </motion.div>
            )}

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: archivo && !uploading ? 1.02 : 1 }}
                whileTap={{ scale: archivo && !uploading ? 0.98 : 1 }}
                onClick={handleGuardar}
                disabled={!archivo || uploading}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin"></span>
                    Guardando...
                  </span>
                ) : (
                  "Guardar"
                )}
              </motion.button>
              <button
                onClick={() => {
                  setModoEdicion(null);
                  setArchivo(null);
                }}
                disabled={uploading}
                className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
