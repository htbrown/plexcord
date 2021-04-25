module.exports.start = (log, db) => {
    const express = require('express');
    const app = express();
    const discordRpc = require('discord-rpc');
    const { ipcMain } = require('electron');
    
    const multer = require('multer'),
        upload = multer({ dest: './temp' });

    const rpc = new discordRpc.Client({ transport: 'ipc' });
    
    log.info('Starting up Express.')

    let playing = false;

    const clearActivity = () => {
        setTimeout(() => {
            if (playing === false) {
                rpc.clearActivity();
                log.info('Removed presence.');
            } else {
                return;
            }
        }, db.get('pause-timeout') * 60000)
    }

    app.get('/', (req, res) => {
        res.send(`Plexcord v${require('./package.json').version} by Hayden Brown`);
    })

    app.post('/webhook', upload.single('thumb'), (req, res) => {
        let payload = JSON.parse(req.body.payload);
        log.info(`Payload received for ${payload.event} from client ${payload.Player.uuid}.`);

        if (!db.get('plex-username') || !db.get('plex-client-id') || !db.get('style') || !db.get('startup') || !db.get('pause-timeout')) {
            ipcMain.emit('invalid-config');
            log.error('Invalid config.');
            res.sendStatus(500);
            return;
        }

        let detailsEmoji, stateEmoji;

        if (db.get('style') === 'music') {
            detailsEmoji = "🎵";
            stateEmoji = "💿";
        } else {
            detailsEmoji = "🎥"
            stateEmoji = "🎬"
        }

        if (db.get('plex-client-id') === payload.Player.uuid) {
            let startTimestamp;
            switch (payload.event) {
                case "media.play":
                    startTimestamp = new Date();
                    rpc.setActivity({
                        details: `${detailsEmoji} ${payload.Metadata.title} - ${payload.Metadata.grandparentTitle}`,
                        state: `${stateEmoji} ${payload.Metadata.parentTitle}`,
                        startTimestamp,
                        largeImageKey: 'plex',
                        largeImageText: `Plexcord v${require("./package.json").version}`,
                        smallImageKey: "play",
                        smallImageText: "Playing",
                        instance: false
                    })
                    log.success(`Set status for ${payload.Metadata.title} - ${payload.Metadata.grandparentTitle}`)
                    playing = true
                    break;
                case "media.resume":
                    startTimestamp = new Date();
                    rpc.setActivity({
                        details: `${detailsEmoji} ${payload.Metadata.title} - ${payload.Metadata.grandparentTitle}`,
                        state: `${stateEmoji} ${payload.Metadata.parentTitle}`,
                        startTimestamp,
                        largeImageKey: 'plex',
                        largeImageText: `Plexcord v${require("./package.json").version}`,
                        smallImageKey: "play",
                        smallImageText: "Playing",
                        instance: false
                    })
                    log.success(`Set status for ${payload.Metadata.title} - ${payload.Metadata.grandparentTitle}`)
                    playing = true
                    break;
                case "media.pause":
                    rpc.setActivity({
                        details: `${detailsEmoji} ${payload.Metadata.title} - ${payload.Metadata.grandparentTitle}`,
                        state: `${stateEmoji} ${payload.Metadata.parentTitle}`,
                        startTimestamp,
                        largeImageKey: 'plex',
                        largeImageText: `Plexcord v${require("./package.json").version}`,
                        smallImageKey: "pause",
                        smallImageText: "Paused",
                        instance: false
                    })
                    log.success(`Paused`);
                    playing = false
                    clearActivity();
                    break;
                case "media.stop":
                    rpc.clearActivity();
                    log.success('Stopped');
                    playing = false
                    break;
                default:
                    log.info('Ignored event. Skipping.')
                    break;
            }
        } else {
            log.info('Ignored client. Skipping.');
        }

        res.sendStatus(200);
    })

    app.listen(7648, () => {
        log.success('Express listening on port 7648.')
    })

    rpc.login({ clientId: "810213130453778473" }).catch(console.error);
} 