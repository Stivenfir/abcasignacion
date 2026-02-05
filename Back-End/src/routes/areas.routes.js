import { Router } from "express";  
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();  
  
// Función GetData para comunicarse con la API externa  
async function GetData(P){  
  return new Promise(resolve=>{  
    var OptPet={  
      method: 'POST',  
      headers:{  
        'Content-Type': 'application/x-www-form-urlencoded',  
        TK:process.env.API_TOKEN   
      },  
      body: P.replace('/\n/g',"\\n")  
    }  
    fetch(process.env.EXTERNAL_API_URL,OptPet).then(response=>response.text()).then(Rta=>{  
      resolve(Rta)  
    }).catch(error=>{console.error("Error",error);});  
  });  
}  

function logAuditoria(accion, usuario, detalles) {  
  const timestamp = new Date().toISOString();  
  const logEntry = {  
    timestamp,  
    accion,  
    usuario,  
    ...detalles  
  };  
  console.log('[AUDIT]', JSON.stringify(logEntry));  
}


  
// GET - Obtener todas las áreas disponibles (tabla Area completa)  
router.get("/", async (req, res) => {  

  var Rta = await GetData("GetAreas=''");  
    
  console.log('Respuesta cruda:', Rta.substring(0, 200));  
    
  try{  
    var S = Rta.trim();  
    var D = JSON.parse(S.trim())["data"];  
      
    // Validar que devuelva áreas sin IdAreaPiso e IdPiso  
    console.log('Primer elemento:', D[0]);  
      
    return res.json(D);  
  }  
  catch(error){  
    console.error('Error:', error);  
    return res.status(500).json({ message: error.message });  
  }  
});  
  
// GET - Obtener áreas de un piso específico  
router.get("/piso/:idPiso", async (req, res) => {  
  const { idPiso } = req.params;  
  var Rta = await GetData(`GetAreasPiso=${idPiso}`);  
    
  // Validar respuesta antes de parsear  
  if (!Rta || Rta.trim().startsWith(':')) {  
    console.error('Error de BD:', Rta);  
    return res.status(503).json({   
      message: "Servicio de base de datos no disponible"   
    });  
  }  
    
  try{  
    var S=Rta.trim();  
    var D=JSON.parse(S.trim())["data"];  
      
    // Asegurar que devuelve array  
    if (!Array.isArray(D)) {  
      return res.json([]);  
    }  
      
    return(res.json(D));  
  }  
  catch(error){  
    console.error('Error:', error);  
    return res.status(500).json({ message: error.message });  
  }  
});
  

// POST - Asignar área a un piso  
router.post("/piso", async (req, res) => {  
  const { idArea, idPiso } = req.body;  
    
  // Validar parámetros  
  if (!idArea || !idPiso) {  
    return res.status(400).json({ error: "idArea e idPiso son requeridos" });  
  }  
    
  var Rta = await GetData(`EditABCDeskBooking=0,${idPiso},${idArea},0,0`);  
    
  // Validar respuesta antes de parsear  
  if (!Rta || Rta.trim().startsWith(':')) {  
    console.error('Error de BD:', Rta);  
    logAuditoria('ASIGNAR_AREA', 'unknown', {  
      idArea,  
      idPiso,  
      resultado: 'error',  
      error: 'Servicio de base de datos no disponible'  
    });  
    return res.status(503).json({   
      message: "Servicio de base de datos no disponible",  
      detalle: Rta   
    });  
  }  
    
  try {  
    var S = Rta.trim();  
    var D = JSON.parse(S.trim());  
      
    logAuditoria('ASIGNAR_AREA', 'unknown', {  
      idArea,  
      idPiso,  
      resultado: 'exitoso'  
    });  
      
    return res.json(D);  
  } catch(error) {  
    console.error('Error al parsear respuesta:', error);  
    console.error('Respuesta recibida:', Rta.substring(0, 200));  
      
    logAuditoria('ASIGNAR_AREA', 'unknown', {  
      idArea,  
      idPiso,  
      resultado: 'error',  
      error: error.message  
    });  
      
    return res.status(500).json({   
      message: "Error al procesar respuesta de la base de datos",  
      error: error.message   
    });  
  }  
});
  
