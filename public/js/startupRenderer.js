let localIp = ipcRenderer.sendSync('get-local-ip');

if (document.getElementById('plexcord-ip')) {
    document.getElementById('plexcord-ip').innerHTML = `http://${localIp}:7648/webhook`;
}

ipcRenderer.on('id-change', (event, arg) => {
    if (document.getElementById('plexcord-id')) {
        document.getElementById('plexcord-id').innerHTML = arg;
        document.getElementById('plexcord-id-save').removeAttribute('disabled');
    }
})

const usernameSave = () => {
    ipcRenderer.send('save', { key: 'plex-username', value: document.getElementById('plex-username').value });
    window.location.href = "./startupClient.html"
}

const idSave = () => {
    ipcRenderer.send('save', { key: 'plex-client-id', value: document.getElementById('plexcord-id').innerHTML });
    window.location.href = "./startupDone.html";
    ipcRenderer.send('startup-closable');
}