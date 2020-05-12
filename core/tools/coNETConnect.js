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
const commandRequestTimeOutTime = 1000 * 10;
const requestTimeOut = 1000 * 60;
class default_1 extends Imap.imapPeer {
    constructor(imapData, server, socket, cmdResponse, _exit) {
        super(imapData, imapData.clientFolder, imapData.serverFolder, err => {
            console.debug(`imapPeer doing exit! err =`, err);
            this.roomEmit.emit('tryConnectCoNETStage', null, -2);
            return this.exit1(err);
        });
        this.imapData = imapData;
        this.server = server;
        this.socket = socket;
        this.cmdResponse = cmdResponse;
        this._exit = _exit;
        this.CoNETConnectReady = false;
        this.connectStage = -1;
        this.alreadyExit = false;
        this.timeoutWaitAfterSentrequestMail = null;
        this.roomEmit = this.server.to(this.socket.id);
        saveLog(`=====================================  new CoNET connect()`, true);
        this.roomEmit.emit('tryConnectCoNETStage', null, 5);
        this.newMail = (mail, hashCode) => {
            return this.cmdResponse(mail, hashCode);
        };
        this.on('CoNETConnected', publicKey => {
            this.CoNETConnectReady = true;
            saveLog('Connected CoNET!', true);
            //console.log ( publicKey )
            clearTimeout(this.timeoutWaitAfterSentrequestMail);
            this.connectStage = 4;
            this.roomEmit.emit('tryConnectCoNETStage', null, 4, publicKey);
            return;
        });
        this.on('pingTimeOut', () => {
            console.log(`class CoNETConnect on pingTimeOut`);
            return this.roomEmit.emit('pingTimeOut');
        });
        this.on('ping', () => {
            this.roomEmit.emit('tryConnectCoNETStage', null, 2);
            //this.sockerServer.emit ( 'tryConnectCoNETStage', null, 2 )
        });
    }
    exit1(err) {
        console.trace(`imapPeer doing exit! this.sockerServer.emit ( 'tryConnectCoNETStage', null, -1 )`);
        this.roomEmit.emit('tryConnectCoNETStage', null, -1);
        if (!this.alreadyExit) {
            this.alreadyExit = true;
            console.log(`CoNETConnect class exit1 doing this._exit() success!`);
            return this._exit(err);
        }
        console.log(`exit1 cancel already Exit [${err}]`);
    }
    setTimeWaitAfterSentrequestMail() {
        this.timeoutWaitAfterSentrequestMail = setTimeout(() => {
            return this.roomEmit.emit('tryConnectCoNETStage', null, 0);
        }, requestTimeOut * 2);
    }
    requestCoNET_v1(uuid, text, CallBack) {
        return this.sendDataToANewUuidFolder(Buffer.from(text).toString('base64'), this.imapData.serverFolder, uuid, CallBack);
    }
    getFile(fileName, CallBack) {
        let callback = false;
        if (this.alreadyExit) {
            return CallBack(new Error('alreadyExit'));
        }
        console.log(`requestCoNET_v1 get file:[${fileName}]`);
        const rImap = new Imap.qtGateImapRead(this.imapData, fileName, true, mail => {
            const attr = Imap.getMailAttached(mail);
            console.log(`=========>   getFile mail.length = [${mail.length}] attr.length = [${attr.length}]`);
            if (!callback) {
                callback = true;
                CallBack(null, attr);
            }
            return rImap.destroyAll(null);
        });
        rImap.once('error', err => {
            return rImap.destroyAll(null);
        });
        rImap.once('end', err => {
            if (err) {
                if (!callback) {
                    saveLog(`getFile got error [${err}]\nDoing getFile again!\n`);
                    return this.getFile(fileName, CallBack);
                }
            }
            return saveLog(`getFile [${fileName}] success!`);
        });
    }
}
exports.default = default_1;
