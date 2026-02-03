import { Router } from "express";    
import multer from 'multer';    
import path from 'path';    
    
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
    
router.post("/plano/:idPiso", upload.single('plano'), async (req, res) => {    
  try {    
    const { idPiso } = req.params;    
    const rutaArchivo = req.file.path;    
    res.json({ success: true, ruta: rutaArchivo });    
  } catch (error) {    
    res.status(500).json({ error: error.message });    
  }    
});    
    
// 5. Exportar el router    
export default router;