import { useState, useEffect } from "react";  
import { motion } from "framer-motion";  
import { fetchWithAuth } from "../../api/client";  
  
export default function AdminDashboard() {  
  const [activeTab, setActiveTab] = useState("resumen");  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);  
    
  const [metrics, setMetrics] = useState(null);  
  const [floors, setFloors] = useState([]);  
  const [desks, setDesks] = useState([]);  
  const [reservations, setReservations] = useState([]);  
  const [users, setUsers] = useState([]);  
    
  const [filters, setFilters] = useState({  
    dateFrom: new Date().toISOString().split('T')[0],  
    dateTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],  
    floorId: "",  
    deskId: "",  
    user: "",  
    status: ""  
  });  
  
  // AQUÍ VA EL useEffect QUE TE PROPORCIONÉ  
  useEffect(() => {  
    // Comentar temporalmente las llamadas al backend  
    // loadDashboardData();  
      
    // Usar datos mock directamente  
    setMetrics({  
      totalPuestos: 120,  
      puestosDisponibles: 45,  
      puestosOcupados: 60,  
      puestosBloqueados: 15,  
      totalEmpleados: 150,  
      totalSucursales: 5,  
      reservasHoy: 38,  
      alerts: [],  
      topDesks: [],  
      recentActivity: []  
    });  
      
    setFloors([  
      { id: 1, name: "Piso 1", totalDesks: 40, availableDesks: 15 },  
      { id: 2, name: "Piso 2", totalDesks: 40, availableDesks: 18 }  
    ]);  
      
    setReservations([]);  
    setUsers([  
      { username: 'admin', nombre: 'Admin Test', email: 'admin@abc.com', role: 'administrador', active: true },  
      { username: 'jefe', nombre: 'Jefe Test', email: 'jefe@abc.com', role: 'jefe', active: true },  
      { username: 'empleado', nombre: 'Empleado Test', email: 'empleado@abc.com', role: 'empleado', active: true }  
    ]);  
      
    setLoading(false);  
  }, []);  
  
  const loadDesks = async (floorId) => {  
    try {  
      const res = await fetchWithAuth(`/api/admin/desks?floorId=${floorId}`);  
      setDesks(await res.json());  
    } catch (err) {  
      console.error("Error cargando puestos:", err);  
    }  
  };  
  
  const handleCreateFloor = async (floorData) => {  
    try {  
      await fetchWithAuth("/api/admin/floors", {  
        method: "POST",  
        body: JSON.stringify(floorData)  
      });  
      loadDashboardData();  
    } catch (err) {  
      alert("Error creando piso: " + err.message);  
    }  
  };  
  
  const handleToggleDeskStatus = async (deskId, currentStatus) => {  
    try {  
      await fetchWithAuth(`/api/admin/desks/${deskId}`, {  
        method: "PATCH",  
        body: JSON.stringify({ blocked: !currentStatus })  
      });  
      loadDesks(filters.floorId);  
    } catch (err) {  
      alert("Error actualizando puesto: " + err.message);  
    }  
  };  
  
  const handleCancelReservation = async (reservationId) => {  
    if (!confirm("¿Cancelar esta reserva?")) return;  
      
    try {  
      await fetchWithAuth(`/api/admin/reservations/${reservationId}/cancel`, {  
        method: "PATCH"  
      });  
      loadDashboardData();  
    } catch (err) {  
      alert("Error cancelando reserva: " + err.message);  
    }  
  };  
  
  if (loading) {  
    return (  
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">  
        <div className="text-center">  
          <div className="h-16 w-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-4" />  
          <p className="text-lg">Cargando dashboard...</p>  
        </div>  
      </div>  
    );  
  }  
  
  if (error) {  
    return (  
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">  
        <div className="text-center">  
          <div className="text-6xl mb-4">⚠️</div>  
          <p className="text-xl text-red-400">{error}</p>  
          <button  
            onClick={loadDashboardData}  
            className="mt-4 px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"  
          >  
            Reintentar  
          </button>  
        </div>  
      </div>  
    );  
  }  
  
  return (  
    <div className="min-h-screen bg-slate-950 text-white">  
      {/* Header */}  
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">  
        <div className="max-w-7xl mx-auto px-6 py-4">  
          <div className="flex items-center justify-between">  
            <div>  
              <h1 className="text-2xl font-bold">Panel de Administración</h1>  
              <p className="text-sm text-slate-400">ABC Desk Booking System</p>  
            </div>  
            <button  
              onClick={() => window.location.href = "/home"}  
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"  
            >  
              Volver al inicio  
            </button>  
          </div>  
        </div>  
      </header>  
  
      <main className="max-w-7xl mx-auto px-6 py-8">  
        {/* KPIs */}  
        <section className="mb-8">  
          <h2 className="text-xl font-semibold mb-4">Métricas Clave</h2>  
          <div className="grid md:grid-cols-5 gap-4">  
            <KPICard  
              title="Ocupación Promedio"  
              value={`${metrics?.averageOccupancy || 0}%`}  
              icon="📊"  
              color="blue"  
              trend={metrics?.occupancyTrend}  
            />  
            <KPICard  
              title="Puestos Disponibles"  
              value={`${metrics?.availableDesks || 0}%`}  
              icon="🪑"  
              color="green"  
            />  
            <KPICard  
              title="Reservas Hoy"  
              value={metrics?.reservationsToday || 0}  
              icon="📅"  
              color="purple"  
            />  
            <KPICard  
              title="Reservas Semana"  
              value={metrics?.reservationsWeek || 0}  
              icon="📈"  
              color="indigo"  
            />  
            <KPICard  
              title="Alertas Activas"  
              value={metrics?.activeAlerts || 0}  
              icon="⚠️"  
              color="red"  
            />  
          </div>  
        </section>  
  
        {/* Top 5 Puestos Más Usados */}  
        {metrics?.topDesks && (  
          <section className="mb-8">  
            <h2 className="text-xl font-semibold mb-4">Top 5 Puestos Más Usados</h2>  
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">  
              <div className="space-y-3">  
                {metrics.topDesks.map((desk, idx) => (  
                  <div key={idx} className="flex items-center justify-between">  
                    <div className="flex items-center gap-3">  
                      <span className="text-2xl font-bold text-slate-600">#{idx + 1}</span>  
                      <div>  
                        <div className="font-medium">{desk.name}</div>  
                        <div className="text-sm text-slate-400">{desk.floor}</div>  
                      </div>  
                    </div>  
                    <div className="text-right">  
                      <div className="font-bold text-blue-400">{desk.reservations} reservas</div>  
                      <div className="text-xs text-slate-500">{desk.utilizationRate}% uso</div>  
                    </div>  
                  </div>  
                ))}  
              </div>  
            </div>  
          </section>  
        )}  
  
        {/* Tabs de Navegación */}  
        <div className="border-b border-slate-800 mb-6">  
          <nav className="flex gap-4">  
            {["resumen", "pisos", "puestos", "reservas", "usuarios"].map((tab) => (  
              <button  
                key={tab}  
                onClick={() => setActiveTab(tab)}  
                className={`px-4 py-3 font-medium capitalize transition-all ${  
                  activeTab === tab  
                    ? "border-b-2 border-blue-500 text-blue-400"  
                    : "text-slate-400 hover:text-white"  
                }`}  
              >  
                {tab}  
              </button>  
            ))}  
          </nav>  
        </div>  
  
        {/* Contenido por Tab */}  
        <motion.div  
          key={activeTab}  
          initial={{ opacity: 0, y: 20 }}  
          animate={{ opacity: 1, y: 0 }}  
          transition={{ duration: 0.3 }}  
        >  
          {activeTab === "resumen" && (  
            <ResumenTab metrics={metrics} floors={floors} />  
          )}  
  
          {activeTab === "pisos" && (  
            <PisosTab  
              floors={floors}  
              onCreateFloor={handleCreateFloor}  
              onSelectFloor={loadDesks}  
            />  
          )}  
  
          {activeTab === "puestos" && (  
            <PuestosTab  
              desks={desks}  
              floors={floors}  
              onToggleStatus={handleToggleDeskStatus}  
            />  
          )}  
  
          {activeTab === "reservas" && (  
            <ReservasTab  
              reservations={reservations}  
              filters={filters}  
              setFilters={setFilters}  
              onCancelReservation={handleCancelReservation}  
              onFilterChange={loadDashboardData}  
            />  
          )}  
  
          {activeTab === "usuarios" && (  
            <UsuariosTab users={users} />  
          )}  
        </motion.div>  
      </main>  
    </div>  
  );  
}  
  
