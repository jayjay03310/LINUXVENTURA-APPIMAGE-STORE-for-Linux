const { ipcRenderer } = require('electron');

const gameGrid = document.getElementById('game-grid');
const statusText = document.getElementById('status-text');
const progressBar = document.getElementById('progress-bar');
const searchInput = document.getElementById('search-input');
const dateEl = document.getElementById('current-date');
const timeEl = document.getElementById('current-time');

let allGamesList = [];

// Relógio
function updateClock() {
    const now = new Date();
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dStr = String(now.getDate()).padStart(2, '0');
    const mStr = String(now.getMonth() + 1).padStart(2, '0');
    dateEl.innerText = `${dStr}/${mStr} (${days[now.getDay()]})`;
    timeEl.innerText = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
setInterval(updateClock, 1000);
updateClock();

// Inicia
ipcRenderer.send('fetch-games');

ipcRenderer.on('games-data', (event, games) => {
    allGamesList = games;
    renderGrid(allGamesList);
});

// Busca
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allGamesList.filter(g => g.name.toLowerCase().includes(term));
    renderGrid(filtered);
});

function renderGrid(games) {
    gameGrid.innerHTML = '';
    if (!games || games.length === 0) {
        gameGrid.innerHTML = '<div class="loading-screen"><p>Nenhum jogo encontrado.</p></div>';
        return;
    }

    games.forEach((game, index) => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.id = `card-${index}`;
        
        // Cor do disco baseada no nome
        const hue = Math.abs(game.name.charCodeAt(0) * 10) % 360;

        card.innerHTML = `
            <div class="disc-icon" style="background: conic-gradient(hsl(${hue}, 20%, 90%), #fff, hsl(${hue}, 20%, 90%), #fff);"></div>
            <div class="game-title">${game.name}</div>
            <div class="download-overlay">BAIXAR</div>
        `;

        card.onclick = () => {
            // Desabilita UI
            document.querySelectorAll('.channel-card').forEach(c => c.classList.add('disabled'));
            // Define o jogo atual sendo baixado
            setCurrentDownloadingGame(game);
            ipcRenderer.send('download-game', game);
        };
        gameGrid.appendChild(card);
    });
}

// Variável para armazenar o jogo atual sendo baixado
let currentDownloadingGame = null;

// Eventos de Download
ipcRenderer.on('download-start', (event, name) => {
    statusText.innerText = `Baixando: ${name}`;
    progressBar.style.width = '1%';
    
    // Atualizar o texto do botão de controle para "Cancelar"
    const controlButton = document.getElementById('control-button');
    if (controlButton) {
        controlButton.textContent = 'Cancelar';
        controlButton.onclick = () => {
            if (currentDownloadingGame) {
                ipcRenderer.send('cancel-download');
            }
        };
    }
    
    // Mostrar botão de reiniciar (inicialmente oculto durante o download)
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
        restartButton.style.display = 'none'; // Ocultar durante o download
    }
});

ipcRenderer.on('download-progress', (event, data) => {
    const { percentage, name, speed } = data;
    if (speed) {
        statusText.innerText = `Baixando ${name} (${percentage}%) - Velocidade: ${speed}`;
    } else {
        statusText.innerText = `Baixando ${name} (${percentage}%)`;
    }
    progressBar.style.width = `${percentage}%`;
});

ipcRenderer.on('download-complete', (event, { name, path }) => {
    statusText.innerText = `Download Completo!`;
    progressBar.style.width = '100%';
    document.querySelectorAll('.channel-card').forEach(c => c.classList.remove('disabled'));

    // Atualizar o botão de controle para mostrar "Reiniciar"
    const controlButton = document.getElementById('control-button');
    if (controlButton) {
        controlButton.textContent = 'Reiniciar';
        controlButton.onclick = () => {
            if (currentDownloadingGame) {
                ipcRenderer.send('restart-download', currentDownloadingGame);
            }
        };
    }
    
    // Mostrar botão de reiniciar
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
        restartButton.style.display = 'inline-block';
    }

    alert(`Sucesso! Jogo salvo em:\n${path}`);

    setTimeout(() => {
        statusText.innerText = 'Pasta alvo: ~/Wii_isos';
        progressBar.style.width = '0%';
    }, 4000);
});

ipcRenderer.on('download-cancelled', (event, data) => {
    statusText.innerText = 'Download Cancelado';
    progressBar.style.width = '0%';
    document.querySelectorAll('.channel-card').forEach(c => c.classList.remove('disabled'));

    // Atualizar o botão de controle para mostrar "Reiniciar"
    const controlButton = document.getElementById('control-button');
    if (controlButton) {
        controlButton.textContent = 'Reiniciar';
        controlButton.onclick = () => {
            if (currentDownloadingGame) {
                ipcRenderer.send('restart-download', currentDownloadingGame);
            }
        };
    }
    
    // Mostrar botão de reiniciar
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
        restartButton.style.display = 'inline-block';
    }
});

ipcRenderer.on('download-restart', (event, name) => {
    statusText.innerText = `Reiniciando download: ${name}`;
    progressBar.style.width = '1%';
    
    // Atualizar o botão de controle para "Cancelar"
    const controlButton = document.getElementById('control-button');
    if (controlButton) {
        controlButton.textContent = 'Cancelar';
        controlButton.onclick = () => {
            if (currentDownloadingGame) {
                ipcRenderer.send('cancel-download');
            }
        };
    }
    
    // Ocultar botão de reiniciar durante o reinício
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
        restartButton.style.display = 'none';
    }
});

ipcRenderer.on('error', (event, msg) => {
    statusText.innerText = `ERRO`;
    document.querySelectorAll('.channel-card').forEach(c => c.classList.remove('disabled'));
    
    // Atualizar o botão de controle para mostrar "Reiniciar" em caso de erro
    const controlButton = document.getElementById('control-button');
    if (controlButton) {
        controlButton.textContent = 'Reiniciar';
        controlButton.onclick = () => {
            if (currentDownloadingGame) {
                ipcRenderer.send('restart-download', currentDownloadingGame);
            }
        };
    }
    
    // Mostrar botão de reiniciar
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
        restartButton.style.display = 'inline-block';
    }
    
    alert(msg);
});

// Função para definir o jogo atual sendo baixado
function setCurrentDownloadingGame(game) {
    currentDownloadingGame = game;
}