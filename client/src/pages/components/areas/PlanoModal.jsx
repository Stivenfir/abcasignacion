// client/src/components/areas/PlanoModal.jsx
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { validarDelimitacion } from "../../utils/validacionDelimitaciones";

export default function PlanoModal({
  pisoSeleccionado,
  areaSeleccionada,
  areaPisoSeleccionada,
  modoDelimitacion,
  areas,
  delimitaciones,
  delimitacionAEditar,
  onClose,
  onAsignarArea,
  onCrearDelimitacion,
  onEditarDelimitacion,
}) {
  const [planoUrl, setPlanoUrl] = useState(null);
  const [dibujando, setDibujando] = useState(false);
  const [rectangulo, setRectangulo] = useState(null);
  const canvasRef = useRef(null);
  const imagenRef = useRef(null);
  const [idDelimitacionEditando, setIdDelimitacionEditando] = useState(null);
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Cargar plano al montar
  useEffect(() => {
    cargarPlano();
  }, [pisoSeleccionado]);

  // Cargar delimitaciones existentes si está en modo edición
  useEffect(() => {
    if (
      modoDelimitacion &&
      areaPisoSeleccionada &&
      delimitaciones[areaPisoSeleccionada]
    ) {
      dibujarDelimitacionesExistentes();
    }
  }, [modoDelimitacion, areaPisoSeleccionada, delimitaciones]);

  useEffect(() => {
    if (delimitacionAEditar) {
      setIdDelimitacionEditando(delimitacionAEditar.IdDelimitacion);
      // Pre-cargar el rectángulo con las coordenadas existentes
      setRectangulo({
        x: Number(delimitacionAEditar.PosicionX),
        y: Number(delimitacionAEditar.PosicionY),
        width: Number(delimitacionAEditar.Ancho),
        height: Number(delimitacionAEditar.Alto),
      });
    }
  }, [delimitacionAEditar]);

  const cargarPlano = async () => {
    try {
      const res = await fetch(
        `${API}/api/pisos/plano/${pisoSeleccionado.IDPiso}`,
      );
      const data = await res.json();
      if (data.success) {
        setPlanoUrl(`${API}${data.ruta}`);
      }
    } catch (error) {
      console.error("Error al cargar plano:", error);
    }
  };

  const normalizarRect = (r) => {
    const x = Math.min(r.startX, r.endX);
    const y = Math.min(r.startY, r.endY);
    const width = Math.abs(r.endX - r.startX);
    const height = Math.abs(r.endY - r.startY);
    return { x, y, width, height };
  };

  const handleMouseDown = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRectangulo({ startX: x, startY: y, endX: x, endY: y });
    setDibujando(true);
  };

  const handleMouseMove = (e) => {
    if (!dibujando || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setRectangulo((prev) => ({
      ...prev,
      endX: e.clientX - rect.left,
      endY: e.clientY - rect.top,
    }));
  };

  // ✅ ACTUALIZADO: Validación completa al soltar el mouse
  const handleMouseUp = () => {
    setDibujando(false);
    const normalized = rectangulo ? normalizarRect(rectangulo) : null;

    if (!normalized) return;

    // Obtener delimitaciones existentes del área actual
    const delimitacionesExistentes = modoDelimitacion
      ? delimitaciones[areaPisoSeleccionada] || []
      : [];

    // Validación completa usando las funciones del archivo validacionDelimitaciones
    const validacion = validarDelimitacion(
      normalized,
      delimitacionesExistentes,
      canvasRef.current.width,
      canvasRef.current.height,
    );

    if (!validacion.valido) {
      alert(validacion.mensaje);
      setRectangulo(null);
      dibujarDelimitacionesExistentes();
      return;
    }

    setRectangulo(normalized);
  };

  const dibujarDelimitacionesExistentes = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colors = [
      { stroke: "#3B82F6", fill: "rgba(59, 130, 246, 0.15)" },
      { stroke: "#10B981", fill: "rgba(16, 185, 129, 0.15)" },
      { stroke: "#F59E0B", fill: "rgba(245, 158, 11, 0.15)" },
      { stroke: "#EF4444", fill: "rgba(239, 68, 68, 0.15)" },
      { stroke: "#8B5CF6", fill: "rgba(139, 92, 246, 0.15)" },
      { stroke: "#EC4899", fill: "rgba(236, 72, 153, 0.15)" },
    ];

    const delims = delimitaciones[areaPisoSeleccionada] || [];
    if (delims.length === 0) return;

    // ✅ Validar que exista IdArea
    const idArea = delims[0]?.IdArea;
    if (idArea === undefined) return;

    const color = colors[idArea % colors.length];

    // Dibujar todas las delimitaciones con el mismo color
    delims.forEach((delim) => {
      ctx.strokeStyle = color.stroke;
      ctx.lineWidth = 3;
      ctx.fillStyle = color.fill;
      ctx.fillRect(delim.PosicionX, delim.PosicionY, delim.Ancho, delim.Alto);
      ctx.strokeRect(delim.PosicionX, delim.PosicionY, delim.Ancho, delim.Alto);
    });
  };

  const dibujarRectangulo = () => {
    if (!canvasRef.current || !rectangulo) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Redibujar delimitaciones existentes primero
    dibujarDelimitacionesExistentes();

    // Dibujar rectángulo actual
    const r =
      rectangulo.x !== undefined ? rectangulo : normalizarRect(rectangulo);
    ctx.strokeStyle = "#3B82F6";
    ctx.lineWidth = 3;
    ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
    ctx.fillRect(r.x, r.y, r.width, r.height);
    ctx.strokeRect(r.x, r.y, r.width, r.height);
  };

  useEffect(() => {
    if (rectangulo && dibujando) {
      dibujarRectangulo();
    }
  }, [rectangulo, dibujando]);

  const handleGuardar = async () => {
    if (!rectangulo) return;
    const r =
      rectangulo.x !== undefined ? rectangulo : normalizarRect(rectangulo);

    if (idDelimitacionEditando) {
      // Modo edición
      await onEditarDelimitacion(
        areaPisoSeleccionada,
        idDelimitacionEditando,
        r,
      );
    } else if (modoDelimitacion) {
      // Modo crear nueva delimitación
      await onCrearDelimitacion(areaPisoSeleccionada, r);
    } else {
      // Modo asignar área
      const area = areas.find((a) => a.IdArea === areaSeleccionada);
      await onAsignarArea(areaSeleccionada, area?.NombreArea, r);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (rectangulo && !confirm("¿Descartar los cambios?")) return;
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-auto"
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">
            {idDelimitacionEditando
              ? "Editar Delimitación"
              : modoDelimitacion
                ? "Agregar Delimitación"
                : "Delimitar Área"}{" "}
            - Piso {pisoSeleccionado?.NumeroPiso}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 Haz clic y arrastra sobre el plano para dibujar un rectángulo
              que delimite el área
            </p>
            {rectangulo && (
              <p className="text-sm text-gray-700 mt-2">
                📐 Dimensiones: {Math.round(normalizarRect(rectangulo).width)} ×{" "}
                {Math.round(normalizarRect(rectangulo).height)} px
              </p>
            )}
          </div>

          <div className="relative inline-block">
            <img
              ref={imagenRef}
              src={planoUrl}
              alt="Plano del piso"
              className="max-w-full h-auto border border-gray-300 rounded"
              onLoad={(e) => {
                if (canvasRef.current) {
                  canvasRef.current.width = e.target.width;
                  canvasRef.current.height = e.target.height;
                  dibujarDelimitacionesExistentes();
                }
              }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleGuardar}
              disabled={!rectangulo}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {modoDelimitacion ? "Agregar Delimitación" : "Asignar Área"}
            </button>
            <button
              onClick={() => {
                setRectangulo(null);
                dibujarDelimitacionesExistentes();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Limpiar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
