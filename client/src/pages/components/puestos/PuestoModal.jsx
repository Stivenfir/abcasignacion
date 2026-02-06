// client/src/pages/components/puestos/PuestoModal.jsx  
import { useState, useRef, useEffect } from "react";  
import { motion } from "framer-motion";  
  
export default function PuestoModal({  
  pisoSeleccionado,  
  areaSeleccionada,  
  puestoAEditar,  
  clasificaciones,  
  onClose,  
  onGuardar,  
}) {  
  const [planoUrl, setPlanoUrl] = useState(null);  
  const [puntoSeleccionado, setPuntoSeleccionado] = useState(null);  
  const [formData, setFormData] = useState({  
    noPuesto: puestoAEditar?.NoPuesto || '',  
    disponible: puestoAEditar?.Disponible || 'SI',  
    idClasificacion: puestoAEditar?.IDClasificacionPuesto || '',  
  });  
    
  const canvasRef = useRef(null);  
  const imagenRef = useRef(null);  
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";  
  
  useEffect(() => {  
    cargarPlano();  
  }, [pisoSeleccionado]);  
  
  useEffect(() => {  
    if (puestoAEditar) {  
      setPuntoSeleccionado({  
        x: Number(puestoAEditar.UbicacionX),  
        y: Number(puestoAEditar.UbicacionY),  
      });  
    }  
  }, [puestoAEditar]);  
  
  const cargarPlano = async () => {  
    try {  
      const res = await fetch(`${API}/api/pisos/plano/${pisoSeleccionado.IDPiso}`);  
      const data = await res.json();  
      if (data.success) {  
        setPlanoUrl(`${API}${data.ruta}`);  
      }  
    } catch (error) {  
      console.error("Error al cargar plano:", error);  
    }  
  };  
  
  const handleCanvasClick = (e) => {  
    if (!canvasRef.current) return;  
    const rect = canvasRef.current.getBoundingClientRect();  
    const x = Math.round(e.clientX - rect.left);  
    const y = Math.round(e.clientY - rect.top);  
    setPuntoSeleccionado({ x, y });  
  };  
  
  const dibujarPunto = () => {  
    if (!canvasRef.current || !puntoSeleccionado) return;  
    const canvas = canvasRef.current;  
    const ctx = canvas.getContext("2d");  
    ctx.clearRect(0, 0, canvas.width, canvas.height);  
  
    // Dibujar punto  
    ctx.fillStyle = "#3B82F6";  
    ctx.beginPath();  
    ctx.arc(puntoSeleccionado.x, puntoSeleccionado.y, 8, 0, 2 * Math.PI);  
    ctx.fill();  
  
    // Dibujar borde  
    ctx.strokeStyle = "#1E40AF";  
    ctx.lineWidth = 2;  
    ctx.stroke();  
  
    // Dibujar número del puesto  
    if (formData.noPuesto) {  
      ctx.fillStyle = "#1E40AF";  
      ctx.font = "bold 12px Arial";  
      ctx.textAlign = "center";  
      ctx.fillText(formData.noPuesto, puntoSeleccionado.x, puntoSeleccionado.y - 12);  
    }  
  };  
  
  useEffect(() => {  
    if (puntoSeleccionado) {  
      dibujarPunto();  
    }  
  }, [puntoSeleccionado, formData.noPuesto]);  
  
  const handleGuardar = async () => {  
    if (!puntoSeleccionado || !formData.noPuesto || !formData.idClasificacion) {  
      alert("Por favor completa todos los campos y selecciona una ubicación en el mapa");  
      return;  
    }  
  
    const datosPuesto = {  
      idAreaPiso: areaSeleccionada.IdAreaPiso,  
      noPuesto: formData.noPuesto,  
      ubicacionX: puntoSeleccionado.x,  
      ubicacionY: puntoSeleccionado.y,  
      disponible: formData.disponible,  
      idClasificacion: formData.idClasificacion,  
    };  
  
    await onGuardar(datosPuesto);  
    onClose();  
  };  
  
  return (  
    <div  
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"  
      onClick={(e) => {  
        if (e.target === e.currentTarget) {  
          if (confirm("¿Descartar los cambios?")) onClose();  
        }  
      }}  
    >  
      <motion.div  
        initial={{ opacity: 0, scale: 0.95 }}  
        animate={{ opacity: 1, scale: 1 }}  
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-auto"  
      >  
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">  
          <h3 className="text-xl font-bold text-gray-900">  
            {puestoAEditar ? "Editar Puesto" : "Crear Nuevo Puesto"} - Piso {pisoSeleccionado?.NumeroPiso}  
          </h3>  
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">  
            ✕  
          </button>  
        </div>  
  
        <div className="p-6">  
          {/* Formulario */}  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">  
            <div>  
              <label className="block text-sm font-medium text-gray-700 mb-2">  
                Número de Puesto *  
              </label>  
              <input  
                type="number"  
                value={formData.noPuesto}  
                onChange={(e) => setFormData({ ...formData, noPuesto: e.target.value })}  
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"  
                placeholder="Ej: 1"  
              />  
            </div>  
  
            <div>  
              <label className="block text-sm font-medium text-gray-700 mb-2">  
                Disponible para Reserva *  
              </label>  
              <select  
                value={formData.disponible}  
                onChange={(e) => setFormData({ ...formData, disponible: e.target.value })}  
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"  
              >  
                <option value="SI">✓ Sí</option>  
                <option value="NO">✗ No</option>  
              </select>  
            </div>  
  
            <div>  
              <label className="block text-sm font-medium text-gray-700 mb-2">  
                Tipo de Equipamiento *  
              </label>  
              <select  
                value={formData.idClasificacion}  
                onChange={(e) => setFormData({ ...formData, idClasificacion: e.target.value })}  
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"  
              >  
                <option value="">Seleccionar...</option>  
                {clasificaciones.map((c) => (  
                  <option key={c.IdClasificacion} value={c.IdClasificacion}>  
                    {c.Descripcion}  
                  </option>  
                ))}  
              </select>  
            </div>  
          </div>  
  
          {/* Instrucciones */}  
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">  
            <p className="text-sm text-blue-800">  
              💡 Haz clic en el plano para seleccionar la ubicación del puesto  
            </p>  
            {puntoSeleccionado && (  
              <p className="text-sm text-gray-700 mt-2">  
                📍 Ubicación seleccionada: ({puntoSeleccionado.x}, {puntoSeleccionado.y})  
              </p>  
            )}  
          </div>  
  
          {/* Plano interactivo */}  
          <div className="relative inline-block">  
            <img  
              ref={imagenRef}  
              src={planoUrl}  
              alt="Plano del piso"  
              className="max-w-full h-auto border border-gray-300 rounded"  
              onLoad={(e) => {  
                if (canvasRef.current) {  
                  canvasRef.current.width = e.target.width;  
                  canvasRef.current.height = e.target.height;  
                  if (puntoSeleccionado) dibujarPunto();  
                }  
              }}  
            />  
              <canvas  
              ref={canvasRef}  
              className="absolute top-0 left-0 cursor-crosshair"  
              onClick={handleCanvasClick}  
            />  
          </div>  
  
          {/* Botones de acción */}  
          <div className="mt-6 flex gap-3">  
            <motion.button  
              whileHover={{ scale: 1.02 }}  
              whileTap={{ scale: 0.98 }}  
              onClick={handleGuardar}  
              disabled={!puntoSeleccionado || !formData.noPuesto || !formData.idClasificacion}  
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"  
            >  
              {puestoAEditar ? "💾 Guardar Cambios" : "➕ Crear Puesto"}  
            </motion.button>  
            <motion.button  
              whileHover={{ scale: 1.02 }}  
              whileTap={{ scale: 0.98 }}  
              onClick={() => {  
                setPuntoSeleccionado(null);  
                if (canvasRef.current) {  
                  const ctx = canvasRef.current.getContext("2d");  
                  ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);  
                }  
              }}  
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"  
            >  
              🗑️ Limpiar  
            </motion.button>  
          </div>  
        </div>  
      </motion.div>  
    </div>  
  );  
}