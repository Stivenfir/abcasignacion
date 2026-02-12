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
router.get("/empleado", authenticateToken, async (req, res) => {      
  const idEmpleado = req.user.idEmpleado;  // ✅ Del token JWT      
  const usuario = req.user.username;      
        
  logAuditoria('CONSULTAR_RESERVAS_EMPLEADO', usuario, { idEmpleado });      
        
  try {      
    var Rta = await GetData(`ConsultaReservas=@P%3D0,@IdEmpleado%3D${idEmpleado}`);      
          
    // Validar formato PHP      
    if (!Rta || Rta.trim().startsWith('Array') || Rta.trim().startsWith(':')) {      
      logAuditoria('CONSULTAR_RESERVAS_EMPLEADO', usuario, {      
        idEmpleado,      
        resultado: 'error',      
        error: 'Formato inválido de BD'      
      });      
      return res.status(503).json({      
        message: "Servicio de base de datos devolvió formato inválido"      
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
    console.error('Error al obtener reservas del empleado:', error);      
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
  const { idPiso } = req.query;      
  const usuario = req.user.username;  
  const idArea = req.user.idArea;  // ✅ AGREGAR: Extraer idArea del token JWT  
            
  try {  
    // ✅ MODIFICAR: Pasar @IdArea al stored procedure  
    var Rta = await GetData(`ConsultaReservas=@P%3D2,@Fecha%3D'${fecha}',@IdArea%3D${idArea}`);  
            
    if (!Rta || Rta.trim().startsWith('Array') || Rta.trim().startsWith(':')) {            
      console.error('Error de BD:', Rta);          
      logAuditoria('CONSULTAR_PUESTOS_DISPONIBLES', usuario, {            
        fecha,      
        idPiso,  
        idArea,  // ✅ Agregar a logs  
        resultado: 'error',            
        error: 'Servicio de base de datos devolvió formato inválido'            
      });            
      return res.status(503).json({            
        message: "Servicio de base de datos devolvió formato inválido"            
      });            
    }            
            
    var S = Rta.trim();            
    var D = JSON.parse(S.trim())["data"];            
            
    if (!Array.isArray(D)) {            
      return res.json([]);            
    }      
      
    // ✅ Eliminar duplicados basándose en IdPuestoTrabajo    
    const puestosUnicos = [];    
    const idsVistos = new Set();    
        
    for (const puesto of D) {    
      if (!idsVistos.has(puesto.IdPuestoTrabajo)) {    
        idsVistos.add(puesto.IdPuestoTrabajo);    
        puestosUnicos.push(puesto);    
      }    
    }    
        
    D = puestosUnicos;    
      
    // ✅ Filtrar por IdPiso si se especificó en query params      
    if (idPiso && Array.isArray(D)) {      
      D = D.filter(puesto => puesto.IdPiso == idPiso);      
    }      
            
    logAuditoria('CONSULTAR_PUESTOS_DISPONIBLES', usuario, {            
      fecha,      
      idPiso,  
      idArea,  // ✅ Agregar a logs  
      resultado: 'success',            
      cantidad: D.length            
    });            
            
    return res.json(D);            
  } catch (error) {            
    console.error('Error al obtener puestos disponibles:', error);            
    logAuditoria('CONSULTAR_PUESTOS_DISPONIBLES', usuario, {            
      fecha,      
      idPiso,  
      idArea,  // ✅ Agregar a logs  
      resultado: 'error',            
      error: error.message            
    });            
    return res.status(500).json({ message: error.message });            
  }            
});

// GET - Obtener disponibilidad de puestos por área en un piso  
router.get("/disponibilidad-area", authenticateToken, async (req, res) => {  
  const { idPiso } = req.query;  
  const idArea = req.user.idArea;  
  const usuario = req.user.username;  
  
  try {  
    // Consultar cuántos puestos tiene el área en ese piso  
    const query = `  
      SELECT COUNT(*) as cantidadPuestos  
      FROM ABCDeskBooking.dbo.PuestoTrabajo PT  
      INNER JOIN ABCDeskBooking.dbo.AreaPiso AP ON PT.IdAreaPiso = AP.IdAreaPiso  
      WHERE AP.IdArea = ${idArea}  
        AND AP.IdPiso = ${idPiso}  
        AND PT.Disponible = 'SI'  
    `;  
  
    var Rta = await GetData(`ConsultaSQL=${encodeURIComponent(query)}`);  
      
    if (!Rta || Rta.trim().startsWith('Array') || Rta.trim().startsWith(':')) {  
      return res.json({ cantidadPuestos: 0 });  
    }  
  
    var S = Rta.trim();  
    var D = JSON.parse(S.trim())["data"];  
  
    logAuditoria('CONSULTAR_DISPONIBILIDAD_AREA', usuario, {  
      idArea,  
      idPiso,  
      resultado: 'success'  
    });  
  
    return res.json({  
      cantidadPuestos: D[0]?.cantidadPuestos || 0  
    });  
  } catch (error) {  
    console.error('Error al obtener disponibilidad:', error);  
    return res.json({ cantidadPuestos: 0 });  
  }  
});
        
// POST - Crear nueva reserva (✅ CON VALIDACIONES DE FECHA Y RESERVA ÚNICA)  
router.post("/", authenticateToken, async (req, res) => {        
  const { idPuestoTrabajo, fecha } = req.body;  
  const idEmpleado = req.user.idEmpleado;  
  const usuario = req.user.username;        
        
  // Validar parámetros        
  if (!idPuestoTrabajo || !fecha) {        
    return res.status(400).json({        
      error: "idPuestoTrabajo y fecha son requeridos"        
    });        
  }  
    
  // ✅ VALIDACIÓN 1: No permitir fechas pasadas  
  const fechaReserva = new Date(fecha);  
  const hoy = new Date();  
  hoy.setHours(0, 0, 0, 0);  
  fechaReserva.setHours(0, 0, 0, 0);  
  
  if (fechaReserva < hoy) {  
    logAuditoria('CREAR_RESERVA', usuario, {  
      idEmpleado,  
      fecha,  
      resultado: 'error',  
      error: 'Intento de reservar en fecha pasada'  
    });  
    return res.status(400).json({  
      error: "No se pueden crear reservas en fechas pasadas"  
    });  
  }  
        
  logAuditoria('CREAR_RESERVA', usuario, {        
    idEmpleado,        
    idPuestoTrabajo,        
    fecha        
  });        
        
  try {  
    // ✅ VALIDACIÓN 2: Verificar reserva única por día  
    const reservasEmpleado = await GetData(`ConsultaReservas=@P%3D0,@IdEmpleado%3D${idEmpleado}`);  
  
    if (reservasEmpleado && !reservasEmpleado.trim().startsWith('Array') && !reservasEmpleado.trim().startsWith(':')) {  
      const reservasData = JSON.parse(reservasEmpleado.trim())["data"];  
        
      if (Array.isArray(reservasData)) {  
        const reservaExistente = reservasData.find(r => {  
          const fechaReservaExistente = new Date(r.FechaReserva);  
          fechaReservaExistente.setHours(0, 0, 0, 0);  
          return fechaReservaExistente.getTime() === fechaReserva.getTime() && r.ReservaActiva;  
        });  
          
        if (reservaExistente) {  
          logAuditoria('CREAR_RESERVA', usuario, {  
            idEmpleado,  
            fecha,  
            resultado: 'error',  
            error: 'Ya tiene una reserva activa para esta fecha'  
          });  
          return res.status(400).json({  
            error: "Ya tienes una reserva activa para esta fecha"  
          });  
        }  
      }  
    }  
        
    // Crear la reserva  
    var Rta = await GetData(`EditReservas=@P%3D0,@IdEmpleado%3D${idEmpleado},@IdPuestoTrabajo%3D${idPuestoTrabajo},@Fecha%3D'${fecha}'`);        
        
    if (!Rta || Rta.trim().startsWith('Array') || Rta.trim().startsWith(':')) {        
      console.error('Error de BD:', Rta);      
      logAuditoria('CREAR_RESERVA', usuario, {        
        idEmpleado,        
        idPuestoTrabajo,        
        resultado: 'error',        
        error: 'Servicio de base de datos devolvió formato inválido'        
      });        
      return res.status(503).json({        
        message: "Servicio de base de datos devolvió formato inválido"        
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
  const { observacion } = req.body;  // ✅ Solo observacion del body    
  const idEmpleado = req.user.idEmpleado;  // ✅ Del token JWT    
  const usuario = req.user.username;        
        
  // Validar parámetros        
  if (!observacion) {        
    return res.status(400).json({        
      error: "observacion es requerida"        
    });        
  }        
        
  logAuditoria('CANCELAR_RESERVA', usuario, {        
    idReserva,        
    idEmpleado,        
    observacion        
  });        
        
  try {        
    // SP_EditReservas con @P=1 para cancelar reserva        
    var Rta = await GetData(`EditReservas=@P%3D1,@IdEmpleadoPuestoTrabajo%3D${idReserva},@Obs%3D${encodeURIComponent(observacion)},@IdEmpleado%3D${idEmpleado}`);        
        
    // ✅ Validar formato PHP inválido      
    if (!Rta || Rta.trim().startsWith('Array') || Rta.trim().startsWith(':')) {        
      console.error('Error de BD:', Rta);      
      logAuditoria('CANCELAR_RESERVA', usuario, {        
        idReserva,        
        resultado: 'error',        
        error: 'Servicio de base de datos devolvió formato inválido'        
      });        
      return res.status(503).json({        
        message: "Servicio de base de datos devolvió formato inválido"        
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
      
// GET - Obtener todas las reservas (5000 más recientes) - Solo para admin        
router.get("/todas", authenticateToken, async (req, res) => {        
  const usuario = req.user.username;        
        
  try {        
    // SP_ConsultaReservas con @P=1 para obtener todas las reservas        
    var Rta = await GetData(`ConsultaReservas=@P%3D1,@IdEmpleado%3D0`);        
        
    // ✅ Validar formato PHP inválido      
    if (!Rta || Rta.trim().startsWith('Array') || Rta.trim().startsWith(':')) {        
      console.error('Error de BD:', Rta);      
      logAuditoria('CONSULTAR_TODAS_RESERVAS', usuario, {        
        resultado: 'error',        
        error: 'Servicio de base de datos devolvió formato inválido'        
      });        
      return res.status(503).json({        
        message: "Servicio de base de datos devolvió formato inválido"        
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