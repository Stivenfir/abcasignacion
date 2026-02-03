import { Router } from "express";    
import multer from 'multer';    
import path from 'path';  
import fs from 'fs/promises';  
import { fileURLToPath } from 'url';  
  
const __filename = fileURLToPath(import.meta.url);  
const __dirname = path.dirname(__filename);  
  
// 1. PRIMERO: Crear la instancia del router    
const router = Router();    
    
// 2. DESPUÉS: Configurar multer    
const storage = multer.diskStorage({    
  destination: './uploads/planos/',    
  filename: (req, file, cb) => {    
    cb(null, `piso-${req.params.idPiso}-${Date.now()}${path.extname(file.originalname)}`);    
  }    
});    
    
const upload = multer({     
  storage,    
  fileFilter: (req, file, cb) => {    
    const allowedTypes = /jpeg|jpg|png|svg/;    
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());    
    const mimetype = allowedTypes.test(file.mimetype);    
    if (mimetype && extname) return cb(null, true);    
    cb(new Error('Solo se permiten imágenes'));    
  }    
});    
    
// 3. Función GetData  
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
    
// 4. FINALMENTE: Definir las rutas    
router.get("/", (req, res) => {    
  res.json({ status: "ok", service: "desk-booking-api" });    
});    
    
// GET - Obtener lista de pisos  
router.get("/pisos", async (req, res) => {  
  var Rta = await GetData("GetPisos=''");  
  try{  
    var S=Rta.trim();  
    var D=JSON.parse(S.trim())["data"];  
    return(res.json(D));  
  }  
  catch(error){  
    console.error('Error:', error);  
    return res.status(401).json({ message: error});  
  }  
});  
  
// GET - Obtener plano de un piso específico  
router.get("/plano/:idPiso", async (req, res) => {  
  try {  
    const { idPiso } = req.params;  
    const uploadsDir = path.join(__dirname, '../../uploads/planos');  
      
    // Leer archivos en el directorio  
    const files = await fs.readdir(uploadsDir);  
      
    // Buscar archivo que coincida con el IDPiso  
    const planoFile = files.find(file => file.startsWith(`piso-${idPiso}-`));  
      
    if (planoFile) {  
      const rutaCompleta = `/uploads/planos/${planoFile}`;  
      return res.json({ success: true, ruta: rutaCompleta, archivo: planoFile });  
    } else {  
      return res.status(404).json({ error: "Plano no encontrado" });  
    }  
  } catch (error) {  
    console.error('Error al buscar plano:', error);  
    return res.status(500).json({ error: error.message });  
  }  
});  
    
// POST - Crear/subir nuevo plano  
router.post("/plano/:idPiso", upload.single('plano'), async (req, res) => {    
  try {    
    const { idPiso } = req.params;    
    const rutaArchivo = req.file.path;  
      
    // Opcional: Actualizar descripción en la API externa  
    // await GetData(`SetPlano=${idPiso}%20${rutaArchivo}`);  
      
    res.json({ success: true, ruta: rutaArchivo, mensaje: 'Plano subido exitosamente' });    
  } catch (error) {    
    res.status(500).json({ error: error.message });    
  }    
});  
  
// PUT - Actualizar plano existente  
router.put("/plano/:idPiso", upload.single('plano'), async (req, res) => {  
  try {  
    const { idPiso } = req.params;  
    const uploadsDir = path.join(__dirname, '../../uploads/planos');  
      
    // Buscar y eliminar plano anterior  
    const files = await fs.readdir(uploadsDir);  
    const oldFile = files.find(file => file.startsWith(`piso-${idPiso}-`));  
      
    if (oldFile) {  
      await fs.unlink(path.join(uploadsDir, oldFile));  
    }  
      
    // Guardar nuevo plano  
    const rutaArchivo = req.file.path;  
      
    res.json({ success: true, ruta: rutaArchivo, mensaje: "Plano actualizado exitosamente" });  
  } catch (error) {  
    console.error('Error al actualizar plano:', error);  
    res.status(500).json({ error: error.message });  
  }  
});  
  
// DELETE - Eliminar plano  
router.delete("/plano/:idPiso", async (req, res) => {  
  try {  
    const { idPiso } = req.params;  
    const uploadsDir = path.join(__dirname, '../../uploads/planos');  
      
    // Buscar archivo  
    const files = await fs.readdir(uploadsDir);  
    const planoFile = files.find(file => file.startsWith(`piso-${idPiso}-`));  
      
    if (!planoFile) {  
      return res.status(404).json({ error: "Plano no encontrado" });  
    }  
      
    // Eliminar archivo  
    await fs.unlink(path.join(uploadsDir, planoFile));  
      
    res.json({ success: true, mensaje: "Plano eliminado exitosamente" });  
  } catch (error) {  
    console.error('Error al eliminar plano:', error);  
    res.status(500).json({ error: error.message });  
  }  
});  
    
// 5. Exportar el router    
export default router;