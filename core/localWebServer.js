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
const Crypto = require("crypto");
const rendererProcess_1 = require("./rendererProcess");
let logFileFlag = 'w';
const saveLog = (err) => {
    if (!err) {
        return;
    }
    const data = `${new Date().toUTCString()}: ${typeof err === 'object' ? (err['message'] ? err['message'] : '') : err}\r\n`;
    return Fs.appendFile(Tool.ErrorLogFile, data, { flag: logFileFlag }, () => {
        return logFileFlag = 'a';
    });
};
const saveServerStartup = (localIpaddress) => {
    const info = `*************************** CoNET Platform [ ${Tool.packageFile.version} ] server start up *****************************\n` +
        `Access url: http://${localIpaddress}:${Tool.LocalServerPortNumber}`;
    console.log(info);
    saveLog(info);
};
const saveServerStartupError = (err) => {
    const info = `*************************** CoNET Platform [ ${Tool.packageFile.version} ] server startup falied *****************************\n` +
        `${err['message']}`;
    console.log(info);
    saveLog(info);
};
class localServer {
    constructor(test) {
        this.expressServer = Express();
        this.httpServer = HTTP.createServer(this.expressServer);
        this.socketServer = SocketIo(this.httpServer);
        this.config = null;
        this.keyPair = null;
        this.savedPasswrod = '';
        this.localConnected = new Map();
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
            saveServerStartupError(err);
            return process.exit(1);
        });
        Async.series([
            next => Tool.checkSystemFolder(next),
            next => Tool.checkConfig(next),
            next => this.httpServer.listen(Tool.LocalServerPortNumber, next)
        ], (err, data) => {
            if (test && typeof this.httpServer.close === 'function') {
                this.httpServer.close();
            }
            if (err) {
                return saveServerStartupError(err);
            }
            this.config = data['1'];
            return saveServerStartup(this.config.localIpAddress[0]);
        });
    }
    getPbkdf2(passwrod, CallBack) {
        return Crypto.pbkdf2(passwrod, this.config.salt, this.config.iterations, this.config.keylen, this.config.digest, CallBack);
    }
    CoNET_systemError() {
        return this.socketServer.emit('CoNET_systemError');
    }
    listenAfterPassword(socket) {
    }
    socketServerConnected(socket) {
        const client = `[${socket.id}][ ${socket.conn.remoteAddress}]`;
        this.localConnected.set(client, { socket: socket, login: false });
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
            return this.getPbkdf2(password, (err, Pbkdf2Password) => {
                if (err) {
                    saveLog(`on checkPemPassword getPbkdf2 error:[${err.message}]`);
                    return this.CoNET_systemError();
                }
                return Tool.getKeyPairInfo(this.config.keypair.publicKey, this.config.keypair.privateKey, Pbkdf2Password.toString('hex'), (err, key) => {
                    if (err) {
                        return this.CoNET_systemError();
                    }
                    if (!key.passwordOK) {
                        const info = `[${client}] on checkPemPassword had try password! [${password}]`;
                        console.log(info);
                        saveLog(info);
                        return CallBack(true);
                    }
                    this.savedPasswrod = password;
                    this.localConnected.set(client, { socket: socket, login: true });
                    return CallBack();
                });
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
            Tool.saveConfig(this.config, saveLog);
            return this.socketServer.emit('init', this.config);
        });
        socket.on('NewKeyPair', (preData) => {
            //		already have key pair
            if (this.config.keypair && this.config.keypair.createDate) {
                return saveLog(`[${client}] on NewKeyPair but system already have keypair: ${this.config.keypair.publicKeyID} stop and return keypair.`);
            }
            this.savedPasswrod = preData.password;
            saveLog(`on NewKeyPair!`);
            return this.getPbkdf2(this.savedPasswrod, (err, Pbkdf2Password) => {
                if (err) {
                    saveLog(`NewKeyPair getPbkdf2 Error: [${err.message}]`);
                    return this.CoNET_systemError();
                }
                preData.password = Pbkdf2Password.toString('hex');
                let CreateKeyPairProcess = null;
                const calcelFun = () => {
                    saveLog(`NewKeyPair on calcelFun!`);
                    CreateKeyPairProcess.cancel();
                };
                socket.once('cancelNewKeyPair', calcelFun);
                saveLog(`NewKeyPair doing CreateKeyPairProcess`);
                return CreateKeyPairProcess = new rendererProcess_1.default('newKeyPair', [preData.email, preData.nikeName, preData.keyLength, preData.password], false, (err, retData) => {
                    if (err) {
                        this.socketServer.emit('newKeyPairCallBack', null);
                        return saveLog(`CreateKeyPairProcess return err: [${err.message}]`);
                    }
                    CreateKeyPairProcess = null;
                    socket.removeListener('cancelNewKeyPair', calcelFun);
                    if (!retData) {
                        saveLog(`CreateKeyPairProcess ON FINISHED! HAVE NO newKeyPair DATA BACK!`);
                        return this.socketServer.emit('newKeyPairCallBack', null);
                    }
                    this.listenAfterPassword(socket);
                    const info = `RendererProcess finished [${retData}]`;
                    saveLog(info);
                    console.log(info);
                    return Tool.getKeyPairInfo(retData.publicKey, retData.privateKey, preData.password, (err, key) => {
                        if (err) {
                            return this.CoNET_systemError();
                        }
                        this.config.keypair = key;
                        this.config.account = this.config.keypair.email;
                        Tool.saveConfig(this.config, saveLog);
                        return this.socketServer.emit('newKeyPairCallBack', this.config.keypair);
                    });
                });
            });
        });
    }
}
exports.default = localServer;
