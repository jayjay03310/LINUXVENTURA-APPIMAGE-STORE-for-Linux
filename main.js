const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const axios = require('axios');
const { DownloadManager } = require('./libs/downloader');

// Instância do gerenciador de downloads
const downloadManager = new DownloadManager();

// Configurações do Archive.org
const ITEM_ID = 'Wii_ISO';
const METADATA_URL = `https://archive.org/metadata/${ITEM_ID}`;
const DOWNLOAD_BASE = `https://archive.org/download/${ITEM_ID}`;

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        resizable: true,
        autoHideMenuBar: true,
        backgroundColor: '#e0e0e0',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// --- LISTAGEM DE JOGOS ---
ipcMain.on('fetch-games', async (event) => {
    try {
        const { data } = await axios.get(METADATA_URL, { timeout: 20000 });
        if (!data || !data.files) throw new Error('Lista vazia.');

        const games = [];
        data.files.forEach(file => {
            if (file.name && file.name.toLowerCase().endsWith('.iso')) {
                const cleanName = file.name.replace(/\.iso$/i, '');
                // Codifica URL para o download funcionar
                const downloadUrl = `${DOWNLOAD_BASE}/${encodeURIComponent(file.name)}`;
                
                games.push({
                    name: cleanName,
                    filename: file.name,
                    url: downloadUrl
                });
            }
        });

        event.reply('games-data', games);
    } catch (error) {
        event.reply('error', `Falha ao carregar lista: ${error.message}`);
    }
});

// --- LISTAGEM DE JOGOS ---
ipcMain.on('fetch-games', async (event) => {
    try {
        const { data } = await axios.get(METADATA_URL, { timeout: 20000 });
        if (!data || !data.files) throw new Error('Lista vazia.');

        const games = [];
        data.files.forEach(file => {
            if (file.name && file.name.toLowerCase().endsWith('.iso')) {
                const cleanName = file.name.replace(/\.iso$/i, '');
                // Codifica URL para o download funcionar
                const downloadUrl = `${DOWNLOAD_BASE}/${encodeURIComponent(file.name)}`;

                games.push({
                    name: cleanName,
                    filename: file.name,
                    url: downloadUrl
                });
            }
        });

        event.reply('games-data', games);
    } catch (error) {
        event.reply('error', `Falha ao carregar lista: ${error.message}`);
    }
});

// --- DOWNLOAD (Para a pasta Wii_isos) ---
let currentCancellationToken = null;

ipcMain.on('download-game', async (event, game) => {
    // Verificar se já existe um download ativo
    if (currentCancellationToken && !currentCancellationToken.cancelled) {
        event.reply('error', 'Já existe um download em andamento. Por favor, cancele o download atual antes de iniciar um novo.');
        return;
    }

    // CAMINHO PERSONALIZADO: Home do Usuário + pasta Wii_isos
    // No Linux isso vira: /home/usuario/Wii_isos
    const downloadDir = path.join(app.getPath('home'), 'Wii_isos');

    console.log(`[Main] Pasta de destino: ${downloadDir}`);

    event.reply('download-start', game.name);

    // Criar token de cancelamento para este download
    currentCancellationToken = { cancelled: false };

    try {
        const savedPath = await downloadManager.downloadToFile(
            game.url,
            downloadDir,
            (progressData) => {
                event.reply('download-progress', { ...progressData, name: game.name });
            },
            currentCancellationToken
        );

        // Verificar se o download foi cancelado
        if (savedPath && savedPath.cancelled) {
            event.reply('download-cancelled', { name: game.name });
        } else {
            event.reply('download-complete', { name: game.name, path: savedPath });

            // Abre a pasta para o usuário ver
            shell.openPath(downloadDir);
        }

    } catch (error) {
        console.error('[Erro Download]', error);
        
        // Verificar se é um erro de redirecionamento
        if (error.message && error.message.startsWith('Redirecionando para:')) {
            const redirectUrl = error.message.substring('Redirecionando para: '.length);
            
            // Atualizar o URL do jogo para o novo endereço
            game.url = redirectUrl;
            
            // Tentar novamente com o novo URL
            try {
                const savedPath = await downloadManager.downloadToFile(
                    redirectUrl,
                    downloadDir,
                    (progressData) => {
                        event.reply('download-progress', { ...progressData, name: game.name });
                    },
                    currentCancellationToken
                );

                // Verificar se o download foi cancelado
                if (savedPath && savedPath.cancelled) {
                    event.reply('download-cancelled', { name: game.name });
                } else {
                    event.reply('download-complete', { name: game.name, path: savedPath });

                    // Abre a pasta para o usuário ver
                    shell.openPath(downloadDir);
                }
            } catch (redirectError) {
                console.error('[Erro Download Redirecionado]', redirectError);
                event.reply('error', `Erro no download redirecionado: ${redirectError.message}`);
            }
        } else {
            event.reply('error', `Erro no download: ${error.message}`);
        }
    } finally {
        // Certificar-se de que o token é limpo após o término do download
        currentCancellationToken = null;
    }
});

