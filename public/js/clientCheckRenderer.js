ipcRenderer.on('id-change', (event, arg) => {
    if (document.getElementById('plexcord-id')) {
        document.getElementById('plexcord-id').innerHTML = arg;
    }
})