import { Router } from "express";  
  
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
  var Rta = await GetData(`SetAreaPiso=${idArea}%20${idPiso}`);  
  try{  
    var S=Rta.trim();  
    var D=JSON.parse(S.trim());  
    return(res.json(D));  
  }  
  catch(error){  
    console.error('Error:', error);  
    return res.status(500).json({ message: error});  
  }  
});  
  
// DELETE - Eliminar área de un piso  
router.delete("/piso/:idAreaPiso", async (req, res) => {  
  const { idAreaPiso } = req.params;  
  var Rta = await GetData(`DeleteAreaPiso=${idAreaPiso}`);  
  try{  
    var S=Rta.trim();  
    var D=JSON.parse(S.trim());  
    return(res.json(D));  
  }  
  catch(error){  
    console.error('Error:', error);  
    return res.status(500).json({ message: error});  
  }  
});  
  
export default router;