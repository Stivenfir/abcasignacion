import { useState, useEffect } from "react";  
  
export function usePuestos() {  
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";  
    
  const [pisos, setPisos] = useState([]);  
  const [areasPiso, setAreasPiso] = useState([]);  
  const [puestos, setPuestos] = useState([]);  
  const [clasificaciones, setClasificaciones] = useState([]);  
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
  
      const resClasificaciones = await fetch(`${API}/api/puestos/clasificaciones`);  
      const dataClasificaciones = await resClasificaciones.json();  
      setClasificaciones(dataClasificaciones);  
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
      setPuestos(Array.isArray(data) ? data : []);  
    } catch (error) {  
      setMensaje({ tipo: 'error', texto: '✗ Error al cargar puestos' });  
    } finally {  
      setLoadingPuestos(false);  
    }  
  };  
  
  const crearPuesto = async (datosPuesto) => {  
    try {  
      const token = localStorage.getItem('token');  
      const res = await fetch(`${API}/api/puestos`, {  
        method: 'POST',  
        headers: {  
          'Content-Type': 'application/json',  
          'Authorization': `Bearer ${token}`  
        },  
        body: JSON.stringify(datosPuesto)  
      });  
        
      if (res.ok) {  
        setMensaje({ tipo: 'success', texto: '✓ Puesto creado exitosamente' });  
        await cargarPuestos(areaSeleccionada.IdAreaPiso);  
      }  
    } catch (error) {  
      setMensaje({ tipo: 'error', texto: '✗ Error al crear puesto' });  
    }  
  };  
  
  const eliminarPuesto = async (idPuesto) => {  
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
    cargarAreasPiso,  
    cargarPuestos,  
    crearPuesto,  
    eliminarPuesto  
  };  
}