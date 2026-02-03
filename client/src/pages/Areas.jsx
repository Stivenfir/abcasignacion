import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Areas() {
  const [pisos, setPisos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [areasPiso, setAreasPiso] = useState([]);
  const [pisoSeleccionado, setPisoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const navigate = useNavigate();
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
      console.error('La respuesta de áreas no es un array:', dataAreas);    
      setAreas([]);  
    }    
  } catch (error) {    
    console.error('Error al cargar datos:', error);    
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
      console.error('Error HTTP:', res.status);  
      setAreasPiso([]);  
      setMensaje({ tipo: 'error', texto: 'Error al cargar áreas del piso' });  
      return;  
    }  
      
    const data = await res.json();  
      
    // VALIDAR que sea array  
    if (Array.isArray(data)) {  
      setAreasPiso(data);  
    } else {  
      console.error('La respuesta no es un array:', data);  
      setAreasPiso([]);  
      setMensaje({ tipo: 'error', texto: 'Formato de datos incorrecto' });  
    }  
  } catch (error) {  
    console.error('Error al cargar áreas del piso:', error);  
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

  const handleAsignarArea = async (idArea) => {
    try {
      const res = await fetch(`${API}/api/areas/piso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idArea, idPiso: pisoSeleccionado.IDPiso }),
      });

      if (res.ok) {
        setMensaje({ tipo: "success", texto: "✓ Área asignada exitosamente" });
        cargarAreasPiso(pisoSeleccionado.IDPiso);
      } else {
        setMensaje({ tipo: "error", texto: "✗ Error al asignar área" });
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "✗ Error al asignar área" });
    }
  };

  const handleEliminarArea = async (idAreaPiso) => {
    if (!confirm("¿Estás seguro de eliminar esta área del piso?")) return;

    try {
      const res = await fetch(`${API}/api/areas/piso/${idAreaPiso}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMensaje({ tipo: "success", texto: "✓ Área eliminada exitosamente" });
        cargarAreasPiso(pisoSeleccionado.IDPiso);
      } else {
        setMensaje({ tipo: "error", texto: "✗ Error al eliminar área" });
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "✗ Error al eliminar área" });
    }
  };

  // Agrupar pisos por bodega
  const pisosPorBodega = pisos.reduce((acc, piso) => {
    if (!acc[piso.Bodega]) acc[piso.Bodega] = [];
    acc[piso.Bodega].push(piso);
    return acc;
  }, {});

  // Filtrar áreas disponibles (que no estén ya asignadas)
  const areasDisponibles = areas.filter(
    (area) => !areasPiso.some((ap) => ap.IdArea === area.IdArea),
  );

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
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Áreas asignadas ({areasPiso.length})
                  </h4>

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
                        return (
                          <motion.div
                            key={areaPiso.IdAreaPiso}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">
                                  {area?.IdArea}
                                </span>
                              </div>
                              <span className="font-medium text-gray-900">
                                {area?.NombreArea || "Área desconocida"}
                              </span>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                handleEliminarArea(areaPiso.IdAreaPiso)
                              }
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

                {/* Áreas disponibles para asignar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Asignar nueva área ({areasDisponibles.length} disponibles)
                  </h4>

                  {areasDisponibles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <span className="text-4xl mb-2 block">✅</span>
                      Todas las áreas ya están asignadas a este piso
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {areasDisponibles.map((area) => (
                        <motion.button
                          key={area.IdArea}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAsignarArea(area.IdArea)}
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
    </div>
  );
}
