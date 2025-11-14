require('dotenv').config();
const express = require('express');
const db = require('./database');
const authRoutes = require('./routes/auth');
const creditsRoutes = require('./routes/credits');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de base
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur Notivox API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      credits: {
        balance: 'GET /api/credits/balance',
        use: 'POST /api/credits/use',
        add: 'POST /api/credits/add',
        history: 'GET /api/credits/history'
      }
    },
    info: 'Tous les nouveaux utilisateurs reçoivent 30 minutes gratuites !'
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/credits', creditsRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur Notivox lancé sur le port ${PORT}`);
  console.log(`📍 API disponible sur http://localhost:${PORT}`);
  console.log(`🎁 Les nouveaux utilisateurs reçoivent ${process.env.FREE_TRIAL_MINUTES || 30} minutes gratuites`);
});

// Gérer l'arrêt propre du serveur
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  db.close((err) => {
    if (err) {
      console.error('Erreur lors de la fermeture de la base de données:', err);
    } else {
      console.log('✅ Base de données fermée');
    }
    process.exit(0);
  });
});
