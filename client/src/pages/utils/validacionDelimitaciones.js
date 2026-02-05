// Límite máximo de delimitaciones por área  
const MAX_DELIMITACIONES_POR_AREA = 10;  
  
// Validar que el rectángulo esté dentro de los límites del plano  
export function validarDentroDelPlano(rectangulo, canvasWidth, canvasHeight) {  
  const { x, y, width, height } = rectangulo;  
    
  if (x < 0 || y < 0) {  
    return { valido: false, mensaje: "La delimitación debe estar dentro del plano" };  
  }  
    
  if (x + width > canvasWidth || y + height > canvasHeight) {  
    return { valido: false, mensaje: "La delimitación se sale de los límites del plano" };  
  }  
    
  return { valido: true };  
}  
  
// Validar que no se superponga con otras delimitaciones  
export function validarNoSuperposicion(nuevoRect, delimitacionesExistentes) {  
  for (const delim of delimitacionesExistentes) {  
    const existente = {  
      x: Number(delim.PosicionX),  
      y: Number(delim.PosicionY),  
      width: Number(delim.Ancho),  
      height: Number(delim.Alto)  
    };  
      
    // Verificar superposición  
    if (!(nuevoRect.x + nuevoRect.width <= existente.x ||  
          nuevoRect.x >= existente.x + existente.width ||  
          nuevoRect.y + nuevoRect.height <= existente.y ||  
          nuevoRect.y >= existente.y + existente.height)) {  
      return {   
        valido: false,   
        mensaje: "La delimitación se superpone con otra existente"   
      };  
    }  
  }  
    
  return { valido: true };  
}  
  
// Validar límite máximo de delimitaciones  
export function validarLimiteDelimitaciones(delimitacionesActuales) {  
  if (delimitacionesActuales.length >= MAX_DELIMITACIONES_POR_AREA) {  
    return {   
      valido: false,   
      mensaje: `Máximo ${MAX_DELIMITACIONES_POR_AREA} delimitaciones por área`   
    };  
  }  
    
  return { valido: true };  
}  
  
// Validación completa  
export function validarDelimitacion(rectangulo, delimitacionesExistentes, canvasWidth, canvasHeight) {  
  // 1. Validar tamaño mínimo  
  if (rectangulo.width < 20 || rectangulo.height < 20) {  
    return { valido: false, mensaje: "El área debe ser más grande (mínimo 20x20 px)" };  
  }  
    
  // 2. Validar dentro del plano  
  const validacionPlano = validarDentroDelPlano(rectangulo, canvasWidth, canvasHeight);  
  if (!validacionPlano.valido) return validacionPlano;  
    
  // 3. Validar límite de delimitaciones  
  const validacionLimite = validarLimiteDelimitaciones(delimitacionesExistentes);  
  if (!validacionLimite.valido) return validacionLimite;  
    
  // 4. Validar no superposición  
  const validacionSuperposicion = validarNoSuperposicion(rectangulo, delimitacionesExistentes);  
  if (!validacionSuperposicion.valido) return validacionSuperposicion;  
    
  return { valido: true };  
}