const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Créer ou ouvrir la base de données
const db = new sqlite3.Database(path.join(__dirname, 'notivox.db'), (err) => {
  if (err) {
    console.error('Erreur lors de la connexion à la base de données:', err);
  } else {
    console.log('Connecté à la base de données SQLite');
    initializeDatabase();
  }
});

// Initialiser le schéma de la base de données
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      credits_minutes REAL DEFAULT 30,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Erreur lors de la création de la table users:', err);
    } else {
      console.log('Table users créée ou déjà existante');
    }
  });

  // Table pour l'historique d'utilisation des crédits
  db.run(`
    CREATE TABLE IF NOT EXISTS credit_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Erreur lors de la création de la table credit_history:', err);
    } else {
      console.log('Table credit_history créée ou déjà existante');
    }
  });
}

module.exports = db;
