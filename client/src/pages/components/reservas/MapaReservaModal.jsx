import { useState, useRef, useEffect } from "react";  
import { motion } from "framer-motion";  
  
export default function MapaReservaModal({  
  reserva,  
  pisoSeleccionado,  
  areaAsignada,  
  onClose  
}) {  
  const [planoUrl, setPlanoUrl] = useState(null);  
  const [loading, setLoading] = useState(true);  
  const canvasRef = useRef(null);  
  const imagenRef = useRef(null);  
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";  
  
  useEffect(() => {  
    if (pisoSeleccionado?.IDPiso) {  
      cargarPlano();  
    }  
  }, [pisoSeleccionado]);  
  
  const cargarPlano = async () => {  
    try {  
      const res = await fetch(`${API}/api/pisos/plano/${pisoSeleccionado.IDPiso}`);  
      const data = await res.json();  
        
      if (data.success && data.ruta) {  
        setPlanoUrl(`${API}${data.ruta}`);  
      }  
    } catch (error) {  
      console.error("Error al cargar plano:", error);  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  const dibujarPuestoAsignado = () => {  
    if (!canvasRef.current || !reserva?.UbicacionX || !reserva?.UbicacionY) return;  
  
    const canvas = canvasRef.current;  
    const ctx = canvas.getContext("2d");  
    ctx.clearRect(0, 0, canvas.width, canvas.height);  
  
    const x = Number(reserva.UbicacionX);  
    const y = Number(reserva.UbicacionY);  
  
    // Dibujar círculo verde brillante para el puesto asignado  
    ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';  
    ctx.shadowBlur = 10;  
    ctx.shadowOffsetX = 0;  
    ctx.shadowOffsetY = 0;  
  
    ctx.beginPath();  
    ctx.arc(x, y, 15, 0, 2 * Math.PI);  
    ctx.fillStyle = "#10B981";  
    ctx.fill();  
  
    ctx.shadowColor = 'transparent';  
    ctx.strokeStyle = "#059669";  
    ctx.lineWidth = 3;  
    ctx.stroke();  
  
    // Dibujar número del puesto  
    ctx.fillStyle = "#FFFFFF";  
    ctx.font = "bold 14px Arial";  
    ctx.textAlign = "center";  
    ctx.textBaseline = "middle";  
    ctx.fillText(reserva.NoPuesto, x, y);  
  
    // Dibujar pulso animado  
    ctx.beginPath();  
    ctx.arc(x, y, 25, 0, 2 * Math.PI);  
    ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";  
    ctx.lineWidth = 2;  
    ctx.stroke();  
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"  
      >  
        {/* Header */}  
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">  
          <div>  
            <h3 className="text-xl font-bold text-gray-900">  
              ✅ Puesto Asignado  
            </h3>  
            <p className="text-sm text-gray-600 mt-1">  
              {areaAsignada?.NombreArea || `Área ${areaAsignada?.IdArea}`} • Puesto #{reserva?.NoPuesto}  
            </p>  
          </div>  
          <button  
            onClick={onClose}  
            className="w-10 h-10 rounded-full hover:bg-white/80 flex items-center justify-center transition text-gray-600 hover:text-gray-900"  
          >  
            <span className="text-2xl">✕</span>  
          </button>  
        </div>  
  
        {/* Contenido */}  
        <div className="flex-1 overflow-y-auto p-6">  
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">  
            <p className="text-sm text-green-800 font-medium">  
              🎉 Tu reserva ha sido confirmada. Este es tu puesto asignado en el plano.  
            </p>  
          </div>  
  
          {loading ? (  
            <div className="flex justify-center py-16">  
              <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>  
            </div>  
          ) : (  
            <div className="relative inline-block border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg">  
              <img  
                ref={imagenRef}  
                src={planoUrl}  
                alt="Plano del piso"  
                className="max-w-full h-auto block"  
                onLoad={(e) => {  
                  if (canvasRef.current) {  
                    canvasRef.current.width = e.target.width;  
                    canvasRef.current.height = e.target.height;  
                    dibujarPuestoAsignado();  
                  }  
                }}  
              />  
              <canvas  
                ref={canvasRef}  
                className="absolute top-0 left-0 pointer-events-none"  
              />  
            </div>  
          )}  
        </div>  
  
        {/* Footer */}  
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">  
          <motion.button  
            whileHover={{ scale: 1.02 }}  
            whileTap={{ scale: 0.98 }}  
            onClick={onClose}  
            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-semibold shadow-lg"  
          >  
            Entendido  
          </motion.button>  
        </div>  
      </motion.div>  
    </div>  
  );  
}