// --- CANCELAMENTO DE DOWNLOAD ---
ipcMain.on('cancel-download', (event) => {
    if (currentCancellationToken) {
        currentCancellationToken.cancelled = true;
        event.reply('download-cancelled', { message: 'Download cancelado pelo usuário.' });
    } else {
        event.reply('error', 'Nenhum download ativo para cancelar.');
    }
});

// --- REINICIAR DOWNLOAD ---
ipcMain.on('restart-download', async (event, game) => {
    // Cancelar o download atual se houver
    if (currentCancellationToken) {
        currentCancellationToken.cancelled = true;
    }
    
    // Reiniciar o processo de download
    event.reply('download-restart', game.name);
    
    // Criar token de cancelamento para este download
    currentCancellationToken = { cancelled: false };

    try {
        const savedPath = await downloadManager.downloadToFile(
            game.url,
            path.join(app.getPath('home'), 'Wii_isos'),
            (progressData) => {
                event.reply('download-progress', { ...progressData, name: game.name });
            },
            currentCancellationToken
        );

        // Verificar se o download foi cancelado
        if (savedPath && savedPath.cancelled) {
            event.reply('download-cancelled', { name: game.name });
        } else {
            event.reply('download-complete', { name: game.name, path: savedPath });

            // Abre a pasta para o usuário ver
            shell.openPath(path.join(app.getPath('home'), 'Wii_isos'));
        }

    } catch (error) {
        console.error('[Erro Download]', error);
        
        // Verificar se é um erro de redirecionamento
        if (error.message && error.message.startsWith('Redirecionando para:')) {
            const redirectUrl = error.message.substring('Redirecionando para: '.length);
            
            // Atualizar o URL do jogo para o novo endereço
            game.url = redirectUrl;
            
            // Tentar novamente com o novo URL
            try {
                const savedPath = await downloadManager.downloadToFile(
                    redirectUrl,
                    path.join(app.getPath('home'), 'Wii_isos'),
                    (progressData) => {
                        event.reply('download-progress', { ...progressData, name: game.name });
                    },
                    currentCancellationToken
                );

                // Verificar se o download foi cancelado
                if (savedPath && savedPath.cancelled) {
                    event.reply('download-cancelled', { name: game.name });
                } else {
                    event.reply('download-complete', { name: game.name, path: savedPath });

                    // Abre a pasta para o usuário ver
                    shell.openPath(path.join(app.getPath('home'), 'Wii_isos'));
                }
            } catch (redirectError) {
                console.error('[Erro Download Redirecionado]', redirectError);
                event.reply('error', `Erro no download redirecionado: ${redirectError.message}`);
            }
        } else {
            event.reply('error', `Erro no download: ${error.message}`);
        }
    } finally {
        // Certificar-se de que o token é limpo após o término do download
        currentCancellationToken = null;
    }
});