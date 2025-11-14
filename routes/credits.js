const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Obtenir le solde de crédits de l'utilisateur
router.get('/balance', authenticateToken, (req, res) => {
  db.get(
    'SELECT credits_minutes FROM users WHERE id = ?',
    [req.user.id],
    (err, row) => {
      if (err) {
        console.error('Erreur lors de la récupération du solde:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      res.json({
        credits_minutes: row.credits_minutes,
        credits_seconds: Math.floor(row.credits_minutes * 60)
      });
    }
  );
});

// Utiliser des crédits (pour les appels vocaux par exemple)
router.post('/use', authenticateToken, (req, res) => {
  const { minutes } = req.body;

  if (!minutes || minutes <= 0) {
    return res.status(400).json({ error: 'Nombre de minutes invalide' });
  }

  db.get(
    'SELECT credits_minutes FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        console.error('Erreur:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      if (user.credits_minutes < minutes) {
        return res.status(400).json({
          error: 'Crédits insuffisants',
          available: user.credits_minutes,
          required: minutes
        });
      }

      const newBalance = user.credits_minutes - minutes;

      db.run(
        'UPDATE users SET credits_minutes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newBalance, req.user.id],
        function(updateErr) {
          if (updateErr) {
            console.error('Erreur lors de la mise à jour des crédits:', updateErr);
            return res.status(500).json({ error: 'Erreur lors de la mise à jour des crédits' });
          }

          // Enregistrer dans l'historique
          db.run(
            'INSERT INTO credit_history (user_id, amount, type, description) VALUES (?, ?, ?, ?)',
            [req.user.id, -minutes, 'debit', `Utilisation de ${minutes} minute(s)`],
            (historyErr) => {
              if (historyErr) {
                console.error('Erreur lors de l\'enregistrement de l\'historique:', historyErr);
              }
            }
          );

          res.json({
            message: 'Crédits utilisés avec succès',
            used: minutes,
            remaining: newBalance
          });
        }
      );
    }
  );
});

// Obtenir l'historique des crédits
router.get('/history', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM credit_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [req.user.id],
    (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération de l\'historique:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      res.json({
        history: rows
      });
    }
  );
});

// Ajouter des crédits (pour les administrateurs ou les achats)
router.post('/add', authenticateToken, (req, res) => {
  const { minutes, description } = req.body;

  if (!minutes || minutes <= 0) {
    return res.status(400).json({ error: 'Nombre de minutes invalide' });
  }

  db.get(
    'SELECT credits_minutes FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        console.error('Erreur:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      const newBalance = user.credits_minutes + minutes;

      db.run(
        'UPDATE users SET credits_minutes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newBalance, req.user.id],
        function(updateErr) {
          if (updateErr) {
            console.error('Erreur lors de la mise à jour des crédits:', updateErr);
            return res.status(500).json({ error: 'Erreur lors de la mise à jour des crédits' });
          }

          // Enregistrer dans l'historique
          db.run(
            'INSERT INTO credit_history (user_id, amount, type, description) VALUES (?, ?, ?, ?)',
            [req.user.id, minutes, 'credit', description || `Ajout de ${minutes} minute(s)`],
            (historyErr) => {
              if (historyErr) {
                console.error('Erreur lors de l\'enregistrement de l\'historique:', historyErr);
              }
            }
          );

          res.json({
            message: 'Crédits ajoutés avec succès',
            added: minutes,
            new_balance: newBalance
          });
        }
      );
    }
  );
});

module.exports = router;
