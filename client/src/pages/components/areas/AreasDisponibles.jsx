// client/src/components/areas/AreasDisponibles.jsx  
import { motion } from "framer-motion";  
  
export default function AreasDisponibles({  
  areasDisponibles,  
  onSeleccionarArea  
}) {  
  return (  
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
              onClick={() => onSeleccionarArea(area.IdArea)}  
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
  );  
}
