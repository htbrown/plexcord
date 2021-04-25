const { app, BrowserWindow, Menu, Tray, ipcMain, dialog, Notification } = require('electron');
const ex = require('./express');

let win;

const settingsWindow = () => {
    win = new BrowserWindow({
        width: 1000,
        height: 800,
        resizable: false,
        minimizable: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadURL(`file://${__dirname}/public/html/settings.html`);
}

module.exports.start = (log, db) => {
    log.info('Starting up Electron.')

    let tray = null;

    app.on('ready', () => {
        app.server = ex.start(log, db);
        tray = new Tray(__dirname + '/assets/tray.ico');
        let contextMenu = Menu.buildFromTemplate([
            { label: `Plexcord v${require('./package.json').version}`, type: 'normal', enabled: false},
            { label: 'Settings', type: 'normal', click: () => {
                settingsWindow();
            } },
            { label: 'Quit', type: 'normal', click: () => {
                app.quit();
            } }
        ]);
        tray.setContextMenu(contextMenu);
        log.success('Electron started.')
    })

    app.on('window-all-closed', () => {
        log.info('All windows closed.');
    })

    app.on('before-quit', (e) => {
        let confirm = dialog.showMessageBoxSync(win, {
            title: 'Are you sure?',
            detail: 'Are you sure you want to quit Plexcord?',
            type: 'question',
            buttons: ["Yes", "No"]
        });

        if (confirm === 1) {
            e.preventDefault();
        }
    })

    ipcMain.on('quit', (event, arg) => {
        app.quit();
    })

    ipcMain.on('save', (event, arg) => {
        db.set('startup', arg.startup);
        db.set('style', arg.style);
        db.set('plex-username', arg.username);
        db.set('plex-client-id', arg.clientId);
        db.set('pause-timeout', arg.pauseTimeout);

        event.reply('save-reply')
    })

    ipcMain.on('get-settings', (event, arg) => {
        event.reply('get-settings-reply', {
            startup: db.get('startup'),
            style: db.get('style'),
            username: db.get('plex-username'),
            clientId: db.get('plex-client-id'),
            pauseTimeout: db.get('pause-timeout')
        })
    })

    ipcMain.on('reset-db', (event, args) => {
        db.set('startup', true);
        db.set('style', 'music');
        db.set('plex-username', '');
        db.set('plex-client-id', '');
        db.set('pause-timeout', 2);

        event.reply('reset-db-reply');
    })

    ipcMain.on('get-local-ip', (event, args) => {
        require('dns').lookup(require('os').hostname(), function (err, add, fam) {
            event.returnValue = add;
        })
    })

    ipcMain.on('invalid-config', (event, args) => {
        let notification = new Notification({
            title: 'Invalid Configuration',
            body: 'Something is wrong with your settings. Make sure they are all filled out and are all correct.'
        });
        notification.onclick = () => {
            settingsWindow();
        }
        notification.show();
    })
}