const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');

const router = express.Router();
const SALT_ROUNDS = 10;
const FREE_TRIAL_MINUTES = parseFloat(process.env.FREE_TRIAL_MINUTES) || 30;

// Route d'inscription
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  // Validation basique de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email invalide' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
  }

  try {
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Créer l'utilisateur avec 30 minutes gratuites
    db.run(
      'INSERT INTO users (email, password, credits_minutes) VALUES (?, ?, ?)',
      [email, hashedPassword, FREE_TRIAL_MINUTES],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Cet email est déjà utilisé' });
          }
          console.error('Erreur lors de la création de l\'utilisateur:', err);
          return res.status(500).json({ error: 'Erreur lors de la création du compte' });
        }

        const userId = this.lastID;

        // Enregistrer l'attribution des crédits gratuits dans l'historique
        db.run(
          'INSERT INTO credit_history (user_id, amount, type, description) VALUES (?, ?, ?, ?)',
          [userId, FREE_TRIAL_MINUTES, 'credit', 'Crédits gratuits de bienvenue'],
          (historyErr) => {
            if (historyErr) {
              console.error('Erreur lors de l\'enregistrement de l\'historique:', historyErr);
            }
          }
        );

        // Créer un token JWT
        const token = jwt.sign(
          { id: userId, email: email },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.status(201).json({
          message: 'Compte créé avec succès',
          user: {
            id: userId,
            email: email,
            credits_minutes: FREE_TRIAL_MINUTES
          },
          token: token
        });
      }
    );
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route de connexion
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      console.error('Erreur lors de la recherche de l\'utilisateur:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    try {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      // Créer un token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Connexion réussie',
        user: {
          id: user.id,
          email: user.email,
          credits_minutes: user.credits_minutes
        },
        token: token
      });
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
});

module.exports = router;
