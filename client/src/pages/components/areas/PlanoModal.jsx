// client/src/components/areas/PlanoModal.jsx
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { validarDelimitacion } from "../../utils/validacionDelimitaciones";
import { COLORS } from "../../utils/canvas";

export default function PlanoModal({
  pisoSeleccionado,
  areaSeleccionada,
  areaPisoSeleccionada,
  modo,
  areas,
  areasPiso, // ✅ NUEVA PROP
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
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Cargar plano al montar
  useEffect(() => {
    cargarPlano();
  }, [pisoSeleccionado]);

  // ✅ ACTUALIZADO: Dibujar delimitaciones cuando cambia el modo o las delimitaciones
  useEffect(() => {
    if (
      (modo === "agregar" || modo === "editar") &&
      areaPisoSeleccionada &&
      delimitaciones[areaPisoSeleccionada]
    ) {
      dibujarTodasLasDelimitaciones();
    }
  }, [modo, areaPisoSeleccionada, delimitaciones, areasPiso]);

  // Pre-cargar rectángulo si estamos editando
  useEffect(() => {
    if (delimitacionAEditar && modo === "editar") {
      setRectangulo({
        x: Number(delimitacionAEditar.PosicionX),
        y: Number(delimitacionAEditar.PosicionY),
        width: Number(delimitacionAEditar.Ancho),
        height: Number(delimitacionAEditar.Alto),
      });
    }
  }, [delimitacionAEditar, modo]);

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

  // ✅ ACTUALIZADO: Validar contra TODAS las delimitaciones del piso
  const handleMouseUp = () => {
    setDibujando(false);
    const normalized = rectangulo ? normalizarRect(rectangulo) : null;

    if (!normalized) return;

    // ✅ Obtener TODAS las delimitaciones del piso
    const todasLasDelimitaciones = [];
    if (areasPiso) {
      areasPiso.forEach((areaPiso) => {
        const delims = delimitaciones[areaPiso.IdAreaPiso] || [];
        todasLasDelimitaciones.push(...delims);
      });
    }

    // Filtrar la delimitación que se está editando
    const delimsParaValidar =
      modo === "editar" && delimitacionAEditar
        ? todasLasDelimitaciones.filter(
            (d) => d.IdDelimitacion !== delimitacionAEditar.IdDelimitacion,
          )
        : todasLasDelimitaciones;

    // Validación completa
    const validacion = validarDelimitacion(
      normalized,
      delimsParaValidar,
      canvasRef.current.width,
      canvasRef.current.height,
    );

    if (!validacion.valido) {
      alert(validacion.mensaje);
      setRectangulo(null);
      redibujarDelimitaciones();
      return;
    }

    setRectangulo(normalized);
  };

  // ✅ NUEVA FUNCIÓN: Dibujar TODAS las áreas del piso con números
  const dibujarTodasLasDelimitaciones = () => {
    if (!canvasRef.current || !areasPiso) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar todas las áreas del piso
    areasPiso.forEach((areaPiso, areaIndex) => {
      const area = areas.find((a) => a.IdArea === areaPiso.IdArea);
      const delims = delimitaciones[areaPiso.IdAreaPiso] || [];
      const color = COLORS[areaIndex % COLORS.length];

      delims.forEach((delim, index) => {
        // Si es el área actual, usar color normal; si no, más transparente
        const esAreaActual = areaPiso.IdAreaPiso === areaPisoSeleccionada;

        // Si estamos editando esta delimitación específica, usar estilo diferente
        const esDelimitacionEnEdicion =
          modo === "editar" &&
          delimitacionAEditar &&
          delim.IdDelimitacion === delimitacionAEditar.IdDelimitacion;

        if (esDelimitacionEnEdicion) {
          ctx.strokeStyle = "#999";
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.fillStyle = "rgba(200, 200, 200, 0.1)";
        } else if (esAreaActual) {
          ctx.strokeStyle = color.stroke;
          ctx.lineWidth = 3;
          ctx.setLineDash([]);
          ctx.fillStyle = color.fill;
        } else {
          // Otras áreas: más transparentes
          ctx.strokeStyle = color.stroke;
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          ctx.fillStyle = color.fill.replace(/[\d.]+\)/, "0.05)"); // Más transparente
        }

        ctx.fillRect(delim.PosicionX, delim.PosicionY, delim.Ancho, delim.Alto);
        ctx.strokeRect(
          delim.PosicionX,
          delim.PosicionY,
          delim.Ancho,
          delim.Alto,
        );

        // ✅ Agregar número centrado
        ctx.setLineDash([]); // Reset dash para el texto
        ctx.fillStyle = color.stroke;
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          `#${index + 1}`,
          delim.PosicionX + delim.Ancho / 2,
          delim.PosicionY + delim.Alto / 2,
        );

        // Mostrar nombre del área si no es el área actual
        if (!esAreaActual) {
          ctx.font = "12px Arial";
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          ctx.fillText(
            area?.NombreArea || `Área ${areaPiso.IdArea}`,
            delim.PosicionX + 5,
            delim.PosicionY + 5,
          );
        }
      });
    });
  };

  const dibujarRectangulo = () => {
    if (!canvasRef.current || !rectangulo) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Redibujar todas las delimitaciones primero
    redibujarDelimitaciones();

    // Dibujar rectángulo actual
    const r =
      rectangulo.x !== undefined ? rectangulo : normalizarRect(rectangulo);
    ctx.strokeStyle = "#3B82F6";
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
    ctx.fillRect(r.x, r.y, r.width, r.height);
    ctx.strokeRect(r.x, r.y, r.width, r.height);
  };

  const redibujarDelimitaciones = () => {
    if (
      (modo === "agregar" || modo === "editar") &&
      areaPisoSeleccionada &&
      delimitaciones[areaPisoSeleccionada]
    ) {
      dibujarTodasLasDelimitaciones();
    }
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

    if (modo === "editar" && delimitacionAEditar) {
      if (!delimitacionAEditar.IdDelimitacion) {
        alert("Error: No se puede editar - ID de delimitación no encontrado");
        console.error("delimitacionAEditar:", delimitacionAEditar);
        return;
      }

      await onEditarDelimitacion(
        areaPisoSeleccionada,
        delimitacionAEditar.IdDelimitacion,
        r,
      );
    } else if (modo === "agregar") {
      await onCrearDelimitacion(areaPisoSeleccionada, r);
    } else if (modo === "crear") {
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
            {modo === "editar"
              ? "Editar Delimitación"
              : modo === "agregar"
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
            {(modo === "agregar" || modo === "editar") && (
              <p className="text-sm text-gray-600 mt-2">
                ℹ️ Las áreas de otras zonas se muestran más transparentes para
                evitar superposiciones
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
                  redibujarDelimitaciones();
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
              {modo === "editar"
                ? "Guardar Cambios"
                : modo === "agregar"
                  ? "Agregar Delimitación"
                  : "Asignar Área"}
            </button>
            <button
              onClick={() => {
                setRectangulo(null);
                redibujarDelimitaciones();
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
