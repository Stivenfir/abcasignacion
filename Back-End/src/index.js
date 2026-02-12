import 'dotenv/config';
import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import pisosRoutes from "./routes/pisos.routes.js";
import areasRoutes from "./routes/areas.routes.js";
import puestosRoutes from "./routes/puestos.routes.js";
import reservasRoutes from "./routes/reservas.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pisos", pisosRoutes);
app.use("/api/areas", areasRoutes);
app.use("/api/puestos", puestosRoutes);
app.use("/api/reservas", reservasRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on http://0.0.0.0:${PORT}`);
});
