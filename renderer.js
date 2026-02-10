const { ipcRenderer } = require('electron');

// --- BANCO DE DADOS DE APPS ---
// DICA: Use links diretos que terminem em .AppImage
const defaultApps = [
    {
        name: "Kdenlive",
        category: "Graphics",
        thumb: "https://images.icon-icons.com/1381/PNG/512/kdenlive_94451.png",
        link: "https://github.com/jayjay03310/LegacyAPPImageAPPS/releases/download/1.1/kdenlive-25.12.2-x86_64.AppImage",
        filename: "kdenlive-25.12.2-x86_64.AppImage"
    },
    {
        name: "Gimp",
        category: "Graphics",
        thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/The_GIMP_icon_-_gnome.svg/960px-The_GIMP_icon_-_gnome.svg.png",
        link: "https://github.com/jayjay03310/LegacyAPPImageAPPS/releases/download/1.1/GIMP.AppImage",
        filename: "GIMP.AppImage"
    },
    {
        name: "LibreOffice",
        category: "Office",
        thumb: "https://dl.flathub.org/media/org/libreoffice/LibreOffice/2f0bc12f32de34447aeb298f965caee1/icons/128x128@2/org.libreoffice.LibreOffice.png",
        link: "https://github.com/jayjay03310/LegacyAPPImageAPPS/releases/download/1.1/LibreOffice-Basic.AppImage", // Exemplo: Substitua por um link real de AppImage
        filename: "LibreOffice-Basic.AppImage"
    },
    {
        name: "PADVIDEOAbndwr",
        category: "Office",
        thumb: "https://cdn-icons-png.flaticon.com/512/8152/8152756.png",
        link: "https://archive.org/download/PADVIDEOABANDONWAREEDITION/PADVIDEOABANDONWAREEDITION.appimage", // Exemplo: Substitua por um link real de AppImage
        filename: "PADVIDEOABANDONWAREEDITION.appimage"
    },
    {
        name: "VLC",
        category: "Office",
        thumb: "https://upload.wikimedia.org/wikipedia/commons/0/0d/VLC_for_iOS_Icon.png",
        link: "https://github.com/lucasmz1/VLC_AppImage/releases/download/3.0.20/VLC_media_player-3.0.20.AppImage", // Exemplo: Substitua por um link real de AppImage
        filename: "VLC_media_player-3.0.20.AppImage"
    },
    {
        name: "Spotify",
        category: "Office",
        thumb: "https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png",
        link: "https://github.com/ivan-hc/Spotify-appimage/releases/download/20260208-142036/Spotify-1.2.74.477.g3be53afe-x86_64.AppImage", // Exemplo: Substitua por um link real de AppImage
        filename: "Spotify-1.2.74.477.g3be53afe-x86_64.AppImage"
    },
    {
        name: "Telegram",
        category: "Office",
        thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/960px-Telegram_logo.svg.png",
        link: "https://github.com/srevinsaju/Telegram-AppImage/releases/download/v3.2.5/Telegram_Desktop-x86_64.AppImage", // Exemplo: Substitua por um link real de AppImage
        filename: "Telegram_Desktop-x86_64.AppImage"
    },
    {
        name: "Angiru - Orkut",
        category: "Office",
        thumb: "https://cdn-icons-png.flaticon.com/512/3992/3992323.png",
        link: "https://github.com/jayjay03310/LegacyAPPImageAPPS/releases/download/1.1/Orkut-Angiru.AppImage", // Exemplo: Substitua por um link real de AppImage
        filename: "Orkut-Angiru.AppImage"
    },
    {
        name: "CosTV - Vídeos",
        category: "Office",
        thumb: "https://i.ibb.co/VcwJ1kS1/costv.png",
        link: "https://github.com/jayjay03310/LegacyAPPImageAPPS/releases/download/1.1/CosTV-1.0.0.AppImage", // Exemplo: Substitua por um link real de AppImage
        filename: "CosTV-1.0.0.AppImage"
    },
    {
        name: "REAPR6_Music DAW",
        category: "Office",
        thumb: "https://i.ibb.co/HDTfnpHw/image.png",
        link: "https://archive.org/download/PADVIDEOABANDONWAREEDITION/REAPR6Linux.appimage", // Exemplo: Substitua por um link real de AppImage
        filename: "REAPR6Linux.appimag"
    },
    {
        name: "Godot Engine",
        category: "Games",
        thumb: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Godot_icon.svg",
        link: "https://github.com/stupid-kid-af/Godot-AppImage/releases/download/godot-3.4.4-stable-mono/Godot-x86_64.AppImage", // Exemplo
        filename: "Godot-x86_64.AppImage"
    },
    {
        name: "MP GAMES IO",
        category: "Games",
        thumb: "https://cdn-icons-png.flaticon.com/512/10069/10069229.png",
        link: "https://github.com/jayjay03310/LegacyAPPImageAPPS/releases/download/1.1/MP-IO-Launcher-1.0.0.AppImage", // Exemplo
        filename: "MP-IO-Launcher-1.0.0.AppImage"
    },
    {
        name: "DuckStation PS1",
        category: "Games",
        thumb: "https://cdn.iconscout.com/icon/free/png-256/free-playstation-logo-icon-svg-download-png-3030210.png",
        link: "https://github.com/stenzek/duckstation/releases/download/v0.1-10693/DuckStation-x64.AppImage", // Exemplo
        filename: "DuckStation-x64.AppImage"
    },
    {
        name: "Heroic Launcher",
        category: "Games",
        thumb: "https://user-images.githubusercontent.com/63420929/106940506-63629c80-6700-11eb-977e-e316281bf65e.png",
        link: "https://github.com/Heroic-Games-Launcher/HeroicGamesLauncher/releases/download/v2.19.1/Heroic-2.19.1-linux-x86_64.AppImage", // Exemplo
        filename: "Heroic-2.19.1-linux-x86_64.AppImage"
    },
    {
        name: "Dolphin WII Games",
        category: "Games",
        thumb: "https://dashboard.snapcraft.io/site_media/appmedia/2020/08/icon_MmFesP6.png",
        link: "https://github.com/pkgforge-dev/Dolphin-emu-AppImage/releases/download/2512%402026-01-26_1769467304/Dolphin_Emulator-2512-anylinux-x86_64.AppImage", // Exemplo
        filename: "Dolphin_Emulator-2512-anylinux-x86_64.AppImage"
    },
    {
        name: "Games Torrent Search Engine",
        category: "Games",
        thumb: "https://cdn-icons-png.flaticon.com/512/2800/2800059.png",
        link: "https://github.com/jayjay03310/ArchAngel/releases/download/1.0/ArchAngel.Search-1.0.0.AppImage", // Exemplo
        filename: "ArchAngel.Search-1.0.0.AppImage"
    },
    {
        name: "Inkscape",
        category: "Graphics",
        thumb: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Inkscape_Logo.svg",
        link: "https://inkscape.org/gallery/item/44616/Inkscape-e7c3feb-x86_64.AppImage", // Exemplo
        filename: "inkscape.AppImage"
    },
    {
        name: "FreeCAD",
        category: "Graphics",
        thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/FreeCAD-logo.svg/3840px-FreeCAD-logo.svg.png",
        link: "https://github.com/FreeCAD/FreeCAD/releases/download/weekly-2026.02.04/FreeCAD_weekly-2026.02.04-Linux-x86_64-py311.AppImage", // Exemplo
        filename: "FreeCAD_weekly-2026.02.04-Linux-x86_64-py311.AppImage"
    },
    {
        name: "Blender 4.2LTS",
        category: "Graphics",
        thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Blender_logo_no_text.svg/3840px-Blender_logo_no_text.svg.png",
        link: "https://github.com/erroreutopia/Blender-Appimage/releases/download/blender4.2.0/blender-4.2.0-linux-x64.Appimage", // Exemplo
        filename: "blender-4.2.0-linux-x64.Appimage"
    },
    {
        name: "FotoShockCS6",
        category: "Graphics",
        thumb: "https://img.icons8.com/ios11/512/F25081/adobe-photoshop.png",
        link: "https://archive.org/download/PADVIDEOABANDONWAREEDITION/FotoShock_CS6.appimage", // Exemplo
        filename: "FotoShock_CS6.appimage"
    },
    {
        name: "Audacity",
        category: "System",
        thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Audacity_Logo.svg/500px-Audacity_Logo.svg.png",
        link: "https://github.com/audacity/audacity/releases/download/Audacity-3.4.2/audacity-linux-3.4.2-x64.AppImage",
        filename: "audacity.AppImage"
    },
    {
        name: "Bottles",
        category: "System",
        thumb: "https://cdn-icons-png.flaticon.com/512/3437/3437507.png",
        link: "https://github.com/ivan-hc/Bottles-appimage/releases/download/20260202-153650/Bottles_61.1-1-archimage5.0-x86_64.AppImage",
        filename: "Bottles_61.1-1-archimage5.0-x86_64.AppImage"
    }
];

