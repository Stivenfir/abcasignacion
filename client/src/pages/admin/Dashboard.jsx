import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const cards = [
  {
    to: "/mapa",
    title: "Mapa de puestos",
    description: "Visualiza disponibilidad y reserva escritorios en segundos.",
    icon: "🗺️",
    gradient: "from-blue-50 to-blue-100",
  },
  {
    to: "/areas",
    title: "Gestión de Áreas",
    description: "Administra áreas, delimitaciones y relación por piso.",
    icon: "📍",
    gradient: "from-purple-50 to-purple-100",
  },
  {
    to: "/mis-reservas",
    title: "Mis reservas",
    description: "Consulta, confirma o cancela tus reservas activas.",
    icon: "📋",
    gradient: "from-indigo-50 to-indigo-100",
  },
];

const stats = [
  {
    label: "Estado del sistema",
    value: "Operativo",
    icon: "🟢",
    detail: "Sin incidencias críticas",
  },
  {
    label: "Módulos clave",
    value: "Reservas + Puestos",
    icon: "🧩",
    detail: "Listos para operar",
  },
  {
    label: "Experiencia",
    value: "Optimizada",
    icon: "✨",
    detail: "UI alineada y consistente",
  },
];

export default function Dashboard() {
  const hoy = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border border-blue-100 bg-gradient-to-r from-white via-blue-50/60 to-indigo-50/50 p-6 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Bienvenido al sistema de reserva de escritorios
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-700 shadow-sm">
            📅 {hoy}
          </div>
        </div>
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
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">{card.icon}</div>
                    <motion.div
                      initial={{ x: 0 }}
                      whileHover={{ x: 3 }}
                      className="text-gray-400 group-hover:text-blue-600 transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
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

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -2 }}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.detail}</p>
          </motion.div>
        ))}
      </motion.div>


      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.35 }}
        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Flujo recomendado</h3>
            <p className="text-sm text-gray-600">
              Sigue este recorrido para una operación más rápida y ordenada.
            </p>
          </div>
          <Link
            to="/mis-reservas"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            Ir a Mis Reservas
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { paso: "1", titulo: "Verifica el mapa", texto: "Confirma pisos y áreas con cupo disponible." },
            { paso: "2", titulo: "Gestiona áreas", texto: "Mantén delimitaciones y configuración por piso al día." },
            { paso: "3", titulo: "Monitorea reservas", texto: "Revisa reservas activas y estado de los escritorios." },
          ].map((item) => (
            <div
              key={item.paso}
              className="rounded-xl border border-gray-200 p-4 bg-gradient-to-br from-gray-50 to-white"
            >
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center mb-2">
                {item.paso}
              </div>
              <p className="font-semibold text-gray-900">{item.titulo}</p>
              <p className="text-xs text-gray-600 mt-1">{item.texto}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
