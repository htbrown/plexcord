const el = require('./electron');

const Journl = require('journl');
const log = new Journl();

const Store = require('electron-store');
const db = new Store();

const AutoLaunch = require('auto-launch');
let autoLaunch = new AutoLaunch({
    name: "Plexcord"
});

autoLaunch.isEnabled().then((isEnabled) => {
    if (db.get('startup') === true) {
        if (isEnabled) return;
        autoLaunch.enable();
    } else {
        autoLaunch.disable();
    }
})

let autoLaunchUnsub = db.onDidChange('startup', (oldValue, newValue) => {
    if (newValue === false) {
        autoLaunch.enable();
        log.success('Enabled auto launch.')
    } else {
        autoLaunch.disable();
        log.success('Disabled auto launch.')
    }
})

el.start(log, db);