// Componente KPI Card  
function KPICard({ title, value, icon, color, trend }) {  
  const colorClasses = {  
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30",  
    green: "from-green-500/20 to-green-600/10 border-green-500/30",  
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30",  
    indigo: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30",  
    red: "from-red-500/20 to-red-600/10 border-red-500/30"  
  };  
  
  return (  
    <motion.div  
      whileHover={{ scale: 1.02, y: -4 }}  
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6`}  
    >  
      <div className="flex items-center justify-between mb-2">  
        <span className="text-3xl">{icon}</span>  
        {trend && (  
          <span className={`text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>  
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%  
          </span>  
        )}  
      </div>  
      <div className="text-3xl font-bold mb-1">{value}</div>  
      <div className="text-sm text-slate-400">{title}</div>  
    </motion.div>  
  );  
}  

// Tab: Resumen  
function ResumenTab({ metrics, floors }) {  
  return (  
    <div className="space-y-6">  
      <div className="grid md:grid-cols-2 gap-6">  
        {/* Alertas */}  
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">  
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">  
            <span>⚠️</span> Alertas del Sistema  
          </h3>  
          <div className="space-y-3">  
            {metrics?.alerts?.length > 0 ? (  
              metrics.alerts.map((alert, idx) => (  
                <div key={idx} className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/30">  
                  <span className="text-xl">{alert.icon}</span>  
                  <div>  
                    <div className="font-medium text-red-400">{alert.title}</div>  
                    <div className="text-sm text-slate-400">{alert.description}</div>  
                  </div>  
                </div>  
              ))  
            ) : (  
              <p className="text-slate-500">No hay alertas activas</p>  
            )}  
          </div>  
        </div>  
  
        {/* Distribución por Piso */}  
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">  
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">  
            <span>🏢</span> Distribución por Piso  
          </h3>  
          <div className="space-y-3">  
            {floors?.map((floor, idx) => (  
              <div key={idx} className="flex items-center justify-between">  
                <div>  
                  <div className="font-medium">{floor.name}</div>  
                  <div className="text-xs text-slate-400">{floor.totalDesks} puestos</div>  
                </div>  
                <div className="text-right">  
                  <div className="text-sm font-medium text-green-400">  
                    {floor.availableDesks} disponibles  
                  </div>  
                  <div className="text-xs text-slate-500">  
                    {Math.round((floor.availableDesks / floor.totalDesks) * 100)}% libre  
                  </div>  
                </div>  
              </div>  
            )) || <p className="text-slate-500">No hay pisos configurados</p>}  
          </div>  
        </div>  
      </div>  
  
      {/* Actividad Reciente */}  
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">  
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">  
          <span>📋</span> Actividad Reciente  
        </h3>  
        <div className="space-y-2">  
          {metrics?.recentActivity?.map((activity, idx) => (  
            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">  
              <span className="text-2xl">{activity.icon}</span>  
              <div className="flex-1">  
                <div className="text-sm">{activity.description}</div>  
                <div className="text-xs text-slate-500">{activity.timestamp}</div>  
              </div>  
            </div>  
          )) || <p className="text-slate-500">No hay actividad reciente</p>}  
        </div>  
      </div>  
    </div>  
  );  
}  
  
