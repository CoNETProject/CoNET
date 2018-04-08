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
const saveServerStartup = () => {
    saveLog(`*************************** CoNET Platform [ ${Tool.packageFile.version} ] server start up on [ ${Tool.LocalServerPortNumber} ] *****************************`);
};
class localServer {
    constructor(test) {
        this.expressServer = Express();
        this.httpServer = HTTP.createServer(this.expressServer);
        this.socketServer = SocketIo(this.httpServer);
        this.config = null;
        this.keyPair = null;
        Async.series([
            next => Tool.checkSystemFolder(next),
            next => Tool.checkConfig(next)
        ], (err, data) => {
            if (err) {
                return saveLog(err);
            }
            this.config = data['1'];
            console.log(Util.inspect(this.config));
        });
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
        this.httpServer.listen(Tool.LocalServerPortNumber);
        saveServerStartup();
        if (test) {
            this.httpServer.close();
        }
    }
    socketServerConnected(socket) {
        socket.on('init', Callback => {
            const ret = Tool.emitConfig(this.config, false);
            return Callback(ret);
        });
        socket.once('agreeClick', () => {
            saveLog(`socket on agreeClick`);
            this.config.firstRun = false;
            return Tool.saveConfig(this.config, saveLog);
        });
    }
}
exports.default = localServer;
