const kill = require('fkill');
const psList = require('ps-list');
const cron = require('cron').CronJob;

const chromeRegex = new RegExp(/chrome/);
const killCount = 10;

let checkCount = 0;
const job = new cron('0 * * * * *', () => {
    const killList = [];
    psList().then(processes => {
        let counted = false;
        processes.forEach(process => {
            if (chromeRegex.test(process.name)) {
                if (!counted) {
                    checkCount ++;
                    counted = true;
                }
                console.log(checkCount);
                if (checkCount >= killCount) {
                    killList.push(process.pid);
                }
            }
        });
        kill(killList, {
            force: true
        }).catch(e => {});
        if (checkCount >= killCount) {
            checkCount = 0;
        }
    }).catch(e => {
        console.error(e);
    });
});

job.start();