let apps = [...defaultApps]; // Começa com os apps padrão

// Carregar fontes personalizadas
async function loadCustomSources() {
    try {
        const customSources = await ipcRenderer.invoke('get-custom-sources');
        apps = [...defaultApps, ...customSources]; // Combina apps padrão com personalizados
    } catch (error) {
        console.error('Erro ao carregar fontes personalizadas:', error);
        apps = [...defaultApps]; // Volta aos apps padrão em caso de erro
    }
}

const grid = document.getElementById('grid-container');
const searchInput = document.getElementById('search-input');
const statusText = document.getElementById('status-text');
const progressBar = document.getElementById('progress-bar');
let currentCategory = 'all';

// --- RENDERIZADOR ---
async function renderApps(searchTerm = '') {
    grid.innerHTML = ''; // Limpa o grid

    for (const app of apps) {
        // Filtros (Categoria e Busca)
        if (currentCategory !== 'all' && app.category !== currentCategory) continue;
        if (searchTerm && !app.name.toLowerCase().includes(searchTerm.toLowerCase())) continue;

        // Verifica se o arquivo já existe no PC (assíncrono)
        const exists = await ipcRenderer.invoke('check-file-exists', app.filename);

        // Cria o elemento do Card
        const card = document.createElement('div');
        card.className = 'app-card';

        // Define o HTML interno com base no status (Instalado ou Não)
        let buttonsHtml = '';

        if (exists) {
            // Se instalado: Botão Play + Botão Deletar
            buttonsHtml = `
                <button class="btn-action btn-play" onclick="launchApp('${app.filename}')">
                    <i class="fa-solid fa-play"></i> JOGAR
                </button>
                <button class="btn-action btn-delete" onclick="deleteApp('${app.filename}')">
                    <i class="fa-solid fa-trash"></i> APAGAR
                </button>
            `;
        } else {
            // Se não instalado: Botão Download
            buttonsHtml = `
                <button class="btn-action btn-download" onclick="downloadApp('${app.link}', '${app.filename}')">
                    <i class="fa-solid fa-download"></i> BAIXAR
                </button>
            `;
        }

        card.innerHTML = `
            <img src="${app.thumb}" class="app-thumb" alt="${app.name}">
            <div class="app-title">${app.name}</div>
            <div class="overlay">
                ${buttonsHtml}
            </div>
        `;

        grid.appendChild(card);
    }
}

