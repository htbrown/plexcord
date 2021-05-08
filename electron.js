const { app, BrowserWindow, Menu, Tray, ipcMain, dialog, Notification } = require('electron');
const ex = require('./express');

let settingsWin;

const settingsWindow = () => {
    settingsWin = new BrowserWindow({
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

    settingsWin.loadURL(`file://${__dirname}/public/html/settings.html`);
}

let startupWin;
let startupWinOpen = false;

const startupWindow = () => {
    startupWin = new BrowserWindow({
        width: 600,
        height: 600,
        resizable: false,
        minimizable: false,
        maximizable: false,
        closable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    startupWin.loadURL(`file://${__dirname}/public/html/startup.html`);
    startupWinOpen = true;

    startupWin.on('closed', () => {
        startupWin = null;
        startupWinOpen = false;
    })
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
                if (!startupWinOpen) {
                    settingsWindow();
                } else {
                    let notification = new Notification({
                        title: 'Finish Setup',
                        body: 'Please finish the setup before further configuration.'
                    });
                    notification.show();
                }
            } },
            { label: 'Quit', type: 'normal', click: () => {
                app.quit();
            } }
        ]);
        tray.setContextMenu(contextMenu);

        if (!db.get("plex-username") || !db.get("plex-client-id") || !db.get("startup") || !db.get("style") || !db.get("pause-timeout")) {
            log.warn("Invalid or no database. Running through initial setup.");
            db.set('startup', true);
            db.set('style', 'music');
            db.set('plex-username', '');
            db.set('plex-client-id', '');
            db.set('pause-timeout', 2);
            startupWindow();
        }

        log.success('Electron started.')
    })

    app.on('window-all-closed', () => {
        log.info('All windows closed.');
    })

    ipcMain.on('quit', (event, arg) => {
        app.quit();
    })

    ipcMain.on('save', (event, arg) => {
        db.set(arg.key, arg.value);
        log.success(`Saved value ${arg.value} in key ${arg.key}.`)
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
        if (!startupWinOpen) {
            let notification = new Notification({
                title: 'Invalid Configuration',
                body: 'Something is wrong with your settings. Make sure they are all filled out and are all correct.'
            });
            notification.onclick = () => {
                settingsWindow();
            }
            notification.show();
        } else {
            return;
        }
    })

    ipcMain.on('recent-id', () => {
        if (startupWin) {
            startupWin.webContents.send('id-change', db.get('recent-id'));
            return;
        }
        if (settingsWin) {
            settingsWin.webContents.send('id-change', db.get('recent-id'));
            return;
        }
    })

    ipcMain.on('startup-closable', () => {
        if (startupWin) {
            startupWin.closable = true;
        }
    })
}