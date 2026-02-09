// client/src/pages/hooks/useReservas.js  
import { useState, useEffect } from "react";  
  
export function useReservas() {  
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";  
    
  const [pisos, setPisos] = useState([]);  
  const [reservas, setReservas] = useState([]);  
  const [pisoSeleccionado, setPisoSeleccionado] = useState(null);  
  const [loading, setLoading] = useState(true);  
  const [loadingReservas, setLoadingReservas] = useState(false);  
  const [mensaje, setMensaje] = useState(null);  
  
  useEffect(() => {  
    cargarDatos();  
  }, []);  
  
  const cargarDatos = async () => {  
    try {  
      const token = localStorage.getItem("token");  
      const userId = localStorage.getItem("userId"); // Asumiendo que guardas el ID del usuario  
        
      // Cargar pisos  
      const resPisos = await fetch(`${API}/api/pisos`);  
      const dataPisos = await resPisos.json();  
      setPisos(dataPisos);  
  
      // Cargar reservas del usuario  
      const resReservas = await fetch(`${API}/api/reservas/empleado/${userId}`, {  
        headers: { Authorization: `Bearer ${token}` }  
      });  
      const dataReservas = await resReservas.json();  
      setReservas(Array.isArray(dataReservas) ? dataReservas : []);  
    } catch (error) {  
      setMensaje({ tipo: 'error', texto: '✗ Error al cargar datos' });  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  const obtenerPuestoDisponible = async (idPiso, fecha) => {  
    try {  
      const token = localStorage.getItem("token");  
      const res = await fetch(`${API}/api/reservas/disponibles/${fecha}`, {  
        headers: { Authorization: `Bearer ${token}` }  
      });  
      const puestosDisponibles = await res.json();  
        
      // Filtrar por piso y obtener el primer puesto disponible  
      const puestosPiso = puestosDisponibles.filter(p => p.IdPiso === idPiso);  
        
      if (puestosPiso.length === 0) {  
        setMensaje({ tipo: 'error', texto: '✗ No hay puestos disponibles para esta fecha' });  
        return null;  
      }  
  
      // Sistema asigna automáticamente el primer puesto disponible  
      return puestosPiso[0];  
    } catch (error) {  
      setMensaje({ tipo: 'error', texto: '✗ Error al buscar puestos disponibles' });  
      return null;  
    }  
  };  
  
  const crearReserva = async (datosReserva) => {  
    try {  
      const token = localStorage.getItem("token");  
      const userId = localStorage.getItem("userId");  
  
      const res = await fetch(`${API}/api/reservas`, {  
        method: 'POST',  
        headers: {  
          'Content-Type': 'application/json',  
          Authorization: `Bearer ${token}`  
        },  
        body: JSON.stringify({  
          idEmpleado: userId,  
          idPuestoTrabajo: datosReserva.puesto.IdPuestoTrabajo,  
          fecha: datosReserva.fecha  
        })  
      });  
  
      if (res.ok) {  
        setMensaje({ tipo: 'success', texto: '✓ Reserva creada exitosamente' });  
        await cargarDatos(); // Recargar reservas  
      }  
    } catch (error) {  
      setMensaje({ tipo: 'error', texto: '✗ Error al crear reserva' });  
    }  
  };  
  
  const cancelarReserva = async (idReserva, observacion) => {  
    try {  
      const token = localStorage.getItem("token");  
      const userId = localStorage.getItem("userId");  
  
      const res = await fetch(`${API}/api/reservas/${idReserva}/cancelar`, {  
        method: 'PUT',  
        headers: {  
          'Content-Type': 'application/json',  
          Authorization: `Bearer ${token}`  
        },  
        body: JSON.stringify({  
          idEmpleadoCancela: userId,  
          observacion  
        })  
      });  
  
      if (res.ok) {  
        setMensaje({ tipo: 'success', texto: '✓ Reserva cancelada' });  
        await cargarDatos();  
      }  
    } catch (error) {  
      setMensaje({ tipo: 'error', texto: '✗ Error al cancelar reserva' });  
    }  
  };  
  
  return {  
    pisos,  
    reservas,  
    pisoSeleccionado,  
    loading,  
    loadingReservas,  
    mensaje,  
    setPisoSeleccionado,  
    setMensaje,  
    obtenerPuestoDisponible,  
    crearReserva,  
    cancelarReserva  
  };  
}