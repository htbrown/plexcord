const Journl = require("journl"),
    express = require("express"),
    discordRpc = require("discord-rpc"),
    multer = require("multer"),
    config = require("./config");

const log = new Journl(),
    app = express(),
    upload = multer({ dest: "./temp" });

const rpc = new discordRpc.Client({ transport: 'ipc' });

let playId;

app.post("/webhook", upload.single("thumb"), (req, res) => {
    let payload = JSON.parse(req.body.payload);
    log.info(`Payload received for ${payload.event} from client ${payload.Player.uuid}`);

    if (config.clientIds.includes(payload.Player.uuid) || config.clientIds.length < 1) {
        if (payload.event === "media.play" || payload.event === "media.resume") {
            let startTimestamp = new Date();
            rpc.setActivity({
                details: `🎵 ${payload.Metadata.title} - ${payload.Metadata.grandparentTitle}`,
                state: `💿 ${payload.Metadata.parentTitle}`,
                startTimestamp,
                largeImageKey: config.discord.icon,
                largeImageText: `Plexcord v${require("./package.json").version}`,
                smallImageKey: "play",
                smallImageText: "Playing",
                instance: false
            })
            log.success(`Set status for ${payload.Metadata.title} - ${payload.Metadata.grandparentTitle}`)
        } else if (payload.event === "media.pause") {
            rpc.setActivity({
                details: `🎵 ${payload.Metadata.title} - ${payload.Metadata.grandparentTitle}`,
                state: `💿 ${payload.Metadata.parentTitle}`,
                largeImageKey: config.discord.icon,
                largeImageText: `Plexcord v${require("./package.json").version}`,
                smallImageKey: "pause",
                smallImageText: "Paused",
                instance: false
            })
            log.success("Paused.")
        } else if (payload.event === "media.stop") {
            rpc.clearActivity();
            log.success("Stopped.")
        } else {
            log.info("Ignored event. Skipping...")
        }
    } else {
        log.success("Ignored client. Skipping...")
    }
    res.sendStatus(200);
});

app.listen(config.port, () => {
    log.success(`Listening on port ${config.port}.`)
});

const clientId = config.discord.clientId;

rpc.login({ clientId }).catch(console.error);