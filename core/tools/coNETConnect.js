"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Imap = require("./imap");
const Tool = require("./initSystem");
const Fs = require("fs");
const Async = require("async");
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
const requestTimeOut = 1000 * 30;
class default_1 extends Imap.imapPeer {
    constructor(imapData, sockerServer, openKeyOption, doNetSendConnectMail, cmdResponse, _exit) {
        super(imapData, imapData.clientFolder, imapData.serverFolder, (encryptText, CallBack) => {
            return Tool.encryptMessage(openKeyOption, encryptText, CallBack);
        }, (decryptText, CallBack) => {
            return Tool.decryptoMessage(openKeyOption, decryptText, CallBack);
        }, err => {
            console.log(`coNETConnect IMAP class exit with err: [${err}] doing this.exit(err)!`);
            return this.exit1(err);
        });
        this.imapData = imapData;
        this.sockerServer = sockerServer;
        this.openKeyOption = openKeyOption;
        this.doNetSendConnectMail = doNetSendConnectMail;
        this.cmdResponse = cmdResponse;
        this._exit = _exit;
        this.commandCallBackPool = new Map();
        this.CoNETConnectReady = false;
        this.connectStage = -1;
        this.alreadyExit = false;
        this.ignorePingTimeout = false;
        this.timeOutWhenSendConnectRequestMail = null;
        saveLog(`=====================================  new CoNET connect() doNetSendConnectMail = [${doNetSendConnectMail}]\n`, true);
        this.newMail = (ret) => {
            //		have not requestSerial that may from system infomation
            saveLog('clearTimeout timeOutWhenSendConnectRequestMail !', true);
            clearTimeout(this.timeOutWhenSendConnectRequestMail);
            if (!ret.requestSerial) {
                console.trace(`CoNETConnect.ts newMail Error !ret.requestSerial`, ret);
                if (this.cmdResponse && typeof this.cmdResponse === 'function') {
                    return this.cmdResponse(ret);
                }
            }
            saveLog(`on newMail command [${ret.command}] have requestSerial [${ret.requestSerial}]`, true);
            const poolData = this.commandCallBackPool.get(ret.requestSerial);
            if (!poolData || typeof poolData.CallBack !== 'function') {
                return saveLog(`QTGateAPIRequestCommand got commandCallBackPool ret.requestSerial [${ret.requestSerial}] have not callback `);
            }
            clearTimeout(poolData.timeout);
            return poolData.CallBack(null, ret);
        };
        this.on('wImapReady', () => {
            console.log('on imapReady !');
            this.connectStage = 1;
            return this.sockerServer.emit('tryConnectCoNETStage', null, 1);
        });
        this.on('ready', () => {
            clearTimeout(this.timeOutWhenSendConnectRequestMail);
            this.CoNETConnectReady = true;
            saveLog('Connected CoNET!', true);
            this.connectStage = 4;
            this.sockerServer.emit('tryConnectCoNETStage', null, 4, cmdResponse ? false : true);
            return this.sendFeedback();
        });
        this.on('pingTimeOut', () => {
            if (this.ignorePingTimeout) {
                return saveLog(`coNETConnect on pingTimeOut this.ignorePingTimeout = true, do nothing!`, true);
            }
            return this.destroy();
        });
        this.sockerServer.emit('tryConnectCoNETStage', null, this.connectStage = 0);
    }
    sendFeedback() {
        return;
    }
    makeTimeOutEvent() {
        const self = this;
        clearTimeout(this.timeOutWhenSendConnectRequestMail);
        this.ignorePingTimeout = true;
        return this.timeOutWhenSendConnectRequestMail = setTimeout(() => {
            this.ignorePingTimeout = false;
            if (this.peerReady) {
                return saveLog(`timeOutWhenSendConnectRequestMail peerReady already true!`, true);
            }
            saveLog(`makeTimeOutEvent destroy connect!`, true);
            return self.destroy(0);
        }, timeOutWhenSendConnectRequestMail);
    }
    checkConnect(CallBack) {
        if (this.wImap && this.wImap.imapStream && this.wImap.imapStream.writable &&
            this.rImap && this.rImap.imapStream && this.rImap.imapStream.readable) {
            if (this.needPing) {
                this.once('ready', () => {
                    console.log(`wImap && rImap looks good, doing PING get ready!`);
                    return CallBack();
                });
                this.Ping();
                return console.log(`doing wait ping ready!`);
            }
            return CallBack();
        }
        this.destroy();
        return CallBack(new Error('checkConnect no connect!'));
    }
    exit1(err) {
        if (!this.alreadyExit) {
            this.alreadyExit = true;
            return this._exit(err);
        }
        console.log(`exit1 cancel already Exit [${err}]`);
    }
    request(command, CallBack) {
        Async.waterfall([
            next => Tool.myIpServer(next),
            (ip, next) => this.checkConnect(next),
            next => {
                saveLog(`request command [${command.command}] requestSerial [${command.requestSerial}]`, true);
                if (command.requestSerial) {
                    const poolData = {
                        CallBack: CallBack,
                        timeout: setTimeout(() => {
                            console.log(`request command [${command.command}] timeout! do again`);
                            this.commandCallBackPool.delete(command.requestSerial);
                            return this.request(command, CallBack);
                        }, requestTimeOut)
                    };
                    this.commandCallBackPool.set(command.requestSerial, poolData);
                }
                return Tool.encryptMessage(this.openKeyOption, JSON.stringify(command), next);
            },
            (data, next) => this.trySendToRemote(Buffer.from(data), next)
        ], (err) => {
            if (err) {
                saveLog(`request got error [${err.message ? err.message : null}]`);
                this.commandCallBackPool.delete(command.requestSerial);
                return CallBack(err);
            }
            console.log(`request success!`);
        });
    }
    tryConnect1() {
        this.connectStage = 1;
        this.sockerServer.emit('tryConnectCoNETStage', null, this.connectStage = 1);
        return Tool.myIpServer((err, localIpAddress) => {
            if (err) {
                console.log(`Tool.myIpServer callback error`, err);
                this.connectStage = 0;
                return this.sockerServer.emit('tryConnectCoNETStage', 0);
            }
            saveLog(`tryConnect success Tool.myIpServer [${localIpAddress}]`, true);
            if (this.doNetSendConnectMail) {
                //	 wait long time to get response from CoNET
                console.log(`this.doNetSendConnectMail = true`);
            }
            return this.checkConnect(err => {
                if (err) {
                    return this.exit1(err);
                }
            });
        });
    }
}
exports.default = default_1;
