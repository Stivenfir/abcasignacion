import { Router } from "express";  
import jwt from "jsonwebtoken";  
  
const router = Router();  
  
// Solo deshabilitar TLS en desarrollo  
if (process.env.NODE_ENV === 'development') {  
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';  
}  
  
// Usuarios de prueba para desarrollo  
const MOCK_USERS = {  
  'admin': {   
    password: 'admin123',   
    role: 'administrador',  
    nombre: 'Admin Test'  
  },  
  'jefe': {   
    password: 'jefe123',   
    role: 'jefe',  
    nombre: 'Jefe Test'  
  },  
  'empleado': {   
    password: 'empleado123',   
    role: 'empleado',  
    nombre: 'Empleado Test'  
  }  
};  
  
async function ValidaUrs(usr, psw) {  
  // En desarrollo, primero verificar usuarios mock  
  if (process.env.NODE_ENV === 'development' && MOCK_USERS[usr]) {  
    if (MOCK_USERS[usr].password === psw) {  
      return {   
        success: true,   
        data: 'OK',  
        role: MOCK_USERS[usr].role,  
        nombre: MOCK_USERS[usr].nombre  
      };  
    }  
    return { success: false, error: 'Credenciales inválidas' };  
  }  
  
  // Si no es usuario mock, validar con API externa  
  try {  

    const cabeceras= {  
      "Content-Type": "application/x-www-form-urlencoded",  
      "TK": process.env.API_TOKEN
    }

    const url=process.env.EXTERNAL_API_URL
    var response = await fetch(url, {method: "POST", headers: cabeceras, body: `CheckUsrABC=${usr}%20${psw}`});
    var S = await response.text();
    if(!S.includes("distinguishedName")){
      //console.log(S)
      return { success: false, error: 'Credenciales inválidas' };      
    }
    else{

      response = await fetch(url, {method: "POST", headers:cabeceras, body:`CheckRollABC='${usr}'`});
      S = await response.text();
      if(!S.includes("Usuario")){
        return { success: false, error: 'Imposible obtener el tipo de usuario'};
      }
      else{
        const data=JSON.parse(S.trim())["data"][0]; 
        //console.log(data);
        return {success: true, data:'OK',Type:data["IdRol"]}; 
      }
      
      

    }  
     
  } catch (error) {  
    console.error('Error validando usuario:', error);  
    return { success: false, error: error.message };  
  }  
}  
  
router.post("/login", async (req, res) => {  
  const { username, password } = req.body;  
  
  if (!username || !password) {  
    return res.status(400).json({ message: "Faltan datos" });  
  }  
  
  const result = await ValidaUrs(username, password);  
    
  if (!result.success) {  
    return res.status(401).json({ message: "Credenciales inválidas" });  
  }  
  
  // Generar JWT con información de rol  
  const token = jwt.sign(  
    {   
      username,   
      role: result.Type,
      timestamp: Date.now()   
    },  
    process.env.JWT_SECRET,  
    { expiresIn: '8h' }  
  );  
  
  return res.json({  
    message: result.data,  
    token,  
    user: {  
      username,  
      role: result.Type,  
      nombre: result.nombre || username  
    }  
  });  
});  
  
export default router;