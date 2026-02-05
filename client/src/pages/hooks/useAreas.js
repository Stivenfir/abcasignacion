// client/src/hooks/useAreas.js  
import { useState, useEffect } from 'react';  
import { logError, handleAPIResponse, APIError } from '../utils/errorHandler';  
  
export function useAreas() {  
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";  
    
  // Estados principales  
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
      await handleAPIResponse(resPisos, 'GET /api/pisos');  
      const dataPisos = await resPisos.json();  
      setPisos(dataPisos);  
  
      const resAreas = await fetch(`${API}/api/areas`);  
      await handleAPIResponse(resAreas, 'GET /api/areas');  
      const dataAreas = await resAreas.json();  
        
      if (Array.isArray(dataAreas)) {  
        setAreas(dataAreas);  
      } else {  
        setAreas([]);  
      }  
    } catch (error) {  
      if (error instanceof APIError) {  
        setMensaje({ tipo: 'error', texto: `✗ ${error.message}` });  
      } else {  
        logError(error, { action: 'cargarDatos' });  
        setMensaje({ tipo: 'error', texto: '✗ Error al cargar datos iniciales' });  
      }  
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
      await handleAPIResponse(res, `GET /api/areas/piso/${idPiso}`);  
        
      const data = await res.json();  
        
      if (Array.isArray(data)) {  
        setAreasPiso(data);  
          
        // Cargar delimitaciones para cada área  
        const delimitacionesMap = {};  
        for (const areaPiso of data) {  
          const dels = await cargarDelimitaciones(areaPiso.IdAreaPiso);  
          delimitacionesMap[areaPiso.IdAreaPiso] = dels;  
        }  
        setDelimitaciones(delimitacionesMap);  
      } else {  
        setAreasPiso([]);  
        setMensaje({ tipo: 'error', texto: 'Formato de datos incorrecto' });  
      }  
    } catch (error) {  
      if (error instanceof APIError) {  
        setMensaje({ tipo: 'error', texto: `✗ ${error.message}` });  
      } else {  
        logError(error, { action: 'cargarAreasPiso', idPiso });  
        setMensaje({ tipo: 'error', texto: '✗ Error al cargar áreas del piso' });  
      }  
      setAreasPiso([]);  
    } finally {  
      setLoadingAreas(false);  
    }  
  };  
    
  const cargarDelimitaciones = async (idAreaPiso) => {  
    try {  
      const res = await fetch(`${API}/api/areas/piso/${idAreaPiso}/delimitaciones`);  
      await handleAPIResponse(res, `GET /api/areas/piso/${idAreaPiso}/delimitaciones`);  
        
      const data = await res.json();  
      return Array.isArray(data) ? data : [];  
    } catch (error) {  
      if (error instanceof APIError) {  
        // Ya fue loggeado por handleAPIResponse  
        setMensaje({   
          tipo: 'error',   
          texto: `✗ ${error.message}`   
        });  
      } else {  
        logError(error, { action: 'cargarDelimitaciones', idAreaPiso });  
        setMensaje({   
          tipo: 'error',   
          texto: '✗ Error inesperado al cargar delimitaciones'   
        });  
      }  
      return [];  
    }  
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
  
      await handleAPIResponse(res, 'POST /api/areas/piso');  
        
      setMensaje({ tipo: "success", texto: "✓ Área asignada exitosamente" });  
      await cargarAreasPiso(pisoSeleccionado.IDPiso);  
    } catch (error) {  
      if (error instanceof APIError) {  
        setMensaje({ tipo: 'error', texto: `✗ ${error.message}` });  
      } else {  
        logError(error, { action: 'handleAsignarArea', idArea, nombreArea });  
        setMensaje({ tipo: "error", texto: "✗ Error al asignar área" });  
      }  
    }  
  };  

  const editarDelimitacion = async (idAreaPiso, idDelimitacion, rectangulo) => {  
  try {  
    const token = localStorage.getItem("token");  
    const res = await fetch(`${API}/api/areas/piso/${idAreaPiso}/delimitacion/${idDelimitacion}`, {  
      method: "PUT",  
      headers: {  
        "Content-Type": "application/json",  
        Authorization: `Bearer ${token}`,  
      },  
      body: JSON.stringify({  
        coordX: Math.round(rectangulo.x),  
        coordY: Math.round(rectangulo.y),  
        ancho: Math.round(rectangulo.width),  
        alto: Math.round(rectangulo.height)  
      }),  
    });  
  
    await handleAPIResponse(res, `PUT /api/areas/piso/${idAreaPiso}/delimitacion/${idDelimitacion}`);  
      
    setMensaje({ tipo: 'success', texto: '✓ Delimitación editada exitosamente' });  
      
    // Recargar delimitaciones  
    const dels = await cargarDelimitaciones(idAreaPiso);  
    setDelimitaciones(prev => ({  
      ...prev,  
      [idAreaPiso]: dels  
    }));  
      
    return true;  
  } catch (error) {  
    if (error instanceof APIError) {  
      setMensaje({ tipo: 'error', texto: `✗ ${error.message}` });  
    } else {  
      logError(error, { action: 'editarDelimitacion', idAreaPiso, idDelimitacion });  
      setMensaje({ tipo: 'error', texto: '✗ Error al editar delimitación' });  
    }  
    return false;  
  }  
}; 

