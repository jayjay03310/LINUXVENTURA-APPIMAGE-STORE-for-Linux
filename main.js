const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { spawn } = require('child_process'); // Usamos spawn para rodar o app

// Configurações para lidar com ambientes gráficos problemáticos
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-setuid-sandbox');
app.commandLine.appendSwitch('disable-dev-shm-usage');
app.commandLine.appendSwitch('no-zygote');

// Lidar com ambiente gráfico ausente
app.disableHardwareAcceleration();

// Pasta onde os AppImages ficam salvos
const LIBRARY_PATH = path.join(app.getPath('home'), 'LinuxVenturaLibrary');
const SOURCES_FILE = path.join(app.getPath('userData'), 'custom_sources.json');

// Garante que a pasta existe
if (!fs.existsSync(LIBRARY_PATH)) {
    fs.mkdirSync(LIBRARY_PATH, { recursive: true });
}

// Função para carregar fontes personalizadas
function loadCustomSources() {
    if (fs.existsSync(SOURCES_FILE)) {
        try {
            const data = fs.readFileSync(SOURCES_FILE, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            console.error('Erro ao ler fontes personalizadas:', err);
            return [];
        }
    }
    return [];
}

// Função para salvar fontes personalizadas
function saveCustomSources(sources) {
    try {
        fs.writeFileSync(SOURCES_FILE, JSON.stringify(sources, null, 2));
    } catch (err) {
        console.error('Erro ao salvar fontes personalizadas:', err);
    }
}

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 600,
        frame: true, 
        backgroundColor: '#eef',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// ==========================================
// 🚀 SISTEMA DE EXECUÇÃO (PLAY) - ATUALIZADO
// ==========================================

ipcMain.on('launch-app', (event, filename) => {
    const filePath = path.join(LIBRARY_PATH, filename);

    console.log(`Preparando para lançar: ${filename}`);

    // Verificar se o arquivo existe antes de tentar executar
    fs.access(filePath, fs.constants.F_OK, (accessErr) => {
        if (accessErr) {
            console.error(`Arquivo não encontrado: ${filePath}`);
            event.sender.send('launch-error', 'Arquivo não encontrado.');
            return;
        }

        // Verificar se o arquivo é legível e executável
        fs.access(filePath, fs.constants.R_OK | fs.constants.X_OK, (permissionErr) => {
            if (permissionErr) {
                console.log('Permissões insuficientes, tentando corrigir...');
                
                // PASSO 1: Executa o equivalente a "chmod +x" (Permissão de execução)
                // 0o755 é o código octal para rwxr-xr-x (Leitura, Escrita, Execução para o dono)
                fs.chmod(filePath, 0o755, (chmodErr) => {
                    if (chmodErr) {
                        console.error(`Erro ao dar permissão chmod +x: ${chmodErr}`);
                        event.sender.send('launch-error', 'Erro de permissão no arquivo.');
                        return;
                    }

                    executeAppImage(filePath, event);
                });
            } else {
                executeAppImage(filePath, event);
            }
        });
    });
});

// Função auxiliar para executar o AppImage
function executeAppImage(filePath, event) {
    console.log('Iniciando AppImage...', filePath);

    // Verificar se o AppImage tem o bit executable setado
    fs.stat(filePath, (err, stats) => {
        if (err) {
            console.error('Erro ao obter status do arquivo:', err);
            event.sender.send('launch-error', 'Erro ao verificar o arquivo.');
            return;
        }

        // Verificar se é realmente executável
        const isExecutable = (stats.mode & 0o111) !== 0;
        if (!isExecutable) {
            console.log('Arquivo não é executável, tentando chmod...');
            fs.chmod(filePath, 0o755, (chmodErr) => {
                if (chmodErr) {
                    console.error(`Erro ao definir permissão de execução: ${chmodErr}`);
                    event.sender.send('launch-error', 'Erro ao definir permissão de execução.');
                    return;
                }
                runSpawnProcess(filePath, event);
            });
        } else {
            runSpawnProcess(filePath, event);
        }
    });
}

// Função para executar o processo com diferentes estratégias
function runSpawnProcess(filePath, event) {
    // Tenta executar o AppImage com diferentes estratégias
    const strategies = [
        // Estratégia 1: Executar diretamente
        () => spawn(filePath, [], {
            detached: true,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: {
                ...process.env,
                APPIMAGE_ALLOW_UNSIGNED: '1',
                DISPLAY: process.env.DISPLAY || ':0',
                XAUTHORITY: process.env.XAUTHORITY || '',
                DBUS_SESSION_BUS_ADDRESS: process.env.DBUS_SESSION_BUS_ADDRESS || '',
                HOME: process.env.HOME || require('os').homedir(),
                USER: process.env.USER || require('os').userInfo().username,
                LANG: process.env.LANG || 'en_US.UTF-8',
                LC_ALL: process.env.LC_ALL || 'en_US.UTF-8'
            }
        }),
        
        // Estratégia 2: Usar bash para executar
        () => spawn('bash', ['-c', `chmod +x "${filePath}" && "${filePath}"`], {
            detached: true,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: {
                ...process.env,
                APPIMAGE_ALLOW_UNSIGNED: '1',
                DISPLAY: process.env.DISPLAY || ':0',
                XAUTHORITY: process.env.XAUTHORITY || '',
                DBUS_SESSION_BUS_ADDRESS: process.env.DBUS_SESSION_BUS_ADDRESS || '',
                HOME: process.env.HOME || require('os').homedir(),
                USER: process.env.USER || require('os').userInfo().username,
                LANG: process.env.LANG || 'en_US.UTF-8',
                LC_ALL: process.env.LC_ALL || 'en_US.UTF-8'
            }
        })
    ];

    let attempt = 0;
    let subprocess;

    const tryStrategy = () => {
        if (attempt >= strategies.length) {
            event.sender.send('launch-error', 'Falha ao executar o AppImage com todas as estratégias disponíveis.');
            return;
        }

        try {
            subprocess = strategies[attempt]();
            
            // Listen for errors
            subprocess.on('error', (err) => {
                console.error(`Erro na estratégia ${attempt + 1} ao executar o AppImage: ${err.message}`);
                
                // Se falhar, tenta a próxima estratégia
                attempt++;
                tryStrategy();
            });

            // Listen for close event
            subprocess.on('close', (code, signal) => {
                console.log(`AppImage fechado com código: ${code}, sinal: ${signal}`);
                
                // Se o código for 0 ou indefinido (processo saiu normalmente), consideramos sucesso
                if (code === 0 || typeof code === 'undefined') {
                    console.log('AppImage executado com sucesso');
                } else if (code !== null) {
                    console.error(`AppImage encerrado com código: ${code}`);
                    // Não enviamos erro se for sucesso, apenas se for falha real
                    if (attempt >= strategies.length) {
                        event.sender.send('launch-error', `AppImage encerrado com código: ${code}`);
                    }
                }
            });

            // Capture stderr for debugging
            subprocess.stderr.on('data', (data) => {
                const stderrStr = data.toString();
                console.error(`AppImage stderr: ${stderrStr}`);
                
                // Verificar se há erros específicos do AppImage
                if (stderrStr.toLowerCase().includes('appimage') && stderrStr.toLowerCase().includes('error')) {
                    console.error('Erro detectado no AppImage:', stderrStr);
                }
            });

            subprocess.unref(); // Desvincula o processo filho do processo da loja
            
        } catch (spawnErr) {
            console.error(`Erro ao executar estratégia ${attempt + 1}:`, spawnErr);
            attempt++;
            tryStrategy();
        }
    };

    tryStrategy();
}

// ==========================================
// 🛠️ SISTEMA DE DOWNLOAD (COM REDIRECT)
// ==========================================

function downloadFile(url, filePath, event, filename) {
    const file = fs.createWriteStream(filePath);

    const request = https.get(url, (response) => {
        // Seguir redirecionamentos (GitHub Releases)
        if (response.statusCode === 301 || response.statusCode === 302) {
            downloadFile(response.headers.location, filePath, event, filename);
            return;
        }

        if (response.statusCode !== 200) {
            event.sender.send('download-error', `Status HTTP: ${response.statusCode}`);
            fs.unlink(filePath, () => {}); 
            return;
        }

        const totalBytes = parseInt(response.headers['content-length'], 10);
        let receivedBytes = 0;

        response.on('data', (chunk) => {
            receivedBytes += chunk.length;
            file.write(chunk);
            if (totalBytes) {
                const progress = (receivedBytes / totalBytes) * 100;
                event.sender.send('download-progress', { filename, progress });
            }
        });

        response.on('end', () => {
            file.end();
        });
    });

    request.on('error', (err) => {
        fs.unlink(filePath, () => {});
        event.sender.send('download-error', err.message);
    });

    file.on('finish', () => {
        file.close(() => {
            // Também damos chmod ao finalizar o download por garantia
            fs.chmod(filePath, 0o755, (chmodErr) => {
                if (chmodErr) {
                    console.error(`Erro ao definir permissões do arquivo: ${chmodErr}`);
                    // Continuar mesmo com erro de permissão
                }
                event.sender.send('download-complete', filename);
            });
        });
    });

    file.on('error', (err) => {
        fs.unlink(filePath, () => {});
        event.sender.send('download-error', err.message);
    });
}

ipcMain.on('download-app', (event, { url, filename }) => {
    const filePath = path.join(LIBRARY_PATH, filename);
    downloadFile(url, filePath, event, filename);
});

// ==========================================
// 🗑️ SISTEMA DE DELETE
// ==========================================

ipcMain.handle('delete-app', async (event, filename) => {
    const filePath = path.join(LIBRARY_PATH, filename);
    return new Promise((resolve) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) resolve({ success: false, error: err.message });
                else resolve({ success: true });
            });
        } else {
            resolve({ success: true });
        }
    });
});

