// client/src/pages/components/reservas/AyudaReservas.jsx    
import { useState, useEffect } from "react";    
import { motion } from "framer-motion";    
    
export default function AyudaReservas({ pisos, onSeleccionarPiso }) {    
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";    
  const [disponibilidadPorPiso, setDisponibilidadPorPiso] = useState({});    
  const [loading, setLoading] = useState(true);    
  const [areaUsuario, setAreaUsuario] = useState(null);    
    
  useEffect(() => {    
    cargarDisponibilidad();    
  }, [pisos]);    
    
  const cargarDisponibilidad = async () => {    
    try {    
      const token = localStorage.getItem("token");    
          
      if (!token) {    
        setLoading(false);    
        return;    
      }    
    
      // Decodificar token para obtener idArea    
      const payload = JSON.parse(atob(token.split('.')[1]));    
      setAreaUsuario(payload.idArea);    
    
      // Obtener fecha de hoy en formato YYYY-MM-DD    
      const hoy = new Date().toISOString().split('T')[0];    
    
      // ✅ MODIFICACIÓN: Consultar disponibilidad por cada piso individualmente    
      const promesas = pisos.map(async (piso) => {    
        try {    
          // ✅ Agregar parámetro idPiso en la query string    
          const res = await fetch(`${API}/api/reservas/disponibles/${hoy}?idPiso=${piso.IDPiso}`, {    
            headers: { Authorization: `Bearer ${token}` }    
          });    
    
          if (!res.ok) return { idPiso: piso.IDPiso, cantidad: 0 };    
    
          const puestos = await res.json();    
          return {    
            idPiso: piso.IDPiso,    
            numeroPiso: piso.NumeroPiso,    
            bodega: piso.Bodega,    
            cantidad: Array.isArray(puestos) ? puestos.length : 0    
          };    
        } catch (error) {    
          console.error(`Error al consultar piso ${piso.IDPiso}:`, error);    
          return { idPiso: piso.IDPiso, cantidad: 0 };    
        }    
      });    
    
      const resultados = await Promise.all(promesas);    
    
      // Crear mapa de disponibilidad    
      const mapa = {};    
      resultados.forEach(r => {    
        if (r.cantidad > 0) {    
          mapa[r.idPiso] = r;    
        }    
      });    
    
      setDisponibilidadPorPiso(mapa);    
    } catch (error) {    
      console.error('Error al cargar disponibilidad:', error);    
    } finally {    
      setLoading(false);    
    }    
  };    
    
  if (loading) {    
    return (    
      <div className="mx-6 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">    
        <p className="text-sm text-blue-700">⏳ Cargando sugerencias...</p>    
      </div>    
    );    
  }    
    
  const pisosDisponibles = Object.values(disponibilidadPorPiso);    
    
  if (pisosDisponibles.length === 0) {    
    return (    
      <motion.div    
        initial={{ opacity: 0, y: -10 }}    
        animate={{ opacity: 1, y: 0 }}    
        className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"    
      >    
        <div className="flex items-start gap-3">    
          <span className="text-2xl">⚠️</span>    
          <div className="flex-1">    
            <h3 className="font-semibold text-yellow-900 mb-1">    
              No hay puestos disponibles para tu área    
            </h3>    
            <p className="text-sm text-yellow-800">    
              Tu área (ID: {areaUsuario}) no tiene puestos asignados en ningún piso.    
              Contacta al administrador para que configure puestos para tu área.    
            </p>    
          </div>    
        </div>    
      </motion.div>    
    );    
  }    
    
  return (    
    <motion.div    
      initial={{ opacity: 0, y: -10 }}    
      animate={{ opacity: 1, y: 0 }}    
      className="mx-6 mt-4"    
    >    
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">    
        <div className="flex items-start gap-3 mb-3">    
          <span className="text-2xl">💡</span>    
          <div className="flex-1">    
            <h3 className="font-semibold text-green-900 mb-1">    
              disponibilidad para tu área    
            </h3>    
          </div>    
        </div>    
    
        <div className="space-y-2">    
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">    
            {pisosDisponibles.map((piso) => (    
              <motion.button    
                key={piso.idPiso}    
                whileHover={{ scale: 1.02 }}    
                whileTap={{ scale: 0.98 }}    
                onClick={() => {    
                  const pisoCompleto = pisos.find(p => p.IDPiso === piso.idPiso);    
                  if (pisoCompleto) onSeleccionarPiso(pisoCompleto);    
                }}    
                className="p-3 bg-white border-2 border-green-300 rounded-lg hover:border-green-500 hover:shadow-md transition text-left"    
              >    
                <div className="flex items-center justify-between">    
                  <span className="text-sm font-medium text-gray-900">    
                    🏢 Piso {piso.numeroPiso} • Bodega {piso.bodega}    
                  </span>    
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">    
                    {piso.cantidad} {piso.cantidad === 1 ? 'puesto' : 'puestos'}    
                  </span>    
                </div>    
              </motion.button>    
            ))}    
          </div>    
          <p className="text-xs text-green-700 mt-2">    
            💡 Haz clic en un piso para seleccionarlo y ver los puestos disponibles    
          </p>    
        </div>    
      </div>    
    </motion.div>    
  );    
}