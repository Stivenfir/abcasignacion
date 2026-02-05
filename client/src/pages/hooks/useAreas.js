// client/src/hooks/useAreas.js  
import { useState, useEffect } from 'react';  
  
export function useAreas() {  
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";  
    
  const [pisos, setPisos] = useState([]);  
  const [areas, setAreas] = useState([]);  
  const [areasPiso, setAreasPiso] = useState([]);  
  const [pisoSeleccionado, setPisoSeleccionado] = useState(null);  
  const [loading, setLoading] = useState(true);  
  const [loadingAreas, setLoadingAreas] = useState(false);  
  const [mensaje, setMensaje] = useState(null);  
    
  // NUEVO: Estado para múltiples delimitaciones  
  const [delimitaciones, setDelimitaciones] = useState({});  
    
  useEffect(() => {  
    cargarDatos();  
  }, []);  
    
  const cargarDatos = async () => {  
    try {  
      const resPisos = await fetch(`${API}/api/pisos`);  
      const dataPisos = await resPisos.json();  
      setPisos(dataPisos);  
  
      const resAreas = await fetch(`${API}/api/areas`);  
      const dataAreas = await resAreas.json();  
        
      if (Array.isArray(dataAreas)) {  
        setAreas(dataAreas);  
      } else {  
        setAreas([]);  
      }  
    } catch (error) {  
      console.error("Error al cargar datos:", error);  
      setAreas([]);  
      setPisos([]);  
    } finally {  
      setLoading(false);  
    }  
  };  
    
  const cargarAreasPiso = async (idPiso) => {  
    setLoadingAreas(true);  
    try {  
      const res = await fetch(`${API}/api/areas/piso/${idPiso}`);  
      if (!res.ok) {  
        setAreasPiso([]);  
        setMensaje({ tipo: "error", texto: "Error al cargar áreas del piso" });  
        return;  
      }  
        
      const data = await res.json();  
      if (Array.isArray(data)) {  
        setAreasPiso(data);  
          
        // NUEVO: Cargar delimitaciones para cada área  
        await cargarTodasLasDelimitaciones(data);  
      } else {  
        setAreasPiso([]);  
      }  
    } catch (error) {  
      console.error("Error al cargar áreas del piso:", error);  
      setAreasPiso([]);  
    } finally {  
      setLoadingAreas(false);  
    }  
  };  
    
  // NUEVO: Cargar todas las delimitaciones de las áreas del piso  
  const cargarTodasLasDelimitaciones = async (areasDelPiso) => {  
    const delims = {};  
      
    for (const areaPiso of areasDelPiso) {  
      try {  
        const res = await fetch(`${API}/api/areas/piso/${areaPiso.IdAreaPiso}/delimitaciones`);  
        if (res.ok) {  
          const data = await res.json();  
          delims[areaPiso.IdAreaPiso] = Array.isArray(data) ? data : [];  
        }  
      } catch (error) {  
        console.error(`Error al cargar delimitaciones de ${areaPiso.IdAreaPiso}:`, error);  
        delims[areaPiso.IdAreaPiso] = [];  
      }  
    }  
      
    setDelimitaciones(delims);  
  };  
    
  const handleAsignarArea = async (idArea, nombreArea) => {  
    if (!confirm(`¿Quieres añadir el área "${nombreArea}" a este piso?`)) return;  
      
    try {  
      const token = localStorage.getItem("token");  
      const res = await fetch(`${API}/api/areas/piso`, {  
        method: "POST",  
        headers: {  
          "Content-Type": "application/json",  
          Authorization: `Bearer ${token}`,  
        },  
        body: JSON.stringify({ idArea, idPiso: pisoSeleccionado.IDPiso }),  
      });  
  
      if (res.ok) {  
        setMensaje({ tipo: "success", texto: "✓ Área asignada exitosamente" });  
        await cargarAreasPiso(pisoSeleccionado.IDPiso);  
        return true;  
      } else if (res.status === 401) {  
        setMensaje({ tipo: "error", texto: "✗ No autorizado" });  
        return false;  
      } else {  
        setMensaje({ tipo: "error", texto: "✗ Error al asignar área" });  
        return false;  
      }  
    } catch (error) {  
      setMensaje({ tipo: "error", texto: "✗ Error al asignar área" });  
      return false;  
    }  
  };  
    
  // NUEVO: Crear nueva delimitación (permite múltiples)  
  const crearDelimitacion = async (idAreaPiso, coordX, coordY, ancho, alto) => {  
    try {  
      const token = localStorage.getItem("token");  
      const res = await fetch(`${API}/api/areas/piso/${idAreaPiso}/delimitacion`, {  
        method: "POST",  
        headers: {  
          "Content-Type": "application/json",  
          Authorization: `Bearer ${token}`,  
        },  
        body: JSON.stringify({ coordX, coordY, ancho, alto }),  
      });  
  
      if (res.ok) {  
        setMensaje({ tipo: "success", texto: "✓ Delimitación creada exitosamente" });  
        await cargarAreasPiso(pisoSeleccionado.IDPiso);  
        return true;  
      } else {  
        setMensaje({ tipo: "error", texto: "✗ Error al crear delimitación" });  
        return false;  
      }  
    } catch (error) {  
      setMensaje({ tipo: "error", texto: "✗ Error al crear delimitación" });  
      return false;  
    }  
  };  
    
  const handleEliminarArea = async (idAreaPiso) => {  
    if (!confirm("¿Estás seguro de eliminar esta área del piso?")) return;  
      
    try {  
      const token = localStorage.getItem("token");  
      const res = await fetch(`${API}/api/areas/piso/${idAreaPiso}`, {  
        method: "DELETE",  
        headers: { Authorization: `Bearer ${token}` },  
      });  
  
      if (res.ok) {  
        setMensaje({ tipo: "success", texto: "✓ Área eliminada exitosamente" });  
        await cargarAreasPiso(pisoSeleccionado.IDPiso);  
        return true;  
      } else {  
        setMensaje({ tipo: "error", texto: "✗ Error al eliminar área" });  
        return false;  
      }  
    } catch (error) {  
      setMensaje({ tipo: "error", texto: "✗ Error al eliminar área" });  
      return false;  
    }  
  };  
    
  return {  
    // Estado  
    pisos,  
    areas,  
    areasPiso,  
    pisoSeleccionado,  
    loading,  
    loadingAreas,  
    mensaje,  
    delimitaciones,  
      
    // Acciones  
    setPisoSeleccionado,  
    setMensaje,  
    cargarAreasPiso,  
    handleAsignarArea,  
    handleEliminarArea,  
    crearDelimitacion,  
  };  
}