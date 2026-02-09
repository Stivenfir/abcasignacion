import { Router } from "express";  
import { authenticateToken } from '../middleware/auth.middleware.js';  
  
const router = Router();  
  
// Función GetData para comunicarse con la API externa  
async function GetData(P) {  
  return new Promise(resolve => {  
    var OptPet = {  
      method: 'POST',  
      headers: {  
        'Content-Type': 'application/x-www-form-urlencoded',  
        TK: process.env.API_TOKEN  
      },  
      body: P.replace('/\n/g', "\\n")  
    }  
    fetch(process.env.EXTERNAL_API_URL, OptPet).then(response => response.text()).then(Rta => {  
      resolve(Rta)  
    }).catch(error => { console.error("Error", error); });  
  });  
}  
  
function logAuditoria(accion, usuario, detalles) {  
  const timestamp = new Date().toISOString();  
  const logEntry = { timestamp, accion, usuario, ...detalles };  
  console.log('[AUDIT]', JSON.stringify(logEntry));  
}  
  
// GET - Obtener las 1000 reservas más recientes de un empleado  
router.get("/empleado/:idEmpleado", authenticateToken, async (req, res) => {  
  const { idEmpleado } = req.params;  
  const usuario = req.user.email;  
  
  try {  
    // SP_ConsultaReservas con @P=0 para obtener reservas del empleado  
    var Rta = await GetData(`SP_ConsultaReservas=0,${idEmpleado}`);  
  
    if (!Rta || Rta.trim().startsWith(':')) {  
      logAuditoria('CONSULTAR_RESERVAS_EMPLEADO', usuario, {  
        idEmpleado,  
        resultado: 'error',  
        error: 'Servicio de base de datos no disponible'  
      });  
      return res.status(503).json({  
        message: "Servicio de base de datos no disponible"  
      });  
    }  
  
    var S = Rta.trim();  
    var D = JSON.parse(S.trim())["data"];  
  
    if (!Array.isArray(D)) {  
      return res.json([]);  
    }  
  
    logAuditoria('CONSULTAR_RESERVAS_EMPLEADO', usuario, {  
      idEmpleado,  
      resultado: 'success',  
      cantidad: D.length  
    });  
  
    return res.json(D);  
  } catch (error) {  
    console.error('Error al obtener reservas:', error);  
    logAuditoria('CONSULTAR_RESERVAS_EMPLEADO', usuario, {  
      idEmpleado,  
      resultado: 'error',  
      error: error.message  
    });  
    return res.status(500).json({ message: error.message });  
  }  
});  
  
// GET - Obtener puestos disponibles para una fecha específica  
router.get("/disponibles/:fecha", authenticateToken, async (req, res) => {  
  const { fecha } = req.params;  
  const usuario = req.user.email;  
  
  try {  
    // SP_ConsultaReservas con @P=2 para obtener puestos disponibles  
    var Rta = await GetData(`SP_ConsultaReservas=2,0,'${fecha}'`);  
  
    if (!Rta || Rta.trim().startsWith(':')) {  
      logAuditoria('CONSULTAR_PUESTOS_DISPONIBLES', usuario, {  
        fecha,  
        resultado: 'error',  
        error: 'Servicio de base de datos no disponible'  
      });  
      return res.status(503).json({  
        message: "Servicio de base de datos no disponible"  
      });  
    }  
  
    var S = Rta.trim();  
    var D = JSON.parse(S.trim())["data"];  
  
    if (!Array.isArray(D)) {  
      return res.json([]);  
    }  
  
    logAuditoria('CONSULTAR_PUESTOS_DISPONIBLES', usuario, {  
      fecha,  
      resultado: 'success',  
      cantidad: D.length  
    });  
  
    return res.json(D);  
  } catch (error) {  
    console.error('Error al obtener puestos disponibles:', error);  
    logAuditoria('CONSULTAR_PUESTOS_DISPONIBLES', usuario, {  
      fecha,  
      resultado: 'error',  
      error: error.message  
    });  
    return res.status(500).json({ message: error.message });  
  }  
});  
  
