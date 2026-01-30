import { useNavigate } from "react-router-dom";  
import { motion } from "framer-motion";  
import { clearToken } from "../auth";  
  
export default function Header({ onMenuClick }) {  
  const navigate = useNavigate();  
  
  const logout = () => {  
    clearToken();  
    localStorage.removeItem("username");  
    localStorage.removeItem("userRole"); // Limpiar también el rol  
    navigate("/login");  
  };  
  
  return (  
    <motion.header   
      initial={{ y: -20, opacity: 0 }}  
      animate={{ y: 0, opacity: 1 }}  
      transition={{ duration: 0.5 }}  
      className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm"  
    >  
      <div className="px-6 py-4 flex items-center justify-between">  
        <div className="flex items-center gap-4">  
          <motion.button  
            whileHover={{ scale: 1.05 }}  
            whileTap={{ scale: 0.95 }}  
            onClick={onMenuClick}  
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"  
          >  
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">  
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />  
            </svg>  
          </motion.button>  
            
          <motion.div  
            initial={{ x: -10, opacity: 0 }}  
            animate={{ x: 0, opacity: 1 }}  
            transition={{ delay: 0.2 }}  
            className="flex items-center gap-3"  
          >  
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center font-bold text-white shadow-lg">  
              ABC  
            </div>  
            <div>  
              <h1 className="text-xl font-bold text-gray-900">ABC Desk Booking</h1>  
              <p className="text-xs text-gray-600">Panel de Administración</p>  
            </div>  
          </motion.div>  
        </div>  
  
        {/* Botón de logout */}  
        <motion.button  
          whileHover={{ scale: 1.02 }}  
          whileTap={{ scale: 0.98 }}  
          onClick={logout}  
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium shadow-sm"  
        >  
          Cerrar sesión  
        </motion.button>  
      </div>  
    </motion.header>  
  );  
}