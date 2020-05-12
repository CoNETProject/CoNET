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
const HTTP = require("http");
const SocketIo = require("socket.io");
const Tool = require("./tools/initSystem");
const Async = require("async");
const Fs = require("fs");
const Uuid = require("node-uuid");
const Imap = require("./tools/imap");
const coNETConnect_1 = require("./tools/coNETConnect");
const mime = require("mime-types");
let logFileFlag = 'w';
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
    const info = `\n*************************** Kloak Platform [ ${Tool.CoNET_version} ] server start up *****************************\n` +
        `Access url: http://${localIpaddress}:${Tool.LocalServerPortNumber}\n`;
    saveLog(info);
};
const saveServerStartupError = (err) => {
    const info = `\n*************************** Kloak Platform [ ${Tool.CoNET_version} ] server startup falied *****************************\n` +
        `platform ${process.platform}\n` +
        `${err['message']}\n`;
    saveLog(info);
};
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
        this.localConnected = new Map();
        this.openPgpKeyOption = null;
        this.localKeyPair = null;
        this.serverKeyPassword = Uuid.v4();
        this.requestPool = new Map();
        this.imapConnectPool = new Map();
        //Express.static.mime.define({ 'message/rfc822' : ['mhtml','mht'] })
        //Express.static.mime.define ({ 'multipart/related' : ['mhtml','mht'] })
        Express.static.mime.define({ 'application/x-mimearchive': ['mhtml', 'mht'] });
        this.expressServer.set('views', Path.join(__dirname, 'views'));
        this.expressServer.set('view engine', 'pug');
        this.expressServer.use(Express.static(Tool.QTGateFolder));
        this.expressServer.use(Express.static(Path.join(__dirname, 'public')));
        this.expressServer.use(Express.static(Path.join(__dirname, 'html')));
        this.expressServer.get('/', (req, res) => {
            res.render('home', { title: 'home', proxyErr: false });
        });
        this.expressServer.get('/message', (req, res) => {
            res.render('home/message', { title: 'message', proxyErr: false });
        });
        this.expressServer.get('/browserNotSupport', (req, res) => {
            res.render('home/browserNotSupport', { title: 'browserNotSupport', proxyErr: false });
        });
        this.socketServer.on('connection', socker => {
            return this.socketServerConnected(socker);
        });
        this.httpServer.once('error', err => {
            console.log(`httpServer error`, err);
            saveServerStartupError(err);
            return process.exit(1);
        });
        this.newKeyPair(err => {
            if (err) {
                return saveServerStartupError(err);
            }
            return this.httpServer.listen(Tool.LocalServerPortNumber, () => {
                saveServerStartup(`localhost`);
            });
        });
    }
    catchCmd(mail, uuid) {
        console.log(`Get response from CoNET uuid [${uuid}] length [${mail.length}]`);
        const socket = this.requestPool.get(uuid);
        if (!socket) {
            return console.log(`Get cmd that have no matched socket \n\n`, mail);
        }
        socket.emit('doingRequest', mail, uuid);
    }
    tryConnectCoNET(socket, imapData, sendMail) {
        console.log(`doing tryConnectCoNET`);
        //		have CoGate connect
        let userConnet = socket["userConnet"] = socket["userConnet"] || this.imapConnectPool.get(imapData.account);
        if (userConnet) {
            console.log(`tryConnectCoNET already have room;[${userConnet.socket.id}]`);
            socket.join(userConnet.socket.id);
            return userConnet.Ping(sendMail);
        }
        const _exitFunction = err => {
            console.trace(`makeConnect on _exitFunction err this.CoNETConnectCalss destroy!`, err);
            if (err && err.message) {
                //		network error
                if (/ ECONNRESET /i.test) {
                    if (typeof userConnet.destroy === 'function') {
                        userConnet.destroy();
                    }
                    this.imapConnectPool.set(imapData.account, userConnet = socket["userConnet"] = makeConnect());
                }
            }
            return console.log(`_exitFunction doing nathing!`);
        };
        const makeConnect = () => {
            return new coNETConnect_1.default(imapData, this.socketServer, socket, (mail, uuid) => {
                return this.catchCmd(mail, uuid);
            }, _exitFunction);
        };
        return this.imapConnectPool.set(imapData.account, userConnet = socket["userConnet"] = makeConnect());
    }
    listenAfterPassword(socket) {
        const self = this;
        let keyPair = null;
        let sendMail = false;
        socket.on('checkImap', (imapConnectData, CallBack1) => {
            console.log(`localServer on checkImap!`);
            const uuid = Uuid.v4();
            CallBack1(uuid);
            if (!keyPair) {
                return socket.emit('imapTest', 'system');
            }
            return Tool.decryptoMessage(keyPair.publicKeys, self.localKeyPair.privateKey, imapConnectData, (err, data) => {
                if (err) {
                    console.log('checkImap Tool.decryptoMessage error\n', err);
                    return socket.emit('imapTest', 'system');
                }
                let imapData = null;
                try {
                    imapData = JSON.parse(data);
                }
                catch (ex) {
                    return socket.emit('imapTest', 'system');
                }
                return self.doingCheckImap(socket, imapData, keyPair);
            });
        });
        socket.on('tryConnectCoNET', (imapData, CallBack1) => {
            const uuid = Uuid.v4();
            CallBack1(uuid);
            console.log(`socket account [${keyPair.email}]:[${keyPair.keyID}] on tryConnectCoNET!\n\n`);
            return this.tryConnectCoNET(socket, imapData, sendMail);
        });
        socket.on('doingRequest', (uuid, request, CallBack1) => {
            const _uuid = Uuid.v4();
            CallBack1(_uuid);
            const _callBack = (...data) => {
                socket.emit(_uuid, ...data);
            };
            this.requestPool.set(uuid, socket);
            console.log(`on doingRequest uuid = [${uuid}]\n${request}\n`);
            const userConnect = socket["userConnet"] || this.imapConnectPool.get(keyPair.email);
            if (userConnect) {
                saveLog(`doingRequest on ${uuid}`);
                return userConnect.requestCoNET_v1(uuid, request, _callBack);
            }
            saveLog(`doingRequest on ${uuid} but have not CoNETConnectCalss need restart! socket.emit ( 'systemErr' )`);
            return socket.emit('systemErr');
        });
        socket.on('getFilesFromImap', (files, CallBack1) => {
            const uuid = Uuid.v4();
            CallBack1(uuid);
            let ret = '';
            const _callBack = (err) => {
                socket.emit(uuid, err, ret);
            };
            if (typeof files !== 'string' || !files.length) {
                return _callBack(new Error('invalidRequest'));
            }
            const _files = files.split(',');
            console.log(`socket.on ('getFilesFromImap') _files = [${_files}] _files.length = [${_files.length}]`);
            const userConnect = socket["userConnet"] || this.imapConnectPool.get(keyPair.email);
            if (!userConnect) {
                console.log(`getFilesFromImap error:![ Have no userConnect ]`);
                return socket.emit('systemErr');
            }
            return Async.eachSeries(_files, (n, next) => {
                console.log(`Async.eachSeries _files[${n}] typeof userConnect.getFile = [${typeof userConnect.getFile}]`);
                return userConnect.getFile(n, (err, data) => {
                    if (err) {
                        return next(err);
                    }
                    ret += data.toString();
                    return next();
                });
            }, _callBack);
        });
        socket.on('sendRequestMail', (message, imapData, toMail, CallBack1) => {
            const _uuid = Uuid.v4();
            CallBack1(_uuid);
            const _callBack = (...data) => {
                socket.emit(_uuid, ...data);
            };
            sendMail = true;
            const userConnect = socket["userConnet"] || this.imapConnectPool.get(keyPair.email);
            if (userConnect) {
                userConnect.Ping(true);
            }
            return Tool.sendCoNETConnectRequestEmail(imapData, toMail, message, _callBack);
        });
        socket.on('sendMedia', (uuid, rawData, CallBack1) => {
            const _uuid = Uuid.v4();
            CallBack1(_uuid);
            const _callBack = (...data) => {
                socket.emit(_uuid, ...data);
            };
            const userConnect = this.imapConnectPool.get(keyPair.email);
            if (!userConnect) {
                return socket.emit('systemErr');
            }
            return userConnect.sendDataToANewUuidFolder(Buffer.from(rawData).toString('base64'), uuid, uuid, _callBack);
        });
        socket.on('mime', (_mime, CallBack1) => {
            const _uuid = Uuid.v4();
            CallBack1(_uuid);
            console.log(`socket.on ( 'mime' ) [${_mime}]`);
            const _callBack = (...data) => {
                socket.emit(_uuid, ...data);
            };
            let y = mime.lookup(_mime);
            console.log(y);
            if (!y) {
                return _callBack(new Error('no mime'));
            }
            return _callBack(null, y);
        });
        socket.on('keypair', (publicKey, CallBack) => {
            console.log(`socket.on ( 'keypair') \n`);
            const _uuid = Uuid.v4();
            CallBack(_uuid);
            return Tool.getPublicKeyInfo(publicKey, (err, data) => {
                if (err) {
                    return socket.emit(_uuid, err);
                }
                keyPair = data;
                let connect = false;
                const _connect = this.imapConnectPool.get(keyPair.email);
                if (_connect) {
                    connect = true;
                }
                socket.emit(_uuid, null, this.localKeyPair.public, connect);
            });
        });
        /*
                socket.on ('getUrl', ( url: string, CallBack ) => {
                    const uu = new URLSearchParams ( url )
                    if ( !uu || typeof uu.get !== 'function' ) {
                        console.log (`getUrl [${ url }] have not any URLSearchParams`)
                        return CallBack ()
                    }
                    
                    return CallBack ( null, uu.get('imgrefurl'), uu.get('/imgres?imgurl'))
                })
        */
    }
    doingCheckImap(socket, imapData, keyPair) {
        return Async.series([
            next => Imap.imapAccountTest(imapData, err => {
                if (err) {
                    return next(err);
                }
                console.log(`imapAccountTest success!`, typeof next);
                socket.emit('imapTest');
                return next();
            }),
            next => Tool.smtpVerify(imapData, next)
        ], (err) => {
            if (err) {
                console.log(`doingCheckImap Async.series Error!`, err);
                return socket.emit('imapTest', err.message || err);
            }
            imapData.imapTestResult = true;
            return Tool.encryptMessage(keyPair.publicKeys, this.localKeyPair.privateKey, JSON.stringify(imapData), (err, data) => {
                return socket.emit('imapTestFinish', err, data);
            });
        });
    }
    newKeyPair(CallBack) {
        return Tool.newKeyPair("admin@Localhost.local", "admin", this.serverKeyPassword, (err, data) => {
            if (err) {
                return CallBack(err);
            }
            this.localKeyPair = data;
            return CallBack();
        });
    }
    socketServerConnected(socket) {
        const clientName = `[${socket.id}][ ${socket.conn.remoteAddress}]`;
        let sessionHash = '';
        const clientObj = {
            listenAfterPasswd: false,
            socket: socket,
            login: false
        };
        saveLog(`socketServerConnected ${clientName} connect ${this.localConnected.size}`);
        return this.listenAfterPassword(socket);
    }
}
exports.default = localServer;
