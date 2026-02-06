import { Router } from "express";      
import { authenticateToken } from '../middleware/auth.middleware.js';    
  
const router = Router();      
    
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
  const logEntry = { timestamp, accion, usuario, ...detalles };      
  console.log('[AUDIT]', JSON.stringify(logEntry));      
}    
    
// GET - Obtener puestos de un área específica    
router.get("/area/:idAreaPiso", async (req, res) => {  
  const { idAreaPiso } = req.params;  
  var Rta = await GetData(`GetPuestos2=${idAreaPiso}`);  
    
  console.log('Respuesta cruda GetPuestos:', Rta.substring(0, 200));  
    
  if (!Rta || Rta.trim().startsWith(':')) {  
    console.error('Error de BD:', Rta);  
    return res.status(503).json({   
      message: "Servicio de base de datos no disponible"   
    });  
  }  
    
  try {  
    var S = Rta.trim();  
    var D = JSON.parse(S.trim())["data"];  
      
    // ✅ Normalizar: convertir cadenas vacías a null  
    const normalized = Array.isArray(D) ? D.map(puesto => ({  
      ...puesto,  
      UbicacionX: puesto.UbicacionX === '' ? null : puesto.UbicacionX,  
      UbicacionY: puesto.UbicacionY === '' ? null : puesto.UbicacionY,  
      IDClasificacionPuesto: puesto.IDClasificacionPuesto === '' ? null : puesto.IDClasificacionPuesto,  
      TieneMapeo: puesto.TieneMapeo === '' ? 0 : (puesto.TieneMapeo || 0)  
    })) : [];  
      
    console.log('Primer puesto normalizado:', normalized[0]);  
    return res.json(normalized);  
  } catch(error) {  
    console.error('Error:', error);  
    return res.status(500).json({ message: error.message });  
  }  
});  
  
// POST - Crear nuevo puesto    
router.post("/", authenticateToken, async (req, res) => {      
  const { idAreaPiso, noPuesto, ubicacionX, ubicacionY, disponible, idClasificacion } = req.body;      
  const usuario = req.user.email;      

  const tieneMapeo = (ubicacionX !== null && ubicacionY !== null) ? 1 : 0;  

  logAuditoria('CREAR_PUESTO', usuario, { idAreaPiso, noPuesto, tieneMapeo });      

  try {      
    console.log("BODY:", req.body);

    var Rta = await GetData(`EditABCDeskBooking=6,${idAreaPiso},${noPuesto},${ubicacionX || 'NULL'},${ubicacionY || 'NULL'},${idClasificacion},${tieneMapeo},0,'${disponible}'`);      


    var S = Rta.trim();


    var D = JSON.parse(S.trim());      

        
    return res.json(D);      
  } catch(error) {      
    console.error("ERROR PARSEANDO RESPUESTA:");
    console.error(error);

     
    return res.status(500).json({ message: error.message });      
  }      
});
    
// PUT - Actualizar puesto (disponibilidad y clasificación)  
router.put("/:idPuesto", authenticateToken, async (req, res) => {      
  const { idPuesto } = req.params;      
  const { disponible, idClasificacion } = req.body;      
  const usuario = req.user.email;      
        
  logAuditoria('ACTUALIZAR_PUESTO', usuario, { idPuesto });      
    
  try {      
     
    var Rta = await GetData(`EditABCDeskBooking=7,${idPuesto},${disponible},${idClasificacion}`);      
    var S = Rta.trim();      
    var D = JSON.parse(S.trim());      
          
    logAuditoria('ACTUALIZAR_PUESTO', usuario, { resultado: 'success' });      
    return res.json(D);      
  } catch(error) {      
    logAuditoria('ACTUALIZAR_PUESTO', usuario, { resultado: 'error', error: error.message });      
    return res.status(500).json({ message: error.message });      
  }      
});    
  
// ✅ NUEVO: PUT - Actualizar coordenadas del puesto (mapeo)  
router.put("/:idPuesto/mapeo", authenticateToken, async (req, res) => {  
  const { idPuesto } = req.params;  
  const { ubicacionX, ubicacionY } = req.body;  
  const usuario = req.user.email;  
    
  logAuditoria('ACTUALIZAR_MAPEO_PUESTO', usuario, { idPuesto, ubicacionX, ubicacionY });  
  
  try {  
    // Al actualizar coordenadas, marcar TieneMapeo = 1  
    var Rta = await GetData(`EditABCDeskBooking=9,${idPuesto},${ubicacionX},${ubicacionY},1`);  
    var S = Rta.trim();  
    var D = JSON.parse(S.trim());  
      
    logAuditoria('ACTUALIZAR_MAPEO_PUESTO', usuario, { resultado: 'success' });  
    return res.json(D);  
  } catch(error) {  
    logAuditoria('ACTUALIZAR_MAPEO_PUESTO', usuario, { resultado: 'error', error: error.message });  
    return res.status(500).json({ message: error.message });  
  }  
});  
    
// DELETE - Eliminar puesto    
router.delete("/:idPuesto", authenticateToken, async (req, res) => {      
  const { idPuesto } = req.params;      
  const usuario = req.user.email;      
        
  logAuditoria('ELIMINAR_PUESTO', usuario, { idPuesto });      
    
  try {      
    var Rta = await GetData(`EditABCDeskBooking=8,${idPuesto}`);      
    var S = Rta.trim();      
    var D = JSON.parse(S.trim());      
          
    logAuditoria('ELIMINAR_PUESTO', usuario, { resultado: 'success' });      
    return res.json(D);      
  } catch(error) {      
    logAuditoria('ELIMINAR_PUESTO', usuario, { resultado: 'error', error: error.message });      
    return res.status(500).json({ message: error.message });      
  }      
});    
    
export default router;