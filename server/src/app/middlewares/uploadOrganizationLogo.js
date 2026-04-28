import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../../uploads/organization-logos');

// Asegura carpeta uploads
const baseUploadsDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(baseUploadsDir)) {
  fs.mkdirSync(baseUploadsDir, { recursive: true });
}

// Asegura carpeta organization-logos
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extension =
      path.extname(file.originalname || '').toLowerCase() || '.png';

    const safeName = `organization-${req.params.id}-${Date.now()}${extension}`;
    cb(null, safeName);
  },
});

function fileFilter(_req, file, cb) {
  if (!file.mimetype?.startsWith('image/')) {
    return cb(new Error('Solo se permiten imágenes'));
  }

  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
}).single('logo');

export function uploadOrganizationLogo(req, res, next) {
  upload(req, res, (err) => {
    if (!err) {
      return next();
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          ok: false,
          message: 'La imagen supera el tamaño permitido de 3MB',
        });
      }

      return res.status(400).json({
        ok: false,
        message: 'Error al subir la imagen',
      });
    }

    return res.status(400).json({
      ok: false,
      message: err.message || 'No se pudo procesar la imagen',
    });
  });
}