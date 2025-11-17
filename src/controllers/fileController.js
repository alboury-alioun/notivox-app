const FileModel = require('../models/FileModel');
const path = require('path');
const fs = require('fs');

class FileController {
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni'
        });
      }

      const fileData = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.body.uploadedBy || 'Anonymous',
        description: req.body.description || ''
      };

      const file = FileModel.createFile(fileData);

      res.status(201).json({
        success: true,
        message: 'Fichier téléversé avec succès',
        data: { file }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors du téléversement',
        error: error.message
      });
    }
  }

  async getAllFiles(req, res) {
    try {
      const { status } = req.query;
      let files;

      if (status) {
        files = FileModel.getFilesByStatus(status);
      } else {
        files = FileModel.getAllFiles();
      }

      res.json({
        success: true,
        data: { files, count: files.length }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des fichiers',
        error: error.message
      });
    }
  }

  async getFileById(req, res) {
    try {
      const { id } = req.params;
      const file = FileModel.getFileById(id);

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'Fichier non trouvé'
        });
      }

      res.json({
        success: true,
        data: { file }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du fichier',
        error: error.message
      });
    }
  }

  async downloadFile(req, res) {
    try {
      const { id } = req.params;
      const file = FileModel.getFileById(id);

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'Fichier non trouvé'
        });
      }

      if (!fs.existsSync(file.path)) {
        return res.status(404).json({
          success: false,
          message: 'Fichier physique non trouvé'
        });
      }

      res.download(file.path, file.originalName);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors du téléchargement',
        error: error.message
      });
    }
  }

  async updateFileStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'in_review', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Statut invalide'
        });
      }

      const file = FileModel.updateFile(id, { status });

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'Fichier non trouvé'
        });
      }

      res.json({
        success: true,
        message: 'Statut mis à jour',
        data: { file }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour',
        error: error.message
      });
    }
  }

  async deleteFile(req, res) {
    try {
      const { id } = req.params;
      const deleted = FileModel.deleteFile(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Fichier non trouvé'
        });
      }

      res.json({
        success: true,
        message: 'Fichier supprimé avec succès'
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

module.exports = new FileController();
