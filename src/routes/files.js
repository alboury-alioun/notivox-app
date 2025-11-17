const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Route publique pour téléverser un fichier
router.post('/upload', upload.single('file'), fileController.uploadFile);

// Routes protégées (nécessitent authentification expert)
router.get('/', authMiddleware, fileController.getAllFiles);
router.get('/:id', authMiddleware, fileController.getFileById);
router.get('/:id/download', authMiddleware, fileController.downloadFile);
router.patch('/:id/status', authMiddleware, fileController.updateFileStatus);
router.delete('/:id', authMiddleware, fileController.deleteFile);

module.exports = router;
