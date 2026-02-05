// client/src/api/client.js  
import { logError, handleAPIResponse, APIError } from '../utils/errorHandler';  
  
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";  
  
export async function fetchWithAuth(endpoint, options = {}) {  
  const token = localStorage.getItem("token");  
    
  const headers = {  
    "Content-Type": "application/json",  
    ...options.headers,  
  };  
    
  if (token) {  
    headers["Authorization"] = `Bearer ${token}`;  
  }  
    
  try {  
    const response = await fetch(`${API}${endpoint}`, {  
      ...options,  
      headers,  
    });  
      
    if (response.status === 401 || response.status === 403) {  
      const error = new APIError(  
        'Sesión expirada',   
        response.status,   
        endpoint  
      );  
      logError(error, { action: 'fetchWithAuth' });  
        
      localStorage.removeItem("token");  
      window.location.href = "/login";  
      throw error;  
    }  
      
    await handleAPIResponse(response, `${options.method || 'GET'} ${endpoint}`);  
    return response;  
  } catch (error) {  
    if (!(error instanceof APIError)) {  
      logError(error, { endpoint, options });  
    }  
    throw error;  
  }  
}