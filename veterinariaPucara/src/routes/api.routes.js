import { Router } from 'express';
import { ownersList, petsByOwner } from '../controllers/api.controller.js';
import { pool } from '../utils/db.js';

const router = Router();

// /api/owners       -> sin q => lista completa 
// /api/owners?q=pa  -> con q  => búsqueda por nombre desde DB
router.get('/owners', async (req, res, next) => {
  const q = String(req.query.q || '').trim();
  if (!q) return ownersList(req, res, next);

  const like = `%${q}%`;
  const [rows] = await pool.query(
    'SELECT id, name FROM users WHERE name LIKE ? ORDER BY name LIMIT 50',
    [like]
  );
  res.json(rows);
});

router.get('/owners/:ownerId/pets', petsByOwner);

export default router;
