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
  var Rta = await GetData(`GetPuestos=${idAreaPiso}`);    
      
  try{    
    var S = Rta.trim();    
    var D = JSON.parse(S.trim())["data"];    
    return res.json(D);    
  }    
  catch(error){    
    console.error('Error:', error);    
    return res.status(500).json({ message: error.message });    
  }    
});  
  
// POST - Crear nuevo puesto  
router.post("/", authenticateToken, async (req, res) => {    
  const { idAreaPiso, noPuesto, ubicacionX, ubicacionY, disponible, idClasificacion } = req.body;    
  const usuario = req.user.email;    
      
  logAuditoria('CREAR_PUESTO', usuario, { idAreaPiso, noPuesto });    
  
  try {    
    var Rta = await GetData(`EditABCDeskBooking=6,${idAreaPiso},${noPuesto},${ubicacionX},${ubicacionY},${disponible},${idClasificacion}`);    
    var S = Rta.trim();    
    var D = JSON.parse(S.trim());    
        
    logAuditoria('CREAR_PUESTO', usuario, { resultado: 'success' });    
    return res.json(D);    
  } catch(error) {    
    logAuditoria('CREAR_PUESTO', usuario, { resultado: 'error', error: error.message });    
    return res.status(500).json({ message: error.message });    
  }    
});  
  
// PUT - Actualizar puesto  
router.put("/:idPuesto", authenticateToken, async (req, res) => {    
  const { idPuesto } = req.params;    
  const { disponible, idClasificacion, ubicacionX, ubicacionY } = req.body;    
  const usuario = req.user.email;    
      
  logAuditoria('ACTUALIZAR_PUESTO', usuario, { idPuesto });    
  
  try {    
    var Rta = await GetData(`EditABCDeskBooking=7,${idPuesto},${ubicacionX},${ubicacionY},${disponible},${idClasificacion}`);    
    var S = Rta.trim();    
    var D = JSON.parse(S.trim());    
        
    logAuditoria('ACTUALIZAR_PUESTO', usuario, { resultado: 'success' });    
    return res.json(D);    
  } catch(error) {    
    logAuditoria('ACTUALIZAR_PUESTO', usuario, { resultado: 'error', error: error.message });    
    return res.status(500).json({ message: error.message });    
  }    
});  
  
// DELETE - Eliminar puesto  
router.delete("/:idPuesto", authenticateToken, async (req, res) => {    
  const { idPuesto } = req.params;    
  const usuario = req.user.email;    
      
  logAuditoria('ELIMINAR_PUESTO', usuario, { idPuesto });    
  
  try {    
    var Rta = await GetData(`EditPuesto=8,${idPuesto}`);    
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