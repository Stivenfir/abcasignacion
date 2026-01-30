import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Mapa from "./pages/Mapa";
import { isAuthed } from "./auth";
import { pageVariants, pageTransition } from "./animations/pageTransitions";
import AdminDashboard from "./pages/admin/AdminDashboard";  

function PrivateRoute({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />

        <Route
          path="/home"
          element={
            <PrivateRoute>
              <AnimatedPage><Home /></AnimatedPage>
            </PrivateRoute>
          }
        />

        <Route
          path="/mapa"
          element={
            <PrivateRoute>
              <AnimatedPage><Mapa /></AnimatedPage>
            </PrivateRoute>
          }
        />

        <Route  
  path="/admin"  
  element={  
    <PrivateRoute>  
      <AnimatedPage><AdminDashboard /></AnimatedPage>  
    </PrivateRoute>  
  }  
/>

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
