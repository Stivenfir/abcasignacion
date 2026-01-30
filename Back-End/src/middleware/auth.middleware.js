import jwt from "jsonwebtoken";  
  
export function authenticateToken(req, res, next) {  
  const authHeader = req.headers['authorization'];  
  const token = authHeader && authHeader.split(' ')[1];  
  
  if (!token) {  
    return res.status(401).json({ message: "Token no proporcionado" });  
  }  
  
  try {  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  
    req.user = decoded;  
    next();  
  } catch (error) {  
    if (error.name === 'TokenExpiredError') {  
      return res.status(401).json({ message: "Token expirado" });  
    }  
    return res.status(403).json({ message: "Token inválido" });  
  }  
}  
  
// Middleware para verificar rol de administrador  
export function requireAdmin(req, res, next) {  
  if (req.user.role !== 'administrador') {  
    return res.status(403).json({ message: "Acceso denegado: se requiere rol de administrador" });  
  }  
  next();  
}  
  
// Middleware para verificar rol de jefe o superior  
export function requireJefe(req, res, next) {  
  if (req.user.role !== 'jefe' && req.user.role !== 'administrador') {  
    return res.status(403).json({ message: "Acceso denegado: se requiere rol de jefe o administrador" });  
  }  
  next();  
}