// --- FUNÇÕES DE CONTROLE ---

// 1. Iniciar Download
window.downloadApp = (url, filename) => {
    statusText.innerText = `Iniciando download de ${filename}...`;
    progressBar.style.width = '5%';
    ipcRenderer.send('download-app', { url, filename });
};

// 2. Executar App (Play)
window.launchApp = (filename) => {
    statusText.innerText = `Executando ${filename}...`;
    ipcRenderer.send('launch-app', filename);
    
    // Efeito visual rápido
    progressBar.style.width = '100%';
    setTimeout(() => { progressBar.style.width = '0%'; statusText.innerText = 'Rodando...'; }, 1500);
};

// 3. Deletar App (Lixeira)
window.deleteApp = async (filename) => {
    if (confirm(`Tem certeza que deseja remover o ${filename}?`)) {
        statusText.innerText = `Removendo ${filename}...`;
        const result = await ipcRenderer.invoke('delete-app', filename);
        
        if (result.success) {
            statusText.innerText = `${filename} removido.`;
            renderApps(searchInput.value); // Recarrega a tela para mostrar o botão de download de novo
        } else {
            alert(`Erro ao deletar: ${result.error}`);
        }
    }
};

// 4. Filtrar por Categoria
window.filterApps = (category) => {
    currentCategory = category;
    
    // Atualiza visual dos botões de categoria
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active'); // O botão clicado fica ativo

    renderApps(searchInput.value);
};

