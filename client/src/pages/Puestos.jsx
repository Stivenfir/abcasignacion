// client/src/pages/Puestos.jsx  
import { useNavigate } from "react-router-dom";  
import { motion } from "framer-motion";  
import { usePuestos } from "./hooks/usePuestos";  
import PuestosSidebar from "./components/puestos/PuestosSidebar";  
import PuestosPanel from "./components/puestos/PuestosPanel";  
  
export default function Puestos() {  
  const navigate = useNavigate();  
  const puestosData = usePuestos();  
  
  if (puestosData.loading) {  
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
              onClick={() => navigate("/dashboard")}  
              className="text-gray-600 hover:text-gray-900 transition"  
            >  
              ← Volver  
            </button>  
            <div>  
              <h1 className="text-2xl font-bold text-gray-900">  
                Gestión de Puestos de Trabajo  
              </h1>  
              <p className="text-sm text-gray-500">  
                Configuración y asignación de puestos por área  
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
  
      {/* Main Content */}  
      <main className="max-w-7xl mx-auto px-6 py-8">  
        {/* Mensaje de feedback */}  
        {puestosData.mensaje && (  
          <motion.div  
            initial={{ opacity: 0, y: -10 }}  
            animate={{ opacity: 1, y: 0 }}  
            className={`mb-6 p-4 rounded-lg border ${  
              puestosData.mensaje.tipo === "success"  
                ? "bg-green-50 border-green-200 text-green-800"  
                : "bg-red-50 border-red-200 text-red-800"  
            }`}  
          >  
            {puestosData.mensaje.texto}  
          </motion.div>  
        )}  
  
        {/* Grid principal */}  
        <div className="grid lg:grid-cols-3 gap-6">  
          {/* Sidebar de pisos */}  
          <PuestosSidebar  
            pisos={puestosData.pisos}  
            pisoSeleccionado={puestosData.pisoSeleccionado}  
            onSeleccionarPiso={(piso) => {  
              puestosData.setPisoSeleccionado(piso);  
              puestosData.cargarAreasPiso(piso.IDPiso);  
            }}  
          />  
  
          {/* Panel principal de puestos */}  
          <PuestosPanel  
            pisoSeleccionado={puestosData.pisoSeleccionado}  
            areasPiso={puestosData.areasPiso}  
            areaSeleccionada={puestosData.areaSeleccionada}  
            puestos={puestosData.puestos}  
            clasificaciones={puestosData.clasificaciones}  
            loadingPuestos={puestosData.loadingPuestos}  
            onSeleccionarArea={(area) => {  
              puestosData.setAreaSeleccionada(area);  
              puestosData.cargarPuestos(area.IdAreaPiso);  
            }}  
            onCrearPuesto={puestosData.crearPuesto}  
            onEliminarPuesto={puestosData.eliminarPuesto}  
          />  
        </div>  
      </main>  
    </div>  
  );  
}