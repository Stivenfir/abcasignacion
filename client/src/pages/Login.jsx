import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { setToken } from "../auth";
import AnimatedBackground from "../components/AnimatedBackground";
import LoginCard from "../components/LoginCard";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {}

      if (response.ok) {
        setToken(data?.token);
        localStorage.setItem("username", username);


        const userRole =
          username.toLowerCase() === "admin" ? "admin" : "empleado";
        localStorage.setItem("userRole", userRole);

        setSuccessMessage(`✔ Bienvenido, ${username}`);
        setTimeout(() => navigate("/dashboard"), 900);
      } else {
        setError(data?.message || "Usuario o contraseña incorrectos");
      }
    } catch {
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <AnimatedBackground />

      <header className="relative z-10 w-full p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl font-bold text-white"
          >
            ABC Desk Booking
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.65,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-sm text-blue-200/90"
          >
            Sistema de Reserva de Puestos
          </motion.div>
        </div>
      </header>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="text-white space-y-4"
          >
            <h2 className="text-5xl font-bold leading-tight">
              Reserva tu puesto de trabajo
            </h2>

            <p className="text-xl text-blue-100/90">
              Hot-desking empresarial con trazabilidad, disponibilidad y
              control.
            </p>

            {/* Mensaje de valor (branding) */}
            <p className="text-sm text-blue-200/70">
              Reservas inteligentes para oficinas híbridas.
            </p>
          </motion.div>

          <LoginCard
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            loading={loading}
            error={error}
            successMessage={successMessage}
            onSubmit={handleLogin}
          />
        </div>
      </div>

      <footer className="relative z-10 w-full p-6">
        <div className="max-w-7xl mx-auto text-center text-blue-200/80 text-sm">
          © 2026 ABC Corporation · Desk Booking System v1.0
        </div>
      </footer>
    </div>
  );
}
