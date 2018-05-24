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
const socketIo = io({ reconnectionAttempts: 100, timeout: 500 });
const makeKeyPairData = function (view, keypair) {
    const length = keypair.publicKeyID.length;
    keypair.publicKeyID = keypair.publicKeyID.substr(length - 16);
    let keyPairPasswordClass = new keyPairPassword(function (_imapData) {
        keypair.keyPairPassword(keyPairPasswordClass = null);
        keypair.passwordOK = true;
        keypair.showLoginPasswordField(false);
        return view.imapSetup(new imapForm(keypair.email, _imapData, keypair.verified));
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
        socketIo.emit('deleteKeyPairNext');
        view.showIconBar(false);
        view.connectedCoNET(false);
        view.connectToCoNET(false);
        return keypair.delete_btn_view(false);
    };
    socketIo.on('deleteKeyPairNoite', function () {
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
            this.showKeyPair = ko.observable(true);
            this.socketListen();
        }
        systemError() {
            this.modalContent(infoDefine[this.languageIndex()].emailConform.formatError[10]);
            $('#CoNETError').modal('setting', 'closable', false).modal('show');
            return this.CoNETLocalServerError(true);
        }
        listingConnectStage(err, stage) {
            if (stage > -1) {
                this.showIconBar(true);
                this.connectToCoNET(true);
                if (stage === 4) {
                    this.connectToCoNET(false);
                    this.connectedCoNET(true);
                }
            }
        }
        initConfig(self, config) {
            if (config.keypair && config.keypair.publicKeyID) {
                const keypair = config.keypair;
                makeKeyPairData(this, keypair);
                if (!keypair.passwordOK) {
                    this.showKeyPair(true);
                    keypair.showLoginPasswordField(true);
                }
            }
            else {
                this.showKeyPair(true);
                config.keypair = null;
                let imap = self.imapSetup();
                self.imapSetup(imap = null);
                let _keyPairGenerateForm = new keyPairGenerateForm(function (_keyPair) {
                    makeKeyPairData(self, _keyPair);
                    _keyPair.passwordOK = true;
                    let keyPairPassword = _keyPair.keyPairPassword();
                    _keyPair.keyPairPassword(keyPairPassword = null);
                    config.keypair = _keyPair;
                    self.localServerConfig(config);
                    self.keyPair(_keyPair);
                    initPopupArea();
                    self.imapSetup(new imapForm(config.account));
                    return self.keyPairGenerateForm(_keyPairGenerateForm = null);
                });
                self.keyPairGenerateForm(_keyPairGenerateForm);
            }
            self.localServerConfig(config);
            self.keyPair(self.localServerConfig().keypair);
            if (self.keyPair() && self.keyPair().keyPairPassword() && typeof self.keyPair().keyPairPassword().inputFocus === 'function') {
                self.keyPair().keyPairPassword().inputFocus(true);
            }
        }
        socketListen() {
            let self = this;
            socketIo.once('reconnect_failed', function (err) {
                if (self.CoNETLocalServerError()) {
                    return;
                }
                return self.systemError();
            });
            socketIo.on('reconnect_attempt', () => {
                return self.systemError();
            });
            socketIo.once('CoNET_systemError', function () {
                return self.systemError();
            });
            socketIo.on('init', function (config) {
                return self.initConfig(self, config);
            });
            socketIo.emit('init', function (config) {
                return self.initConfig(self, config);
            });
            socketIo.on('tryConnectCoNETStage', function (err, stage) {
                return self.listingConnectStage(err, stage);
            });
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
            this.sectionAgreement(false);
            socketIo.emit('agreeClick');
            this.localServerConfig().firstRun = false;
            return this.openClick();
        }
        exit() {
            if (typeof require === 'undefined') {
                this.modalContent(infoDefine[this.languageIndex()].emailConform.formatError[11]);
                return this.hacked(true);
            }
            const { remote } = require('electron');
            return remote.app.quit();
        }
    }
    view_layout.view = view;
})(view_layout || (view_layout = {}));
const _view = new view_layout.view();
ko.applyBindings(_view, document.getElementById('body'));
$(`.${_view.tLang()}`).addClass('active');