// ==========================================
// 🔍 UTILITÁRIOS
// ==========================================

ipcMain.handle('check-file-exists', async (event, filename) => {
    return fs.existsSync(path.join(LIBRARY_PATH, filename));
});

ipcMain.on('open-library-folder', () => {
    shell.openPath(LIBRARY_PATH);
});

// ==========================================
// 📦 MANIPULADORES PARA FONTES PERSONALIZADAS
// ==========================================

ipcMain.handle('add-source', async (event, sourceData) => {
    try {
        // Carregar fontes existentes
        const sources = loadCustomSources();
        
        // Adicionar nova fonte
        sources.push(sourceData);
        
        // Salvar fontes atualizadas
        saveCustomSources(sources);
        
        return { success: true };
    } catch (error) {
        console.error('Erro ao adicionar fonte:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-custom-sources', async (event) => {
    try {
        return loadCustomSources();
    } catch (error) {
        console.error('Erro ao obter fontes personalizadas:', error);
        return [];
    }
});

// ==========================================
// 📦 MANIPULADORES PARA FONTES PERSONALIZADAS
// ==========================================

ipcMain.handle('add-sources-batch', async (event, appsToAdd) => {
    try {
        // Carregar fontes existentes
        let sources = loadCustomSources();
        
        // Adicionar novos apps
        sources = [...sources, ...appsToAdd];
        
        // Salvar fontes atualizadas
        saveCustomSources(sources);
        
        return { success: true };
    } catch (error) {
        console.error('Erro ao adicionar fontes em lote:', error);
        return { success: false, error: error.message };
    }
});

// ==========================================
// 📦 MANIPULADORES PARA FONTES PERSONALIZADAS
// ==========================================

ipcMain.handle('eject-sources', async (event) => {
    try {
        // Apagar o arquivo de fontes personalizadas
        if (fs.existsSync(SOURCES_FILE)) {
            fs.unlinkSync(SOURCES_FILE);
        }
        
        return { success: true };
    } catch (error) {
        console.error('Erro ao ejetar fontes personalizadas:', error);
        return { success: false, error: error.message };
    }
});

// ==========================================
// 🔄 MANIPULADOR PARA REINICIAR A APLICAÇÃO
// ==========================================

ipcMain.handle('restart-app', async (event) => {
    try {
        // Fecha a janela atual e reinicia o app
        app.relaunch();
        app.exit(0);
        return { success: true };
    } catch (error) {
        console.error('Erro ao reiniciar a aplicação:', error);
        return { success: false, error: error.message };
    }
});

// ==========================================
// 📁 MANIPULADOR PARA OBTER APPS ADICIONAIS NA PASTA
// ==========================================

// Variável para armazenar os nomes dos arquivos padrão
let defaultAppFilenames = [];

// Função para atualizar a lista de apps padrão
function updateDefaultAppFilenames(filenames) {
    defaultAppFilenames = filenames;
}

// Manipulador para receber a lista de apps padrão do renderer
ipcMain.handle('update-default-app-filenames', async (event, filenames) => {
    updateDefaultAppFilenames(filenames);
    return { success: true };
});

ipcMain.handle('get-additional-apps', async (event) => {
    try {
        const fs = require('fs');
        
        // Ler todos os arquivos na pasta de biblioteca
        const files = fs.readdirSync(LIBRARY_PATH);
        
        // Filtrar apenas arquivos AppImage
        const appImageFiles = files.filter(file => 
            file.toLowerCase().endsWith('.appimage')
        );
        
        // Filtrar arquivos que NÃO estão na lista padrão
        const filteredAppImageFiles = appImageFiles.filter(file => 
            !defaultAppFilenames.includes(file)
        );
        
        // Criar objetos de app para cada AppImage encontrado
        const additionalApps = filteredAppImageFiles.map(filename => {
            // Tentar extrair informações do nome do arquivo
            const name = filename.replace(/\.AppImage$/i, '').replace(/_/g, ' ').replace(/-/g, ' ');
            
            return {
                name: name,
                category: 'Additional',
                thumb: 'https://cdn-icons-png.flaticon.com/512/10069/10069229.png', // Imagem padrão
                link: '', // Não há link para apps adicionais
                filename: filename
            };
        });
        
        return additionalApps;
    } catch (error) {
        console.error('Erro ao obter apps adicionais:', error);
        return [];
    }
});
