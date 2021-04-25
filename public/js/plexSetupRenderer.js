let localIp = ipcRenderer.sendSync('get-local-ip');

document.getElementById('plexcord-ip').innerHTML = `http://${localIp}:7648/webhook`;