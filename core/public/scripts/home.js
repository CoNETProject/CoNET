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
const InitKeyPair = function () {
    const keyPair = {
        publicKey: null,
        privateKey: null,
        keyLength: null,
        nikeName: null,
        createDate: null,
        email: null,
        passwordOK: false,
        verified: false,
        publicKeyID: null
    };
    return keyPair;
};
const socketIo = io({ reconnectionAttempts: 5, timeout: 500, autoConnect: true });
socketIo.emit11 = function (eventName, ...args) {
    let CallBack = args.pop();
    if (typeof CallBack !== 'function') {
        CallBack ? args.push(CallBack) : null;
        CallBack = null;
    }
    const localTimeOut = setTimeout(function () {
        let uu = eventName;
        _view.systemError();
    }, 10000);
    const _CallBack = function (err) {
        clearTimeout(localTimeOut);
        if (CallBack) {
            socketIo.once(eventName, function (...args) {
                return CallBack(...args);
            });
        }
    };
    args.length
        ? socketIo.emit(eventName, ...args, _CallBack)
        : socketIo.emit(eventName, _CallBack);
};
const makeKeyPairData = function (view, keypair) {
    const length = keypair.publicKeyID.length;
    keypair.publicKeyID = keypair.publicKeyID.substr(length - 16);
    let keyPairPasswordClass = new keyPairPassword(function (_imapData) {
        //      password OK
        keypair.keyPairPassword(keyPairPasswordClass = null);
        keypair.passwordOK = true;
        keypair.showLoginPasswordField(false);
        view.showIconBar(true);
        view.showKeyPair(false);
        if (_imapData && _imapData.imapTestResult) {
            return view.imapSetupClassExit(_imapData);
        }
        let uu = null;
        return view.imapSetup(uu = new imapForm(keypair.email, _imapData, function (imapData) {
            view.imapSetup(uu = null);
            view.imapSetupClassExit(imapData);
        }));
    });
    keypair.keyPairPassword = ko.observable(keyPairPasswordClass);
    keypair.showLoginPasswordField = ko.observable(false);
    keypair.delete_btn_view = ko.observable(true);
    keypair.showConform = ko.observable(false);
    keypair.delete_btn_click = function () {
        keypair.delete_btn_view(false);
        return keypair.showConform(true);
    };
    keypair.deleteKeyPairNext = function () {
        socketIo.emit11('deleteKeyPairNext');
        view.showIconBar(false);
        view.connectedCoNET(false);
        view.connectToCoNET(false);
        return keypair.delete_btn_view(false);
    };
    socketIo.once('deleteKeyPairNoite', function () {
        return keypair.showDeleteKeyPairNoite(true);
    });
    keypair.showDeleteKeyPairNoite = ko.observable(false);
};
const initPopupArea = () => {
    const popItem = $('.activating.element').popup('hide');
    const inline = popItem.hasClass('inline');
    return popItem.popup({
        on: 'focus',
        movePopup: false,
        position: 'top left',
        inline: inline
    });
};
var view_layout;
(function (view_layout) {
    class view {
        constructor() {
            this.sectionLogin = ko.observable(false);
            this.sectionAgreement = ko.observable(false);
            this.sectionWelcome = ko.observable(true);
            this.isFreeUser = ko.observable(true);
            this.QTTransferData = ko.observable(false);
            this.LocalLanguage = 'up';
            this.menu = Menu;
            this.CoNETLocalServerError = ko.observable(false);
            this.modalContent = ko.observable('');
            this.keyPairGenerateForm = ko.observable();
            this.tLang = ko.observable(initLanguageCookie());
            this.languageIndex = ko.observable(lang[this.tLang()]);
            this.localServerConfig = ko.observable();
            this.keyPair = ko.observable(InitKeyPair());
            this.hacked = ko.observable(false);
            this.imapSetup = ko.observable();
            this.showIconBar = ko.observable(false);
            this.connectToCoNET = ko.observable(false);
            this.connectedCoNET = ko.observable(false);
            this.showKeyPair = ko.observable(false);
            this.CoGate = ko.observable(false);
            this.CoGateClass = ko.observable(null);
            this.showCoGateButton = ko.observable(false);
            this.showCoGate = ko.observable(false);
            this.CoNETConnect = ko.observable(null);
            this.socketListen();
        }
        systemError() {
            this.modalContent(infoDefine[this.languageIndex()].emailConform.formatError[10]);
            $('#CoNETError').modal('setting', 'closable', false).modal('show');
            return this.CoNETLocalServerError(true);
        }
        afterInitConfig() {
            this.keyPair(this.localServerConfig().keypair);
            if (this.keyPair() && this.keyPair().keyPairPassword() && typeof this.keyPair().keyPairPassword().inputFocus === 'function') {
                this.keyPair().keyPairPassword().inputFocus(true);
            }
        }
        listingConnectStage(err, stage) {
            if (stage > -1) {
                this.showIconBar(true);
                this.connectToCoNET(true);
                this.showKeyPair(false);
                if (stage === 4) {
                    this.connectToCoNET(false);
                    this.connectedCoNET(true);
                    if (this.keyPair().verified) {
                        if (this.showCoGate()) {
                            this.showCoGateButton(true);
                            return this.CoGateClick();
                        }
                    }
                }
            }
        }
        initConfig(config) {
            const self = this;
            this.showKeyPair(true);
            if (config.keypair && config.keypair.publicKeyID) {
                /**
                 *
                 *      Key pair ready
                 *
                 */
                makeKeyPairData(this, config.keypair);
                if (!config.keypair.passwordOK) {
                    config.keypair.showLoginPasswordField(true);
                }
            }
            else {
                /**
                 *
                 *      No key pair
                 *
                 */
                this.clearImapData();
                config.keypair = null;
                let _keyPairGenerateForm = new keyPairGenerateForm(function (_keyPair) {
                    /**
                     *      key pair ready
                     */
                    makeKeyPairData(self, _keyPair);
                    _keyPair.passwordOK = true;
                    let keyPairPassword = _keyPair.keyPairPassword();
                    _keyPair.keyPairPassword(keyPairPassword = null);
                    config.keypair = _keyPair;
                    self.keyPair(_keyPair);
                    self.showIconBar(true);
                    self.showKeyPair(false);
                    initPopupArea();
                    let uu = null;
                    self.imapSetup(uu = new imapForm(config.account, null, (imapData) => {
                        self.imapSetup(uu = null);
                        return self.imapSetupClassExit(imapData);
                    }));
                    return self.keyPairGenerateForm(_keyPairGenerateForm = null);
                });
                this.keyPairGenerateForm(_keyPairGenerateForm);
            }
            this.localServerConfig(config);
            this.afterInitConfig();
        }
        clearImapData() {
            let imap = this.imapSetup();
            this.imapSetup(imap = null);
        }
        socketListen() {
            let self = this;
            socketIo.once('reconnect_failed', function (err) {
                if (self.CoNETLocalServerError()) {
                    return;
                }
                return self.systemError();
            });
            socketIo.on('reconnect_attempt', function () {
                //return self.systemError()
            });
            socketIo.once('CoNET_systemError', function () {
                return self.systemError();
            });
            socketIo.on('init', function (err, config) {
                return self.initConfig(config);
            });
            socketIo.emit11('init');
        }
        //          change language
        selectItem(that, site) {
            const tindex = lang[this.tLang()];
            let index = tindex + 1;
            if (index > 3) {
                index = 0;
            }
            this.languageIndex(index);
            this.tLang(lang[index]);
            $.cookie('langEH', this.tLang(), { expires: 180, path: '/' });
            const obj = $("span[ve-data-bind]");
            obj.each(function (index, element) {
                const ele = $(element);
                const data = ele.attr('ve-data-bind');
                if (data && data.length) {
                    ele.text(eval(data));
                }
            });
            $('.languageText').shape(`flip ${this.LocalLanguage}`);
            $('.KnockoutAnimation').transition('jiggle');
            return initPopupArea();
        }
        //          start click
        openClick() {
            this.sectionWelcome(false);
            if (this.localServerConfig().firstRun) {
                return this.sectionAgreement(true);
            }
            this.sectionLogin(true);
            return initPopupArea();
        }
        agreeClick() {
            socketIo.emit11('agreeClick');
            this.sectionAgreement(false);
            this.localServerConfig().firstRun = false;
            return this.openClick();
        }
        CoGateClick() {
            this.showKeyPair(false);
            if (this.CoGate()) {
                let uu = this.CoGateClass();
                if (uu.doingCommand) {
                    return;
                }
                this.CoGate(false);
                return this.CoGateClass(uu = null);
            }
            this.CoGateClass(new CoGateClass());
            this.CoGate(true);
        }
        refresh() {
            if (typeof require === 'undefined') {
                this.modalContent(infoDefine[this.languageIndex()].emailConform.formatError[11]);
                return this.hacked(true);
            }
            const { remote } = require('electron');
            return remote.app.quit();
        }
        showKeyInfoClick() {
            if (this.showKeyPair()) {
                if (this.CoNETConnect() !== null && !this.CoGate()) {
                    this.CoGateClass(new CoGateClass());
                    this.CoGate(true);
                }
                return this.showKeyPair(false);
            }
            this.showKeyPair(true);
            this.CoGate(false);
            let uu = this.CoGateClass();
            return this.CoGateClass(uu = null);
        }
        imapSetupClassExit(_imapData) {
            const self = this;
            let uu = null;
            return this.CoNETConnect(uu = new CoNETConnect(_imapData.imapUserName, this.keyPair().verified, _imapData.confirmRisk, this.keyPair().email, function (err, showCoGate) {
                if (err) {
                    self.CoNETConnect(uu = null);
                    return self.imapSetup(uu = new imapForm(_imapData.account, null, function (imapData) {
                        self.imapSetup(uu = null);
                        return self.imapSetupClassExit(imapData);
                    }));
                }
                self.showCoGate(showCoGate);
                if (showCoGate) {
                    return self.CoGateClick();
                }
            }));
        }
        reFreshLocalServer() {
            const self = this;
            socketIo.once('connect', function () {
                return location.reload();
            });
            socketIo.once('connect_error', function () {
                return self.refresh();
            });
            socketIo.connect();
        }
    }
    view_layout.view = view;
})(view_layout || (view_layout = {}));
const _view = new view_layout.view();
ko.applyBindings(_view, document.getElementById('body'));
$(`.${_view.tLang()}`).addClass('active');
