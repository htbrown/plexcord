const el = require('./electron');

const Journl = require('journl');
const log = new Journl();

const Store = require('electron-store');
const db = new Store();

el.start(log, db);