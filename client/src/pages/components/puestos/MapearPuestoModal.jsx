// client/src/pages/components/puestos/MapearPuestoModal.jsx  
import { useState, useRef, useEffect } from "react";  
import { motion, AnimatePresence } from "framer-motion";  
  
export default function MapearPuestoModal({  
  pisoSeleccionado,  
  areaSeleccionada,  
  puestoAMapear,  
  onClose,  
  onMapear,  
}) {  
  const [planoUrl, setPlanoUrl] = useState(null);  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);  
  const [puntoSeleccionado, setPuntoSeleccionado] = useState(null);  
    
  const canvasRef = useRef(null);  
  const imagenRef = useRef(null);  
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";  
  
  // Cargar plano al montar  
  useEffect(() => {  
    if (pisoSeleccionado?.IDPiso) {  
      cargarPlano();  
    } else {  
      setError('No se ha seleccionado un piso válido');  
      setLoading(false);  
    }  
  }, [pisoSeleccionado]);  
  
  const cargarPlano = async () => {  
    setLoading(true);  
    setError(null);  
      
    try {  
      const res = await fetch(`${API}/api/pisos/plano/${pisoSeleccionado.IDPiso}`);  
        
      if (!res.ok) {  
        throw new Error(`Error ${res.status}: No se pudo cargar el plano`);  
      }  
        
      const data = await res.json();  
        
      if (data.success && data.ruta) {  
        setPlanoUrl(`${API}${data.ruta}`);  
        setError(null);  
      } else {  
        throw new Error('No se encontró el plano para este piso');  
      }  
    } catch (error) {  
      console.error("Error al cargar plano:", error);  
      setError(error.message || 'No se pudo cargar el plano del piso');  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  const handleCanvasClick = (e) => {  
    if (!canvasRef.current) return;  
      
    const rect = canvasRef.current.getBoundingClientRect();  
    const x = Math.round(e.clientX - rect.left);  
    const y = Math.round(e.clientY - rect.top);  
      
    setPuntoSeleccionado({ x, y });  
    dibujarPunto(x, y);  
  };  
  
  const dibujarPunto = (x, y) => {  
    if (!canvasRef.current) return;  
      
    const canvas = canvasRef.current;  
    const ctx = canvas.getContext("2d");  
      
    // Limpiar canvas  
    ctx.clearRect(0, 0, canvas.width, canvas.height);  
      
    // Dibujar punto  
    ctx.beginPath();  
    ctx.arc(x, y, 8, 0, 2 * Math.PI);  
    ctx.fillStyle = "#3B82F6";  
    ctx.fill();  
    ctx.strokeStyle = "#1E40AF";  
    ctx.lineWidth = 2;  
    ctx.stroke();  
      
    // Dibujar número del puesto  
    ctx.fillStyle = "#FFFFFF";  
    ctx.font = "bold 10px Arial";  
    ctx.textAlign = "center";  
    ctx.textBaseline = "middle";  
    ctx.fillText(puestoAMapear.NoPuesto, x, y);  
  };  
  
  const handleGuardar = async () => {  
    if (!puntoSeleccionado) {  
      alert("Por favor, selecciona una ubicación en el plano");  
      return;  
    }  
  
    await onMapear(puestoAMapear.IdPuestoTrabajo, puntoSeleccionado.x, puntoSeleccionado.y);  
    onClose();  
  };  
  
  const handleLimpiar = () => {  
    setPuntoSeleccionado(null);  
    if (canvasRef.current) {  
      const ctx = canvasRef.current.getContext("2d");  
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);  
    }  
  };  
  
  return (  
    <div  
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"  
      onClick={onClose}  
    >  
      <motion.div  
        initial={{ opacity: 0, scale: 0.95 }}  
        animate={{ opacity: 1, scale: 1 }}  
        exit={{ opacity: 0, scale: 0.95 }}  
        onClick={(e) => e.stopPropagation()}  
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"  
      >  
        {/* Header fijo */}  
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">  
          <div>  
            <h3 className="text-xl font-bold text-gray-900">  
              📍 Mapear Puesto #{puestoAMapear.NoPuesto}  
            </h3>  
            <p className="text-sm text-gray-600 mt-1">  
              {areaSeleccionada?.NombreArea || `Área ${areaSeleccionada?.IdArea}`} • Piso {pisoSeleccionado?.NumeroPiso}  
            </p>  
          </div>  
          <button  
            onClick={onClose}  
            className="w-10 h-10 rounded-full hover:bg-white/80 flex items-center justify-center transition text-gray-600 hover:text-gray-900"  
          >  
            <span className="text-2xl">✕</span>  
          </button>  
        </div>  
  
        {/* Contenido con scroll */}  
        <div className="flex-1 overflow-y-auto p-6">  
          {/* Estados de carga y error */}  
          {loading && (  
            <div className="flex flex-col items-center justify-center py-16">  
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>  
              <p className="text-gray-600 font-medium">Cargando plano del piso...</p>  
            </div>  
          )}  
  
          {error && !loading && (  
            <div className="flex flex-col items-center justify-center py-16">  
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">  
                <span className="text-4xl">⚠️</span>  
              </div>  
              <p className="text-red-600 font-semibold mb-2">{error}</p>  
              <p className="text-gray-500 text-sm mb-4">  
                Verifica que el plano del piso esté cargado correctamente  
              </p>  
              <motion.button  
                whileHover={{ scale: 1.05 }}  
                whileTap={{ scale: 0.95 }}  
                onClick={cargarPlano}  
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"  
              >  
                🔄 Reintentar  
              </motion.button>  
            </div>  
          )}  
  
          {/* Plano cargado exitosamente */}  
          {!loading && !error && planoUrl && (  
            <>  
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">  
                <p className="text-sm text-blue-800 font-medium">  
                  💡 Haz clic en el plano para seleccionar la ubicación del puesto  
                </p>  
                {puntoSeleccionado && (  
                  <p className="text-sm text-gray-700 mt-2">  
                    📍 Ubicación seleccionada: ({puntoSeleccionado.x}, {puntoSeleccionado.y})  
                  </p>  
                )}  
              </div>  
  
              <div className="relative inline-block border-2 border-gray-300 rounded-lg overflow-hidden">  
                <img  
                  ref={imagenRef}  
                  src={planoUrl}  
                  alt="Plano del piso"  
                  className="max-w-full h-auto"  
                  onLoad={(e) => {  
                    if (canvasRef.current) {  
                      canvasRef.current.width = e.target.width;  
                      canvasRef.current.height = e.target.height;  
                    }  
                  }}  
                  onError={() => {  
                    setError('Error al cargar la imagen del plano');  
                  }}  
                />  
                <canvas  
                  ref={canvasRef}  
                  className="absolute top-0 left-0 cursor-crosshair"  
                  onClick={handleCanvasClick}  
                />  
              </div>  
            </>  
          )}  
        </div>  
  
        {/* Footer fijo con botones */}  
        {!loading && !error && planoUrl && (  
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3">  
            <motion.button  
              whileHover={{ scale: 1.02 }}  
              whileTap={{ scale: 0.98 }}  
              onClick={handleGuardar}  
              disabled={!puntoSeleccionado}  
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition font-semibold shadow-lg disabled:shadow-none"  
            >  
              💾 Guardar Ubicación  
            </motion.button>  
            <motion.button  
              whileHover={{ scale: 1.02 }}  
              whileTap={{ scale: 0.98 }}  
              onClick={handleLimpiar}  
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition font-semibold"  
            >  
              🗑️ Limpiar  
            </motion.button>  
          </div>  
        )}  
      </motion.div>  
    </div>  
  );  
}