import 'dotenv/config';  
import express from "express";  
import cors from "cors";  
  
import healthRoutes from "./routes/health.routes.js";  
import authRoutes from "./routes/auth.routes.js";  
  
const app = express();  
app.use(cors());  
app.use(express.json());  
  
app.use("/api", healthRoutes);  
app.use("/api/auth", authRoutes);  
  
const PORT = process.env.PORT || 3000;  
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));