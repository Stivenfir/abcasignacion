// client/src/components/areas/AreasAsignadas.jsx    
import { motion } from "framer-motion";    
    
export default function AreasAsignadas({    
  areasPiso,    
  areas,    
  loadingAreas,    
  delimitaciones,    
  onEditarDelimitacion,    
  onEliminarArea,    
  onVerMapaCompleto,  
  onGestionarDelimitaciones  // ✅ Nueva prop  
}) {    
  return (    
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">    
      <div className="flex items-center justify-between mb-4">    
        <h4 className="text-lg font-semibold text-gray-900">    
          Áreas asignadas ({areasPiso.length})    
        </h4>    
        {areasPiso.length > 0 && (    
          <button    
            onClick={onVerMapaCompleto}    
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
            const area = areas.find((a) => a.IdArea === areaPiso.IdArea);    
            const numDelimitaciones = delimitaciones[areaPiso.IdAreaPiso]?.length || 0;    
            const tieneDelimitacion = numDelimitaciones > 0;    
                
            return (    
              <motion.div    
                key={areaPiso.IdAreaPiso}    
                initial={{ opacity: 0, y: 10 }}    
                animate={{ opacity: 1, y: 0 }}    
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition"    
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
                        {numDelimitaciones} delimitación(es) en mapa    
                      </span>    
                    ) : (    
                      <span className="text-xs text-orange-600 flex items-center gap-1">    
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>    
                        Sin delimitar en mapa    
                      </span>    
                    )}    
                  </div>    
                </div>    
                  
                {/* ✅ NUEVO: Botones de gestión */}  
                <div className="flex gap-2">  
                  {/* Botón para agregar/editar delimitaciones */}  
                  <motion.button  
                    whileHover={{ scale: 1.05 }}  
                    whileTap={{ scale: 0.95 }}  
                    onClick={() => onEditarDelimitacion(areaPiso)}  
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition"  
                  >  
                    📐 Delimitar  
                  </motion.button>  
                    
                  {/* Botón para gestionar delimitaciones existentes */}  
                  {numDelimitaciones > 0 && (  
                    <motion.button  
                      whileHover={{ scale: 1.05 }}  
                      whileTap={{ scale: 0.95 }}  
                      onClick={() => onGestionarDelimitaciones(areaPiso)}  
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition"  
                    >  
                      ✏️ Gestionar ({numDelimitaciones})  
                    </motion.button>  
                  )}  
                    
                  {/* Botón eliminar área */}  
                  <motion.button    
                    whileHover={{ scale: 1.05 }}    
                    whileTap={{ scale: 0.95 }}    
                    onClick={(e) => {    
                      e.stopPropagation();    
                      onEliminarArea(areaPiso.IdAreaPiso);    
                    }}    
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition"    
                  >    
                    ✕ Eliminar    
                  </motion.button>  
                </div>  
              </motion.div>    
            );    
          })}    
        </div>    
      )}    
    </div>    
  );    
}