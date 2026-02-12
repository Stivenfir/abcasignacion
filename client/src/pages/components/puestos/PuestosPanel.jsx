// client/src/pages/components/puestos/PuestosPanel.jsx  
import { useState } from "react";
import { motion } from "framer-motion";
import PuestosLista from "./PuestosLista";
import PuestoModal from "./PuestoModal";
import PreviewMapaPuestos from "./PreviewMapaPuestos";

export default function PuestosPanel({
  pisoSeleccionado,
  areasPiso,
  areaSeleccionada,
  puestos,
  clasificaciones,
  loadingPuestos,
  onSeleccionarArea,
  onCrearPuesto,
  onEliminarPuesto,
  onAbrirModalMapeo,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [puestoAEditar, setPuestoAEditar] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const handleAbrirModal = (puesto = null) => {
    setPuestoAEditar(puesto);
    setModalVisible(true);
  };

  const handleCerrarModal = () => {
    setModalVisible(false);
    setPuestoAEditar(null);
  };

  if (!pisoSeleccionado) {
    return (
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏢</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Selecciona un piso
            </h3>
            <p className="text-gray-500">
              Elige un piso de la lista para gestionar sus puestos
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
      <div className="space-y-6">
        {/* Información del piso seleccionado */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Piso {pisoSeleccionado.NumeroPiso}
              </h3>
              <p className="text-sm text-gray-500">
                Bodega {pisoSeleccionado.Bodega} • ID: {pisoSeleccionado.IDPiso}
              </p>
            </div>
          </div>
        </div>

        {/* Selección de área */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">


          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Seleccionar Área ({areasPiso.length} disponibles)
            </h4>
            {areaSeleccionada && (
              <button
                onClick={() => setPreviewVisible(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🗺️ Ver Mapa
              </button>
            )}
          </div>

          {areasPiso.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">📭</span>
              No hay áreas asignadas a este piso
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {areasPiso.map((area) => (
                <motion.button
                  key={area.IdAreaPiso}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSeleccionarArea(area)}
                  className={`p-4 text-left border-2 rounded-lg transition ${areaSeleccionada?.IdAreaPiso === area.IdAreaPiso
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:bg-gray-50 hover:border-blue-500"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${areaSeleccionada?.IdAreaPiso === area.IdAreaPiso
                      ? "bg-blue-100"
                      : "bg-gray-100"
                      }`}>
                      <span className={`font-bold text-sm ${areaSeleccionada?.IdAreaPiso === area.IdAreaPiso
                        ? "text-blue-600"
                        : "text-gray-600"
                        }`}>
                        {area.IdArea}
                      </span>
                    </div>
                    {/* ✅ Mostrar nombre del área */}
                    <span className={`font-medium ${areaSeleccionada?.IdAreaPiso === area.IdAreaPiso
                      ? "text-blue-900"
                      : "text-gray-900"
                      }`}>
                      {area.NombreArea || `Área ${area.IdArea}`}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Lista de puestos */}
        {areaSeleccionada && (
          <PuestosLista
            puestos={puestos}
            clasificaciones={clasificaciones}
            loadingPuestos={loadingPuestos}
            onAbrirModal={handleAbrirModal}
            onAbrirModalMapeo={onAbrirModalMapeo}
            onEliminarPuesto={onEliminarPuesto}
          />
        )}
      </div>

      {/* Modal para crear/editar puesto */}
      {modalVisible && (
        <PuestoModal
          pisoSeleccionado={pisoSeleccionado}
          areaSeleccionada={areaSeleccionada}
          puestoAEditar={puestoAEditar}
          clasificaciones={clasificaciones}
          onClose={handleCerrarModal}
          onGuardar={onCrearPuesto}
        />
      )}

      {previewVisible && (
        <PreviewMapaPuestos
          pisoSeleccionado={pisoSeleccionado}
          areaSeleccionada={areaSeleccionada}
          puestos={puestos}
          onClose={() => setPreviewVisible(false)}
        />
      )}
    </div>
  );
}