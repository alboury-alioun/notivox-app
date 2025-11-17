const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const authMiddleware = require('../middleware/auth');

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// Routes pour les analyses
router.post('/', analysisController.createAnalysis);
router.get('/', analysisController.getAllAnalyses);
router.get('/my-analyses', analysisController.getMyAnalyses);
router.get('/:id', analysisController.getAnalysisById);
router.get('/file/:fileId', analysisController.getAnalysesByFileId);
router.patch('/:id', analysisController.updateAnalysis);
router.delete('/:id', analysisController.deleteAnalysis);

module.exports = router;
