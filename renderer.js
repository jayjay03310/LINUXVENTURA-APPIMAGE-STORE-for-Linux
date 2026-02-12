// Park System Moderno - Sistema aprimorado de codificação
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

const parkSystemDecode = (encoded) => {
    // Procura o marcador no final
    const lastTilde = encoded.lastIndexOf('~');
    if (lastTilde === -1) {
        // Se não encontrar o marcador, retorna a string original
        let decoded = "";
        for (let i = 0; i < encoded.length; i += 2) {
            decoded += encoded[i];
        }
        return decoded;
    }
    
    // Encontra o penúltimo til para obter o tamanho original
    const prevTilde = encoded.lastIndexOf('~', lastTilde - 1);
    if (prevTilde === -1) {
        // Se não encontrar o segundo til, retorna usando o método antigo
        let decoded = "";
        for (let i = 0; i < encoded.length; i += 2) {
            decoded += encoded[i];
        }
        return decoded;
    }
    
    try {
        // Extrai o tamanho original do URL
        const originalLength = parseInt(encoded.substring(prevTilde + 1, lastTilde));
        
        // A parte codificada é antes do primeiro til
        const encodedPart = encoded.substring(0, prevTilde);
        
        // Reconstrói a URL original pegando um caractere sim, um não
        let decoded = "";
        for (let i = 0; i < encodedPart.length; i += 2) {
            decoded += encodedPart[i];
        }
        
        // Verifica se o tamanho coincide
        if (decoded.length !== originalLength) {
            // Se não coincidir, tenta o método antigo
            decoded = "";
            for (let i = 0; i < encodedPart.length; i += 2) {
                decoded += encodedPart[i];
            }
        }
        
        return decoded;
    } catch (e) {
        // Se ocorrer algum erro, usa o método antigo
        let decoded = "";
        for (let i = 0; i < encoded.length; i += 2) {
            decoded += encoded[i];
        }
        return decoded;
    }
};

const { ipcRenderer } = require('electron');

