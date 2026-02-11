const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  fetchGames: () => ipcRenderer.invoke('fetch-games'),
  startDownload: (url, filename) => ipcRenderer.send('start-download', { url, filename }),
  pauseDownload: (url) => ipcRenderer.send('pause-download', url),
  resumeDownload: (url) => ipcRenderer.send('resume-download', url),
  cancelDownload: (url) => ipcRenderer.send('cancel-download', url),
  
  onProgress: (callback) => ipcRenderer.on('download-progress', callback),
  onComplete: (callback) => ipcRenderer.on('download-complete', callback)
});