router.delete("/piso/:idAreaPiso", authenticateToken, async (req, res) => {    
  const { idAreaPiso } = req.params;    
  const usuario = req.user.email;    
      
  var Rta = await GetData(`EditABCDeskBooking=1,0,0,0,${idAreaPiso}`);    
    
  // Validar respuesta antes de parsear  
  if (!Rta || Rta.trim().startsWith(':')) {    
    console.error('Error de BD:', Rta);    
    logAuditoria('ELIMINAR_AREA', usuario, {    
      idAreaPiso,    
      resultado: 'error',    
      error: 'Servicio de base de datos no disponible'    
    });    
    return res.status(503).json({     
      message: "Servicio de base de datos no disponible",    
      detalle: Rta     
    });    
  }  
      
  try {    
    var S = Rta.trim();    
    var D = JSON.parse(S.trim());    
        
    logAuditoria('ELIMINAR_AREA', usuario, {    
      idAreaPiso,    
      resultado: 'exitoso'    
    });    
        
    return res.json(D);    
  } catch(error) {    
    console.error('Error al parsear respuesta:', error);    
    console.error('Respuesta recibida:', Rta.substring(0, 200));    
      
    logAuditoria('ELIMINAR_AREA', usuario, {    
      idAreaPiso,    
      resultado: 'error',    
      error: error.message    
    });    
      
    return res.status(500).json({     
      message: "Error al procesar respuesta de la base de datos",    
      error: error.message     
    });    
  }    
});

// PUT - Guardar delimitación de área existente  
router.put("/piso/:idAreaPiso/delimitacion", authenticateToken, async (req, res) => {  
  const { idAreaPiso } = req.params;  
  const { coordX, coordY, ancho, alto } = req.body;  
  const usuario = req.user.email;  
    
  logAuditoria('GUARDAR_DELIMITACION', usuario, { idAreaPiso, coordX, coordY, ancho, alto });  

  try {  
    var Rta = await GetData(`EditABCDeskBooking=2,${idAreaPiso},${coordX},${coordY},${ancho},${alto}`);  
    var S = Rta.trim();  
    var D = JSON.parse(S.trim());  
      
    logAuditoria('GUARDAR_DELIMITACION', usuario, { idAreaPiso, resultado: 'success' });  
    return res.json(D);  
  } catch(error) {  
    logAuditoria('GUARDAR_DELIMITACION', usuario, { idAreaPiso, resultado: 'error', error: error.message });  
    return res.status(500).json({ message: error });  
  }  
});

//POST - CREAR nueva delimitacion (que permita multiple areas)

router.post("/piso/:idAreaPiso/delimitacion", authenticateToken, async (req, res) => {    
  const { idAreaPiso } = req.params;    
  const { coordX, coordY, ancho, alto } = req.body;    
  const usuario = req.user.email;    
      
  // Validar parámetros    
  if (!coordX || !coordY || !ancho || !alto) {    
    return res.status(400).json({ error: "Todos los parámetros son requeridos" });    
  }    
      
  logAuditoria('CREAR_DELIMITACION', usuario, { idAreaPiso, coordX, coordY, ancho, alto });    
    
  try {    

    var Rta = await GetData(`EditABCDeskBooking=3,${idAreaPiso},${coordX},${coordY},${ancho},${alto}`);    
      
    if (!Rta || Rta.trim().startsWith(':')) {  
      logAuditoria('CREAR_DELIMITACION', usuario, {   
        idAreaPiso,   
        resultado: 'error',  
        error: 'Servicio de base de datos no disponible'  
      });  
      return res.status(503).json({   
        message: "Servicio de base de datos no disponible"   
      });  
    }  
      
    var S = Rta.trim();    
    var D = JSON.parse(S.trim());    
        
    logAuditoria('CREAR_DELIMITACION', usuario, { idAreaPiso, resultado: 'success' });    
    return res.json(D);    
  } catch(error) {    
    logAuditoria('CREAR_DELIMITACION', usuario, { idAreaPiso, resultado: 'error', error: error.message });    
    return res.status(500).json({ message: error.message });    
  }    
});





  
export default router;