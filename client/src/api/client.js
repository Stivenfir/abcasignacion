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
    
  const response = await fetch(`${API}${endpoint}`, {  
    ...options,  
    headers,  
  });  
    
  if (response.status === 401 || response.status === 403) {  
    localStorage.removeItem("token");  
    window.location.href = "/login";  
    throw new Error("Sesión expirada");  
  }  
    
  return response;  
}