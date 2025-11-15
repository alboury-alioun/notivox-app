require('dotenv').config();
const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration du stockage pour les uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `audio-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500 MB limite (pour 120 minutes d'audio)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /webm|mp3|wav|m4a|ogg|mp4/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Format audio non supporté. Formats acceptés: webm, mp3, wav, m4a, ogg, mp4'));
    }
  }
});

// Route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route pour transcrire et générer un rapport
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier audio fourni' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Clé API OpenAI non configurée' });
  }

  const audioFilePath = req.file.path;

  try {
    console.log(`Transcription en cours pour: ${req.file.filename}`);

    // Transcription avec Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: 'whisper-1',
      language: 'fr', // Français par défaut
      response_format: 'verbose_json'
    });

    console.log('Transcription terminée');

    // Génération du rapport sans afficher la transcription complète
    const rapport = await genererRapport(transcription);

    // Supprimer le fichier audio après traitement
    fs.unlinkSync(audioFilePath);

    res.json({
      success: true,
      rapport: rapport,
      duree: transcription.duration,
      langue: transcription.language
    });

  } catch (error) {
    console.error('Erreur lors de la transcription:', error);

    // Nettoyer le fichier en cas d'erreur
    if (fs.existsSync(audioFilePath)) {
      fs.unlinkSync(audioFilePath);
    }

    res.status(500).json({
      error: 'Erreur lors de la transcription',
      details: error.message
    });
  }
});

// Fonction pour générer un rapport basé sur la transcription
async function genererRapport(transcription) {
  try {
    const prompt = `Tu es un assistant qui génère des rapports structurés à partir de transcriptions audio.
Voici une transcription d'un enregistrement audio :

"${transcription.text}"

Génère un rapport professionnel structuré qui inclut :
1. Un résumé exécutif (2-3 phrases)
2. Les points clés abordés (liste à puces)
3. Les actions ou décisions importantes mentionnées
4. Une conclusion

Ne cite pas directement la transcription, reformule et structure l'information de manière professionnelle.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant professionnel qui génère des rapports concis et bien structurés.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    // En cas d'erreur avec GPT, retourner un rapport basique
    return `# Rapport de Transcription

## Résumé
Enregistrement audio transcrit avec succès.

## Durée
${Math.round(transcription.duration)} secondes (${Math.round(transcription.duration / 60)} minutes)

## Langue détectée
${transcription.language}

## Note
Le contenu a été transcrit mais la génération automatique du rapport détaillé a rencontré une erreur. Veuillez consulter la transcription complète si nécessaire.`;
  }
}

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    openai_configured: !!process.env.OPENAI_API_KEY,
    max_duration_minutes: 120
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🎙️  Serveur Notivox lancé sur le port ${PORT}`);
  console.log(`📝 Accédez à l'application sur http://localhost:${PORT}`);
  console.log(`⏱️  Durée maximale d'enregistrement: 120 minutes`);

  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  ATTENTION: Clé API OpenAI non configurée!');
    console.warn('   Créez un fichier .env avec OPENAI_API_KEY=votre_clé');
  }
});
