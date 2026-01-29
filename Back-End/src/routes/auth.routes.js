import express from 'express';
import { Router } from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, TK");
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const router = Router();

async function ValidaUrs(usr, psw) {
  return new Promise(resolve=>{
    var Opt={
      method:"POST",
      headers:{
        "Content-Type": "application/x-www-form-urlencoded",
        "TK": "5a3475a6f3e5c186992f3261959a680606c799017f3a73fab8a3dce206f54e3d"
      },
      body: `CheckUsrABC=${usr}%20${psw}`
    };
    fetch("https://apps.abcrepecev.com:1901/api-abc/index.php",Opt).then(Rta0=>Rta0.text()).then(Rta=>{
      resolve(Rta)
    }).catch(error=>{
      console.error('Error',error);
      resolve('');
    });
  });
}

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Faltan datos" });
  }
  else{
    ValidaUrs(username, password).then(Rta=>{return res.json({message: Rta});});    
  }
  
});

export default router;
