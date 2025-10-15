import { Router } from 'express';
const router = Router();

router.get('/', (_req,res) => {
  res.json([{ id:1, fecha:'2025-10-13T09:00:00', triage_nivel:'III' }]);
});

export default router;
