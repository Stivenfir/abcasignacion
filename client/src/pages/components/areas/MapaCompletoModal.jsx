// client/src/components/areas/MapaCompletoModal.jsx  
import { useRef, useEffect } from "react";  
import { motion } from "framer-motion";  
  
export default function MapaCompletoModal({  
  pisoSeleccionado,  
  areasPiso,  
  areas,  
  delimitaciones,  
  onClose  
}) {  
  const canvasPreviewRef = useRef(null);  
  const imagenPreviewRef = useRef(null);  
    
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";  
  
  useEffect(() => {  
    if (imagenPreviewRef.current && canvasPreviewRef.current) {  
      dibujarTodasLasDelimitaciones();  
    }  
  }, [areasPiso, delimitaciones]);  
  
  const dibujarTodasLasDelimitaciones = () => {  
    if (!canvasPreviewRef.current) return;  
  
    const canvas = canvasPreviewRef.current;  
    const ctx = canvas.getContext("2d");  
    ctx.clearRect(0, 0, canvas.width, canvas.height);  
  
    const colors = [  
      { stroke: "#3B82F6", fill: "rgba(59, 130, 246, 0.15)" },  
      { stroke: "#10B981", fill: "rgba(16, 185, 129, 0.15)" },  
      { stroke: "#F59E0B", fill: "rgba(245, 158, 11, 0.15)" },  
      { stroke: "#EF4444", fill: "rgba(239, 68, 68, 0.15)" },  
      { stroke: "#8B5CF6", fill: "rgba(139, 92, 246, 0.15)" },  
      { stroke: "#EC4899", fill: "rgba(236, 72, 153, 0.15)" },  
    ];  
  
    // Dibujar todas las delimitaciones de todas las áreas  
    areasPiso.forEach((areaPiso, areaIndex) => {  
      const area = areas.find((a) => a.IdArea === areaPiso.IdArea);  
      const delimitacionesArea = delimitaciones[areaPiso.IdAreaPiso] || [];  
      const color = colors[areaIndex % colors.length];  
  
      // Dibujar cada delimitación del área  
      delimitacionesArea.forEach((delimitacion) => {  
        ctx.strokeStyle = color.stroke;  
        ctx.lineWidth = 3;  
        ctx.fillStyle = color.fill;  
  
        ctx.fillRect(  
          Number(delimitacion.PosicionX),  
          Number(delimitacion.PosicionY),  
          Number(delimitacion.Ancho),  
          Number(delimitacion.Alto)  
        );  
        ctx.strokeRect(  
          Number(delimitacion.PosicionX),  
          Number(delimitacion.PosicionY),  
          Number(delimitacion.Ancho),  
          Number(delimitacion.Alto)  
        );  
  
        // Etiqueta con nombre del área  
        ctx.fillStyle = color.stroke;  
        ctx.font = "14px Arial";  
        ctx.fillText(  
          area?.NombreArea || `Área ${areaPiso.IdArea}`,  
          Number(delimitacion.PosicionX) + 5,  
          Number(delimitacion.PosicionY) + 20  
        );  
      });  
    });  
  };  
  
  return (  
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">  
      <motion.div  
        initial={{ opacity: 0, scale: 0.95 }}  
        animate={{ opacity: 1, scale: 1 }}  
        exit={{ opacity: 0, scale: 0.95 }}  
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-auto"  
      >  
        {/* Header */}  
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">  
          <h3 className="text-xl font-bold text-gray-900">  
            Mapa Completo - Piso {pisoSeleccionado?.NumeroPiso}  
          </h3>  
          <button  
            onClick={onClose}  
            className="text-gray-500 hover:text-gray-700 text-2xl transition"  
          >  
            ✕  
          </button>  
        </div>  
  
        {/* Contenido */}  
        <div className="p-6">  
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">  
            <p className="text-sm text-blue-800">  
              🗺️ Vista previa de todas las áreas delimitadas en este piso  
            </p>  
          </div>  
  
          {/* Plano con canvas de solo lectura */}  
          <div className="relative inline-block">  
            <img  
              ref={imagenPreviewRef}  
              src={`${API}/api/pisos/plano/${pisoSeleccionado?.IDPiso}`}  
              alt="Plano del piso"  
              className="max-w-full h-auto border border-gray-300 rounded"  
              onLoad={(e) => {  
                if (canvasPreviewRef.current) {  
                  canvasPreviewRef.current.width = e.target.width;  
                  canvasPreviewRef.current.height = e.target.height;  
                  dibujarTodasLasDelimitaciones();  
                }  
              }}  
            />  
            <canvas  
              ref={canvasPreviewRef}  
              className="absolute top-0 left-0 pointer-events-none"  
            />  
          </div>  
  
          {/* Leyenda de colores */}  
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">  
            <h4 className="text-sm font-semibold text-gray-900 mb-3">  
              Áreas delimitadas:  
            </h4>  
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">  
              {areasPiso.map((areaPiso, index) => {  
                const area = areas.find((a) => a.IdArea === areaPiso.IdArea);  
                const numDelimitaciones = delimitaciones[areaPiso.IdAreaPiso]?.length || 0;  
                  
                if (numDelimitaciones === 0) return null;  
  
                const colors = [  
                  "#3B82F6",  
                  "#10B981",  
                  "#F59E0B",  
                  "#EF4444",  
                  "#8B5CF6",  
                  "#EC4899",  
                ];  
                const color = colors[index % colors.length];  
  
                return (  
                  <div  
                    key={areaPiso.IdAreaPiso}  
                    className="flex items-center gap-2"  
                  >  
                    <div  
                      className="w-4 h-4 rounded"  
                      style={{ backgroundColor: color }}  
                    ></div>  
                    <span className="text-sm text-gray-700">  
                      {area?.NombreArea || `Área ${areaPiso.IdArea}`}  
                      <span className="text-xs text-gray-500 ml-1">  
                        ({numDelimitaciones})  
                      </span>  
                    </span>  
                  </div>  
                );  
              })}  
            </div>  
          </div>  
        </div>  
      </motion.div>  
    </div>  
  );  
}