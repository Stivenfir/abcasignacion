import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function PreviewMapaPuestos({
  pisoSeleccionado,
  areaSeleccionada,
  puestos,
  onClose,
}) {
  const [planoUrl, setPlanoUrl] = useState(null);
  const canvasRef = useRef(null);
  const [delimitaciones, setDelimitaciones] = useState([]);
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    cargarPlano();
  }, [pisoSeleccionado]);

  // ✅ CORREGIDO: Agregar delimitaciones como dependencia
  useEffect(() => {
    if (planoUrl && puestos.length > 0 && canvasRef.current) {
      dibujarPuestos();
    }
  }, [planoUrl, puestos, delimitaciones]);

  useEffect(() => {
    const cargarDelimitaciones = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API}/api/areas/piso/${areaSeleccionada.IdAreaPiso}/delimitaciones`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        console.log("✅ Delimitaciones cargadas:", data); // DEBUG
        setDelimitaciones(data);

        // ✅ AGREGAR: Forzar redibujo cuando llegan las delimitaciones
        if (canvasRef.current && planoUrl && puestos.length > 0) {
          dibujarPuestos();
        }
      } catch (error) {
        console.error("❌ Error al cargar delimitaciones:", error);
      }
    };

    if (areaSeleccionada) {
      console.log(
        "📍 Cargando delimitaciones para área:",
        areaSeleccionada.IdAreaPiso,
      ); // DEBUG
      cargarDelimitaciones();
    }
  }, [areaSeleccionada]);

  const cargarPlano = async () => {
    const res = await fetch(
      `${API}/api/pisos/plano/${pisoSeleccionado.IDPiso}`,
    );
    const data = await res.json();
    if (data.success) setPlanoUrl(`${API}${data.ruta}`);
  };

  const dibujarPuestos = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // ✅ AGREGAR: Verificar que el canvas tenga dimensiones
    if (canvas.width === 0 || canvas.height === 0) return;

    // ✅ AGREGAR: Limpiar canvas primero
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1️⃣ Dibujar delimitaciones primero (zona azul)
    delimitaciones.forEach((d) => {
      ctx.strokeStyle = "#3B82F6";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.fillStyle = "rgba(59, 130, 246, 0.15)";

      ctx.fillRect(
        Number(d.PosicionX),
        Number(d.PosicionY),
        Number(d.Ancho),
        Number(d.Alto),
      );
      ctx.strokeRect(
        Number(d.PosicionX),
        Number(d.PosicionY),
        Number(d.Ancho),
        Number(d.Alto),
      );
    });

    // ✅ AGREGAR: Reset line dash para los puestos
    ctx.setLineDash([]);

    // 2️⃣ Dibujar puestos con colores según estado
    puestos.forEach((puesto) => {
      if (!puesto.UbicacionX || !puesto.UbicacionY) return;

      let color = puesto.Disponible === "SI" ? "#10B981" : "#EF4444";
      if (puesto.AsignadoA) color = "#F59E0B";

      ctx.beginPath();
      ctx.arc(
        Number(puesto.UbicacionX),
        Number(puesto.UbicacionY),
        8,
        0,
        2 * Math.PI,
      );
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 10px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        puesto.NoPuesto,
        Number(puesto.UbicacionX),
        Number(puesto.UbicacionY),
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-auto"
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">
            🗺️ Preview del Mapa -{" "}
            {areaSeleccionada?.NombreArea || `Área ${areaSeleccionada?.IdArea}`}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm">No disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm">Asignado</span>
            </div>
          </div>

          <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
            <img
              src={planoUrl}
              alt="Plano"
              className="max-w-full h-auto block"
              onLoad={(e) => {
                if (canvasRef.current) {
                      console.log('PREVIEW - Dimensiones:', e.target.naturalWidth, e.target.naturalHeight);  
                      console.log('PREVIEW - URL:', planoUrl);  
                  canvasRef.current.width = e.target.naturalWidth;
                  canvasRef.current.height = e.target.naturalHeight;
                  dibujarPuestos();
                }
              }}
            />
            <canvas ref={canvasRef} className="absolute top-0 left-0" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
