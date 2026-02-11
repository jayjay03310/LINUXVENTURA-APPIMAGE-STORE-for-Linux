// Script para gerar as URLs codificadas
const parkSystemEncode = (url) => {
    // Insere um caractere aleatório (letra/número) após cada caractere do URL
    let encoded = "";
    for (let i = 0; i < url.length; i++) {
        encoded += url[i];
        // Adiciona um caractere aleatório (letra ou número)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const randomChar = chars.charAt(Math.floor(Math.random() * chars.length));
        encoded += randomChar;
    }
    
    // Adiciona um marcador especial para identificar o final da codificação
    // O marcador contém um caractere especial e o tamanho original
    const marker = `~${url.length}~`;
    return encoded + marker;
};

// Lista de aplicativos com seus URLs originais
const appsWithUrls = [
    {
        name: "Kdenlive",
        category: "Graphics",
        thumb: "https://s12.gifyu.com/images/bvbP6.gif",
        originalUrl: "https://github.com/jayjay03310/LegacyAPPImageAPPS/releases/download/1.1/kdenlive-25.12.2-x86_64.AppImage",
        filename: "kdenlive-25.12.2-x86_64.AppImage"
    },
    {
        name: "Gimp",
        category: "Graphics",
        thumb: "https://s12.gifyu.com/images/bvzSF.gif",
        originalUrl: "https://github.com/jayjay03310/LegacyAPPImageAPPS/releases/download/1.1/GIMP.AppImage",
        filename: "GIMP.AppImage"
    },
    {
        name: "LibreOffice",
        category: "Office",
        thumb: "https://s12.gifyu.com/images/bvzSB.gif",
        originalUrl: "https://github.com/jayjay03310/LegacyAPPImageAPPS/releases/download/1.1/LibreOffice-Basic.AppImage",
        filename: "LibreOffice-Basic.AppImage"
    },
    {
        name: "PADVIDEOAbndwr",
        category: "Office",
        thumb: "https://s12.gifyu.com/images/bvzbi.gif",
        originalUrl: "https://archive.org/download/PADVIDEOABANDONWAREEDITION/PADVIDEOABANDONWAREEDITION.appimage",
        filename: "PADVIDEOABANDONWAREEDITION.appimage"
    },
    {
        name: "VLC",
        category: "Office",
        thumb: "https://s12.gifyu.com/images/bvzSO.gif",
        originalUrl: "https://github.com/lucasmz1/VLC_AppImage/releases/download/3.0.20/VLC_media_player-3.0.20.AppImage",
        filename: "VLC_media_player-3.0.20.AppImage"
    },
    {
        name: "Spotify",
        category: "Office",
        thumb: "https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png",
        originalUrl: "https://github.com/ivan-hc/Spotify-appimage/releases/download/20260208-142036/Spotify-1.2.74.477.g3be53afe-x86_64.AppImage",
        filename: "Spotify-1.2.74.477.g3be53afe-x86_64.AppImage"
    },
    {
        name: "Telegram",
        category: "Office",
        thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/960px-Telegram_logo.svg.png",
        originalUrl: "https://github.com/srevinsaju/Telegram-AppImage/releases/download/v3.2.5/Telegram_Desktop-x86_64.AppImage",
        filename: "Telegram_Desktop-x86_64.AppImage"
    },
    {
        name: "Angiru - Orkut",
        category: "Office",
        thumb: "https://s12.gifyu.com/images/bvbPY.gif",
        originalUrl: "https://github.com/jayjay03310/LegacyAPPImageAPPS/releases/download/1.1/Orkut-Angiru.AppImage",
        filename: "Orkut-Angiru.AppImage"
    },
    {
        name: "CosTV - Vídeos",
        category: "Office",
        thumb: "https://s12.gifyu.com/images/bvbP5.gif",
        originalUrl: "https://github.com/jayjay03310/LegacyAPPImageAPPS/releases/download/1.1/CosTV-1.0.0.AppImage",
        filename: "CosTV-1.0.0.AppImage"
    },
    {
        name: "REAPR6_Music DAW",
        category: "Office",
        thumb: "https://s12.gifyu.com/images/bvzS7.gif",
        originalUrl: "https://archive.org/download/PADVIDEOABANDONWAREEDITION/REAPR6Linux.appimage",
        filename: "REAPR6Linux.appimag"
    },
    {
        name: "Godot Engine",
        category: "Games",
        thumb: "https://s12.gifyu.com/images/bvzSq.gif",
        originalUrl: "https://github.com/stupid-kid-af/Godot-AppImage/releases/download/godot-3.4.4-stable-mono/Godot-x86_64.AppImage",
        filename: "Godot-x86_64.AppImage"
    },
    {
        name: "MP GAMES IO",
        category: "Games",
        thumb: "https://cdn-icons-png.flaticon.com/512/10069/10069229.png",
        originalUrl: "https://github.com/jayjay03310/LegacyAPPImageAPPS/releases/download/1.1/MP-IO-Launcher-1.0.0.AppImage",
        filename: "MP-IO-Launcher-1.0.0.AppImage"
    },
    {
        name: "DuckStation PS1",
        category: "Games",
        thumb: "https://s12.gifyu.com/images/bvzSI.gif",
        originalUrl: "https://github.com/stenzek/duckstation/releases/download/v0.1-10693/DuckStation-x64.AppImage",
        filename: "DuckStation-x64.AppImage"
    },
    {
        name: "Heroic Launcher",
        category: "Games",
        thumb: "https://user-images.githubusercontent.com/63420929/106940506-63629c80-6700-11eb-977e-e316281bf65e.png",
        originalUrl: "https://github.com/Heroic-Games-Launcher/HeroicGamesLauncher/releases/download/v2.19.1/Heroic-2.19.1-linux-x86_64.AppImage",
        filename: "Heroic-2.19.1-linux-x86_64.AppImage"
    },
    {
        name: "Dolphin WII Games",
        category: "Games",
        thumb: "https://s12.gifyu.com/images/bvzSU.gif",
        originalUrl: "https://github.com/pkgforge-dev/Dolphin-emu-AppImage/releases/download/2512%402026-01-26_1769467304/Dolphin_Emulator-2512-anylinux-x86_64.AppImage",
        filename: "Dolphin_Emulator-2512-anylinux-x86_64.AppImage"
    },
    {
        name: "Games Torrent Search Engine",
        category: "Games",
        thumb: "https://cdn-icons-png.flaticon.com/512/2800/2800059.png",
        originalUrl: "https://github.com/jayjay03310/ArchAngel/releases/download/1.0/ArchAngel.Search-1.0.0.AppImage",
        filename: "ArchAngel.Search-1.0.0.AppImage"
    },
    {
        name: "Inkscape",
        category: "Graphics",
        thumb: "https://s12.gifyu.com/images/bvzb0.gif",
        originalUrl: "https://inkscape.org/gallery/item/44616/Inkscape-e7c3feb-x86_64.AppImage",
        filename: "inkscape.AppImage"
    },
    {
        name: "FreeCAD",
        category: "Graphics",
        thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/FreeCAD-logo.svg/3840px-FreeCAD-logo.svg.png",
        originalUrl: "https://github.com/FreeCAD/FreeCAD/releases/download/weekly-2026.02.04/FreeCAD_weekly-2026.02.04-Linux-x86_64-py311.AppImage",
        filename: "FreeCAD_weekly-2026.02.04-Linux-x86_64-py311.AppImage"
    },
    {
        name: "Blender 4.2LTS",
        category: "Graphics",
        thumb: "https://s12.gifyu.com/images/bvbPB.gif",
        originalUrl: "https://github.com/erroreutopia/Blender-Appimage/releases/download/blender4.2.0/blender-4.2.0-linux-x64.AppImage",
        filename: "blender-4.2.0-linux-x64.Appimage"
    },
    {
        name: "FotoShockCS6",
        category: "Graphics",
        thumb: "https://s12.gifyu.com/images/bvbJx.gif",
        originalUrl: "https://archive.org/download/PADVIDEOABANDONWAREEDITION/FotoShock_CS6.appimage",
        filename: "FotoShock_CS6.appimage"
    },
    {
        name: "Audacity",
        category: "System",
        thumb: "https://s12.gifyu.com/images/bvzbj.gif",
        originalUrl: "https://github.com/audacity/audacity/releases/download/Audacity-3.4.2/audacity-linux-3.4.2-x64.AppImage",
        filename: "audacity.AppImage"
    },
    {
        name: "Bottles",
        category: "System",
        thumb: "https://cdn-icons-png.flaticon.com/512/3437/3437507.png",
        originalUrl: "https://github.com/ivan-hc/Bottles-appimage/releases/download/20260202-153650/Bottles_61.1-1-archimage5.0-x86_64.AppImage",
        filename: "Bottles_61.1-1-archimage5.0-x86_64.AppImage"
    }
];

console.log("// --- BANCO DE DADOS DE APPS ---");
console.log("// DICA: Use links diretos que terminem em .AppImage");
console.log("const defaultApps = [");

appsWithUrls.forEach((app, index) => {
    const encodedUrl = parkSystemEncode(app.originalUrl);
    console.log("    {");
    console.log(`        name: "${app.name}",`);
    console.log(`        category: "${app.category}",`);
    console.log(`        thumb: "${app.thumb}",`);
    console.log(`        link: "${encodedUrl}",`);
    console.log(`        filename: "${app.filename}"`);
    console.log("    }" + (index < appsWithUrls.length - 1 ? "," : ""));
});

console.log("];");