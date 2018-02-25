require('dotenv').config();
const fs = require('fs');
const path = require('path');

const Bot = require('node-telegram-bot-api');

const token = process.env.telegramBotToken || 'YOUR_TELEGRAM_BOT_TOKEN';
const channels = process.env.telegramChannels || '';
const telegramId = process.env.telegramId;

const channelTablePath = path.resolve('channels.json');
fs.existsSync(channelTablePath) || fs.writeFileSync(channelTablePath, JSON.stringify({}), 'utf-8');
const file = fs.readFileSync(channelTablePath);
const channelTable = JSON.parse(file);

let instance = null;

module.exports = class TelegramBot {
    constructor() {
        if (!instance) {
            instance = this;
            this.initialized = false;
            this.chatList = [];
            this.bot = new Bot(token, { polling: false });

            let stackCount = 0;
            const checkStackCount = () => {
                if (stackCount === 0) {
                    this.initialized = true;
                    fs.writeFileSync(channelTablePath, JSON.stringify(channelTable, null, '\t'), 'utf-8');
                }
            };

            channels.split(',').forEach(channel => {
                if (/^@/.test(channel)) {
                    if (!channelTable[channel]) {
                        stackCount++;
                        this.bot.sendMessage(channel, '채널 ID를 확인하기 위한 메시지')
                            .then((msg) => {
                                this.chatList.push(msg.chat.id);
                                channelTable[channel] = msg.chat.id;
                                stackCount--;
                                checkStackCount();
                            })
                            .catch((error) => {
                                stackCount--;
                                checkStackCount();
                                log.error(error.message);
                            });
                    } else {
                        this.chatList.push(channelTable[channel]);
                    }
                } else {
                    /^-\d{13}/.test(channel) && this.chatList.push(channel);
                }
            });
            checkStackCount()
        }
        this.sendMessage = this.sendMessage.bind(this);
        this.sendPhoto = this.sendPhoto.bind(this);
        return {
            sendMessage: this.sendMessage,
            sendPhoto: this.sendPhoto,
        }
    }

    sendMessage(message) {
        if (typeof message === 'string') {
            if (!this.initialized) {
                setTimeout(() => {
                    this.sendMessage(message);
                }, 1000);
            } else {
                this.chatList.forEach(async chat => {
                    this.bot.sendMessage(chat, message)
                        .catch(error => {
                            log.error(error.message);
                        });
                });
            }
        }
    };

    sendPhoto(photo) {
        if (!this.initialized) {
            setTimeout(() => {
                this.sendPhoto(photo);
            }, 1000);
        } else {
            this.chatList.forEach(async chat => {
                this.bot.sendPhoto(chat, photo)
                    .catch(error => {
                        log.error(error.message);
                    });
            });
        }
    }

};