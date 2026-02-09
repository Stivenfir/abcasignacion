import { Link } from "react-router-dom";  
import { motion } from "framer-motion";  
  
const cards = [  
  {  
    to: "/mapa",  
    title: "Mapa de puestos",  
    description: "Ver disponibilidad y reservar escritorios",  
    icon: "🗺️",  
    gradient: "from-blue-50 to-blue-100",  
  },  
  
  {  
    to: "/mis-reservas",  
    title: "Mis reservas",  
    description: "Consultar o cancelar tus reservas activas",  
    icon: "📋",  
    gradient: "from-indigo-50 to-indigo-100",  
  },  
];  
  
export default function CM_Dashboard() {  
  return (  
    <div className="max-w-6xl mx-auto">  
      <motion.div  
        initial={{ y: -20, opacity: 0 }}  
        animate={{ y: 0, opacity: 1 }}  
        transition={{ duration: 0.5 }}  
      >  
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>  
        <p className="text-gray-600 mb-8">Bienvenido al sistema de reserva de escritorios</p>  
      </motion.div>  
        
      <div className="grid md:grid-cols-2 gap-6">  
        {cards.map((card, index) => (  
          <motion.div  
            key={card.to}  
            initial={{ y: 20, opacity: 0 }}  
            animate={{ y: 0, opacity: 1 }}  
            transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}  
          >  
            <Link to={card.to} className="block group">  
              <motion.div  
                whileHover={{ y: -4, scale: 1.02 }}  
                whileTap={{ scale: 0.98 }}  
                className={`  
                  relative rounded-2xl border border-gray-200   
                  bg-gradient-to-br ${card.gradient}  
                  p-8 transition-all duration-300  
                  shadow-sm hover:shadow-lg  
                  overflow-hidden  
                `}  
              >  
                <div className="relative z-10">  
                  <div className="flex items-start justify-between mb-4">  
                    <div className="text-5xl">{card.icon}</div>  
                    <motion.div  
                      initial={{ rotate: 0 }}  
                      whileHover={{ rotate: 45 }}  
                      transition={{ duration: 0.3 }}  
                      className="text-gray-400 group-hover:text-blue-600 transition-colors"  
                    >  
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">  
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />  
                      </svg>  
                    </motion.div>  
                  </div>  
                    
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">  
                    {card.title}  
                  </h3>  
                  <p className="text-gray-600 text-sm leading-relaxed">  
                    {card.description}  
                  </p>  
                </div>  
              </motion.div>  
            </Link>  
          </motion.div>  
        ))}  
      </div>   
    </div>  
  );  
}