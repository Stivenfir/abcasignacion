import { motion } from "framer-motion";  
  
export default function Footer() {  
  return (  
    <motion.footer   
      initial={{ y: 20, opacity: 0 }}  
      animate={{ y: 0, opacity: 1 }}  
      transition={{ delay: 0.3 }}  
      className="bg-white border-t border-gray-200 py-4"  
    >  
      <div className="px-6 text-center">  
        <p className="text-gray-600 text-sm">  
          © 2026 <span className="text-blue-600 font-medium">ABC Corporation</span> · Desk Booking System v1.0  
        </p>  
        <p className="text-gray-500 text-xs mt-1">  
          Sistema de reserva de escritorios empresarial  
        </p>  
      </div>  
    </motion.footer>  
  );  
}