// POST - Crear nueva reserva  
router.post("/", authenticateToken, async (req, res) => {  
  const { idEmpleado, idPuestoTrabajo, fecha } = req.body;  
  const usuario = req.user.email;  
  
  // Validar parámetros  
  if (!idEmpleado || !idPuestoTrabajo || !fecha) {  
    return res.status(400).json({  
      error: "idEmpleado, idPuestoTrabajo y fecha son requeridos"  
    });  
  }  
  
  logAuditoria('CREAR_RESERVA', usuario, {  
    idEmpleado,  
    idPuestoTrabajo,  
    fecha  
  });  
  
  try {  
    // SP_EditReservas con @P=0 para crear reserva  
    var Rta = await GetData(`SP_EditReservas=0,${idEmpleado},0,${idPuestoTrabajo},'${fecha}',''`);  
  
    if (!Rta || Rta.trim().startsWith(':')) {  
      logAuditoria('CREAR_RESERVA', usuario, {  
        idEmpleado,  
        idPuestoTrabajo,  
        resultado: 'error',  
        error: 'Servicio de base de datos no disponible'  
      });  
      return res.status(503).json({  
        message: "Servicio de base de datos no disponible"  
      });  
    }  
  
    var S = Rta.trim();  
    var D = JSON.parse(S.trim());  
  
    logAuditoria('CREAR_RESERVA', usuario, {  
      idEmpleado,  
      idPuestoTrabajo,  
      resultado: 'success'  
    });  
  
    return res.json(D);  
  } catch (error) {  
    console.error('Error al crear reserva:', error);  
    logAuditoria('CREAR_RESERVA', usuario, {  
      idEmpleado,  
      idPuestoTrabajo,  
      resultado: 'error',  
      error: error.message  
    });  
    return res.status(500).json({ message: error.message });  
  }  
});  
  
// PUT - Cancelar una reserva  
router.put("/:idReserva/cancelar", authenticateToken, async (req, res) => {  
  const { idReserva } = req.params;  
  const { idEmpleado, observacion } = req.body;  
  const usuario = req.user.email;  
  
  // Validar parámetros  
  if (!idEmpleado || !observacion) {  
    return res.status(400).json({  
      error: "idEmpleado y observacion son requeridos"  
    });  
  }  
  
  logAuditoria('CANCELAR_RESERVA', usuario, {  
    idReserva,  
    idEmpleado,  
    observacion  
  });  
  
  try {  
    // SP_EditReservas con @P=1 para cancelar reserva  
    var Rta = await GetData(`SP_EditReservas=1,${idEmpleado},${idReserva},0,NULL,'${observacion}'`);  
  
    if (!Rta || Rta.trim().startsWith(':')) {  
      logAuditoria('CANCELAR_RESERVA', usuario, {  
        idReserva,  
        resultado: 'error',  
        error: 'Servicio de base de datos no disponible'  
      });  
      return res.status(503).json({  
        message: "Servicio de base de datos no disponible"  
      });  
    }  
  
    var S = Rta.trim();  
    var D = JSON.parse(S.trim());  
  
    logAuditoria('CANCELAR_RESERVA', usuario, {  
      idReserva,  
      resultado: 'success'  
    });  
  
    return res.json(D);  
  } catch (error) {  
    console.error('Error al cancelar reserva:', error);  
    logAuditoria('CANCELAR_RESERVA', usuario, {  
      idReserva,  
      resultado: 'error',  
      error: error.message  
    });  
    return res.status(500).json({ message: error.message });  
  }  
});  
  

router.get("/disponibles/:fecha", async (req, res) => {  
  const { fecha } = req.params;  
    
  try {  
    // Llamar al stored procedure SP_ConsultaReservas con @P=2  
    var Rta = await GetData(`ConsultaReservas=2,0,${fecha}`);  
      
    if (!Rta || Rta.trim().startsWith(':')) {  
      return res.status(503).json({   
        message: "Servicio de base de datos no disponible"   
      });  
    }  
      
    var S = Rta.trim();  
    var D = JSON.parse(S.trim())["data"];  
      
    if (!Array.isArray(D)) {  
      return res.json([]);  
    }  
      
    return res.json(D);  
  } catch (error) {  
    console.error('Error al obtener puestos disponibles:', error);  
    return res.status(500).json({ message: error.message });  
  }  
});

// GET - Obtener todas las reservas (5000 más recientes) - Solo para admin  
router.get("/todas", authenticateToken, async (req, res) => {  
  const usuario = req.user.email;  
  
  try {  
    // SP_ConsultaReservas con @P=1 para obtener todas las reservas  
    var Rta = await GetData(`SP_ConsultaReservas=1,0`);  
  
    if (!Rta || Rta.trim().startsWith(':')) {  
      logAuditoria('CONSULTAR_TODAS_RESERVAS', usuario, {  
        resultado: 'error',  
        error: 'Servicio de base de datos no disponible'  
      });  
      return res.status(503).json({  
        message: "Servicio de base de datos no disponible"  
      });  
    }  
  
    var S = Rta.trim();  
    var D = JSON.parse(S.trim())["data"];  
  
    if (!Array.isArray(D)) {  
      return res.json([]);  
    }  
  
    logAuditoria('CONSULTAR_TODAS_RESERVAS', usuario, {  
      resultado: 'success',  
      cantidad: D.length  
    });  
  
    return res.json(D);  
  } catch (error) {  
    console.error('Error al obtener todas las reservas:', error);  
    logAuditoria('CONSULTAR_TODAS_RESERVAS', usuario, {  
      resultado: 'error',  
      error: error.message  
    });  
    return res.status(500).json({ message: error.message });  
  }  
});  
  
export default router;