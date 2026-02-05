const isDevelopment = import.meta.env.MODE === 'development';  
  
export class APIError extends Error {  
  constructor(message, status, endpoint, details = {}) {  
    super(message);  
    this.name = 'APIError';  
    this.status = status;  
    this.endpoint = endpoint;  
    this.details = details;  
    this.timestamp = new Date().toISOString();  
  }  
}  
  
export function logError(error, context = {}) {  
  const errorLog = {  
    timestamp: new Date().toISOString(),  
    type: error.name || 'Error',  
    message: error.message,  
    status: error.status,  
    endpoint: error.endpoint,  
    context,  
    stack: isDevelopment ? error.stack : undefined  
  };  
  
  // Logging con colores según el tipo de error  
  const styles = {  
    400: 'color: #F59E0B; font-weight: bold', // Amarillo - Bad Request  
    401: 'color: #EF4444; font-weight: bold', // Rojo - No autorizado  
    403: 'color: #DC2626; font-weight: bold', // Rojo oscuro - Prohibido  
    404: 'color: #8B5CF6; font-weight: bold', // Morado - No encontrado  
    500: 'color: #DC2626; font-weight: bold', // Rojo - Error servidor  
    503: 'color: #F97316; font-weight: bold'  // Naranja - Servicio no disponible  
  };  
  
  const style = styles[error.status] || 'color: #6B7280; font-weight: bold';  
    
  console.group(`%c[${error.status || 'ERROR'}] ${error.endpoint || 'Unknown endpoint'}`, style);  
  console.error('Message:', error.message);  
  console.error('Details:', errorLog);  
  if (isDevelopment && error.stack) {  
    console.error('Stack:', error.stack);  
  }  
  console.groupEnd();  
  
  return errorLog;  
}  
  
export async function handleAPIResponse(response, endpoint) {  
  if (!response.ok) {  
    let errorMessage = 'Error en la petición';  
    let details = {};  
  
    try {  
      const data = await response.json();  
      errorMessage = data.message || data.error || errorMessage;  
      details = data;  
    } catch (e) {  
      errorMessage = response.statusText;  
    }  
  
    const error = new APIError(errorMessage, response.status, endpoint, details);  
    logError(error);  
    throw error;  
  }  
  
  return response;  
}