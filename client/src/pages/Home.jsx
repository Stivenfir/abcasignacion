import { useState, useEffect } from "react";  
import { Link, useNavigate, useLocation } from "react-router-dom";  
import { motion, AnimatePresence } from "framer-motion";  
import { clearToken } from "../auth";  
  
export default function Home() {  
  const navigate = useNavigate();  
  const location = useLocation();  
  const [sidebarOpen, setSidebarOpen] = useState(false);  
  const [userInfo, setUserInfo] = useState({  
    username: '',  
    role: 'empleado',  
    nombre: ''  
  });  
  
  useEffect(() => {  
    const token = localStorage.getItem('token');  
    if (token) {  
      try {  
        const payload = JSON.parse(atob(token.split('.')[1]));  
        setUserInfo({  
          username: payload.username || '',  
          role: payload.role || 'empleado',  
          nombre: payload.nombre || payload.username || 'Usuario'  
        });  
      } catch (e) {  
        console.error('Error decodificando token');  
      }  
    }  
  }, []);  
  
  const logout = () => {  
    clearToken();  
    navigate("/login");  
  };  
  
  const getGreeting = () => {  
    const hour = new Date().getHours();  
    if (hour < 12) return "Buenos días";  
    if (hour < 18) return "Buenas tardes";  
    return "Buenas noches";  
  };  
  
  const menuItems = [  
    { title: "Inicio", icon: "🏠", path: "/home" },  
    { title: "Mapa de Puestos", icon: "🗺️", path: "/mapa" },  
    { title: "Mis Reservas", icon: "📋", path: "/mis-reservas" },  
  ];  
  
  if (userInfo.role === 'administrador') {  
    menuItems.push({ title: "Panel Admin", icon: "⚙️", path: "/admin" });  
  }  
  
  const stats = [  
    { label: "Puestos Disponibles", value: "45", icon: "🪑", color: "green" },  
    { label: "Mis Reservas", value: "2", icon: "📅", color: "blue" },  
    { label: "Ocupación", value: "68%", icon: "📊", color: "purple" }  
  ];  
  
  return (  
    <div className="min-h-screen bg-slate-950 text-white flex">  
      {/* Sidebar */}  
      <AnimatePresence>  
        {sidebarOpen && (  
          <>  
            {/* Overlay para cerrar sidebar en mobile */}  
            <motion.div  
              initial={{ opacity: 0 }}  
              animate={{ opacity: 1 }}  
              exit={{ opacity: 0 }}  
              onClick={() => setSidebarOpen(false)}  
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"  
            />  
              
            {/* Sidebar */}  
            <motion.aside  
              initial={{ x: -280 }}  
              animate={{ x: 0 }}  
              exit={{ x: -280 }}  
              transition={{ type: "spring", damping: 25, stiffness: 200 }}  
              className="fixed lg:sticky top-0 left-0 h-screen w-72 bg-slate-900 border-r border-slate-800 z-50 flex flex-col"  
            >  
              {/* Logo y Header del Sidebar */}  
              <div className="p-6 border-b border-slate-800">  
                <div className="flex items-center gap-3 mb-4">  
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-sm shadow-lg">  
                    ABC  
                  </div>  
                  <div>  
                    <div className="font-bold text-lg">ABC Desk</div>  
                    <div className="text-xs text-slate-400">Booking System</div>  
                  </div>  
                </div>  
                  
                {/* Info del Usuario */}  
                <div className="bg-slate-800/50 rounded-lg p-3">  
                  <div className="text-sm font-medium">{userInfo.nombre}</div>  
                  <div className="text-xs text-slate-400 capitalize">{userInfo.role}</div>  
                </div>  
              </div>  
  
              {/* Navegación */}  
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">  
                {menuItems.map((item, idx) => {  
                  const isActive = location.pathname === item.path;  
                  return (  
                    <Link  
                      key={idx}  
                      to={item.path}  
                      onClick={() => setSidebarOpen(false)}  
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${  
                        isActive   
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'   
                          : 'hover:bg-slate-800 text-slate-300'  
                      }`}  
                    >  
                      <span className="text-xl">{item.icon}</span>  
                      <span className="font-medium">{item.title}</span>  
                    </Link>  
                  );  
                })}  
              </nav>  
  
              {/* Footer del Sidebar */}  
              <div className="p-4 border-t border-slate-800">  
                <button  
                  onClick={logout}  
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 transition-all"  
                >  
                  <span className="text-xl">🚪</span>  
                  <span className="font-medium">Cerrar Sesión</span>  
                </button>  
              </div>  
            </motion.aside>  
          </>  
        )}  
      </AnimatePresence>  
  
      {/* Contenido Principal */}  
      <div className="flex-1 flex flex-col min-h-screen">  
        {/* Header Superior */}  
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/80 backdrop-blur-lg">  
          <div className="px-6 py-4 flex items-center justify-between">  
            <div className="flex items-center gap-4">  
              {/* Botón para abrir sidebar */}  
              <button  
                onClick={() => setSidebarOpen(!sidebarOpen)}  
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"  
              >  
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">  
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />  
                </svg>  
              </button>  
                
              <div>  
                <div className="text-xl font-bold">ABC Desk Booking</div>  
                <div className="text-xs text-slate-400">Sistema de Reserva de Puestos</div>  
              </div>  
            </div>  
  
            {/* Usuario en header (desktop) */}  
            <div className="hidden md:flex items-center gap-4">  
              <div className="text-right">  
                <div className="text-sm font-medium">{userInfo.nombre}</div>  
                <div className="text-xs text-slate-400 capitalize">{userInfo.role}</div>  
              </div>  
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold">  
                {userInfo.nombre.charAt(0).toUpperCase()}  
              </div>  
            </div>  
          </div>  
        </header>  
  
        {/* Contenido Scrolleable */}  
        <main className="flex-1 overflow-y-auto">  
          <div className="max-w-7xl mx-auto p-6 space-y-8">  
            {/* Hero Section */}  
            <motion.section  
              initial={{ opacity: 0, y: 20 }}  
              animate={{ opacity: 1, y: 0 }}  
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-blue-500/30 p-8"  
            >  
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />  
              <div className="relative">  
                <h1 className="text-4xl font-bold mb-2">  
                  {getGreeting()}, {userInfo.nombre}  
                </h1>  
                <p className="text-lg text-slate-300">  
                  Bienvenido a tu espacio de trabajo. Gestiona tus reservas y encuentra el puesto perfecto.  
                </p>  
              </div>  
            </motion.section>  
  
            {/* Estadísticas */}  
            <motion.section  
              initial={{ opacity: 0, y: 20 }}  
              animate={{ opacity: 1, y: 0 }}  
              transition={{ delay: 0.1 }}  
            >  
              <h2 className="text-xl font-semibold mb-4">Resumen de Hoy</h2>  
              <div className="grid md:grid-cols-3 gap-4">  
                {stats.map((stat, idx) => (  
                  <motion.div  
                    key={idx}  
                    whileHover={{ scale: 1.02, y: -4 }}  
                    className="bg-slate-900 rounded-xl p-6 border border-slate-800"  
                  >  
                    <div className="flex items-center justify-between mb-2">  
                      <span className="text-3xl">{stat.icon}</span>  
                      <span className="text-3xl font-bold">{stat.value}</span>  
                    </div>  
                    <div className="text-sm text-slate-400">{stat.label}</div>  
                  </motion.div>  
                ))}  
              </div>  
            </motion.section>  
  
            {/* Acciones Rápidas */}  
            <motion.section  
              initial={{ opacity: 0, y: 20 }}  
              animate={{ opacity: 1, y: 0 }}  
              transition={{ delay: 0.2 }}  
            >  
              <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>  
              <div className="grid md:grid-cols-2 gap-6">  
                <Link to="/mapa">  
                  <motion.div  
                    whileHover={{ scale: 1.02, y: -4 }}  
                    className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6 h-full"  
                  >  
                    <div className="text-5xl mb-4">🗺️</div>  
                    <h3 className="text-lg font-semibold mb-2">Mapa de Puestos</h3>  
                    <p className="text-sm text-slate-300">Ver disponibilidad y reservar tu espacio</p>  
                  </motion.div>  
                </Link>  
  
                <Link to="/mis-reservas">  
                  <motion.div  
                    whileHover={{ scale: 1.02, y: -4 }}  
                    className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/30 rounded-2xl p-6 h-full"  
                  >  
                    <div className="text-5xl mb-4">📋</div>  
                    <h3 className="text-lg font-semibold mb-2">Mis Reservas</h3>  
                    <p className="text-sm text-slate-300">Consultar o cancelar tus reservas activas</p>  
                  </motion.div>  
                </Link>  
              </div>  
            </motion.section>  
  
            {/* Información Adicional */}  
            <motion.section  
              initial={{ opacity: 0, y: 20 }}  
              animate={{ opacity: 1, y: 0 }}  
              transition={{ delay: 0.3 }}  
              className="grid md:grid-cols-2 gap-6"  
            >  
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">  
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">  
                  <span>💡</span> Consejos Rápidos  
                </h3>  
                <ul className="space-y-2 text-sm text-slate-300">  
                  <li>• Reserva con anticipación para garantizar disponibilidad</li>  
                  <li>• Puedes cancelar reservas hasta 2 horas antes</li>  
                  <li>• Consulta el mapa para ver la distribución</li>  
                </ul>  
              </div>  
  
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">  
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">  
                  <span>📞</span> Soporte  
                </h3>  
                <p className="text-sm text-slate-300 mb-3">  
                  ¿Necesitas ayuda? Nuestro equipo está disponible.  
                </p>  
                <div className="text-sm text-slate-400">  
                  <div>📧 soporte@abcdesk.com</div>  
                  <div>📱 Ext. 1234</div>  
                </div>  
              </div>  
            </motion.section>  
          </div>  
        </main>  
  
        {/* Footer */}  
        <footer className="border-t border-slate-800 bg-slate-900/50">  
          <div className="px-6 py-4 text-center text-sm text-slate-400">  
            © 2026 ABC Corporation · Desk Booking System v1.0  
          </div>  
        </footer>  
      </div>  
    </div>  
  );  
}