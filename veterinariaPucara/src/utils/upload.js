// src/utils/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// carpeta destino: src/public/uploads
const uploadDir = path.resolve(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  const ok = /^image\/(png|jpe?g|gif|webp|svg\+xml)$/.test(file.mimetype);
  cb(ok ? null : new Error('Solo se permiten imágenes (png, jpg, jpeg, gif, webp, svg).'), ok);
};

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