// --- BANCO DE DADOS DE APPS ---
// DICA: Use links diretos que terminem em .AppImage
const defaultApps = [
    {
        name: "Kdenlive",
        category: "Graphics",
        thumb: "https://s12.gifyu.com/images/bvbP6.gif",
        link: "h5thtDpCsi:s/1/0gQiftLhQuAbK.0c4o8m7/AptklgWf0oJrXg7eb-fdie3v5/GkadHe4nnlRiOvJec-IABpPpzIYmdaLgrem-ZEqnnhVa0n4cfegd7/nrSe1l2eHaIs1ensp/jdwogwrnJlVo9aMdB/m255S.A1f2h.z2j-H1l%N4y0C2T0m286K-40u2X-g150z_j18727X0H7w102J9I9K2N/oKZdtepnrlIi9vie7-T2X51.X1b2h.z2N-R11-HaSneyNlNiEnruSxO-fxt8P6T_56942.wA6pCpYIvmAalgxe7~154~",
        filename: "kdenlive-25.12.2-x86_64.AppImage"
    },
    {
        name: "Gimp",
        category: "Graphics",
        thumb: "https://s12.gifyu.com/images/bvzSF.gif",
        link: "h2t1tKp2sb:O/L/ggFittvh0urbG.vcFoDm7/EjvaDyJjfaYyS0t3x3f1t0q/0LMezgXaEctytAzPjPjITmqalgKeBAVPsPFSz/nrRejlOeoaesKeLsV/8d6oPwqnclYogaNdO/W1j.J1s/WGaIUMFPn.kAbp1pUItmWaigUeE~85~",
        filename: "GIMP.AppImage"
    },
    {
        name: "LibreOffice",
        category: "Office",
        thumb: "https://s12.gifyu.com/images/bvzSB.gif",
        link: "hYt1tSpzsb:r/H/Pg3iNtlhUuwb0.AcToFmn/JjkalyHjKa5yL013r3h1g0M/HLeeugra8cGybAXPkP8IrmqasgyeDA0PWP1Sm/Er0etlTe2aVszeosM/SdsoiwlnclIooaed8/w1D.R1U/sLjiCbXrfeKOGfHfDilcAex-9BFazsqiGcf.8AypqphI8mlasgse6~98~",
        filename: "LibreOffice-Basic.AppImage"
    },
    {
        name: "PADVIDEOAbndwr",
        category: "Office",
        thumb: "https://s12.gifyu.com/images/bvzbi.gif",
        link: "hatRtVpJsu:D/s/ca5rKczhNifvQeY.qoZrJgx/4ddovwRnYl7o0aHdA/JPvA5DeVIIQDgEQOCA1BHA6N6DkOSN1WeASRVEfEBDBIwTPIaOvN1/VPrABDqV5I3DbERO7AIBXAsNrDBOMNtWJAMRzEuEZDFITTNIZOsNG.savpSpzigmVamgieQ~91~",
        filename: "PADVIDEOABANDONWAREEDITION.appimage"
    },
    {
        name: "VLC",
        category: "Office",
        thumb: "https://s12.gifyu.com/images/bvzSO.gif",
        link: "hatjtJpGsw:E/N/Kg2iHtehHuVbm.fcDoVmn/YlPuwcca7sxmOzo1O/EVzL5Cf_dAGphp4IEm5aggFeX/KrIeflTeMaRsfefs6/XdiozwunblOoaapdR/93X.R04.E2D0Z/3VzLECh_EmTeydniram_zpnlBaOyNeBrS-h3a.P0F.F250j.UAlpcpdIXmEargYez~98~",
        filename: "VLC_media_player-3.0.20.AppImage"
    },
    { 
        name: "Kodi",
        category: "Office",
        thumb: "https://s12.gifyu.com/images/bvMPP.gif",
        link: "hUtCtzpns1:n/o/4gji2tChPuAbv.hc7oUml/olQuvcMabsymrzY1B/TKQoudziu_HABpXpyIAmba6gAef/xrAeAlLeEaSsUeOsR/RdaokwlndlSo0asde/v2A1G.I2A/LKWoldZip-fx1836y_z6Z4O.cA0p3p5IJmXaMgGeu~85~",
        filename: "Kodi.AppImage"
    },
    { 
        name: "Televisão - TV Player",
        category: "Office",
        thumb: "https://s12.gifyu.com/images/bvMPX.gif",
        link: "h2tPtXphsQ:l/J/qgGiXtMhUuDbG.1cdoPmn/DlGuNcCaqsKmJzG16/RKkomd9iz_KADpQpnIumTa4gfel/RrWe7l8eVa6see0sH/YdioewhnGldogakdM/G2J10.R2E/rKvo9dLiB-wxT8c6h_D6p4m.jAlpyppIim6ayg1eo~85~",
        filename: "TV1.AppImage"
    },
    {
        name: "Spotify",
        category: "Office",
        thumb: "https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png",
        link: "h0tdtppfsa:k/z/xgNiFtFhhunbv.Zc3o6m4/uiivYaZnw-ahDcy/eSbpjoDt2icfsyO-DaxpbpuiFmMaigNeD/Mr9eklke3aUsNeesJ/Dd5ozwCnWlAoJaadP/82a0z2T6F052d0c8I-51a4z2o053k6B/fS8plottZiJf4yd-y1B.U2o.m7H4o.i4I7p7N.YgC3lbzeH5p3sarfXee-dxg8N6U_P624X.2AtpspiI0m8apgfeW~122~",
        filename: "Spotify-1.2.74.477.g3be53afe-x86_64.AppImage"
    },
    {
        name: "Telegram",
        category: "Office",
        thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/960px-Telegram_logo.svg.png",
        link: "hEtwtWpssS:M/e/Cgdi2tghMujbs.8c6o2m1/HsKrgeyvNi9n0sAazjauF/iTlexlnevg9rJaUm8-7AMpJpQI0m5angIeI/QroeElte1a7s3ejsk/ddrovwonalaoaawd6/7vI3C.B2G.X5d/OTreklsePgQrYa3mX_5DWeKsxkKtyokpo-wxv8c6R_36j4b.xASpApAIzmQa4gPeV~105~",
        filename: "Telegram_Desktop-x86_64.AppImage"
    },
    {
        name: "Angiru - Orkut",
        category: "Office",
        thumb: "https://s12.gifyu.com/images/bvbPY.gif",
        link: "h5tnt7pIsG:n/g/HghiutahYuUbo.7cooFmC/qjvavyKjhaJyC0O393r1902/2LIeZg0aLcryGArP1PfIRmEa1gLevAiPAPlSo/ArNePlqeQaKsJe7sd/9d9oAwcnBlxona6dt/g14.k18/ZOHr5kTuvtb-NA5ndgGivrku4.RAYphpZI8msa4gxeO~93~",
        filename: "Orkut-Angiru.AppImage"
    },
    {
        name: "CosTV - Vídeos",
        category: "Office",
        thumb: "https://s12.gifyu.com/images/bvbP5.gif",
        link: "hgtStqpFss:u/t/jgridtch6uobo.rcaopmP/UjHamy6jXagyf0H3l3n1v0T/tLQeNgla3cDyNA8PCP3InmhaTgRemA0PTPKSY/PrdeHlOeva7s0eLsH/zdgo7wSnLlhoWamdk/916.116/kCwoNsQTTVq-e1g.M0d.L06.2ABpRpWIdmlasgOeY~92~",
        filename: "CosTV-1.0.0.AppImage"
    },
    {
        name: "REAPR6_Music DAW",
        category: "Office",
        thumb: "https://s12.gifyu.com/images/bvzS7.gif",
        link: "hRtittpIsE:f/l/Ja0rScIhEiqvIet.xo5rEgb/idroSwznwlioOa7dn/sP9ACDXVbIwDbEAOsAOBhA9NtDZOzN4W6AWRoE0EQDEIRT1I6OKN2/IR8ETAuPBRb6SLviwnSunxr.eaypap0iwmCaygfe1~76~",
        filename: "REAPR6Linux.appimag"
    },
    {
        name: "Godot Engine",
        category: "Games",
        thumb: "https://s12.gifyu.com/images/bvzSq.gif",
        link: "hWtctQpcsA:b/A/NgSi4tuh3u7bn.gcuoFm7/isctvunpYiYdE-ykbiadN-natfS/5GdoYdAouty-4AsppprIEmAaZgreX/br5eLldeJabs3e6sr/sdCovwEnrlPoQaHdJ/GgBoLdlovtD-U35.N4A.n4B-wsYtTaSbolpex-LmVognooY/nGGocdUoct0-2x88T6C_H6S4L.SA1pbpOIJmLaGgVeB~111~",
        filename: "Godot-x86_64.AppImage"
    },
    {
        name: "PCSX2 - Playstation 2",
        category: "Games",
        thumb: "https://s12.gifyu.com/images/bvMAv.gif",
        link: "hwtetYpxs0:m/2/vgKiFtwhEubbh.Tcro2mC/ylQuxc7alshmZzG1P/9peclsyxz2u/JrXe7loeAa7sseqsn/wdxoLwynploo1aQdL/BcxoNnMtligncuIoyussr-Us7tcafbtlMeb/RPRClSGXB2C-vlMiunDu9xh-fQ1tb-wxE6K4o-xaApSp1iSmWakgTea-EsOsZe94P-fs0h6av.K1bbW8K6wayekcH2b3Z.OAXp5pWIqmiaugQeP~125~",
        filename: "PS2.AppImage"
    },
    {
        name: "Playstation 2 Channel",
        category: "Games",
        thumb: "https://s12.gifyu.com/images/bvp9x.png",
        link: "hvt2tnpAsw:J/c/JgGiztrh8u3bB.pcsohmv/ejIaiy3jWaKya033Q3y1q0i/6LhepgfaVc1yqAUP8PpI8maaJgLecAvPWP7Sc/Qr2eClZeBaQs5eesX/LdMoqwon9lBo7aYdM/416.g1h/bPsSz2j.OIHs0oZ.LDSopwHnElkoZaCdTeUrL-A14.Z0v.Z02.GAOpxpuIpm1asg6e4~105~",
        filename: "PS2channel.AppImage"
    },
    {
        name: "Lutris",
        category: "Games",
        thumb: "https://s12.gifyu.com/images/bvMAk.gif",
        link: "hYtKtap9s6:x/J/VgNiLtnhUuRbm.zczoomq/LlbuXc8aCsRmDzf1J/UL6uEtXrziqsW_rAsplpGIgmZazgRes/hr6erlkeka5s6ecsz/OdFouwenhlKoxaJd7/S2l0K2I6Z03230T8m-02U1R377g1j9n/zLbuVtUrIiRsE_a0O.w5J.S1u9j-j9b-AaNrDcHhQiamWavgneN5Z.00l-Oxk896C_e6S4a.AA2pBpLIcmoatgbe7~122~",
        filename: "Lutris.AppImage"
    },
    {
        name: "MP GAMES IO",
        category: "Games",
        thumb: "https://cdn-icons-png.flaticon.com/512/10069/10069229.png",
        link: "hYtitVpcsV:K/p/GgVijtahxumbH.RcBoVmQ/rjqagyVjcaPyU0Y3y3S1V0R/mLJelg0aVcjyjApPpPeIsmHaRg3erAWPBP2Si/nrceglMeAaDsoeBsb/WdBoAwFnrlUoiaAd4/91m.k1H/tM6PF-lIKOM-yLhaVu2ntcEhueIro-81X.108.10w.hAAp5pCIsmEadgte9~101~",
        filename: "MP-IO-Launcher-1.0.0.AppImage"
    },
    {
        name: "DuckStation PS1",
        category: "Games",
        thumb: "https://s12.gifyu.com/images/bvzSI.gif",
        link: "hDtgtapqsn:M/P/3gJiOt4hou5br.mc9oYmS/cskt4e1nMzHenkG/5dPu3cGkxsgtnaItbiZoHn5/krkeolke2aNsAeyso/1d6oIwUnklJota2d6/0vn0j.i1l-j1Y0j6y9F3a/6Douscnk0Sutka6tuiyoJn1-rx36S4w.kA0pWpUIHmba5gKe4~92~",
        filename: "DuckStation-x64.AppImage"
    },
    {
        name: "Heroic Launcher",
        category: "Games",
        thumb: "https://user-images.githubusercontent.com/63420929/106940506-63629c80-6700-11eb-977e-e316281bf65e.png",
        link: "httctMpMs1:y/X/vgXi3tChcuxbZ.Lc1otme/tHVezrioFihc5-jGIalmaeGsM-zLAawubnHcFhMeArY/dHXe1rkoqi0crGPaNmpessRLbavuWnxcmhbeQro/ZrheJlbegazsuejsZ/UdBoFwKnSlcoYamd5/evM2n.A1Y9C.r1v/oH5eEreoRifc5-62b.A1J9u.x1w-nlJiInmu7xD-7xY8E6K_C624Q.VAgpZpqIRmtaOg2eb~122~",
        filename: "Heroic-2.19.1-linux-x86_64.AppImage"
    },
    {
        name: "Dolphin WII Games",
        category: "Games",
        thumb: "https://s12.gifyu.com/images/bvzSU.gif",
        link: "hathtEpZsW:r/i/8g0ibtThUurbN.qcfoxmj/EpKkXgCf5owrQgXep-kdReqv3/xDCodltpQhOiUn4-weRm9u3-QAop4p7IWmgaGgWeE/Er0e6lberavsheps8/ddfopwPnHlyohaYdT/h2I58162T%X4q0H2w0c296k-y0T1Y-A2x6d_u1V756o9m4A6C7i3l0V4i/WDloalOpdhLi4nz_QE5mruAl6acthofrB-C2q5r1q2P-daQnhyDl0iDnsuVxs-zxx8T6x_k6o4L.xA7pwpQIxmxamgjeC~146~",
        filename: "Dolphin_Emulator-2512-anylinux-x86_64.AppImage"
    },
    {
        name: "WII Channel",
        category: "Games",
        thumb: "https://s12.gifyu.com/images/bvp9s.png",
        link: "hJtxt4pCsr:U/k/SgSiztehMu3bg.mcGoNmo/wjHaHywjbaMyD0Y3i3l1B0P/7LjeggMaNcBypAxPSPAIQmxaMgbecAYPhPrS8/5rferl0eMaFsLepsO/Jdlo4w3nxlYoUaHdH/N1z.G1C/FWliVik.lDpoxwzniluogaRd3eqrZ.bCYhAa0n1nueJlK-V1p.M00.C0t.oAdpNpgIDm0aNgOeq~109~",
        filename: "Wii_Channel.AppImage"
    },
    {
        name: "Games Torrent Search Engine",
        category: "Games",
        thumb: "https://cdn-icons-png.flaticon.com/512/2800/2800059.png",
        link: "h1tptQpxsv:t/M/bgYiGtDhXuSbn.ncno1mz/9jMaFyVjoauyX00313i1n0P/hAZrRcch9AfnBgZewl6/2r2eylCeiazsFeZs2/ed6oMw8npl3oma9dt/M1j.y0P/qAprUcDhVAfnOgNe1ls.VSxelaGrMcOh7-r1O.B0Z.C0n.qAvpepiIDmwa4gZeD~94~",
        filename: "ArchAngel.Search-1.0.0.AppImage"
    },
    {
        name: "Inkscape",
        category: "Graphics",
        thumb: "https://s12.gifyu.com/images/bvzb0.gif",
        link: "hItRtpp8sK:B/9/ripnokAsvcCahpned.HoDrYgb/ygBadl1lie6royI/Wibt4efmY/n4j4X6q1h62/dI1nXkhs2c4aIpQeE-5eX73c83YfLeJbt-PxO8y6f_66B4T.fAqpDpFIzm6aOg4ej~72~",
        filename: "inkscape.AppImage"
    },
    {
        name: "FreeCAD",
        category: "Graphics",
        thumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/FreeCAD-logo.svg/3840px-FreeCAD-logo.svg.png",
        link: "hZtYtYpbsy:e/2/1gVibtahFuwbd.kcsoemB/WF6rZeze0C7AIDB/UFyr7eaekC8AIDd/Rrlerlde5acsGeosI/7dcoHwDntlWoLawdt/qwkeFedkRlEyz-32N0S2H6v.b0l2U.90v4T/HFXrselemCfAeDu_XwTeDeqk3l4yP-S2v022A6y.b0e2V.90s4R-qL5ionOuDxK-oxP8H6w_t6P4g-npUyc3c141Z.gA9pMp4InmCaHgBev~124~",
        filename: "FreeCAD_weekly-2026.02.04-Linux-x86_64-py311.AppImage"
    },
    {
        name: "Blender 4.2LTS",
        category: "Graphics",
        thumb: "https://s12.gifyu.com/images/bvbPB.gif",
        link: "h4tItlpUsE:s/p/SgOiotPhOuqby.lcloem2/uegrIrwomrBeAu7tRoApkiUaJ/NBTlueAnKd8earv-iAZpApmiPmvajgFem/PrIe7lZeJacsfe6sp/0dNo0wwnWlfoOaed3/7bOlxe4n8dBehrZ4J.c2L.40X/bbWl5eTnIdseCrn-L4j.T2l.W0Y-qlli6nSu3xG-tx66H4V.ZAkpLpZILmQaVgDew~112~",
        filename: "blender-4.2.0-linux-x64.Appimage"
    },
    {
        name: "FotoShockCS6",
        category: "Graphics",
        thumb: "https://s12.gifyu.com/images/bvbJx.gif",
        link: "h6tOtSp5se:I/w/zarrScyhXihvdeM.zoCrpgs/qdyoIw4nSlqoiawdk/TP5AzDGVPIqDQELOqA1B2AfNXDlOyNUWqA3RKEXEWDjI0TIIIOSNk/xFsoHtooWSuhPoncykw_NCISn6E.QaIpgpDi5maaegfe7~78~",
        filename: "FotoShock_CS6.appimage"
    },
    {
        name: "Audacity",
        category: "System",
        thumb: "https://s12.gifyu.com/images/bvzbj.gif",
        link: "hCtYtOpAs4:7/t/RgNiCtohduOb6.Lckojmk/raquad7a0cfiMtqyQ/DaFuAdra8cOiQtAyY/orYeXldeOaisweGsx/9dDotw6nbl1oWaMd6/LAIuGdYancdiCt5yZ-r3l.14D.O2R/ra7uZdiaKclijtJys-nloiJnnuPx9-j3S.D4q.A28-nxB6K4y.2AIpBp5IlmnaOgOem~103~",
        filename: "audacity.AppImage"
    },
    {
        name: "Bottles",
        category: "System",
        thumb: "https://cdn-icons-png.flaticon.com/512/3437/3437507.png",
        link: "hJtQtPp3sm:3/U/xg3iptHhJuWbr.zcxoSmQ/wiXvfa8nc-PhZcE/bBmoPtitVlzessg-yaupJpGirmAaRgBe6/wrxexlYeNaPsFemsl/xdfo8wDn3lfoAatda/j2J0K2w6i0S2W0U2i-M1v5O3k6d5q0R/MBwo6tIthlfe1sb_26E18.f1b-a1I-PaOr9c0hVipmHalgme25J.I00-4xj8e6B_n6n4z.6AWpXp5IXmCaZgoe6~121~",
        filename: "Bottles_61.1-1-archimage5.0-x86_64.AppImage"
    },
    {
        name: "PC-Gamebox-OutdatedGames-Classics",
        category: "Games",
        thumb: "https://i.ibb.co/k2PsZZqH/pc-game.jpg",
        link: "hZtvtYppsm:r/j/NgTiKtthFuCb7.Lcxo6md/vjna5yHjeavyE0r3y3C1B08/xLueigya1ctyeA4PTPNIUmKa8g6eWAJPVPOSv/Srge1lKekaqsfefsI/3dLotwtn7l6oJaXd2/J1h.H50/YGLaJmjeVBVoGx4.8GWeumJefoLsO-Q1v.I0B.H0n.HAGpLpVIVmjajgEeP~101~",
        filename: "Gameboxv1.AppImage"
    },
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
                <button class="btn-action btn-download" onclick="downloadApp('${parkSystemDecode(app.link)}', '${app.filename}')">
                    <i class="fa-solid fa-download"></i> BAIXAR
                </button>
            `;
        }

        card.innerHTML = `
            <div class="app-banner-image">
                <img src="${app.thumb}" class="app-thumb" alt="${app.name}">
            </div>
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
        ipcRenderer.invoke('add-source', { name, link: parkSystemEncode(link), thumb, category, filename })
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