const request = require('request');
const fs = require('fs');
const yaml = require('js-yaml');
const cron = require('cron').CronJob;
const TelegramBot = require('./telegram');

const bot = new TelegramBot();
let urlConfig = yaml.safeLoad(fs.readFileSync('url.yml'));

try {
    const job = new cron('0 0,15,30,45 * * * *', () => {
        urlConfig = yaml.safeLoad(fs.readFileSync('url.yml'));
        if (urlConfig) {
            const keys = Object.keys(urlConfig);
            keys.forEach(key => {
                const url = urlConfig[key];
                request(url, (err, response, body) => {
                    if (err) {
                        // send message;
                        bot.sendMessage(err.message);
                    } else {

                    }
                });
            });
        }
    });
    job.start();
} catch (e) {
    console.error(e);
}