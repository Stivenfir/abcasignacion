import { Router } from "express";

const router = Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  // MOCK: luego se reemplaza por LDAP real
  return res.json({
    token: `dev-token-${username}`,
    user: { username }
  });
});

export default router;