// 5. Abrir Pasta Local
window.openLibrary = () => {
    ipcRenderer.send('open-library-folder');
};

// 6. Adicionar nova fonte
window.addSource = () => {
    // Criar modal para adicionar nova fonte
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    modal.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 10px; width: 400px; max-width: 90%;">
            <h3>Adicionar Nova Fonte</h3>
            <form id="source-form">
                <div style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 5px;">Nome:</label>
                    <input type="text" id="source-name" placeholder="Nome da categoria" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" required>
                </div>
                <div style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 5px;">Link:</label>
                    <input type="url" id="source-link" placeholder="URL do AppImage" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" required>
                </div>
                <div style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 5px;">Thumbnail:</label>
                    <input type="url" id="source-thumb" placeholder="URL da imagem" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" required>
                </div>
                <div style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 5px;">Categoria:</label>
                    <input type="text" id="source-category" placeholder="Nome da categoria" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" required>
                </div>
                <div style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 5px;">Nome do Arquivo:</label>
                    <input type="text" id="source-filename" placeholder="Nome do arquivo AppImage" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" required>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <button type="submit" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Adicionar</button>
                    <button type="button" id="cancel-btn" style="padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Evento para cancelar
    document.getElementById('cancel-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // Evento para submeter o formulário
    document.getElementById('source-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('source-name').value;
        const link = document.getElementById('source-link').value;
        const thumb = document.getElementById('source-thumb').value;
        const category = document.getElementById('source-category').value;
        const filename = document.getElementById('source-filename').value;

        // Enviar dados para o main process para salvar
        ipcRenderer.invoke('add-source', { name, link, thumb, category, filename })
            .then(result => {
                if (result.success) {
                    alert('Fonte adicionada com sucesso!');
                    document.body.removeChild(modal);
                    // Recarregar a lista de apps
                    renderApps(searchInput.value);
                } else {
                    alert(`Erro ao adicionar fonte: ${result.error}`);
                }
            });
    });
};

// --- EVENTOS DE ESCUTA (IPC) ---

// Atualização de Progresso
ipcRenderer.on('download-progress', (event, { filename, progress }) => {
    progressBar.style.width = `${progress}%`;
    statusText.innerText = `Baixando ${filename}: ${Math.round(progress)}%`;
});

// Download Concluído
ipcRenderer.on('download-complete', (event, filename) => {
    progressBar.style.width = '100%';
    statusText.innerText = `${filename} instalado com sucesso!`;

    // Atualiza a lista imediatamente para trocar o botão de Download por Play
    renderApps(searchInput.value);
    progressBar.style.width = '0%';
    statusText.innerText = 'Pronto.';
});

// Erro de Download
ipcRenderer.on('download-error', (event, errorMessage) => {
    alert(`Erro no download: ${errorMessage}`);
    progressBar.style.width = '0%';
    statusText.innerText = 'Erro.';
});

// Erro de Execução
ipcRenderer.on('launch-error', (event, errorMessage) => {
    alert(`Erro na execução: ${errorMessage}`);
    progressBar.style.width = '0%';
    statusText.innerText = 'Erro na execução.';
});

// Barra de Busca
searchInput.addEventListener('input', (e) => {
    renderApps(e.target.value);
});

// Inicialização
loadCustomSources().then(() => {
    renderApps();
});
