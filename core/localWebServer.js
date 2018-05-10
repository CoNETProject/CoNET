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
exports.__esModule = true;
var Express = require("express");
var Path = require("path");
var cookieParser = require("cookie-parser");
var HTTP = require("http");
var SocketIo = require("socket.io");
var Tool = require("./tools/initSystem");
var Async = require("async");
var Fs = require("fs");
var Crypto = require("crypto");
var logFileFlag = 'w';
var saveLog = function (err) {
    if (!err) {
        return;
    }
    var data = new Date().toUTCString() + ": " + (typeof err === 'object' ? (err['message'] ? err['message'] : '') : err) + "\r\n";
    return Fs.appendFile(Tool.ErrorLogFile, data, { flag: logFileFlag }, function () {
        return logFileFlag = 'a';
    });
};
var saveServerStartup = function (localIpaddress) {
    var info = "\n*************************** CoNET Platform [ " + Tool.packageFile.version + " ] server start up *****************************\n" +
        ("Access url: http://" + localIpaddress + ":" + Tool.LocalServerPortNumber + "\n");
    console.log(info);
    saveLog(info);
};
var saveServerStartupError = function (err) {
    var info = "\n*************************** CoNET Platform [ " + Tool.packageFile.version + " ] server startup falied *****************************\n" +
        ("platform " + process.platform + "\n") +
        (err['message'] + "\n");
    console.log(info);
    saveLog(info);
};
var localServer = /** @class */ (function () {
    function localServer(test) {
        var _this = this;
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
        this.expressServer.get('/', function (req, res) {
            res.render('home', { title: 'home' });
        });
        this.socketServer.on('connection', function (socker) {
            return _this.socketServerConnected(socker);
        });
        this.httpServer.once('error', function (err) {
            console.log("httpServer error", err);
            saveServerStartupError(err);
            return process.exit(1);
        });
        Async.series([
            function (next) { return Tool.checkSystemFolder(next); },
            function (next) { return Tool.checkConfig(next); }
        ], function (err, data) {
            if (err) {
                return saveServerStartupError(err);
            }
            _this.config = data['1'];
            if (!test) {
                _this.httpServer.listen(Tool.LocalServerPortNumber, function () {
                    return saveServerStartup(_this.config.localIpAddress[0]);
                });
            }
        });
    }
    localServer.prototype.getPbkdf2 = function (passwrod, CallBack) {
        return Crypto.pbkdf2(passwrod, this.config.salt, this.config.iterations, this.config.keylen, this.config.digest, CallBack);
    };
    localServer.prototype.CoNET_systemError = function () {
        return this.socketServer.emit('CoNET_systemError');
    };
    localServer.prototype.listenAfterPassword = function (socket) {
    };
    localServer.prototype.socketServerConnected = function (socket) {
        var _this = this;
        var client = "[" + socket.id + "][ " + socket.conn.remoteAddress + "]";
        this.localConnected.set(client, { socket: socket, login: false });
        socket.once('disconnect', function (reason) {
            saveLog("socketServerConnected " + client + " on disconnect");
            return _this.localConnected["delete"](client);
        });
        socket.on('init', function (Callback) {
            var ret = Tool.emitConfig(_this.config, false);
            return Callback(ret);
        });
        socket.once('agreeClick', function () {
            saveLog("socket on agreeClick");
            _this.config.firstRun = false;
            return Tool.saveConfig(_this.config, saveLog);
        });
        socket.on('checkPemPassword', function (password, CallBack) {
            if (!_this.config.keypair || !_this.config.keypair.publicKey) {
                console.log("checkPemPassword !this.config.keypair");
                return CallBack(true);
            }
            if (!password || password.length < 5) {
                console.log("! password ");
                return CallBack(true);
            }
            if (_this.savedPasswrod && _this.savedPasswrod.length) {
                if (_this.savedPasswrod !== password) {
                    console.log("savedPasswrod !== password ");
                    return CallBack(true);
                }
            }
            return _this.getPbkdf2(password, function (err, Pbkdf2Password) {
                if (err) {
                    saveLog("on checkPemPassword getPbkdf2 error:[" + err.message + "]");
                    return _this.CoNET_systemError();
                }
                return Tool.getKeyPairInfo(_this.config.keypair.publicKey, _this.config.keypair.privateKey, Pbkdf2Password.toString('hex'), function (err, key) {
                    if (err) {
                        return _this.CoNET_systemError();
                    }
                    if (!key.passwordOK) {
                        var info = "[" + client + "] on checkPemPassword had try password! [" + password + "]";
                        console.log(info);
                        saveLog(info);
                        return CallBack(true);
                    }
                    _this.savedPasswrod = password;
                    _this.localConnected.set(client, { socket: socket, login: true });
                    return CallBack();
                });
            });
        });
        socket.on('deleteKeyPairNext', function () {
            console.log("on deleteKeyPairNext");
            var thisConnect = _this.localConnected.get(client);
            if (_this.localConnected.size > 1 && !thisConnect.login) {
                return _this.socketServer.emit('deleteKeyPairNoite');
            }
            var info = "socket on deleteKeyPairNext, delete key pair now.";
            console.log(info);
            saveLog(info);
            _this.config = Tool.InitConfig();
            Tool.saveConfig(_this.config, saveLog);
            return _this.socketServer.emit('init', _this.config);
        });
        socket.on('NewKeyPair', function (preData) {
            //		already have key pair
            if (_this.config.keypair && _this.config.keypair.createDate) {
                return saveLog("[" + client + "] on NewKeyPair but system already have keypair: " + _this.config.keypair.publicKeyID + " stop and return keypair.");
            }
            _this.savedPasswrod = preData.password;
            saveLog("on NewKeyPair!");
            return _this.getPbkdf2(_this.savedPasswrod, function (err, Pbkdf2Password) {
                if (err) {
                    saveLog("NewKeyPair getPbkdf2 Error: [" + err.message + "]");
                    return _this.CoNET_systemError();
                }
                preData.password = Pbkdf2Password.toString('hex');
                saveLog("NewKeyPair doing CreateKeyPairProcess");
                return Tool.newKeyPair(preData.email, preData.nikeName, preData.password, function (err, retData) {
                    if (err) {
                        console.log(err);
                        _this.socketServer.emit('newKeyPairCallBack', null);
                        return saveLog("CreateKeyPairProcess return err: [" + err.message + "]");
                    }
                    if (!retData) {
                        var info_1 = "newKeyPair return null key!";
                        saveLog(info_1);
                        console.log(info_1);
                        return _this.socketServer.emit('newKeyPairCallBack', null);
                    }
                    _this.listenAfterPassword(socket);
                    var info = "RendererProcess finished \n[" + retData.publicKey + "] [" + retData.privateKey + "]";
                    saveLog(info);
                    console.log(info);
                    return Tool.getKeyPairInfo(retData.publicKey, retData.privateKey, preData.password, function (err, key) {
                        if (err) {
                            var info_2 = "Tool.getKeyPairInfo Error [" + (err.message ? err.message : 'null err message ') + "]";
                            saveLog(info_2);
                            console.log(info_2);
                            return _this.CoNET_systemError();
                        }
                        _this.config.keypair = key;
                        _this.config.account = _this.config.keypair.email;
                        Tool.saveConfig(_this.config, saveLog);
                        return _this.socketServer.emit('newKeyPairCallBack', _this.config.keypair);
                    });
                });
            });
        });
    };
    return localServer;
}());
exports["default"] = localServer;
