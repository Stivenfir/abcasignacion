// client/src/pages/components/puestos/PuestosLista.jsx  
import { motion } from "framer-motion";  
  
export default function PuestosLista({  
  puestos,  
  clasificaciones,  
  loadingPuestos,  
  onAbrirModal,  
  onEliminarPuesto,  
}) {  
  const getClasificacionNombre = (idClasificacion) => {  
    const clasificacion = clasificaciones.find(c => c.IdClasificacion === idClasificacion);  
    return clasificacion?.Descripcion || "Sin clasificar";  
  };  
  
  return (  
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">  
      <div className="flex items-center justify-between mb-4">  
        <h4 className="text-lg font-semibold text-gray-900">  
          Puestos de Trabajo ({puestos.length})  
        </h4>  
        <motion.button  
          whileHover={{ scale: 1.05 }}  
          whileTap={{ scale: 0.95 }}  
          onClick={() => onAbrirModal(null)}  
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"  
        >  
          <span>➕</span>  
          Añadir Puesto  
        </motion.button>  
      </div>  
  
      {loadingPuestos ? (  
        <div className="text-center py-8">  
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>  
        </div>  
      ) : puestos.length === 0 ? (  
        <div className="text-center py-8 text-gray-500">  
          <span className="text-4xl mb-2 block">🪑</span>  
          No hay puestos configurados en esta área  
        </div>  
      ) : (  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">  
          {puestos.map((puesto) => (  
            <motion.div  
              key={puesto.IdPuestoTrabajo}  
              initial={{ opacity: 0, y: 10 }}  
              animate={{ opacity: 1, y: 0 }}  
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition"  
            >  
              <div className="flex items-start justify-between mb-3">  
                <div className="flex items-center gap-3">  
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${  
                    puesto.Disponible === 'SI' ? 'bg-green-100' : 'bg-red-100'  
                  }`}>  
                    <span className={`font-bold text-sm ${  
                      puesto.Disponible === 'SI' ? 'text-green-600' : 'text-red-600'  
                    }`}>  
                      {puesto.NoPuesto}  
                    </span>  
                  </div>  
                  <div>  
                    <p className="font-medium text-gray-900">Puesto #{puesto.NoPuesto}</p>  
                    <span className={`text-xs px-2 py-0.5 rounded-full ${  
                      puesto.Disponible === 'SI'   
                        ? 'bg-green-100 text-green-700'   
                        : 'bg-red-100 text-red-700'  
                    }`}>  
                      {puesto.Disponible === 'SI' ? '✓ Disponible' : '✗ No disponible'}  
                    </span>  
                  </div>  
                </div>  
              </div>  
  
              <div className="space-y-2 mb-3">  
                <div className="flex items-center gap-2 text-sm text-gray-600">  
                  <span>💻</span>  
                  <span>{getClasificacionNombre(puesto.IDClasificacionPuesto)}</span>  
                </div>  
                <div className="flex items-center gap-2 text-sm text-gray-600">  
                  <span>📍</span>  
                  <span>Posición: ({puesto.UbicacionX}, {puesto.UbicacionY})</span>  
                </div>  
              </div>  
  
              <div className="flex gap-2">  
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
                    if (confirm('¿Eliminar este puesto?')) {  
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
      )}  
    </div>  
  );  
}