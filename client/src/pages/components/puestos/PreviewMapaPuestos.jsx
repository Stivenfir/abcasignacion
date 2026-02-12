import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

export default function PreviewMapaPuestos({
  pisoSeleccionado,
  areaSeleccionada,
  puestos,
  onClose,
}) {
  const [planoUrl, setPlanoUrl] = useState(null);
  const canvasRef = useRef(null);
  const imagenRef = useRef(null);
  const [delimitaciones, setDelimitaciones] = useState([]);
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const sincronizarCanvasConImagen = useCallback(() => {
    if (!canvasRef.current || !imagenRef.current) return;

    const canvas = canvasRef.current;
    const imagen = imagenRef.current;
    const width = imagen.clientWidth;
    const height = imagen.clientHeight;
    const naturalWidth = imagen.naturalWidth;
    const naturalHeight = imagen.naturalHeight;

    if (!width || !height || !naturalWidth || !naturalHeight) return;

    // Mantener coordenadas en el espacio natural de la imagen para que
    // la posición guardada sea consistente entre crear/mapear/preview.
    canvas.width = naturalWidth;
    canvas.height = naturalHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }, []);

  const dibujarPuestos = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (canvas.width === 0 || canvas.height === 0) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    ctx.setLineDash([]);

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
  }, [delimitaciones, puestos]);

  useEffect(() => {
    const cargarPlano = async () => {
      const res = await fetch(
        `${API}/api/pisos/plano/${pisoSeleccionado.IDPiso}`,
      );
      const data = await res.json();
      if (data.success) setPlanoUrl(`${API}${data.ruta}`);
    };

    if (pisoSeleccionado?.IDPiso) {
      cargarPlano();
    }
  }, [API, pisoSeleccionado]);

  useEffect(() => {
    const cargarDelimitaciones = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API}/api/areas/piso/${areaSeleccionada.IdAreaPiso}/delimitaciones`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        setDelimitaciones(data);
      } catch (error) {
        console.error("Error al cargar delimitaciones:", error);
      }
    };

    if (areaSeleccionada?.IdAreaPiso) {
      cargarDelimitaciones();
    }
  }, [API, areaSeleccionada]);

  useEffect(() => {
    if (planoUrl && canvasRef.current) {
      sincronizarCanvasConImagen();
      dibujarPuestos();
    }
  }, [planoUrl, puestos, delimitaciones, sincronizarCanvasConImagen, dibujarPuestos]);

  useEffect(() => {
    if (!imagenRef.current || !planoUrl) return;

    const observer = new ResizeObserver(() => {
      sincronizarCanvasConImagen();
      dibujarPuestos();
    });

    observer.observe(imagenRef.current);
    return () => observer.disconnect();
  }, [planoUrl, sincronizarCanvasConImagen, dibujarPuestos]);

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
              ref={imagenRef}
              src={planoUrl}
              alt="Plano"
              className="max-w-full h-auto block"
              onLoad={() => {
                sincronizarCanvasConImagen();
                dibujarPuestos();
              }}
            />
            <canvas ref={canvasRef} className="absolute top-0 left-0" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
