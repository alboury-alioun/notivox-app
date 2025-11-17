const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./src/config/config');

// Importer les routes
const authRoutes = require('./src/routes/auth');
const fileRoutes = require('./src/routes/files');
const analysisRoutes = require('./src/routes/analyses');

// Créer l'application Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// S'assurer que les dossiers nécessaires existent
const requiredDirs = [config.uploadPath, config.dataPath];
requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Route de bienvenue
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur Notivox - Système d\'analyse rigoureuse de fichiers par des experts',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        profile: 'GET /api/auth/profile'
      },
      files: {
        upload: 'POST /api/files/upload',
        list: 'GET /api/files',
        getById: 'GET /api/files/:id',
        download: 'GET /api/files/:id/download',
        updateStatus: 'PATCH /api/files/:id/status',
        delete: 'DELETE /api/files/:id'
      },
      analyses: {
        create: 'POST /api/analyses',
        list: 'GET /api/analyses',
        myAnalyses: 'GET /api/analyses/my-analyses',
        getById: 'GET /api/analyses/:id',
        getByFileId: 'GET /api/analyses/file/:fileId',
        update: 'PATCH /api/analyses/:id',
        delete: 'DELETE /api/analyses/:id'
      }
    },
    defaultExpert: {
      email: 'expert@notivox.com',
      password: 'expert123',
      note: 'Utilisez ces identifiants pour tester l\'authentification'
    }
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/analyses', analysisRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur'
  });
});

// Démarrer le serveur
app.listen(config.port, () => {
  console.log(`🚀 Serveur Notivox lancé sur le port ${config.port}`);
  console.log(`📁 Chemin des uploads: ${config.uploadPath}`);
  console.log(`📊 Chemin des données: ${config.dataPath}`);
  console.log(`👤 Expert par défaut: expert@notivox.com / expert123`);
  console.log(`📖 Documentation API: http://localhost:${config.port}/`);
});
