// client/src/pages/components/puestos/PuestosLista.jsx  
import { motion } from "framer-motion";  
import { useState } from "react";  
  
export default function PuestosLista({  
  puestos,  
  clasificaciones,  
  loadingPuestos,  
  onAbrirModal,  
  onAbrirModalMapeo,  
  onEliminarPuesto,  
}) {  
  const [busqueda, setBusqueda] = useState("");  
  const [filtroMapeo, setFiltroMapeo] = useState("todos"); // 'todos', 'mapeados', 'sin-mapear'  
  
  const getClasificacionNombre = (idClasificacion) => {  
    const clasificacion = clasificaciones.find(c => c.IdClasificacion === idClasificacion);  
    return clasificacion?.Descripcion || "Sin clasificar";  
  };  

  const totalDisponibles = puestos.filter((p) => p.Disponible === "SI").length;
  const totalNoDisponibles = puestos.length - totalDisponibles;
  const totalMapeados = puestos.filter((p) => p.TieneMapeo).length;
  const totalMapeadosDisponibles = puestos.filter(
    (p) => p.TieneMapeo && p.Disponible === "SI",
  ).length;
  
  // Filtrar puestos  
  const puestosFiltrados = puestos.filter(puesto => {  
    const matchBusqueda = busqueda === "" ||   
      puesto.NoPuesto.toString().includes(busqueda);  
      
    const matchMapeo = filtroMapeo === "todos" ||  
      (filtroMapeo === "mapeados" && puesto.TieneMapeo) ||  
      (filtroMapeo === "sin-mapear" && !puesto.TieneMapeo);  
      
    return matchBusqueda && matchMapeo;  
  });  
  
  return (  
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">  
      {/* Header con controles */}  
      <div className="flex items-center justify-between mb-4">  
        <h4 className="text-lg font-semibold text-gray-900">  
          Puestos de Trabajo ({puestos.length})  
        </h4>  
        <motion.button  
          whileHover={{ scale: 1.05 }}  
          whileTap={{ scale: 0.95 }}  
          onClick={() => onAbrirModal(null)}  
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition flex items-center gap-2"  
        >  
          <span>➕</span>  
          Crear Puesto  
        </motion.button>  
      </div>  
  
      {/* Filtros */}  
      <div className="mb-4 space-y-3">  
        <input  
          type="text"  
          placeholder="🔍 Buscar por número de puesto..."  
          value={busqueda}  
          onChange={(e) => setBusqueda(e.target.value)}  
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"  
        />  
          
        <div className="flex gap-2">  
          <button  
            onClick={() => setFiltroMapeo("todos")}  
            className={`px-3 py-1 rounded-lg text-sm transition ${  
              filtroMapeo === "todos"  
                ? "bg-blue-600 text-white"  
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"  
            }`}  
          >  
            Todos ({puestos.length})  
          </button>  
          <button  
            onClick={() => setFiltroMapeo("mapeados")}  
            className={`px-3 py-1 rounded-lg text-sm transition ${  
              filtroMapeo === "mapeados"  
                ? "bg-green-600 text-white"  
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"  
            }`}  
          >  
            Mapeados ({totalMapeados})  
          </button>  
          <button  
            onClick={() => setFiltroMapeo("sin-mapear")}  
            className={`px-3 py-1 rounded-lg text-sm transition ${  
              filtroMapeo === "sin-mapear"  
                ? "bg-orange-600 text-white"  
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"  
            }`}  
          >  
            Sin mapear ({puestos.filter(p => !p.TieneMapeo).length})  
          </button>  
        </div>  

        <div className="flex flex-wrap gap-2 text-xs"> 
          <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700"> 
            Disponibles: {totalDisponibles}
          </span>
          <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-700"> 
            No disponibles: {totalNoDisponibles}
          </span>
          <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700"> 
            Mapeados disponibles: {totalMapeadosDisponibles} / {totalMapeados}
          </span>
        </div>
      </div>  
  
      {loadingPuestos ? (  
        <div className="text-center py-8">  
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>  
        </div>  
      ) : puestosFiltrados.length === 0 ? (  
        <div className="text-center py-8 text-gray-500">  
          <span className="text-4xl mb-2 block">📭</span>  
          {busqueda || filtroMapeo !== "todos"   
            ? "No se encontraron puestos con los filtros aplicados"  
            : "No hay puestos creados para esta área"}  
        </div>  
      ) : (  
        <div className="max-h-[500px] overflow-y-auto pr-2">  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">  
            {puestosFiltrados.map((puesto) => (  
              <motion.div  
                key={puesto.IdPuestoTrabajo}  
                initial={{ opacity: 0, scale: 0.95 }}  
                animate={{ opacity: 1, scale: 1 }}  
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition"  
              >  
                {/* Header del puesto */}  
                <div className="flex items-start justify-between mb-3">  
                  <div className="flex items-center gap-3">  
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">  
                      <span className="text-blue-600 font-bold text-sm">  
                        #{puesto.NoPuesto}  
                      </span>  
                    </div>  
                    <div>  
                      <span className="font-medium text-gray-900 block">  
                        Puesto #{puesto.NoPuesto}  
                      </span>  
                      {puesto.TieneMapeo ? (  
                        <span className="text-xs text-green-600 flex items-center gap-1">  
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>  
                          Mapeado en plano  
                        </span>  
                      ) : (  
                        <span className="text-xs text-orange-600 flex items-center gap-1">  
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>  
                          Sin mapear  
                        </span>  
                      )}  
                    </div>  
                  </div>  
                    
                  <span className={`px-2 py-1 rounded text-xs font-medium ${  
                    puesto.Disponible === "SI"  
                      ? "bg-green-100 text-green-700"  
                      : "bg-red-100 text-red-700"  
                  }`}>  
                    {puesto.Disponible === "SI" ? "Disponible" : "No disponible"}  
                  </span>  
                </div>  
  
                {/* Detalles */}  
                <div className="space-y-2 mb-3 text-sm">  
                  <div className="flex items-center gap-2 text-gray-600">  
                    <span>💻</span>  
                    <span className="truncate">  
                      {getClasificacionNombre(puesto.IDClasificacionPuesto)}  
                    </span>  
                  </div>  
                  {puesto.UbicacionX !== null && puesto.UbicacionY !== null && (  
                    <div className="flex items-center gap-2 text-gray-600">  
                      <span>📍</span>  
                      <span>  
                        Posición: ({puesto.UbicacionX}, {puesto.UbicacionY})  
                      </span>  
                    </div>  
                  )}  
                </div>  
  
                {/* Acciones */}  
                <div className="flex gap-2">  
                  {!puesto.TieneMapeo && (  
                    <motion.button  
                      whileHover={{ scale: 1.05 }}  
                      whileTap={{ scale: 0.95 }}  
                      onClick={() => onAbrirModalMapeo?.(puesto)}  
                      className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition"  
                    >  
                      📍 Mapear  
                    </motion.button>  
                  )}  
                    
                  <motion.button  
                    whileHover={{ scale: 1.05 }}  
                    whileTap={{ scale: 0.95 }}  
                    onClick={() => onAbrirModal(puesto)}  
                    className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition"  
                  >  
                    ✏️ Editar  
                  </motion.button>  
  
                  <motion.button  
                    whileHover={{ scale: 1.05 }}  
                    whileTap={{ scale: 0.95 }}  
                    onClick={() => {  
                      if (confirm("¿Eliminar este puesto?")) {  
                        onEliminarPuesto(puesto.IdPuestoTrabajo);  
                      }  
                    }}  
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition"  
                  >  
                    🗑️  
                  </motion.button>  
                </div>  
              </motion.div>  
            ))}  
          </div>  
        </div>  
      )}  
    </div>  
  );  
}