const eliminarDelimitacion = async (idAreaPiso, idDelimitacion) => {  
  if (!confirm("¿Estás seguro de eliminar esta delimitación?")) return;  
  
  try {  
    const token = localStorage.getItem("token");  
    const res = await fetch(`${API}/api/areas/piso/${idAreaPiso}/delimitacion/${idDelimitacion}`, {  
      method: "DELETE",  
      headers: {  
        Authorization: `Bearer ${token}`,  
      },  
    });  
  
    await handleAPIResponse(res, `DELETE /api/areas/piso/${idAreaPiso}/delimitacion/${idDelimitacion}`);  
      
    setMensaje({ tipo: "success", texto: "✓ Delimitación eliminada exitosamente" });  
      
    // Recargar delimitaciones  
    const dels = await cargarDelimitaciones(idAreaPiso);  
    setDelimitaciones(prev => ({  
      ...prev,  
      [idAreaPiso]: dels  
    }));  
      
    return true;  
  } catch (error) {  
    if (error instanceof APIError) {  
      setMensaje({ tipo: 'error', texto: `✗ ${error.message}` });  
    } else {  
      logError(error, { action: 'eliminarDelimitacion', idAreaPiso, idDelimitacion });  
      setMensaje({ tipo: "error", texto: "✗ Error al eliminar delimitación" });  
    }  
    return false;  
  }  
};  
    
  const crearDelimitacion = async (idAreaPiso, rectangulo) => {  
    try {  
      const token = localStorage.getItem("token");  
      const res = await fetch(`${API}/api/areas/piso/${idAreaPiso}/delimitacion`, {  
        method: "POST",  
        headers: {  
          "Content-Type": "application/json",  
          Authorization: `Bearer ${token}`,  
        },  
        body: JSON.stringify({  
          coordX: Math.round(rectangulo.x),  
          coordY: Math.round(rectangulo.y),  
          ancho: Math.round(rectangulo.width),  
          alto: Math.round(rectangulo.height)  
        }),  
      });  
  
      await handleAPIResponse(res, `POST /api/areas/piso/${idAreaPiso}/delimitacion`);  
        
      setMensaje({ tipo: 'success', texto: '✓ Delimitación creada exitosamente' });  
        
      // Recargar delimitaciones  
      const dels = await cargarDelimitaciones(idAreaPiso);  
      setDelimitaciones(prev => ({  
        ...prev,  
        [idAreaPiso]: dels  
      }));  
        
      return true;  
    } catch (error) {  
      if (error instanceof APIError) {  
        setMensaje({ tipo: 'error', texto: `✗ ${error.message}` });  
      } else {  
        logError(error, { action: 'crearDelimitacion', idAreaPiso, rectangulo });  
        setMensaje({ tipo: 'error', texto: '✗ Error al crear delimitación' });  
      }  
      return false;  
    }  
  };  
    
  const handleEliminarArea = async (idAreaPiso) => {  
    if (!confirm("¿Estás seguro de eliminar esta área del piso?")) return;  
  
    try {  
      const token = localStorage.getItem("token");  
      const res = await fetch(`${API}/api/areas/piso/${idAreaPiso}`, {  
        method: "DELETE",  
        headers: {  
          Authorization: `Bearer ${token}`,  
        },  
      });  
  
      await handleAPIResponse(res, `DELETE /api/areas/piso/${idAreaPiso}`);  
        
      setMensaje({ tipo: "success", texto: "✓ Área eliminada exitosamente" });  
      await cargarAreasPiso(pisoSeleccionado.IDPiso);  
    } catch (error) {  
      if (error instanceof APIError) {  
        setMensaje({ tipo: 'error', texto: `✗ ${error.message}` });  
      } else {  
        logError(error, { action: 'handleEliminarArea', idAreaPiso });  
        setMensaje({ tipo: "error", texto: "✗ Error al eliminar área" });  
      }  
    }  
  };  

  const editarDelimitacionDirecta = async (idAreaPiso, idDelimitacion, coordX, coordY, ancho, alto) => {  
  try {  
    const token = localStorage.getItem("token");  
    const res = await fetch(`${API}/api/areas/piso/${idAreaPiso}/delimitacion/${idDelimitacion}`, {  
      method: "PUT",  
      headers: {  
        "Content-Type": "application/json",  
        Authorization: `Bearer ${token}`,  
      },  
      body: JSON.stringify({ coordX, coordY, ancho, alto }),  
    });  
  
    await handleAPIResponse(res, `PUT /api/areas/piso/${idAreaPiso}/delimitacion/${idDelimitacion}`);  
    setMensaje({ tipo: 'success', texto: '✓ Delimitación editada exitosamente' });  
      
    const dels = await cargarDelimitaciones(idAreaPiso);  
    setDelimitaciones(prev => ({ ...prev, [idAreaPiso]: dels }));  
      
    return true;  
  } catch (error) {  
    if (error instanceof APIError) {  
      setMensaje({ tipo: 'error', texto: `✗ ${error.message}` });  
    } else {  
      logError(error, { action: 'editarDelimitacionDirecta', idAreaPiso, idDelimitacion });  
      setMensaje({ tipo: 'error', texto: '✗ Error al editar delimitación' });  
    }  
    return false;  
  }  
};  
    
  return {  
    // Estados  
    pisos,  
    areas,  
    areasPiso,  
    pisoSeleccionado,  
    loading,  
    loadingAreas,  
    mensaje,  
    delimitaciones,  
      
    // Setters  
    setPisoSeleccionado,  
    setMensaje,  
      
    // Funciones  
    cargarAreasPiso,  
    cargarDelimitaciones,  
    handleAsignarArea,  
    handleEliminarArea,  
    crearDelimitacion, 
      editarDelimitacion,  
  eliminarDelimitacion , 
   editarDelimitacionDirecta 
  };  
}