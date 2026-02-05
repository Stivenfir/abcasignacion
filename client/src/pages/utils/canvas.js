// client/src/utils/canvas.js  
  
export const COLORS = [  
  { stroke: "#3B82F6", fill: "rgba(59, 130, 246, 0.15)" },  
  { stroke: "#10B981", fill: "rgba(16, 185, 129, 0.15)" },  
  { stroke: "#F59E0B", fill: "rgba(245, 158, 11, 0.15)" },  
  { stroke: "#EF4444", fill: "rgba(239, 68, 68, 0.15)" },  
  { stroke: "#8B5CF6", fill: "rgba(139, 92, 246, 0.15)" },  
  { stroke: "#EC4899", fill: "rgba(236, 72, 153, 0.15)" },  
];  
  
export function normalizarRect(r) {  
  const x = Math.min(r.startX, r.endX);  
  const y = Math.min(r.startY, r.endY);  
  const width = Math.abs(r.endX - r.startX);  
  const height = Math.abs(r.endY - r.startY);  
  return { x, y, width, height };  
}  
  
// NUEVO: Dibujar múltiples delimitaciones por área  
export function dibujarDelimitaciones(canvasRef, delimitaciones, areas, areasPiso) {  
  if (!canvasRef.current) return;  
    
  const canvas = canvasRef.current;  
  const ctx = canvas.getContext("2d");  
  ctx.clearRect(0, 0, canvas.width, canvas.height);  
    
  areasPiso.forEach((areaPiso, areaIndex) => {  
    const area = areas.find(a => a.IdArea === areaPiso.IdArea);  
    const delims = delimitaciones[areaPiso.IdAreaPiso] || [];  
    const color = COLORS[areaIndex % COLORS.length];  
      
    delims.forEach((delim, delimIndex) => {  
      ctx.strokeStyle = color.stroke;  
      ctx.lineWidth = 3;  
      ctx.fillStyle = color.fill;  
        
      ctx.fillRect(delim.PosicionX, delim.PosicionY, delim.Ancho, delim.Alto);  
      ctx.strokeRect(delim.PosicionX, delim.PosicionY, delim.Ancho, delim.Alto);  
        
      // Etiqueta con número de instancia  
      ctx.fillStyle = color.stroke;  
      ctx.font = 'bold 14px Arial';  
      ctx.fillText(  
        `${area?.NombreArea} #${delimIndex + 1}`,  
        delim.PosicionX + 5,  
        delim.PosicionY + 20  
      );  
    });  
  });  
}  
  
export function dibujarRectanguloActual(canvasRef, rectangulo) {  
  if (!canvasRef.current || !rectangulo) return;  
    
  const canvas = canvasRef.current;  
  const ctx = canvas.getContext("2d");  
    
  const r = rectangulo.x !== undefined ? rectangulo : normalizarRect(rectangulo);  
    
  ctx.strokeStyle = "#3B82F6";  
  ctx.lineWidth = 3;  
  ctx.fillStyle = "rgba(59, 130, 246, 0.2)";  
  ctx.fillRect(r.x, r.y, r.width, r.height);  
  ctx.strokeRect(r.x, r.y, r.width, r.height);  
}