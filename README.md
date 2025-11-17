# Notivox - Système d'Analyse Rigoureuse de Fichiers

Notivox est une application permettant aux experts d'analyser rigoureusement des fichiers téléversés. Le système offre une plateforme complète pour la gestion des fichiers, l'authentification des experts et la documentation détaillée des analyses.

## Fonctionnalités

- **Téléversement de fichiers**: Upload sécurisé de fichiers avec validation de type et taille
- **Authentification des experts**: Système JWT pour authentifier les experts
- **Analyses rigoureuses**: Création et gestion d'analyses détaillées par des experts
- **Gestion des statuts**: Suivi du cycle de vie des fichiers (pending, in_review, approved, rejected)
- **API RESTful**: Interface complète pour toutes les opérations

## Structure du Projet

```
notivox-app/
├── index.js                 # Point d'entrée de l'application
├── package.json            # Dépendances et scripts
├── uploads/                # Dossier de stockage des fichiers téléversés
├── data/                   # Stockage des données JSON
│   ├── files.json         # Métadonnées des fichiers
│   ├── analyses.json      # Analyses des experts
│   └── experts.json       # Informations des experts
└── src/
    ├── config/
    │   └── config.js      # Configuration de l'application
    ├── models/
    │   ├── FileModel.js   # Modèle de gestion des fichiers
    │   ├── AnalysisModel.js # Modèle de gestion des analyses
    │   └── ExpertModel.js # Modèle de gestion des experts
    ├── controllers/
    │   ├── authController.js # Contrôleur d'authentification
    │   ├── fileController.js # Contrôleur de fichiers
    │   └── analysisController.js # Contrôleur d'analyses
    ├── routes/
    │   ├── auth.js        # Routes d'authentification
    │   ├── files.js       # Routes de gestion des fichiers
    │   └── analyses.js    # Routes d'analyses
    └── middleware/
        ├── auth.js        # Middleware d'authentification JWT
        └── upload.js      # Middleware de téléversement Multer
```

## Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur
npm start
```

Le serveur démarre sur le port 3000 par défaut.

## Configuration

Variables d'environnement disponibles:

- `PORT`: Port du serveur (défaut: 3000)
- `JWT_SECRET`: Clé secrète pour JWT (défaut: notivox-secret-key-change-in-production)

## Expert par Défaut

Un compte expert est créé automatiquement:

- **Email**: expert@notivox.com
- **Mot de passe**: expert123

## Documentation API

### Authentification

#### Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "expert@notivox.com",
  "password": "expert123"
}
```

Réponse:
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expert": {
      "id": "uuid",
      "email": "expert@notivox.com",
      "name": "Expert Principal",
      "specialization": "Analyse générale"
    }
  }
}
```

#### Inscription d'un nouvel expert
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "nouveau@expert.com",
  "password": "motdepasse123",
  "name": "Nom de l'expert",
  "specialization": "Spécialité"
}
```

#### Profil de l'expert connecté
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Gestion des Fichiers

#### Téléverser un fichier
```http
POST /api/files/upload
Content-Type: multipart/form-data

file: [fichier]
uploadedBy: "Nom de l'utilisateur"
description: "Description du fichier"
```

#### Lister tous les fichiers
```http
GET /api/files
Authorization: Bearer <token>

# Filtrer par statut (optionnel)
GET /api/files?status=pending
```

#### Obtenir un fichier spécifique
```http
GET /api/files/:id
Authorization: Bearer <token>
```

#### Télécharger un fichier
```http
GET /api/files/:id/download
Authorization: Bearer <token>
```

#### Mettre à jour le statut d'un fichier
```http
PATCH /api/files/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved"
}
```

Statuts disponibles: `pending`, `in_review`, `approved`, `rejected`

#### Supprimer un fichier
```http
DELETE /api/files/:id
Authorization: Bearer <token>
```

### Analyses

#### Créer une analyse
```http
POST /api/analyses
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileId": "uuid-du-fichier",
  "analysisType": "Analyse de sécurité",
  "findings": "Résultats détaillés de l'analyse...",
  "recommendation": "Recommandations basées sur l'analyse",
  "severity": "high",
  "notes": "Notes additionnelles"
}
```

Niveaux de sévérité: `low`, `medium`, `high`, `critical`

#### Lister toutes les analyses
```http
GET /api/analyses
Authorization: Bearer <token>
```

#### Obtenir mes analyses
```http
GET /api/analyses/my-analyses
Authorization: Bearer <token>
```

#### Obtenir une analyse spécifique
```http
GET /api/analyses/:id
Authorization: Bearer <token>
```

#### Obtenir les analyses d'un fichier
```http
GET /api/analyses/file/:fileId
Authorization: Bearer <token>
```

#### Mettre à jour une analyse
```http
PATCH /api/analyses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "findings": "Résultats mis à jour...",
  "recommendation": "Nouvelles recommandations"
}
```

#### Supprimer une analyse
```http
DELETE /api/analyses/:id
Authorization: Bearer <token>
```

## Types de Fichiers Autorisés

- PDF (application/pdf)
- Images: JPEG, PNG, GIF
- Documents: Word (.doc, .docx), Excel (.xls, .xlsx)
- Texte (text/plain)
- Audio: MP3, WAV
- Vidéo: MP4

Taille maximale: 50 MB

## Workflow Typique

1. **Téléversement**: Un utilisateur téléverse un fichier (statut: `pending`)
2. **Authentification**: Un expert se connecte et obtient un token JWT
3. **Consultation**: L'expert consulte les fichiers en attente
4. **Analyse**: L'expert crée une analyse détaillée (statut du fichier: `in_review`)
5. **Décision**: Le fichier est marqué comme `approved` ou `rejected` selon l'analyse
6. **Téléchargement**: Les fichiers et analyses peuvent être téléchargés si nécessaire

## Sécurité

- Authentification JWT avec expiration de 24h
- Mots de passe hashés avec bcrypt
- Validation des types de fichiers
- Limite de taille des fichiers
- Autorisation basée sur l'identité de l'expert pour les analyses

## Développement

```bash
# Démarrer en mode développement
npm start

# La route racine (/) affiche la documentation complète de l'API
http://localhost:3000/
```

## Licence

ISC

## Support

Pour toute question ou problème, veuillez créer une issue dans le dépôt du projet.
