// Constantes
const MAX_DURATION_SECONDS = 120 * 60; // 120 minutes en secondes
const MAX_DURATION_MS = MAX_DURATION_SECONDS * 1000;

// Variables globales
let mediaRecorder = null;
let audioChunks = [];
let recordingStartTime = null;
let timerInterval = null;
let audioBlob = null;

// Éléments DOM
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const transcribeBtn = document.getElementById('transcribeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const timer = document.getElementById('timer');
const audioPreview = document.getElementById('audioPreview');
const audioPlayer = document.getElementById('audioPlayer');
const resultsSection = document.getElementById('resultsSection');
const errorMessage = document.getElementById('errorMessage');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const reportContent = document.getElementById('reportContent');
const audioDuration = document.getElementById('audioDuration');
const audioLanguage = document.getElementById('audioLanguage');

// Event listeners
startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);
resetBtn.addEventListener('click', resetRecording);
transcribeBtn.addEventListener('click', transcribeAudio);
downloadBtn.addEventListener('click', downloadReport);

// Fonction pour démarrer l'enregistrement
async function startRecording() {
    try {
        hideError();
        resultsSection.style.display = 'none';

        // Demander l'accès au microphone
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        });

        // Déterminer le type MIME supporté
        const mimeType = getSupportedMimeType();

        mediaRecorder = new MediaRecorder(stream, { mimeType });
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: mimeType });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPlayer.src = audioUrl;
            audioPreview.style.display = 'block';

            // Arrêter tous les tracks du stream
            stream.getTracks().forEach(track => track.stop());
        };

        // Arrêt automatique après 120 minutes
        setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                stopRecording();
                showError('Durée maximale atteinte (120 minutes). Enregistrement arrêté automatiquement.');
            }
        }, MAX_DURATION_MS);

        mediaRecorder.start(1000); // Collecter les données toutes les secondes
        recordingStartTime = Date.now();

        // Démarrer le timer
        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);

        // Mettre à jour l'interface
        updateUIForRecording(true);
        statusText.textContent = 'Enregistrement en cours...';
        statusIndicator.querySelector('.status-dot').classList.add('recording');

    } catch (error) {
        console.error('Erreur lors du démarrage de l\'enregistrement:', error);
        showError('Impossible d\'accéder au microphone. Veuillez vérifier les permissions.');
    }
}

// Fonction pour arrêter l'enregistrement
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        clearInterval(timerInterval);

        updateUIForRecording(false);
        statusText.textContent = 'Enregistrement terminé';
        statusIndicator.querySelector('.status-dot').classList.remove('recording');
        resetBtn.disabled = false;
    }
}

// Fonction pour réinitialiser
function resetRecording() {
    audioChunks = [];
    audioBlob = null;
    recordingStartTime = null;
    timer.textContent = '00:00:00';
    audioPreview.style.display = 'none';
    audioPlayer.src = '';
    resultsSection.style.display = 'none';
    hideError();

    updateUIForRecording(false);
    statusText.textContent = 'Prêt à enregistrer';
    resetBtn.disabled = true;
}

// Fonction pour transcrire l'audio
async function transcribeAudio() {
    if (!audioBlob) {
        showError('Aucun audio à transcrire');
        return;
    }

    try {
        hideError();
        transcribeBtn.disabled = true;
        transcribeBtn.innerHTML = '<span class="btn-icon">⏳</span> Transcription en cours...';

        progressContainer.style.display = 'block';
        progressFill.style.width = '0%';
        progressText.textContent = 'Envoi du fichier...';

        // Créer le FormData
        const formData = new FormData();
        const audioFile = new File([audioBlob], 'recording.webm', { type: audioBlob.type });
        formData.append('audio', audioFile);

        // Envoyer au serveur
        const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData
        });

        progressFill.style.width = '50%';
        progressText.textContent = 'Traitement en cours...';

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de la transcription');
        }

        const result = await response.json();

        progressFill.style.width = '100%';
        progressText.textContent = 'Terminé !';

        // Afficher les résultats
        setTimeout(() => {
            progressContainer.style.display = 'none';
            displayResults(result);
        }, 500);

    } catch (error) {
        console.error('Erreur:', error);
        showError(`Erreur lors de la transcription: ${error.message}`);
        progressContainer.style.display = 'none';
    } finally {
        transcribeBtn.disabled = false;
        transcribeBtn.innerHTML = '<span class="btn-icon">✨</span> Générer le rapport';
    }
}

// Fonction pour afficher les résultats
function displayResults(result) {
    resultsSection.style.display = 'block';

    // Métadonnées
    const durationMinutes = Math.floor(result.duree / 60);
    const durationSeconds = Math.floor(result.duree % 60);
    audioDuration.textContent = `${durationMinutes}m ${durationSeconds}s`;
    audioLanguage.textContent = result.langue || 'Non détecté';

    // Rapport
    reportContent.innerHTML = formatMarkdown(result.rapport);

    // Scroll vers les résultats
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Fonction pour télécharger le rapport
function downloadReport() {
    const reportText = reportContent.innerText;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-notivox-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Fonction pour mettre à jour le timer
function updateTimer() {
    if (!recordingStartTime) return;

    const elapsed = Date.now() - recordingStartTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const displayHours = String(hours).padStart(2, '0');
    const displayMinutes = String(minutes % 60).padStart(2, '0');
    const displaySeconds = String(seconds % 60).padStart(2, '0');

    timer.textContent = `${displayHours}:${displayMinutes}:${displaySeconds}`;

    // Vérifier si on approche de la limite
    if (seconds >= MAX_DURATION_SECONDS - 60 && seconds < MAX_DURATION_SECONDS) {
        timer.style.color = '#dc3545'; // Rouge
    }
}

// Fonction pour mettre à jour l'interface
function updateUIForRecording(isRecording) {
    startBtn.disabled = isRecording;
    stopBtn.disabled = !isRecording;
    resetBtn.disabled = isRecording;
}

// Fonction pour afficher une erreur
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.scrollIntoView({ behavior: 'smooth' });
}

// Fonction pour cacher l'erreur
function hideError() {
    errorMessage.style.display = 'none';
}

// Fonction pour obtenir le type MIME supporté
function getSupportedMimeType() {
    const types = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/wav'
    ];

    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
            return type;
        }
    }

    return 'audio/webm'; // Fallback
}

// Fonction pour formater le markdown simple
function formatMarkdown(text) {
    if (!text) return '';

    // Conversion simple de markdown en HTML
    let html = text
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        // Lists
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    // Wrapper les listes
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Wrapper dans des paragraphes
    html = '<p>' + html + '</p>';

    return html;
}

// Vérification de la compatibilité au chargement
window.addEventListener('load', () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showError('Votre navigateur ne supporte pas l\'enregistrement audio. Veuillez utiliser un navigateur moderne (Chrome, Firefox, Edge).');
        startBtn.disabled = true;
    }
});
