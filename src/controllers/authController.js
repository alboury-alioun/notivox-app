const jwt = require('jsonwebtoken');
const ExpertModel = require('../models/ExpertModel');
const config = require('../config/config');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email et mot de passe requis'
        });
      }

      const expert = await ExpertModel.verifyPassword(email, password);

      if (!expert) {
        return res.status(401).json({
          success: false,
          message: 'Identifiants invalides'
        });
      }

      const token = jwt.sign(
        { expertId: expert.id, email: expert.email },
        config.jwtSecret,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Connexion réussie',
        data: {
          token,
          expert
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la connexion',
        error: error.message
      });
    }
  }

  async register(req, res) {
    try {
      const { email, password, name, specialization } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: 'Email, mot de passe et nom requis'
        });
      }

      const expert = await ExpertModel.createExpert({
        email,
        password,
        name,
        specialization
      });

      res.status(201).json({
        success: true,
        message: 'Expert créé avec succès',
        data: { expert }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getProfile(req, res) {
    try {
      const expert = ExpertModel.getExpertById(req.expertId);

      if (!expert) {
        return res.status(404).json({
          success: false,
          message: 'Expert non trouvé'
        });
      }

      res.json({
        success: true,
        data: { expert }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du profil',
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
