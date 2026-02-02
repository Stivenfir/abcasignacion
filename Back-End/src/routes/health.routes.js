import { Router } from "express";
import * as db from "../config/database.js";

console.log("DB exports:", Object.keys(db)); // debe mostrar: ['getConnection','sql']

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

router.get("/", (req, res) => {
  res.json({ status: "ok", service: "desk-booking-api" });
});

// Ruta de prueba de DB
router.get("/db-test", async (req, res) => {
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

export default router;
