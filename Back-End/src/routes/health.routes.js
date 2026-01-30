import { Router } from "express";
import * as db from "../config/database.js";

console.log("DB exports:", Object.keys(db)); // debe mostrar: ['getConnection','sql']

const router = Router();

router.get("/", (req, res) => {
  res.json({ status: "ok", service: "desk-booking-api" });
});

// Ruta de prueba de DB
router.get("/db-test", async (req, res) => {
  try {
    const pool = await db.getConnection();
    const result = await pool.request().query("SELECT @@VERSION as version");

    res.json({
      status: "ok",
      message: "Conexión exitosa a SQL Server",
      version: result.recordset[0].version
    });
  } catch (error) {
    console.error("DB TEST ERROR:", error);
    res.status(500).json({
      status: "error",
      message: "Error conectando a la base de datos",
      error: error.message
    });
  }
});

export default router;
