import { useState } from "react";  
import Header from "../components/Header";  
import Sidebar from "../components/SidebarCustom";  
import Footer from "../components/Footer";  
  
export default function C_DashboardLayout({ children }) {  
  const [sidebarOpen, setSidebarOpen] = useState(false);  
  
  return (  
    <div className="min-h-screen bg-gray-50 flex">  
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />  
        
      <div className="flex-1 flex flex-col">  
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />  
          
        <main className="flex-1 p-6">  
          {children}  
        </main>  
          
        <Footer />  
      </div>  
    </div>  
  );  
}