const startupCheckbox = document.getElementById('startup-checkbox');
const presenceStyle = document.getElementById('style');
const plexUsername = document.getElementById('plex-username');
const plexClientId = document.getElementById('plex-client-id');
const pauseTimeout = document.getElementById('pause-timeout');

const saveButton = document.getElementById('save');

const resetSaveButton = () => {
    setTimeout(() => {
        saveButton.classList.remove('is-danger');
        saveButton.classList.add('is-success');
        saveButton.innerHTML = 'Save'
    }, 5000)
}

const save = () => {
    saveButton.classList.add('is-loading');

    if (!presenceStyle.value || !plexUsername.value || !plexClientId.value || !pauseTimeout.value) {
        saveButton.classList.remove('is-success');
        saveButton.classList.add('is-danger');
        saveButton.classList.remove('is-loading');
        saveButton.innerHTML = 'Fill out all fields.'
        resetSaveButton();
        return;
    }

    ipcRenderer.send('save', { key: 'startup', value: startupCheckbox.checked });
    ipcRenderer.send('save', { key: 'style', value: presenceStyle.value });
    ipcRenderer.send('save', { key: 'plex-username', value: plexUsername.value });
    ipcRenderer.send('save', { key: 'plex-client-id', value: plexClientId.value });
    ipcRenderer.send('save', { key: 'pause-timeout', value: pauseTimeout.value });

    saveButton.classList.remove('is-loading');
    saveButton.innerHTML = 'Saved'
    resetSaveButton();
}

ipcRenderer.on('reset-db-reply', (event, args) => {
    window.location.reload();
})

let resetConfirm = false;

const resetDb = () => {
    if (resetConfirm) {
        ipcRenderer.send('reset-db');
    } else {
        document.getElementById('reset').innerHTML = 'Click again to confirm reset.'
        resetConfirm = true;
    }
}

ipcRenderer.on('get-settings-reply', (event, arg) => {
    startupCheckbox.checked = arg.startup
    presenceStyle.value = arg.style
    plexUsername.value = arg.username
    plexClientId.value = arg.clientId
    pauseTimeout.value = arg.pauseTimeout
})

ipcRenderer.send('get-settings');