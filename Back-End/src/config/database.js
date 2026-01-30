import sql from 'mssql';  
  
const config = {  
  server: process.env.DB_SERVER,  
  user: process.env.DB_USER,  
  password: process.env.DB_PASSWORD,  
  database: process.env.DB_DATABASE,  
  options: {  
    encrypt: process.env.DB_ENCRYPT === 'true',  
    trustServerCertificate: process.env.DB_TRUST_CERTIFICATE === 'true'  
  }  
};  
  
let pool = null;  
  
export async function getConnection() {  
  if (!pool) {  
    pool = await sql.connect(config);  
  }  
  return pool;  
}  
  
export { sql };