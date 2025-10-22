import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../prisma"; // adjust your import
const r = Router();

const SALT_ROUNDS = parseInt(process.env.AUTH_SALT_ROUNDS || "10", 10);

r.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({ data: { email, name: name || null, hash, role: "user" } });

    // set session
    (req.session as any).uid = user.id;
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (e:any) {
    console.error(e);
    res.status(500).json({ error: "Failed to register" });
  }
});

r.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    (req.session as any).uid = user.id;
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (e:any) {
    console.error(e);
    res.status(500).json({ error: "Failed to login" });
  }
});

r.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

r.get("/me", async (req, res) => {
  const uid = (req.session as any).uid;
  if (!uid) return res.status(200).json(null);
  const user = await prisma.user.findUnique({ where: { id: uid }, select: { id: true, email: true, name: true, role: true }});
  res.json(user || null);
});

export default r;