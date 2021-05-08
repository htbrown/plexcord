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

el.start(log, db);