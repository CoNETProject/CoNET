"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Imap = require("./imap");
const Tool = require("./initSystem");
const Fs = require("fs");
let logFileFlag = 'w';
const saveLog = (err, _console = false) => {
    if (!err) {
        return;
    }
    const data = `${new Date().toUTCString()}: ${typeof err === 'object' ? (err['message'] ? err['message'] : '') : err}\r\n`;
    _console ? console.log(data) : null;
    return Fs.appendFile(Tool.CoNETConnectLog, data, { flag: logFileFlag }, () => {
        return logFileFlag = 'a';
    });
};
const timeOutWhenSendConnectRequestMail = 1000 * 60;
const commandRequestTimeOutTime = 1000 * 15;
class default_1 extends Imap.imapPeer {
    constructor(imapData, sockerServer, openKeyOption, doNetSendConnectMail, cmdResponse, exit) {
        super(imapData, imapData.clientFolder, imapData.serverFolder, (encryptText, CallBack) => {
            return Tool.encryptMessage(openKeyOption, encryptText, (err, text) => {
                if (err) {
                    console.log(`encryptText error`, err);
                }
                console.log(`encryptText success`);
                return CallBack(err, text);
            });
        }, (decryptText, CallBack) => {
            return Tool.decryptoMessage(openKeyOption, decryptText, CallBack);
        }, err => {
            console.log(`coNETConnect class exit with err: [${err}] doing this.exit(err)!`);
            return exit(err);
        });
        this.imapData = imapData;
        this.sockerServer = sockerServer;
        this.openKeyOption = openKeyOption;
        this.doNetSendConnectMail = doNetSendConnectMail;
        this.commandCallBackPool = new Map();
        this.CoNETConnectReady = false;
        this.connectStage = -1;
        this.timeOutWhenSendConnectRequestMail = null;
        console.log(`new CoNET connect() doNetSendConnectMail = [${doNetSendConnectMail}]`);
        if (!doNetSendConnectMail) {
            this.once('pingTimeOut', () => {
                if (!this.CoNETConnectReady) {
                    return this.destroy(1);
                }
            });
        }
        else {
            this.makeTimeOutEvent(false);
        }
        this.newMail = (ret) => {
            //		have not requestSerial that may from system infomation
            saveLog('clearTimeout timeOutWhenSendConnectRequestMail !');
            if (!ret.requestSerial) {
                return cmdResponse(ret);
            }
            saveLog(`on newMail command [${ret.command}] have requestSerial [${ret.requestSerial}]`);
            const poolData = this.commandCallBackPool.get(ret.requestSerial);
            if (!poolData || typeof poolData.CallBack !== 'function') {
                return saveLog(`QTGateAPIRequestCommand got commandCallBackPool ret.requestSerial [${ret.requestSerial}] have not callback `);
            }
            return poolData.CallBack(null, ret);
        };
        this.ready();
    }
    sendFeedback() {
        return;
    }
    makeTimeOutEvent(request) {
        const self = this;
        saveLog(`doing makeTimeOutEvent request [${request}]`, true);
        clearTimeout(this.timeOutWhenSendConnectRequestMail);
        return this.timeOutWhenSendConnectRequestMail = setTimeout(() => {
            saveLog(`timeOutWhenSendConnectRequestMail UP! request [${request}]`, true);
            if (this.ready) {
                return saveLog(`timeOutWhenSendConnectRequestMail ready!`);
            }
            saveLog(`destroy connect!`, true);
            return self.destroy(0);
        }, request ? commandRequestTimeOutTime : commandRequestTimeOutTime);
    }
    ready() {
        saveLog(`doReady`);
        this.on('wImapReady', () => {
            console.log('on imapReady !');
            this.connectStage = 1;
            return this.sockerServer.emit('tryConnectCoNETStage', null, 1);
        });
        return this.on('ready', () => {
            clearTimeout(this.timeOutWhenSendConnectRequestMail);
            this.CoNETConnectReady = true;
            saveLog('Connected CoNET!', true);
            this.connectStage = 4;
            this.sockerServer.emit('tryConnectCoNETStage', null, 4);
            return this.sendFeedback();
        });
    }
    request(command, CallBack) {
        saveLog(`request command [${command.command}] requestSerial [${command.requestSerial}]`);
        if (command.requestSerial) {
            const poolData = {
                CallBack: CallBack
            };
            this.commandCallBackPool.set(command.requestSerial, poolData);
        }
        return Tool.encryptMessage(this.openKeyOption, JSON.stringify(command), (err1, data) => {
            if (err1) {
                saveLog(`request _deCrypto got error [${JSON.stringify(err1)}]`);
                this.commandCallBackPool.delete(command.requestSerial);
                return CallBack(err1);
            }
            return this.trySendToRemote(Buffer.from(data), () => {
                return this.makeTimeOutEvent(true);
            });
        });
    }
    tryConnect() {
        this.connectStage = 1;
        this.sockerServer.emit('tryConnectCoNETStage', null, this.connectStage = 1);
        this.Ping();
        this.makeTimeOutEvent(true);
    }
}
exports.default = default_1;
