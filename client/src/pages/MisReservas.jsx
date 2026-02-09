// client/src/pages/MisReservas.jsx    
import { useState } from "react";    
import { useNavigate } from "react-router-dom";    
import { motion } from "framer-motion";    
import { useReservas } from "./hooks/useReservas";    
import ReservasSidebar from "./components/reservas/ReservasSidebar";    
import ReservasPanel from "./components/reservas/ReservasPanel";    
import ConfirmacionReservaModal from "./components/reservas/ConfirmacionReservaModal";    
    
export default function MisReservas() {    
  const navigate = useNavigate();    
  const reservasData = useReservas();    
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";    
      
  const [modalConfirmacion, setModalConfirmacion] = useState(false);    
  const [reservaPendiente, setReservaPendiente] = useState(null);    
    
  // ✅ CORREGIDO: Separar lógica de obtener puesto disponible vs crear reserva  
const handleSolicitarReserva = async (fechaSeleccionada) => {  
  try {  
    if (!reservasData.pisoSeleccionado?.IDPiso) {  
      reservasData.setMensaje({   
        tipo: 'error',   
        texto: '✗ Debes seleccionar un piso primero'   
      });  
      return;  
    }  
  
    console.log('📍 Solicitando puestos disponibles para fecha:', fechaSeleccionada);  
    console.log('📍 Piso seleccionado:', reservasData.pisoSeleccionado);  
      
    // ✅ AGREGAR TOKEN DE AUTENTICACIÓN  
    const token = localStorage.getItem('token');  
      
    const fechaFormateada = new Date(fechaSeleccionada).toISOString().split('T')[0];  
    const url = `${API}/api/reservas/disponibles/${fechaFormateada}`;  
      
    console.log('📍 URL:', url);  
      
    const res = await fetch(url, {  
      headers: {  
        'Authorization': `Bearer ${token}`  // ✅ Agregar header de autenticación  
      }  
    });  
      
    console.log('📍 Response status:', res.status);  
    console.log('📍 Response ok:', res.ok);  
      
    if (!res.ok) {  
      const errorText = await res.text();  
      console.error('❌ Error response:', errorText);  
      throw new Error(`HTTP ${res.status}: ${errorText}`);  
    }  
      
    const puestosDisponibles = await res.json();  
    console.log('✅ Puestos disponibles:', puestosDisponibles);  
      
    if (!puestosDisponibles || puestosDisponibles.length === 0) {  
      reservasData.setMensaje({   
        tipo: 'error',   
        texto: '✗ No hay puestos disponibles para esta fecha'   
      });  
      return;  
    }  
      
    // Asignar automáticamente el primer puesto disponible  
    const puestoAsignado = puestosDisponibles[0];  
      
    setReservaPendiente({  
      fecha: fechaSeleccionada,  
      puestoAsignado,  
      pisoSeleccionado: reservasData.pisoSeleccionado  
    });  
      
    setModalConfirmacion(true);  
      
  } catch (error) {  
    console.error('❌ Error completo:', error);  
    console.error('❌ Stack trace:', error.stack);  
    reservasData.setMensaje({   
      tipo: 'error',   
      texto: `✗ ${error.message}`   
    });  
  }  
}; 
    
  // ✅ CORREGIDO: Crear la reserva después de confirmar  
const handleConfirmarReserva = async () => {  
  try {  
    console.log('📍 Confirmando reserva con:', reservaPendiente);  
      
    // ✅ Validar que tenemos todos los datos necesarios  
    if (!reservaPendiente?.puestoAsignado?.IdPuestoTrabajo) {  
      throw new Error('No se pudo obtener el ID del puesto');  
    }  
      
    if (!reservaPendiente?.fecha) {  
      throw new Error('No se pudo obtener la fecha de reserva');  
    }  
      
    const token = localStorage.getItem('token');  
      
    // ✅ Convertir fecha a formato YYYY-MM-DD  
    const fechaFormateada = reservaPendiente.fecha instanceof Date  
      ? reservaPendiente.fecha.toISOString().split('T')[0]  
      : reservaPendiente.fecha;  
      
    console.log('📍 Datos a enviar:', {  
      idPuestoTrabajo: reservaPendiente.puestoAsignado.IdPuestoTrabajo,  
      fecha: fechaFormateada  
    });  
      
    const res = await fetch(`${API}/api/reservas`, {  
      method: 'POST',  
      headers: {  
        'Content-Type': 'application/json',  
        'Authorization': `Bearer ${token}`  
      },  
      body: JSON.stringify({  
        idPuestoTrabajo: Number(reservaPendiente.puestoAsignado.IdPuestoTrabajo),  
        fecha: fechaFormateada  
      })  
    });  
      
    console.log('📍 Response status:', res.status);  
      
    if (!res.ok) {  
      const errorData = await res.json();  
      console.error('❌ Error del servidor:', errorData);  
      throw new Error('Error al crear la reserva');  
    }  
      
    reservasData.setMensaje({   
      tipo: 'success',   
      texto: '✓ Reserva creada exitosamente'   
    });  
      
    setModalConfirmacion(false);  
    setReservaPendiente(null);  
      
    // Recargar reservas  
    await reservasData.cargarDatos();  
      
  } catch (error) {  
    console.error('Error al confirmar reserva:', error);  
    reservasData.setMensaje({   
      tipo: 'error',   
      texto: `✗ ${error.message}`   
    });  
  }  
};
    
  if (reservasData.loading) {    
    return (    
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">    
        <div className="text-center">    
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>    
          <p className="text-gray-600 font-medium">Cargando datos...</p>    
        </div>    
      </div>    
    );    
  }    
    
  return (    
    <div className="min-h-screen bg-gray-50">    
      {/* Header */}    
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">    
        <div className="px-6 py-4">    
          <div className="flex items-center justify-between">    
            <div>    
              <h1 className="text-2xl font-bold text-gray-900">📋 Mis Reservas</h1>    
              <p className="text-sm text-gray-600 mt-1">    
                Gestiona tus reservas de puestos de trabajo    
              </p>    
            </div>    
            <button    
              onClick={() => navigate("/dashboard")}    
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"    
            >    
              ← Volver    
            </button>    
          </div>    
        </div>    
      </header>    
    
      {/* Mensaje de feedback */}    
      {reservasData.mensaje && (    
        <motion.div    
          initial={{ opacity: 0, y: -20 }}    
          animate={{ opacity: 1, y: 0 }}    
          exit={{ opacity: 0 }}    
          className={`mx-6 mt-4 p-4 rounded-xl ${    
            reservasData.mensaje.tipo === "success"    
              ? "bg-green-50 border border-green-200 text-green-800"    
              : "bg-red-50 border border-red-200 text-red-800"    
          }`}    
        >    
          <p className="font-medium">{reservasData.mensaje.texto}</p>    
        </motion.div>    
      )}    
    
      <main className="p-6">    
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">    
          <ReservasSidebar    
            pisos={reservasData.pisos}    
            pisoSeleccionado={reservasData.pisoSeleccionado}    
            onSeleccionarPiso={reservasData.setPisoSeleccionado}    
          />    
    
          <ReservasPanel    
            pisoSeleccionado={reservasData.pisoSeleccionado}    
            reservas={reservasData.reservas}    
            loadingReservas={reservasData.loadingReservas}    
            onSolicitarReserva={handleSolicitarReserva}    
            onCancelarReserva={reservasData.cancelarReserva}    
          />    
        </div>    
      </main>    
    
      {/* ✅ CORREGIDO: Pasar props correctamente al modal */}  
      {modalConfirmacion && reservaPendiente && (    
        <ConfirmacionReservaModal    
          pisoSeleccionado={reservaPendiente.pisoSeleccionado}  
          fechaSeleccionada={reservaPendiente.fecha}  
          puestoAsignado={reservaPendiente.puestoAsignado}  
          onConfirmar={handleConfirmarReserva}    
          onCancelar={() => {  
            setModalConfirmacion(false);  
            setReservaPendiente(null);  
          }}    
        />    
      )}    
    </div>    
  );    
}