// Tab: Pisos  
function PisosTab({ floors, onCreateFloor, onSelectFloor }) {  
  const [showCreateForm, setShowCreateForm] = useState(false);  
  const [newFloor, setNewFloor] = useState({ name: '', description: '' });  
  
  const handleCreate = () => {  
    if (newFloor.name) {  
      onCreateFloor(newFloor);  
      setNewFloor({ name: '', description: '' });  
      setShowCreateForm(false);  
    }  
  };  
  
  return (  
    <div className="space-y-6">  
      <div className="flex justify-between items-center">  
        <h2 className="text-xl font-semibold">Gestión de Pisos</h2>  
        <button  
          onClick={() => setShowCreateForm(!showCreateForm)}  
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"  
        >  
          {showCreateForm ? 'Cancelar' : '+ Crear Piso'}  
        </button>  
      </div>  
  
      {showCreateForm && (  
        <motion.div  
          initial={{ opacity: 0, y: -10 }}  
          animate={{ opacity: 1, y: 0 }}  
          className="bg-slate-900 rounded-xl border border-slate-800 p-6"  
        >  
          <h3 className="font-semibold mb-4">Nuevo Piso</h3>  
          <div className="space-y-4">  
            <input  
              type="text"  
              placeholder="Nombre del piso"  
              value={newFloor.name}  
              onChange={(e) => setNewFloor({ ...newFloor, name: e.target.value })}  
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"  
            />  
            <input  
              type="text"  
              placeholder="Descripción (opcional)"  
              value={newFloor.description}  
              onChange={(e) => setNewFloor({ ...newFloor, description: e.target.value })}  
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"  
            />  
            <button  
              onClick={handleCreate}  
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"  
            >  
              Crear Piso  
            </button>  
          </div>  
        </motion.div>  
      )}  
  
      <div className="grid md:grid-cols-2 gap-4">  
        {floors?.map((floor, idx) => (  
          <motion.div  
            key={idx}  
            whileHover={{ scale: 1.02 }}  
            onClick={() => onSelectFloor(floor.id)}  
            className="bg-slate-900 rounded-xl border border-slate-800 p-6 cursor-pointer hover:border-blue-500/50 transition"  
          >  
            <div className="flex items-center justify-between mb-3">  
              <h3 className="text-lg font-semibold">{floor.name}</h3>  
              <span className="text-2xl">🏢</span>  
            </div>  
            <p className="text-sm text-slate-400 mb-4">{floor.description}</p>  
            <div className="grid grid-cols-2 gap-4 text-sm">  
              <div>  
                <div className="text-slate-500">Total Puestos</div>  
                <div className="font-bold">{floor.totalDesks || 0}</div>  
              </div>  
              <div>  
                <div className="text-slate-500">Disponibles</div>  
                <div className="font-bold text-green-400">{floor.availableDesks || 0}</div>  
              </div>  
            </div>  
          </motion.div>  
        )) || <p className="text-slate-500 col-span-2">No hay pisos configurados</p>}  
      </div>  
    </div>  
  );  
}  
  
