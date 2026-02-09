// Back-End/src/routes/auth.routes.js  
import { Router } from "express";    
import jwt from "jsonwebtoken";    
    
const router = Router();    
    
if (process.env.NODE_ENV === 'development') {    
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';    
}    
    
const MOCK_USERS = {    
  'admin': {     
    password: 'admin123',     
    role: 'administrador',    
    nombre: 'Admin Test',  
    idEmpleado: 1  // ✅ Agregar ID  
  },    
  'jefe': {     
    password: 'jefe123',     
    role: 'jefe',    
    nombre: 'Jefe Test',  
    idEmpleado: 2  // ✅ Agregar ID  
  },    
  'empleado': {     
    password: 'empleado123',     
    role: 'empleado',    
    nombre: 'Empleado Test',  
    idEmpleado: 3  // ✅ Agregar ID  
  }    
};    
    
async function ValidaUrs(usr, psw) {    
  if (process.env.NODE_ENV === 'development' && MOCK_USERS[usr]) {    
    if (MOCK_USERS[usr].password === psw) {    
      return {     
        success: true,     
        data: 'OK',    
        role: MOCK_USERS[usr].role,    
        nombre: MOCK_USERS[usr].nombre,  
        idEmpleado: MOCK_USERS[usr].idEmpleado  // ✅ Incluir en respuesta  
      };    
    }    
    return { success: false, error: 'Credenciales inválidas' };    
  }    
    
  try {    
    const cabeceras = {    
      "Content-Type": "application/x-www-form-urlencoded",    
      "TK": process.env.API_TOKEN  
    }  
  
    const url = process.env.EXTERNAL_API_URL;  
    var response = await fetch(url, {  
      method: "POST",   
      headers: cabeceras,   
      body: `CheckUsrABC=${usr}%20${psw}`  
    });  
      
    var S = await response.text();  
      
    if (!S.includes("distinguishedName")) {  
      return { success: false, error: 'Credenciales inválidas' };        
    }  
  
    response = await fetch(url, {  
      method: "POST",   
      headers: cabeceras,   
      body: `CheckRollABC='${usr}'`  
    });  
      
    S = await response.text();  
      
    if (!S.includes("Usuario")) {  
      return { success: false, error: 'Imposible obtener el tipo de usuario'};  
    }  
      
    const data = JSON.parse(S.trim())["data"][0];   
    console.log(S)
    return {  
      success: true,   
      data: 'OK',  
      Type: data["IdRol"],  
      idEmpleado: data["IdEmpleado"],  // ✅ Agregar desde API  
      nombre: data["Nombre"] || usr     // ✅ También el nombre si está disponible  
      
    };   
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
    
  // ✅ Ahora result.idEmpleado estará disponible  
  const token = jwt.sign(    
    {     
      username,     
      idEmpleado: result.idEmpleado,  // ✅ Ya no será undefined  
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
      nombre: result.nombre || username,  
      idEmpleado: result.idEmpleado  // ✅ También incluir en respuesta  
    }    
  });    
});    
    
export default router;