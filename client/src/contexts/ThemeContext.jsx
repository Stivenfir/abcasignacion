import { createContext, useState } from "react";  
  
export const ThemeContext = createContext();  
  
export function ThemeProvider({ children }) {  
  const [darkMode, setDarkMode] = useState(false);  
    
  return (  
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>  
      <div className={darkMode ? 'dark' : ''}>  
        {children}  
      </div>  
    </ThemeContext.Provider>  
  );  
}