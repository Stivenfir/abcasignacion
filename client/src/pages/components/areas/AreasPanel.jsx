// client/src/components/areas/AreasPanel.jsx  
import { useState } from "react";  
import AreasAsignadas from "./AreasAsignadas";  
import AreasDisponibles from "./AreasDisponibles";  
import PlanoModal from "./PlanoModal";  
import MapaCompletoModal from "./MapaCompletoModal";  
  
export default function AreasPanel({  
  pisoSeleccionado,  
  areas,  
  areasPiso,  
  loadingAreas,  
  delimitaciones,  
  onAsignarArea,  
  onEliminarArea,  
  onCrearDelimitacion  
}) {  
  const [busquedaArea, setBusquedaArea] = useState("");  
  const [planoVisible, setPlanoVisible] = useState(false);  
  const [vistaMapaCompleto, setVistaMapaCompleto] = useState(false);  
  const [areaSeleccionada, setAreaSeleccionada] = useState(null);  
  const [areaPisoSeleccionada, setAreaPisoSeleccionada] = useState(null);  
  const [modoDelimitacion, setModoDelimitacion] = useState(false);  
  
  // Filtrar áreas disponibles (que no estén ya asignadas)  
  const areasDisponiblesFiltradas = areas.filter((area) => {  
    const matchBusqueda =  
      busquedaArea === "" ||  
      area.NombreArea.toLowerCase().includes(busquedaArea.toLowerCase());  
    const noAsignada = !areasPiso.some((ap) => ap.IdArea === area.IdArea);  
    return matchBusqueda && noAsignada;  
  });  
  
  const handleAbrirPlanoEdicion = async (areaPiso) => {  
    setAreaSeleccionada(areas.find(a => a.IdArea === areaPiso.IdArea)?.IdArea);  
    setAreaPisoSeleccionada(areaPiso.IdAreaPiso);  
    setModoDelimitacion(true);  
    setVistaMapaCompleto(false);  
    setPlanoVisible(true);  
  };  
  
  const handleAbrirPlanoAsignacion = async (idArea) => {  
    setAreaSeleccionada(idArea);  
    setAreaPisoSeleccionada(null);  
    setModoDelimitacion(false);  
    setPlanoVisible(true);  
  };  
  
  const handleVerMapaCompleto = () => {  
    setPlanoVisible(false);  
    setVistaMapaCompleto(true);  
  };  
  
  if (!pisoSeleccionado) {  
    return (  
      <div className="lg:col-span-2">  
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">  
          <div className="text-center py-16">  
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">  
              <span className="text-4xl">📋</span>  
            </div>  
            <h3 className="text-xl font-semibold text-gray-900 mb-2">  
              Selecciona un piso  
            </h3>  
            <p className="text-gray-500">  
              Elige un piso de la lista para gestionar sus áreas  
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
              <span className="text-2xl">📍</span>  
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
  
        {/* Áreas asignadas */}  
        <AreasAsignadas  
          areasPiso={areasPiso}  
          areas={areas}  
          loadingAreas={loadingAreas}  
          delimitaciones={delimitaciones}  
          onEditarDelimitacion={handleAbrirPlanoEdicion}  
          onEliminarArea={onEliminarArea}  
          onVerMapaCompleto={handleVerMapaCompleto}  
        />  
  
        {/* Barra de búsqueda */}  
        <div className="mb-4">  
          <input  
            type="text"  
            placeholder="🔍 Buscar área por nombre..."  
            value={busquedaArea}  
            onChange={(e) => setBusquedaArea(e.target.value)}  
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"  
          />  
          <div className="mt-2 text-sm text-gray-600">  
            Mostrando {areasDisponiblesFiltradas.length} de {areas.length} áreas disponibles  
          </div>  
        </div>  
  
        {/* Áreas disponibles para asignar */}  
        <AreasDisponibles  
          areasDisponibles={areasDisponiblesFiltradas}  
          onSeleccionarArea={handleAbrirPlanoAsignacion}  
        />  
      </div>  
  
      {/* Modales */}  
      {planoVisible && (  
        <PlanoModal  
          pisoSeleccionado={pisoSeleccionado}  
          areaSeleccionada={areaSeleccionada}  
          areaPisoSeleccionada={areaPisoSeleccionada}  
          modoDelimitacion={modoDelimitacion}  
          areas={areas}  
          delimitaciones={delimitaciones}  
          onClose={() => {  
            setPlanoVisible(false);  
            setAreaSeleccionada(null);  
            setAreaPisoSeleccionada(null);  
            setModoDelimitacion(false);  
          }}  
          onAsignarArea={onAsignarArea}  
          onCrearDelimitacion={onCrearDelimitacion}  
        />  
      )}  
  
      {vistaMapaCompleto && (  
        <MapaCompletoModal  
          pisoSeleccionado={pisoSeleccionado}  
          areasPiso={areasPiso}  
          areas={areas}  
          delimitaciones={delimitaciones}  
          onClose={() => setVistaMapaCompleto(false)}  
        />  
      )}  
    </div>  
  );  
}