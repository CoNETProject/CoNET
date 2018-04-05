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
const Os = require("os");
const HTTP = require("http");
const SocketIo = require("socket.io");
/**
 * 		define
 */
const QTGateFolder = Path.join(Os.homedir(), '.QTGate');
const CoNET_Home = Path.join(__dirname);
const LocalServerPortNumber = 2000;
class default_1 {
    constructor() {
        this.expressServer = Express();
        this.httpServer = HTTP.createServer(this.expressServer);
        this.socketServer = SocketIo(this.httpServer);
        this.expressServer.set('views', Path.join(CoNET_Home, 'views'));
        this.expressServer.set('view engine', 'pug');
        this.expressServer.use(Express.static(QTGateFolder));
        this.expressServer.use(Express.static(Path.join(CoNET_Home, 'public')));
        this.expressServer.get('/', (req, res) => {
            res.render('home', { title: 'home' });
        });
        this.socketServer.on('connection', socker => {
            return this.socketServerConnected(socker);
        });
        this.httpServer.listen(LocalServerPortNumber);
    }
    socketServerConnected(socket) {
    }
}
exports.default = default_1;
