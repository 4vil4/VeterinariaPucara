import { Router } from 'express';
const router = Router();

router.get('/health', (_req, res) => res.json({ ok:true, time:new Date().toISOString() }));
router.get('/hello', (_req, res) => res.json({ message:'Hola desde el backend 👋' }));

export default router;
