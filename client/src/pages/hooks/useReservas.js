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
  
      // Cargar pisos  
      const resPisos = await fetch(`${API}/api/pisos`);  
      if (!resPisos.ok) throw new Error('Error al cargar pisos');  
      const dataPisos = await resPisos.json();  
      setPisos(dataPisos);  
  
      // ✅ Cargar reservas del usuario (el backend usa req.user.idEmpleado del token)  
      const resReservas = await fetch(`${API}/api/reservas/empleado`, {  
        headers: { Authorization: `Bearer ${token}` },  
      });  
        
      if (!resReservas.ok) {  
        console.error('Error al cargar reservas:', resReservas.status);  
        setReservas([]);  
      } else {  
        const dataReservas = await resReservas.json();  
        setReservas(Array.isArray(dataReservas) ? dataReservas : []);  
      }  
    } catch (error) {  
      console.error('Error en cargarDatos:', error);  
      setMensaje({ tipo: "error", texto: "✗ Error al cargar datos" });  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  const obtenerPuestoDisponible = async (idPiso, fecha) => {  
    try {  
      const token = localStorage.getItem("token");  
      const res = await fetch(`${API}/api/reservas/disponibles/${fecha}`, {  
        headers: { Authorization: `Bearer ${token}` },  
      });  
  
      if (!res.ok) {  
        throw new Error(`Error ${res.status}: No se pudieron obtener puestos disponibles`);  
      }  
  
      const puestosDisponibles = await res.json();  
  
      // Filtrar por piso y obtener el primer puesto disponible  
      const puestosPiso = puestosDisponibles.filter((p) => p.IdPiso === idPiso);  
  
      if (puestosPiso.length === 0) {  
        setMensaje({  
          tipo: "error",  
          texto: "✗ No hay puestos disponibles para esta fecha",  
        });  
        return null;  
      }  
  
      // Sistema asigna automáticamente el primer puesto disponible  
      return puestosPiso[0];  
    } catch (error) {  
      console.error('Error en obtenerPuestoDisponible:', error);  
      setMensaje({  
        tipo: "error",  
        texto: "✗ Error al buscar puestos disponibles",  
      });  
      return null;  
    }  
  };  
  
  const crearReserva = async (datosReserva) => {  
    try {  
      const token = localStorage.getItem("token");  
  
      // ✅ El backend obtiene idEmpleado del token JWT, no necesitas enviarlo  
      const res = await fetch(`${API}/api/reservas`, {  
        method: "POST",  
        headers: {  
          "Content-Type": "application/json",  
          Authorization: `Bearer ${token}`,  
        },  
        body: JSON.stringify({  
          idPuestoTrabajo: datosReserva.puesto.IdPuestoTrabajo,  
          fecha: datosReserva.fecha,  
        }),  
      });  
  
      if (!res.ok) {  
        const errorData = await res.json();  
        throw new Error(errorData.message || 'Error al crear reserva');  
      }  
  
      setMensaje({ tipo: "success", texto: "✓ Reserva creada exitosamente" });  
      await cargarDatos(); // Recargar reservas  
      return true;  
    } catch (error) {  
      console.error('Error en crearReserva:', error);  
      setMensaje({ tipo: "error", texto: `✗ ${error.message}` });  
      return false;  
    }  
  };  
  
  const cancelarReserva = async (idReserva, observacion) => {  
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return false;  
  
    try {  
      const token = localStorage.getItem("token");  
  
      // ✅ El backend obtiene idEmpleadoCancela del token JWT  
      const res = await fetch(`${API}/api/reservas/${idReserva}/cancelar`, {  
        method: "PUT",  
        headers: {  
          "Content-Type": "application/json",  
          Authorization: `Bearer ${token}`,  
        },  
        body: JSON.stringify({  
          observacion: observacion || 'Cancelada por el usuario',  
        }),  
      });  
  
      if (!res.ok) {  
        const errorData = await res.json();  
        throw new Error(errorData.message || 'Error al cancelar reserva');  
      }  
  
      setMensaje({ tipo: "success", texto: "✓ Reserva cancelada" });  
      await cargarDatos();  
      return true;  
    } catch (error) {  
      console.error('Error en cancelarReserva:', error);  
      setMensaje({ tipo: "error", texto: `✗ ${error.message}` });  
      return false;  
    }  
  };  
  
  return {  
    pisos,  
    reservas,  
    pisoSeleccionado,  
    loading,  
    loadingReservas,  
    mensaje,  
    cargarDatos,
    setPisoSeleccionado,  
    setMensaje,  
    obtenerPuestoDisponible,  
    crearReserva,  
    cancelarReserva,  

  };  
}