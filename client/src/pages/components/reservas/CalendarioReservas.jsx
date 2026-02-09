// client/src/pages/components/reservas/CalendarioReservas.jsx  
import { useState } from "react";  
import { motion } from "framer-motion";  
  
export default function CalendarioReservas({  
  pisoSeleccionado,  
  onSolicitarReserva  
}) {  
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);  
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);  
  
  // Generar próximos 14 días  
  const generarDias = () => {  
    const dias = [];  
    const hoy = new Date();  
      
    for (let i = 0; i < 14; i++) {  
      const fecha = new Date(hoy);  
      fecha.setDate(hoy.getDate() + i);  
      dias.push(fecha);  
    }  
      
    return dias;  
  };  
  
  const dias = generarDias();  
  
  const formatearFecha = (fecha) => {  
    return fecha.toLocaleDateString('es-ES', {  
      weekday: 'short',  
      day: 'numeric',  
      month: 'short'  
    });  
  };  
  
  const handleSeleccionarFecha = (fecha) => {  
    setFechaSeleccionada(fecha);  
    setMostrarConfirmacion(true);  
  };  
  
  const handleConfirmarReserva = () => {  
    if (fechaSeleccionada) {  
      onSolicitarReserva(fechaSeleccionada);  
      setMostrarConfirmacion(false);  
      setFechaSeleccionada(null);  
    }  
  };  
  
  return (  
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">  
      <div className="mb-4">  
        <h4 className="text-lg font-semibold text-gray-900 mb-2">  
          📅 Selecciona una Fecha  
        </h4>  
        <p className="text-sm text-gray-600">  
          Elige el día en que necesitas un puesto de trabajo  
        </p>  
      </div>  
  
      {/* Grid de fechas */}  
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">  
        {dias.map((dia, index) => {  
          const esHoy = index === 0;  
          const estaSeleccionado = fechaSeleccionada?.toDateString() === dia.toDateString();  
            
          return (  
            <motion.button  
              key={dia.toISOString()}  
              whileHover={{ scale: 1.05 }}  
              whileTap={{ scale: 0.95 }}  
              onClick={() => handleSeleccionarFecha(dia)}  
              className={`p-4 rounded-xl border-2 transition ${  
                estaSeleccionado  
                  ? "border-blue-600 bg-blue-50"  
                  : esHoy  
                  ? "border-green-500 bg-green-50"  
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"  
              }`}  
            >  
              <div className="text-center">  
                <div className={`text-xs font-medium mb-1 ${  
                  estaSeleccionado ? "text-blue-600" : esHoy ? "text-green-600" : "text-gray-500"  
                }`}>  
                  {formatearFecha(dia).split(',')[0]}  
                </div>  
                <div className={`text-2xl font-bold ${  
                  estaSeleccionado ? "text-blue-900" : esHoy ? "text-green-900" : "text-gray-900"  
                }`}>  
                  {dia.getDate()}  
                </div>  
                <div className={`text-xs ${  
                  estaSeleccionado ? "text-blue-600" : esHoy ? "text-green-600" : "text-gray-500"  
                }`}>  
                  {formatearFecha(dia).split(',')[1]}  
                </div>  
              </div>  
              {esHoy && (  
                <div className="mt-2 text-xs font-medium text-green-600">  
                  Hoy  
                </div>  
              )}  
            </motion.button>  
          );  
        })}  
      </div>  
  
      {/* Modal de confirmación */}  
      {mostrarConfirmacion && (  
        <motion.div  
          initial={{ opacity: 0, y: 20 }}  
          animate={{ opacity: 1, y: 0 }}  
          className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl"  
        >  
          <div className="flex items-start gap-4">  
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">  
              <span className="text-2xl">📋</span>  
            </div>  
            <div className="flex-1">  
              <h5 className="text-lg font-semibold text-gray-900 mb-2">  
                Confirmar Reserva  
              </h5>  
              <p className="text-sm text-gray-700 mb-4">  
                ¿Deseas reservar un puesto para el{" "}  
                <span className="font-semibold">  
                  {fechaSeleccionada?.toLocaleDateString('es-ES', {  
                    weekday: 'long',  
                    day: 'numeric',  
                    month: 'long',  
                    year: 'numeric'  
                  })}  
                </span>  
                ?  
              </p>  
              <p className="text-xs text-gray-600 mb-4">  
                💡 El sistema asignará automáticamente el mejor puesto disponible en{" "}  
                <span className="font-medium">Piso {pisoSeleccionado.NumeroPiso}</span>  
              </p>  
              <div className="flex gap-3">  
                <motion.button  
                  whileHover={{ scale: 1.02 }}  
                  whileTap={{ scale: 0.98 }}  
                  onClick={handleConfirmarReserva}  
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"  
                >  
                  ✓ Confirmar Reserva  
                </motion.button>  
                <motion.button  
                  whileHover={{ scale: 1.02 }}  
                  whileTap={{ scale: 0.98 }}  
                  onClick={() => {  
                    setMostrarConfirmacion(false);  
                    setFechaSeleccionada(null);  
                  }}  
                  className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"  
                >  
                  ✕ Cancelar  
                </motion.button>  
              </div>  
            </div>  
          </div>  
        </motion.div>  
      )}  
    </div>  
  );  
}