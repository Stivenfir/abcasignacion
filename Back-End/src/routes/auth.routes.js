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
    const response = await fetch(process.env.EXTERNAL_API_URL, {  
      method: "POST",  
      headers: {  
        "Content-Type": "application/x-www-form-urlencoded",  
        "TK": process.env.API_TOKEN  
      },  
      body: `CheckUsrABC=${usr}%20${psw}`  
    });  
      
    const data = await response.text();
    if(data.includes("distinguishedName")){
      return { success: true, data: 'OK'}; 
    }
    else{
      return { success: false, error: 'Credenciales inválidas' };
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
      role: result.role || 'empleado', // Por defecto empleado  
      nombre: result.nombre || username,  
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
      role: result.role || 'empleado',  
      nombre: result.nombre || username  
    }  
  });  
});  
  
export default router;