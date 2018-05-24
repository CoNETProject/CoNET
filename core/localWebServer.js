"use strict";
/*!
 * Copyright 2018 CoNET Technology Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Express = require("express");
const Path = require("path");
const cookieParser = require("cookie-parser");
const HTTP = require("http");
const SocketIo = require("socket.io");
const Tool = require("./tools/initSystem");
const Async = require("async");
const Fs = require("fs");
const Util = require("util");
const Uuid = require("node-uuid");
const Imap = require("./tools/imap");
const coNETConnect_1 = require("./tools/coNETConnect");
const Crypto = require("crypto");
let logFileFlag = 'w';
const conetImapAccount = /^qtgate_test\d\d?@icloud.com$/i;
const saveLog = (err) => {
    if (!err) {
        return;
    }
    const data = `${new Date().toUTCString()}: ${typeof err === 'object' ? (err['message'] ? err['message'] : '') : err}\r\n`;
    console.log(data);
    return Fs.appendFile(Tool.ErrorLogFile, data, { flag: logFileFlag }, () => {
        return logFileFlag = 'a';
    });
};
const saveServerStartup = (localIpaddress) => {
    const info = `\n*************************** CoNET Platform [ ${Tool.packageFile.version} ] server start up *****************************\n` +
        `Access url: http://${localIpaddress}:${Tool.LocalServerPortNumber}\n`;
    console.log(info);
    saveLog(info);
};
const saveServerStartupError = (err) => {
    const info = `\n*************************** CoNET Platform [ ${Tool.packageFile.version} ] server startup falied *****************************\n` +
        `platform ${process.platform}\n` +
        `${err['message']}\n`;
    console.log(info);
    saveLog(info);
};
const yy = new Map();
const imapErrorCallBack = (message) => {
    if (message && message.length) {
        if (/auth|login|log in|Too many simultaneous|UNAVAILABLE/i.test(message)) {
            return 1;
        }
        if (/ECONNREFUSED/i.test(message)) {
            return 5;
        }
        if (/OVERQUOTA/i.test(message)) {
            return 6;
        }
        if (/certificate/i.test(message)) {
            return 2;
        }
        if (/timeout|ENOTFOUND/i.test(message)) {
            return 0;
        }
        return 5;
    }
    return -1;
};
class localServer {
    constructor(cmdResponse, test) {
        this.cmdResponse = cmdResponse;
        this.expressServer = Express();
        this.httpServer = HTTP.createServer(this.expressServer);
        this.socketServer = SocketIo(this.httpServer);
        this.config = null;
        this.keyPair = null;
        this.savedPasswrod = '';
        this.imapConnectData = null;
        this.localConnected = new Map();
        this.CoNETConnectCalss = null;
        this.openPgpKeyOption = null;
        this.expressServer.set('views', Path.join(__dirname, 'views'));
        this.expressServer.set('view engine', 'pug');
        this.expressServer.use(cookieParser());
        this.expressServer.use(Express.static(Tool.QTGateFolder));
        this.expressServer.use(Express.static(Path.join(__dirname, 'public')));
        this.expressServer.get('/', (req, res) => {
            res.render('home', { title: 'home' });
        });
        this.socketServer.on('connection', socker => {
            return this.socketServerConnected(socker);
        });
        this.httpServer.once('error', err => {
            console.log(`httpServer error`, err);
            saveServerStartupError(err);
            return process.exit(1);
        });
        Async.series([
            next => Tool.checkSystemFolder(next),
            next => Tool.checkConfig(next)
        ], (err, data) => {
            if (err) {
                return saveServerStartupError(err);
            }
            this.config = data['1'];
            if (!test) {
                this.httpServer.listen(Tool.LocalServerPortNumber, () => {
                    return saveServerStartup(this.config.localIpAddress[0]);
                });
            }
        });
    }
    CoNET_systemError() {
        return this.socketServer.emit('CoNET_systemError');
    }
    tryConnectCoNET(socket) {
        const exit = err => {
            console.trace(`tryConnectCoNET exit! err =`, err);
            switch (err) {
                ///			connect conet had timeout
                case null:
                case 1: {
                    console.trace(`tryConnectCoNET exit! switch: 1 or null`);
                    if (!this.CoNETConnectCalss.doNetSendConnectMail) {
                        return Tool.sendCoNETConnectRequestEmail(this.imapConnectData, this.openPgpKeyOption, this.config.version, this.keyPair.publicKey, (err) => {
                            if (err) {
                                console.log(`sendCoNETConnectRequestEmail callback error`, err);
                                saveLog(`tryConnectCoNET sendCoNETConnectRequestEmail got error [${err.message ? err.message : JSON.stringify(err)}]`);
                                return socket.emit('tryConnectCoNETStage', imapErrorCallBack(err.message));
                            }
                            socket.emit('tryConnectCoNETStage', null, 3);
                            return this.CoNETConnectCalss = new coNETConnect_1.default(this.imapConnectData, this.socketServer, this.openPgpKeyOption, true, this.cmdResponse, exit);
                        });
                    }
                    /**
                     *
                     *
                     */
                    return;
                }
                default: {
                    return console.trace(`tryConnectCoNET exit! switch: default`);
                }
            }
        };
        const makeConnect = () => {
            if (!this.imapConnectData.sendToQTGate) {
                this.imapConnectData.sendToQTGate = true;
                Tool.saveImapData(this.imapConnectData, this.config, this.savedPasswrod, () => { });
                this.socketServer.emit('tryConnectCoNETStage', null, 3);
                return Tool.sendCoNETConnectRequestEmail(this.imapConnectData, this.openPgpKeyOption, this.config.version, this.keyPair.publicKey, (err) => {
                    if (err) {
                        console.log(`sendCoNETConnectRequestEmail callback error`, err);
                        saveLog(`tryConnectCoNET sendCoNETConnectRequestEmail got error [${err.message ? err.message : JSON.stringify(err)}]`);
                        return socket.emit('tryConnectCoNETStage', imapErrorCallBack(err.message));
                    }
                    socket.emit('tryConnectCoNETStage', null, 3);
                    return this.CoNETConnectCalss = new coNETConnect_1.default(this.imapConnectData, this.socketServer, this.openPgpKeyOption, true, this.cmdResponse, exit);
                });
            }
            console.log(`makeConnect without sendMail`);
            return this.CoNETConnectCalss = new coNETConnect_1.default(this.imapConnectData, this.socketServer, this.openPgpKeyOption, false, this.cmdResponse, exit);
        };
        if (!this.CoNETConnectCalss) {
            return makeConnect();
        }
        return this.CoNETConnectCalss.tryConnect();
    }
    sendrequest(socket, cmd, CallBack) {
        if (!this.openPgpKeyOption) {
            console.log(`sendrequest keypair error! !this.config [${!this.config}] !this.keyPair[${!this.keyPair}] !this.keyPair.passwordOK [${!this.keyPair.passwordOK}]`);
            return CallBack(1);
        }
        if (!this.CoNETConnectCalss) {
            console.log(`sendrequest no CoNETConnectCalss`);
            this.tryConnectCoNET(socket);
            return CallBack(0);
        }
        saveLog(`sendrequest send [${cmd.command}]`);
        return this.CoNETConnectCalss.request(cmd, (err, res) => {
            saveLog(`request response [${cmd.command}]`);
            if (err) {
                CallBack(null, err);
                return saveLog(`QTClass.request error! [${err}]`);
            }
            return CallBack(null, res);
        });
    }
    listenAfterPassword(socket) {
        socket.on('checkImap', (emailAddress, password, timeZone, tLang) => {
            console.log(`socket.on ('checkImap') email [${emailAddress}] passwd [${password}]`);
            return Tool.myIpServer((err, ip) => {
                if (err || !ip) {
                    return socket.emit('smtpTest', 4);
                }
                const imapServer = Tool.getImapSmtpHost(emailAddress);
                this.imapConnectData = {
                    email: this.config.account,
                    account: this.config.account,
                    smtpServer: imapServer.smtp,
                    smtpUserName: emailAddress,
                    smtpPortNumber: imapServer.SmtpPort,
                    smtpSsl: imapServer.smtpSsl,
                    smtpIgnoreCertificate: false,
                    smtpUserPassword: password,
                    imapServer: imapServer.imap,
                    imapPortNumber: imapServer.ImapPort,
                    imapSsl: imapServer.imapSsl,
                    imapUserName: emailAddress,
                    imapIgnoreCertificate: false,
                    imapUserPassword: password,
                    timeZoneOffset: timeZone,
                    language: tLang,
                    imapTestResult: null,
                    clientFolder: Uuid.v4(),
                    serverFolder: Uuid.v4(),
                    randomPassword: Uuid.v4(),
                    uuid: Uuid.v4(),
                    confirmRisk: conetImapAccount.test(emailAddress),
                    clientIpAddress: null,
                    ciphers: null,
                    sendToQTGate: false
                };
                return this.doingCheckImap(socket);
            });
        });
        socket.on('tryConnectCoNET', () => {
            console.log(`on tryConnectCoNET`);
            if (!this.imapConnectData) {
                return this.CoNET_systemError();
            }
            if (!this.imapConnectData.confirmRisk) {
                this.imapConnectData.confirmRisk = true;
                return Tool.saveImapData(this.imapConnectData, this.config, this.savedPasswrod, err => {
                    return this.tryConnectCoNET(socket);
                });
            }
            return this.tryConnectCoNET(socket);
        });
        socket.on('requestActivEmail', CallBack => {
            saveLog(`on requestActivEmail`);
            const com = {
                command: 'requestActivEmail',
                Args: [],
                error: null,
                requestSerial: Crypto.randomBytes(8).toString('hex')
            };
            return this.sendrequest(socket, com, CallBack);
        });
        socket.on('checkActiveEmailSubmit', (text, CallBack) => {
            saveLog(`on checkActiveEmailSubmit`);
            if (!text || !text.length || !/^-----BEGIN PGP MESSAGE-----/.test(text)) {
                CallBack(0);
                return saveLog(`checkActiveEmailSubmit, no text.length ! [${text}]`);
            }
            if (text.indexOf('-----BEGIN PGP MESSAGE----- Version: GnuPG v1 ') > -1) {
                text = text.replace(/-----BEGIN PGP MESSAGE----- Version: GnuPG v1 /, '-----BEGIN__PGP__MESSAGE-----\r\nVersion:__GnuPG__v1\r\n\r\n');
                text = text.replace(/-----END PGP MESSAGE-----/, '-----END__PGP__MESSAGE-----');
                text = text.replace(/ /g, '\r\n');
                text = text.replace(/__/g, ' ');
            }
            return Tool.decryptoMessage(this.openPgpKeyOption, text, (err, data) => {
                if (err) {
                    CallBack(1);
                    return saveLog(`checkActiveEmailSubmit, decryptoMessage error [${err.message ? err.message : null}]`);
                }
                let pass = null;
                try {
                    pass = JSON.parse(data);
                }
                catch (ex) {
                    return CallBack(1);
                }
                const com = {
                    command: 'activePassword',
                    Args: [pass],
                    error: null,
                    requestSerial: Crypto.randomBytes(8).toString('hex')
                };
                console.log(Util.inspect(com));
                return this.sendrequest(socket, com, (err, data) => {
                    if (err) {
                        return CallBack(err);
                    }
                    if (data.error > -1) {
                        return CallBack(null, data);
                    }
                    const key = Buffer.from(data.Args[0], 'base64').toString();
                    if (key && key.length) {
                        saveLog(`active key success!`);
                        CallBack();
                        this.keyPair.publicKey = this.config.keypair.publicKey = key;
                        this.keyPair.verified = this.config.keypair.verified = true;
                        return Tool.saveConfig(this.config, err => {
                        });
                    }
                });
            });
        });
    }
    doingCheckImap(socket) {
        return Async.series([
            next => Imap.imapAccountTest(this.imapConnectData, err => {
                if (err) {
                    return next(err);
                }
                console.log(`imapAccountTest success!`);
                socket.emit('imapTest');
                return next();
            }),
            next => Tool.smtpVerify(this.imapConnectData, next)
        ], (err) => {
            if (err) {
                return socket.emit('smtpTest', imapErrorCallBack(err.message));
            }
            return Tool.saveImapData(this.imapConnectData, this.config, this.savedPasswrod, err => {
                socket.emit('imapTestFinish');
            });
        });
    }
    socketServerConnected(socket) {
        const client = `[${socket.id}][ ${socket.conn.remoteAddress}]`;
        this.localConnected.set(client, { socket: socket, login: false, listenAfterPasswd: false });
        socket.once('disconnect', reason => {
            saveLog(`socketServerConnected ${client} on disconnect`);
            return this.localConnected.delete(client);
        });
        socket.on('init', Callback => {
            const ret = Tool.emitConfig(this.config, false);
            return Callback(ret);
        });
        socket.once('agreeClick', () => {
            saveLog(`socket on agreeClick`);
            this.config.firstRun = false;
            return Tool.saveConfig(this.config, saveLog);
        });
        socket.on('checkPemPassword', (password, CallBack) => {
            if (!this.config.keypair || !this.config.keypair.publicKey) {
                console.log(`checkPemPassword !this.config.keypair`);
                return CallBack(true);
            }
            if (!password || password.length < 5) {
                console.log(`! password `);
                return CallBack(true);
            }
            if (this.savedPasswrod && this.savedPasswrod.length) {
                if (this.savedPasswrod !== password) {
                    console.log(`savedPasswrod !== password `);
                    return CallBack(true);
                }
            }
            return Async.waterfall([
                next => Tool.getPbkdf2(this.config, password, next),
                (Pbkdf2Password, next) => Tool.getKeyPairInfo(this.config.keypair.publicKey, this.config.keypair.privateKey, Pbkdf2Password.toString('hex'), next),
                (key, next) => {
                    if (!key.passwordOK) {
                        const info = `[${client}] on checkPemPassword had try password! [${password}]`;
                        saveLog(info);
                        return CallBack(true);
                    }
                    this.savedPasswrod = password;
                    this.localConnected.set(client, { socket: socket, login: true, listenAfterPasswd: true });
                    this.listenAfterPassword(socket);
                    this.keyPair = key;
                    return Tool.makeGpgKeyOption(this.config, this.savedPasswrod, next);
                },
                (option_KeyOption, next) => {
                    this.openPgpKeyOption = option_KeyOption;
                    return Tool.readImapData(password, this.config, next);
                }
            ], (err, data) => {
                if (err) {
                    CallBack(null);
                    return saveLog(`Tool.makeGpgKeyOption return err [${err && err.message ? err.message : null}]`);
                }
                try {
                    this.imapConnectData = JSON.parse(data);
                    return CallBack(null, this.imapConnectData);
                }
                catch (ex) {
                    return CallBack();
                }
            });
        });
        socket.on('deleteKeyPairNext', () => {
            console.log(`on deleteKeyPairNext`);
            const thisConnect = this.localConnected.get(client);
            if (this.localConnected.size > 1 && !thisConnect.login) {
                return this.socketServer.emit('deleteKeyPairNoite');
            }
            const info = `socket on deleteKeyPairNext, delete key pair now.`;
            console.log(info);
            saveLog(info);
            this.config = Tool.InitConfig();
            this.config.firstRun = false;
            this.keyPair = null;
            Tool.saveConfig(this.config, saveLog);
            if (this.CoNETConnectCalss) {
                this.CoNETConnectCalss.destroy();
                this.CoNETConnectCalss = null;
            }
            return this.socketServer.emit('init', this.config);
        });
        socket.on('NewKeyPair', (preData) => {
            //		already have key pair
            if (this.config.keypair && this.config.keypair.createDate) {
                return saveLog(`[${client}] on NewKeyPair but system already have keypair: ${this.config.keypair.publicKeyID} stop and return keypair.`);
            }
            this.savedPasswrod = preData.password;
            return Tool.getPbkdf2(this.config, this.savedPasswrod, (err, Pbkdf2Password) => {
                if (err) {
                    saveLog(`NewKeyPair getPbkdf2 Error: [${err.message}]`);
                    return this.CoNET_systemError();
                }
                preData.password = Pbkdf2Password.toString('hex');
                saveLog(`NewKeyPair doing CreateKeyPairProcess`);
                return Tool.newKeyPair(preData.email, preData.nikeName, preData.password, (err, retData) => {
                    if (err) {
                        console.log(err);
                        this.socketServer.emit('newKeyPairCallBack', null);
                        return saveLog(`CreateKeyPairProcess return err: [${err.message}]`);
                    }
                    if (!retData) {
                        const info = `newKeyPair return null key!`;
                        saveLog(info);
                        console.log(info);
                        return this.socketServer.emit('newKeyPairCallBack', null);
                    }
                    const kk = this.localConnected.get(client);
                    if (!kk.listenAfterPasswd) {
                        kk.listenAfterPasswd = true;
                        this.localConnected.set(client, kk);
                        this.listenAfterPassword(socket);
                    }
                    return Tool.getKeyPairInfo(retData.publicKey, retData.privateKey, preData.password, (err, key) => {
                        if (err) {
                            const info = `Tool.getKeyPairInfo Error [${err.message ? err.message : 'null err message '}]`;
                            saveLog(info);
                            console.log(info);
                            return this.CoNET_systemError();
                        }
                        this.keyPair = this.config.keypair = key;
                        this.config.account = this.config.keypair.email;
                        return Tool.makeGpgKeyOption(this.config, this.savedPasswrod, (err, data) => {
                            if (err) {
                                return saveLog(err.message);
                            }
                            this.openPgpKeyOption = data;
                            Tool.saveConfig(this.config, saveLog);
                            return this.socketServer.emit('newKeyPairCallBack', this.config.keypair);
                        });
                    });
                });
            });
        });
    }
}
exports.default = localServer;
