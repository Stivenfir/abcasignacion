// client/src/pages/hooks/usePuestos.js  
import { useState, useEffect } from "react";  
  
export function usePuestos() {  
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";  
    
  const [pisos, setPisos] = useState([]);  
  const [areasPiso, setAreasPiso] = useState([]);  
  const [puestos, setPuestos] = useState([]);  
  const [clasificaciones, setClasificaciones] = useState([  
    { IdClasificacion: 1, Descripcion: "Portátil, Monitor, Teclado, Mouse" },  
    { IdClasificacion: 2, Descripcion: "Desktop, Monitor (2), Teclado, Mouse" }  
  ]);  
  const [pisoSeleccionado, setPisoSeleccionado] = useState(null);  
  const [areaSeleccionada, setAreaSeleccionada] = useState(null);  
  const [loading, setLoading] = useState(true);  
  const [loadingPuestos, setLoadingPuestos] = useState(false);  
  const [mensaje, setMensaje] = useState(null);  
  
  useEffect(() => {  
    cargarDatos();  
  }, []);  
  
  const cargarDatos = async () => {  
    try {  
      const resPisos = await fetch(`${API}/api/pisos`);  
      const dataPisos = await resPisos.json();  
      setPisos(dataPisos);  
    } catch (error) {  
      setMensaje({ tipo: 'error', texto: '✗ Error al cargar datos' });  
    } finally {  
      setLoading(false);  
    }  
  };  
  
 const cargarAreasPiso = async (idPiso) => {  
  try {  
    const res = await fetch(`${API}/api/areas/piso/${idPiso}`);  
    const data = await res.json();  
    setAreasPiso(Array.isArray(data) ? data : []);  
  } catch (error) {  
    setMensaje({ tipo: 'error', texto: '✗ Error al cargar áreas' });  
  }  
};
  
const cargarPuestos = async (idAreaPiso) => {  
  setLoadingPuestos(true);  
  try {  
    const res = await fetch(`${API}/api/puestos/area/${idAreaPiso}`);  
    const data = await res.json();  
      
    // ✅ Normalizar: convertir cadenas vacías a null  
    const normalized = Array.isArray(data) ? data.map(puesto => ({  
      ...puesto,  
      UbicacionX: puesto.UbicacionX === '' ? null : Number(puesto.UbicacionX),  
      UbicacionY: puesto.UbicacionY === '' ? null : Number(puesto.UbicacionY),  
      IDClasificacionPuesto: puesto.IDClasificacionPuesto === '' ? null : Number(puesto.IDClasificacionPuesto),  
      TieneMapeo: puesto.TieneMapeo === '' || puesto.TieneMapeo === null ? 0 : Number(puesto.TieneMapeo)  
    })) : [];  
      
    setPuestos(normalized);  
  } catch (error) {  
    setMensaje({ tipo: 'error', texto: '✗ Error al cargar puestos' });  
  } finally {  
    setLoadingPuestos(false);  
  }  
};
  
const crearPuesto = async (datosPuesto, idPuesto = null) => {  
  try {  
    const token = localStorage.getItem('token');  
      
    // ✅ Si hay idPuesto, es EDICIÓN (PUT), sino es CREACIÓN (POST)  
    const url = idPuesto   
      ? `${API}/api/puestos/${idPuesto}`  // UPDATE @P=7  
      : `${API}/api/puestos`;              // INSERT @P=6  
      
    const method = idPuesto ? 'PUT' : 'POST';  
      
    const res = await fetch(url, {  
      method,  
      headers: {  
        'Content-Type': 'application/json',  
        Authorization: `Bearer ${token}`,  
      },  
      body: JSON.stringify(datosPuesto),  
    });  
  
    if (res.ok) {  
      setMensaje({ tipo: 'success', texto: `✓ Puesto ${idPuesto ? 'actualizado' : 'creado'} exitosamente` });  
      await cargarPuestos(areaSeleccionada.IdAreaPiso);  
    }  
  } catch (error) {  
    setMensaje({ tipo: 'error', texto: '✗ Error al guardar puesto' });  
  }  
};
  
  const eliminarPuesto = async (idPuesto) => {  
    if (!confirm('¿Estás seguro de eliminar este puesto?')) return;  
      
    try {  
      const token = localStorage.getItem('token');  
      const res = await fetch(`${API}/api/puestos/${idPuesto}`, {  
        method: 'DELETE',  
        headers: { 'Authorization': `Bearer ${token}` }  
      });  
        
      if (res.ok) {  
        setMensaje({ tipo: 'success', texto: '✓ Puesto eliminado' });  
        await cargarPuestos(areaSeleccionada.IdAreaPiso);  
      }  
    } catch (error) {  
      setMensaje({ tipo: 'error', texto: '✗ Error al eliminar puesto' });  
    }  
  };  
  
  return {  
    pisos,  
    areasPiso,  
    puestos,  
    clasificaciones,  
    pisoSeleccionado,  
    areaSeleccionada,  
    loading,  
    loadingPuestos,  
    mensaje,  
    setPisoSeleccionado,  
    setAreaSeleccionada,  
    setMensaje, 
    cargarAreasPiso,  
    cargarPuestos,  
    crearPuesto,  
    eliminarPuesto  
  };  
}