// Tab: Puestos  
function PuestosTab({ desks, floors, onToggleStatus }) {  
  const [selectedFloor, setSelectedFloor] = useState('');  
  
  return (  
    <div className="space-y-6">  
      <div className="flex gap-4 items-center">  
        <select  
          value={selectedFloor}  
          onChange={(e) => setSelectedFloor(e.target.value)}  
          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"  
        >  
          <option value="">Todos los pisos</option>  
          {floors?.map((floor, idx) => (  
            <option key={idx} value={floor.id}>{floor.name}</option>  
          ))}  
        </select>  
      </div>  
  
      <div className="grid md:grid-cols-3 gap-4">  
        {desks?.filter(d => !selectedFloor || d.floorId === selectedFloor).map((desk, idx) => (  
          <div  
            key={idx}  
            className={`bg-slate-900 rounded-xl border p-4 ${  
              desk.blocked ? 'border-red-500/50' : 'border-slate-800'  
            }`}  
          >  
            <div className="flex items-center justify-between mb-3">  
              <h4 className="font-semibold">{desk.name}</h4>  
              <span className={`px-2 py-1 rounded text-xs ${  
                desk.blocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'  
              }`}>  
                {desk.blocked ? 'Bloqueado' : 'Activo'}  
              </span>  
            </div>  
            <button  
              onClick={() => onToggleStatus(desk.id, desk.blocked)}  
              className={`w-full px-3 py-2 rounded-lg text-sm transition ${  
                desk.blocked  
                  ? 'bg-green-600/20 hover:bg-green-600/30 text-green-400'  
                  : 'bg-red-600/20 hover:bg-red-600/30 text-red-400'  
              }`}  
            >  
              {desk.blocked ? 'Desbloquear' : 'Bloquear'}  
            </button>  
          </div>  
        )) || <p className="text-slate-500 col-span-3">No hay puestos disponibles</p>}  
      </div>  
    </div>  
  );  
}  
  
