# Notivox

Application web d'enregistrement audio avec transcription automatique et génération de rapports intelligents utilisant OpenAI Whisper et GPT.

## Fonctionnalités

- Enregistrement audio jusqu'à **120 minutes**
- Transcription automatique avec **OpenAI Whisper**
- Génération de rapports structurés avec **GPT-4o-mini**
- Interface utilisateur moderne et intuitive
- Minuteur en temps réel
- Arrêt automatique à la limite de temps
- Téléchargement des rapports générés

## Installation

1. Clonez le repository
2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez votre clé API OpenAI :
   ```bash
   cp .env.example .env
   ```
   Éditez le fichier `.env` et ajoutez votre clé API OpenAI.

## Configuration

Créez un fichier `.env` à la racine du projet avec :

```
OPENAI_API_KEY=sk-votre-cle-api-ici
PORT=3000
```

Pour obtenir une clé API OpenAI :
1. Visitez https://platform.openai.com/api-keys
2. Créez un nouveau projet ou utilisez un existant
3. Générez une nouvelle clé API
4. Copiez la clé dans votre fichier `.env`

## Utilisation

1. Démarrez le serveur :
   ```bash
   npm start
   ```

2. Ouvrez votre navigateur à l'adresse : http://localhost:3000

3. Utilisez l'interface pour :
   - Cliquer sur "Démarrer l'enregistrement" pour commencer
   - Parler dans votre microphone (max 120 minutes)
   - Cliquer sur "Arrêter" quand vous avez terminé
   - Cliquer sur "Générer le rapport" pour obtenir la transcription et le rapport
   - Télécharger le rapport si souhaité

## Structure du projet

```
notivox-app/
├── index.js           # Serveur Express et API
├── package.json       # Dépendances du projet
├── .env              # Configuration (non versionné)
├── .env.example      # Exemple de configuration
├── public/           # Frontend
│   ├── index.html    # Interface utilisateur
│   ├── style.css     # Styles
│   └── app.js        # Logique client
└── uploads/          # Fichiers audio temporaires (auto-nettoyés)
```

## API Endpoints

### `GET /`
Affiche l'interface utilisateur principale

### `POST /api/transcribe`
Transcrit un fichier audio et génère un rapport

**Body (multipart/form-data):**
- `audio`: Fichier audio (webm, mp3, wav, m4a, ogg, mp4)

**Response:**
```json
{
  "success": true,
  "rapport": "Rapport généré...",
  "duree": 120.5,
  "langue": "fr"
}
```

### `GET /api/health`
Vérifie l'état du serveur

**Response:**
```json
{
  "status": "ok",
  "openai_configured": true,
  "max_duration_minutes": 120
}
```

## Technologies utilisées

- **Backend:**
  - Node.js
  - Express.js
  - Multer (upload de fichiers)
  - OpenAI API (Whisper + GPT-4o-mini)

- **Frontend:**
  - HTML5 / CSS3
  - JavaScript (MediaRecorder API)
  - Design responsive

## Limites

- Durée maximale d'enregistrement : **120 minutes**
- Taille maximale de fichier : **500 MB**
- Formats audio supportés : webm, mp3, wav, m4a, ogg, mp4

## Notes importantes

- Les fichiers audio sont automatiquement supprimés après traitement
- La transcription nécessite une connexion internet
- Une clé API OpenAI valide est requise
- Les coûts d'API OpenAI s'appliquent selon votre utilisation

## Dépannage

### "Impossible d'accéder au microphone"
- Vérifiez les permissions du navigateur
- Utilisez HTTPS en production (requis pour MediaRecorder)
- Testez avec un navigateur moderne (Chrome, Firefox, Edge)

### "Clé API OpenAI non configurée"
- Vérifiez que le fichier `.env` existe
- Vérifiez que `OPENAI_API_KEY` est défini correctement
- Redémarrez le serveur après modification du `.env`

### "Erreur lors de la transcription"
- Vérifiez votre quota API OpenAI
- Vérifiez la taille du fichier audio
- Vérifiez votre connexion internet

## Licence

MIT
