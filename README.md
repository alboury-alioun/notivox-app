# Notivox API

API REST pour l'application Notivox avec système de crédits gratuits pour les nouveaux utilisateurs.

## Fonctionnalités

- Inscription et connexion des utilisateurs avec JWT
- Attribution automatique de **30 minutes gratuites** pour chaque nouvel utilisateur
- Gestion des crédits (consultation, utilisation, ajout)
- Historique complet des transactions de crédits
- Base de données SQLite intégrée

## Installation

```bash
npm install
```

## Configuration

Créez un fichier `.env` à la racine du projet (ou modifiez celui existant) :

```env
JWT_SECRET=votre_secret_jwt_a_changer_en_production
PORT=3000
FREE_TRIAL_MINUTES=30
```

## Démarrage

```bash
npm start
```

Le serveur sera accessible sur `http://localhost:3000`

## API Endpoints

### Authentification

#### Inscription
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "utilisateur@example.com",
  "password": "motdepasse123"
}
```

**Réponse :**
```json
{
  "message": "Compte créé avec succès",
  "user": {
    "id": 1,
    "email": "utilisateur@example.com",
    "credits_minutes": 30
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Connexion
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "utilisateur@example.com",
  "password": "motdepasse123"
}
```

### Gestion des crédits

Toutes les routes de crédits nécessitent un token d'authentification dans le header :
```
Authorization: Bearer <votre_token>
```

#### Consulter le solde
```bash
GET /api/credits/balance
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "credits_minutes": 30,
  "credits_seconds": 1800
}
```

#### Utiliser des crédits
```bash
POST /api/credits/use
Authorization: Bearer <token>
Content-Type: application/json

{
  "minutes": 5
}
```

**Réponse :**
```json
{
  "message": "Crédits utilisés avec succès",
  "used": 5,
  "remaining": 25
}
```

#### Ajouter des crédits
```bash
POST /api/credits/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "minutes": 10,
  "description": "Achat de crédits"
}
```

#### Consulter l'historique
```bash
GET /api/credits/history
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "history": [
    {
      "id": 2,
      "user_id": 1,
      "amount": -5,
      "type": "debit",
      "description": "Utilisation de 5 minute(s)",
      "created_at": "2025-11-14 19:35:58"
    },
    {
      "id": 1,
      "user_id": 1,
      "amount": 30,
      "type": "credit",
      "description": "Crédits gratuits de bienvenue",
      "created_at": "2025-11-14 19:35:39"
    }
  ]
}
```

## Structure du projet

```
notivox-app/
├── index.js              # Point d'entrée de l'application
├── database.js           # Configuration de la base de données SQLite
├── middleware/
│   └── auth.js          # Middleware d'authentification JWT
├── routes/
│   ├── auth.js          # Routes d'authentification
│   └── credits.js       # Routes de gestion des crédits
├── .env                 # Variables d'environnement
├── .gitignore          # Fichiers à ignorer par Git
└── package.json        # Dépendances du projet
```

## Base de données

L'application utilise SQLite avec deux tables principales :

### Table `users`
- `id` : Identifiant unique
- `email` : Email de l'utilisateur (unique)
- `password` : Mot de passe hashé (bcrypt)
- `credits_minutes` : Solde de crédits en minutes (défaut: 30)
- `created_at` : Date de création
- `updated_at` : Date de dernière modification

### Table `credit_history`
- `id` : Identifiant unique
- `user_id` : Référence à l'utilisateur
- `amount` : Montant (positif pour crédit, négatif pour débit)
- `type` : Type de transaction ('credit' ou 'debit')
- `description` : Description de la transaction
- `created_at` : Date de la transaction

## Sécurité

- Mots de passe hashés avec bcrypt (10 rounds)
- Authentification par JWT avec expiration de 7 jours
- Validation des emails et mots de passe
- Gestion des erreurs sécurisée

## Exemples d'utilisation avec curl

### Créer un compte
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@notivox.com","password":"password123"}'
```

### Se connecter
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@notivox.com","password":"password123"}'
```

### Vérifier son solde
```bash
curl -X GET http://localhost:3000/api/credits/balance \
  -H "Authorization: Bearer <votre_token>"
```

### Utiliser des crédits
```bash
curl -X POST http://localhost:3000/api/credits/use \
  -H "Authorization: Bearer <votre_token>" \
  -H "Content-Type: application/json" \
  -d '{"minutes":5}'
```

## Notes importantes

- Les 30 minutes gratuites sont automatiquement attribuées lors de l'inscription
- Chaque transaction est enregistrée dans l'historique
- Le token JWT doit être inclus dans toutes les requêtes protégées
- Changez le `JWT_SECRET` en production pour des raisons de sécurité

## Licence

MIT