// Tab: Reservas  
function ReservasTab({ reservations, filters, setFilters, onCancelReservation, onFilterChange }) {  
  return (  
    <div className="space-y-6">  
      {/* Filtros */}  
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">  
        <h3 className="font-semibold mb-4">Filtros</h3>  
        <div className="grid md:grid-cols-4 gap-4">  
          <input  
            type="date"  
            value={filters.dateFrom}  
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}  
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"  
          />  
          <input  
            type="date"  
            value={filters.dateTo}  
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}  
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"  
          />  
          <input  
            type="text"  
            placeholder="Usuario"  
            value={filters.user}  
            onChange={(e) => setFilters({ ...filters, user: e.target.value })}  
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"  
          />  
          <button  
            onClick={onFilterChange}  
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"  
          >  
            Aplicar Filtros  
          </button>  
        </div>  
      </div>  
  
      {/* Tabla de Reservas */}  
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">  
        <table className="w-full">  
          <thead className="bg-slate-800">  
            <tr>  
              <th className="px-4 py-3 text-left text-sm font-semibold">Usuario</th>  
              <th className="px-4 py-3 text-left text-sm font-semibold">Puesto</th>  
              <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>  
              <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>  
              <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>  
            </tr>  
          </thead>  
          <tbody>  
            {reservations?.map((res, idx) => (  
              <tr key={idx} className="border-t border-slate-800">  
                <td className="px-4 py-3 text-sm">{res.userName}</td>  
                <td className="px-4 py-3 text-sm">{res.deskName}</td>  
                <td className="px-4 py-3 text-sm">{res.date}</td>  
                <td className="px-4 py-3">  
                  <span className={`px-2 py-1 rounded text-xs ${  
                    res.status === 'activa' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'  
                  }`}>  
                    {res.status}  
                  </span>  
                </td>  
                <td className="px-4 py-3">  
                  {res.status === 'activa' && (  
                    <button  
                      onClick={() => onCancelReservation(res.id)}  
                      className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-sm transition"  
                    >  
                      Cancelar  
                    </button>  
                  )}  
                </td>  
              </tr>  
            )) || (  
              <tr>  
                <td colSpan="5" className="px-4 py-8 text-center text-slate-500">  
                  No hay reservas que mostrar  
                </td>  
              </tr>  
            )}  
          </tbody>  
        </table>  
      </div>  
    </div>  
  );  
}  

// Tab: Usuarios  
function UsuariosTab({ users }) {  
  return (  
    <div className="space-y-6">  
      <div className="flex justify-between items-center mb-4">  
        <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>  
        <div className="text-sm text-slate-400">  
          Total: {users?.length || 0} usuarios  
        </div>  
      </div>  
  
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">  
        <table className="w-full">  
          <thead className="bg-slate-800">  
            <tr>  
              <th className="px-4 py-3 text-left text-sm font-semibold">Usuario</th>  
              <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>  
              <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>  
              <th className="px-4 py-3 text-left text-sm font-semibold">Rol</th>  
              <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>  
              <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>  
            </tr>  
          </thead>  
          <tbody>  
            {users?.map((user, idx) => (  
              <tr key={idx} className="border-t border-slate-800 hover:bg-slate-800/50 transition">  
                <td className="px-4 py-3 text-sm font-medium">{user.username}</td>  
                <td className="px-4 py-3 text-sm">{user.nombre}</td>  
                <td className="px-4 py-3 text-sm text-slate-400">{user.email}</td>  
                <td className="px-4 py-3">  
                  <span className={`px-2 py-1 rounded text-xs capitalize ${  
                    user.role === 'administrador'   
                      ? 'bg-purple-500/20 text-purple-400'   
                      : user.role === 'jefe'  
                      ? 'bg-blue-500/20 text-blue-400'  
                      : 'bg-green-500/20 text-green-400'  
                  }`}>  
                    {user.role}  
                  </span>  
                </td>  
                <td className="px-4 py-3">  
                  <span className={`px-2 py-1 rounded text-xs ${  
                    user.active   
                      ? 'bg-green-500/20 text-green-400'   
                      : 'bg-red-500/20 text-red-400'  
                  }`}>  
                    {user.active ? 'Activo' : 'Inactivo'}  
                  </span>  
                </td>  
                <td className="px-4 py-3">  
                  <button className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-sm transition">  
                    Editar  
                  </button>  
                </td>  
              </tr>  
            )) || (  
              <tr>  
                <td colSpan="6" className="px-4 py-8 text-center text-slate-500">  
                  No hay usuarios registrados  
                </td>  
              </tr>  
            )}  
          </tbody>  
        </table>  
      </div>  
  
      {/* Estadísticas de Usuarios */}  
      <div className="grid md:grid-cols-3 gap-4">  
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">  
          <div className="text-sm text-slate-400 mb-1">Administradores</div>  
          <div className="text-2xl font-bold">  
            {users?.filter(u => u.role === 'administrador').length || 0}  
          </div>  
        </div>  
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">  
          <div className="text-sm text-slate-400 mb-1">Jefes</div>  
          <div className="text-2xl font-bold">  
            {users?.filter(u => u.role === 'jefe').length || 0}  
          </div>  
        </div>  
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">  
          <div className="text-sm text-slate-400 mb-1">Empleados</div>  
          <div className="text-2xl font-bold">  
            {users?.filter(u => u.role === 'empleado').length || 0}  
          </div>  
        </div>  
      </div>  
    </div>  
  );
}


  
