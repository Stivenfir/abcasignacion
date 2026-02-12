import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const cards = [
  {
    to: "/mapa",
    title: "Mapa de puestos",
    description: "Consulta disponibilidad por piso y áreas habilitadas.",
    icon: "🗺️",
    gradient: "from-blue-50 to-blue-100",
  },
  {
    to: "/mis-reservas",
    title: "Mis reservas",
    description: "Gestiona tus reservas activas con vista rápida.",
    icon: "📋",
    gradient: "from-indigo-50 to-indigo-100",
  },
];

export default function LD_Dashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border border-blue-100 bg-gradient-to-r from-white via-blue-50/60 to-indigo-50/50 p-6 shadow-sm"
      >
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Vista líder: controla reservas y disponibilidad de tu equipo.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.to}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08 * (index + 1), duration: 0.35 }}
          >
            <Link to={card.to} className="block group">
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`relative rounded-2xl border border-gray-200 bg-gradient-to-br ${card.gradient} p-8 transition-all duration-300 shadow-sm hover:shadow-lg overflow-hidden`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">{card.icon}</div>
                  <span className="text-gray-400 group-hover:text-blue-600 transition-colors">
                    →
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
