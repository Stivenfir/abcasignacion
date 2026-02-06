// client/src/pages/Puestos.jsx      
import { useState } from "react";    
import { useNavigate } from "react-router-dom";      
import { motion } from "framer-motion";      
import { usePuestos } from "./hooks/usePuestos";      
import PuestosSidebar from "./components/puestos/PuestosSidebar";      
import PuestosPanel from "./components/puestos/PuestosPanel";      
import MapearPuestoModal from "./components/puestos/MapearPuestoModal";  
      
export default function Puestos() {      
  const navigate = useNavigate();      
  const puestosData = usePuestos();  
    

  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";  
      
  const [modalMapeoVisible, setModalMapeoVisible] = useState(false);    
  const [puestoAMapear, setPuestoAMapear] = useState(null);    
      
  const handleAbrirModalMapeo = (puesto) => {    
    setPuestoAMapear(puesto);    
    setModalMapeoVisible(true);    
  };    
    
  const handleCerrarModalMapeo = () => {    
    setModalMapeoVisible(false);    
    setPuestoAMapear(null);    
  };    
    
  const handleMapearPuesto = async (ubicacionX, ubicacionY) => {    
    try {    
      const token = localStorage.getItem("token");    
          
      const res = await fetch(    
        `${API}/api/puestos/${puestoAMapear.IdPuestoTrabajo}/mapeo`,  
        {    
          method: "PUT",    
          headers: {    
            "Content-Type": "application/json",    
            Authorization: `Bearer ${token}`,    
          },    
          body: JSON.stringify({    
            ubicacionX: Math.round(ubicacionX),    
            ubicacionY: Math.round(ubicacionY),    
          }),    
        }    
      );    
      
      if (!res.ok) throw new Error("Error al mapear puesto");    
      
      puestosData.setMensaje({     
        tipo: 'success',     
        texto: '✓ Puesto mapeado exitosamente'     
      });    
          
      await puestosData.cargarPuestos(puestosData.areaSeleccionada.IdAreaPiso);    
      handleCerrarModalMapeo();    
    } catch (error) {    
      console.error("Error al mapear puesto:", error);    
      puestosData.setMensaje({     
        tipo: 'error',     
        texto: '✗ Error al mapear puesto'     
      });    
    }    
  };  
      
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
      
      <main className="max-w-7xl mx-auto px-6 py-8">      
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
      
        <div className="grid lg:grid-cols-3 gap-6">      
          <PuestosSidebar      
            pisos={puestosData.pisos}      
            pisoSeleccionado={puestosData.pisoSeleccionado}      
            onSeleccionarPiso={(piso) => {      
              puestosData.setPisoSeleccionado(piso);      
              puestosData.cargarAreasPiso(piso.IDPiso);      
            }}      
          />      
      
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
            onAbrirModalMapeo={handleAbrirModalMapeo}  
          />      
        </div>      
      </main>    
    
      {modalMapeoVisible && puestoAMapear && (    
        <MapearPuestoModal    
          pisoSeleccionado={puestosData.pisoSeleccionado}    
          areaSeleccionada={puestosData.areaSeleccionada}    
          puestoAMapear={puestoAMapear}    
          onClose={handleCerrarModalMapeo}    
          onMapear={handleMapearPuesto}    
        />    
      )}    
    </div>      
  );      
}