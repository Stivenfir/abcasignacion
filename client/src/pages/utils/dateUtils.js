// client/src/utils/dateUtils.js  
  
/**  
 * Convierte una fecha a formato DD/MM/AAAA  
 * @param {Date|string} fecha - Fecha a formatear  
 * @returns {string} Fecha en formato DD/MM/AAAA  
 */  
export const formatearFechaDDMMAAAA = (fecha) => {  
  const date = fecha instanceof Date ? fecha : new Date(fecha);  
    
  const dia = String(date.getDate()).padStart(2, '0');  
  const mes = String(date.getMonth() + 1).padStart(2, '0');  
  const anio = date.getFullYear();  
    
  return `${dia}/${mes}/${anio}`;  
};  
  
/**  
 * Convierte una fecha DD/MM/AAAA a formato YYYY-MM-DD para el backend  
 * @param {string} fechaDDMMAAAA - Fecha en formato DD/MM/AAAA  
 * @returns {string} Fecha en formato YYYY-MM-DD  
 */  
export const convertirDDMMAAAAaYYYYMMDD = (fechaDDMMAAAA) => {  
  const [dia, mes, anio] = fechaDDMMAAAA.split('/');  
  return `${anio}-${mes}-${dia}`;  
};  
  
/**  
 * Convierte una fecha YYYY-MM-DD a formato DD/MM/AAAA  
 * @param {string} fechaYYYYMMDD - Fecha en formato YYYY-MM-DD  
 * @returns {string} Fecha en formato DD/MM/AAAA  
 */  
export const convertirYYYYMMDDaDDMMAAAA = (fechaYYYYMMDD) => {  
  if (!fechaYYYYMMDD) return "";

  const texto = String(fechaYYYYMMDD).trim();
  const soloFecha = texto.split(" ")[0];

  if (/^\d{4}-\d{2}-\d{2}$/.test(soloFecha)) {
    const [anio, mes, dia] = soloFecha.split('-');
    return `${dia}/${mes}/${anio}`;
  }

  const parsed = new Date(texto);
  if (!Number.isNaN(parsed.getTime())) {
    return formatearFechaDDMMAAAA(parsed);
  }

  return texto;
};  
  
/**  
 * Parsea una fecha DD/MM/AAAA a objeto Date  
 * @param {string} fechaDDMMAAAA - Fecha en formato DD/MM/AAAA  
 * @returns {Date} Objeto Date  
 */  
export const parsearFechaDDMMAAAA = (fechaDDMMAAAA) => {  
  const [dia, mes, anio] = fechaDDMMAAAA.split('/');  
  return new Date(anio, mes - 1, dia);  
};