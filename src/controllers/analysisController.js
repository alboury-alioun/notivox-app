const AnalysisModel = require('../models/AnalysisModel');
const FileModel = require('../models/FileModel');

class AnalysisController {
  async createAnalysis(req, res) {
    try {
      const {
        fileId,
        analysisType,
        findings,
        recommendation,
        severity,
        notes
      } = req.body;

      if (!fileId || !analysisType || !findings) {
        return res.status(400).json({
          success: false,
          message: 'fileId, analysisType et findings sont requis'
        });
      }

      // Vérifier que le fichier existe
      const file = FileModel.getFileById(fileId);
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'Fichier non trouvé'
        });
      }

      const analysisData = {
        fileId,
        expertId: req.expertId,
        expertEmail: req.expertEmail,
        analysisType,
        findings,
        recommendation: recommendation || '',
        severity: severity || 'medium',
        notes: notes || '',
        status: 'completed'
      };

      const analysis = AnalysisModel.createAnalysis(analysisData);

      // Mettre à jour le statut du fichier
      FileModel.updateFile(fileId, { status: 'in_review' });

      res.status(201).json({
        success: true,
        message: 'Analyse créée avec succès',
        data: { analysis }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de l\'analyse',
        error: error.message
      });
    }
  }

  async getAllAnalyses(req, res) {
    try {
      const analyses = AnalysisModel.getAllAnalyses();

      res.json({
        success: true,
        data: { analyses, count: analyses.length }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des analyses',
        error: error.message
      });
    }
  }

  async getAnalysisById(req, res) {
    try {
      const { id } = req.params;
      const analysis = AnalysisModel.getAnalysisById(id);

      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: 'Analyse non trouvée'
        });
      }

      res.json({
        success: true,
        data: { analysis }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'analyse',
        error: error.message
      });
    }
  }

  async getAnalysesByFileId(req, res) {
    try {
      const { fileId } = req.params;
      const analyses = AnalysisModel.getAnalysesByFileId(fileId);

      res.json({
        success: true,
        data: { analyses, count: analyses.length }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des analyses',
        error: error.message
      });
    }
  }

  async getMyAnalyses(req, res) {
    try {
      const analyses = AnalysisModel.getAnalysesByExpertId(req.expertId);

      res.json({
        success: true,
        data: { analyses, count: analyses.length }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des analyses',
        error: error.message
      });
    }
  }

  async updateAnalysis(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Vérifier que l'analyse appartient à l'expert connecté
      const existingAnalysis = AnalysisModel.getAnalysisById(id);
      if (!existingAnalysis) {
        return res.status(404).json({
          success: false,
          message: 'Analyse non trouvée'
        });
      }

      if (existingAnalysis.expertId !== req.expertId) {
        return res.status(403).json({
          success: false,
          message: 'Non autorisé à modifier cette analyse'
        });
      }

      const analysis = AnalysisModel.updateAnalysis(id, updates);

      res.json({
        success: true,
        message: 'Analyse mise à jour avec succès',
        data: { analysis }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour',
        error: error.message
      });
    }
  }

  async deleteAnalysis(req, res) {
    try {
      const { id } = req.params;

      // Vérifier que l'analyse appartient à l'expert connecté
      const existingAnalysis = AnalysisModel.getAnalysisById(id);
      if (!existingAnalysis) {
        return res.status(404).json({
          success: false,
          message: 'Analyse non trouvée'
        });
      }

      if (existingAnalysis.expertId !== req.expertId) {
        return res.status(403).json({
          success: false,
          message: 'Non autorisé à supprimer cette analyse'
        });
      }

      const deleted = AnalysisModel.deleteAnalysis(id);

      res.json({
        success: true,
        message: 'Analyse supprimée avec succès'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression',
        error: error.message
      });
    }
  }
}

module.exports = new AnalysisController();
