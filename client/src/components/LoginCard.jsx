import { motion } from "framer-motion";

export default function LoginCard({
  username, setUsername,
  password, setPassword,
  loading,
  error,
  successMessage,
  onSubmit,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Glow */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500/30 via-indigo-500/20 to-blue-500/30 blur-xl" />

      <div className="relative bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
        {/* Logo + title */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-600/25">
              ABC
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 leading-tight">Iniciar Sesión</h3>
              <p className="text-sm text-gray-500">Acceso corporativo seguro</p>
            </div>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            LDAP
          </span>
        </div>

        {/* Feedback */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
          >
            {error}
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center"
          >
            {successMessage}
          </motion.div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario Corporativo
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-gray-400 select-none">👤</span>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                aria-label="Usuario corporativo"
                autoComplete="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="tu.usuario"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-gray-400 select-none">🔒</span>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                aria-label="Contraseña"
                autoComplete="current-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Button */}
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                Autenticando...
              </span>
            ) : (
              "Ingresar"
            )}
          </motion.button>
        </form>

        {/* Footer text */}
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
          <p className="text-sm text-gray-600 text-center">
            Autenticación mediante LDAP corporativo
          </p>
          <p className="text-xs text-gray-500 text-center">
            ¿Problemas para ingresar? Contacta a <b>TI</b>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
