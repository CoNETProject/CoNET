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
const InitKeyPair = () => {
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
const socketIo = io({ reconnectionAttempts: 5, timeout: 500 });
var view_layout;
(function (view_layout) {
    class view {
        constructor() {
            this.sectionLogin = ko.observable(false);
            this.sectionAgreement = ko.observable(false);
            this.sectionWelcome = ko.observable(true);
            this.isFreeUser = ko.observable(true);
            this.QTTransferData = ko.observable(false);
            this.keyPair_delete_btn_view = ko.observable(false);
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
            socketIo.once('reconnect_failed', err => {
                if (this.CoNETLocalServerError()) {
                    return;
                }
                return this.systemError();
            });
            socketIo.once('CoNET_systemError', () => {
                return this.systemError();
            });
            socketIo.on('init', (config) => {
                return this.initConfig(config);
            });
            socketIo.emit('init', (config) => {
                return this.initConfig(config);
            });
        }
        systemError() {
            this.modalContent(infoDefine[this.languageIndex()].emailConform.formatError[10]);
            $('#CoNETError').modal('setting', 'closable', false).modal('show');
            return this.CoNETLocalServerError(true);
        }
        initConfig(config) {
            if (config.keypair && config.keypair.publicKeyID) {
                const keypair = config.keypair;
                const length = keypair.publicKeyID.length;
                keypair.publicKeyID = keypair.publicKeyID.substr(length - 8).toUpperCase();
                keypair.publicKeyID = `${keypair.publicKeyID.substr(0, 4)} ${keypair.publicKeyID.substr(4)}`;
                let keyPairPasswordClass = new keyPairPassword(() => {
                    keypair.keyPairPassword(keyPairPasswordClass = null);
                    keypair.showLoginPasswordField(false);
                });
                keypair.keyPairPassword = ko.observable(keyPairPasswordClass);
                keypair.showLoginPasswordField = ko.observable(false);
                keypair.delete_btn_view = ko.observable(true);
                keypair.showConform = ko.observable(false);
                keypair.delete_btn_click = () => {
                    keypair.delete_btn_view(false);
                    return keypair.showConform(true);
                };
                keypair.showLoginPasswordFieldClick = () => {
                    keypair.showLoginPasswordField(!keypair.showLoginPasswordField());
                    return keypair.keyPairPassword().inputFocus(keypair.showLoginPasswordField());
                };
                keypair.deleteKeyPairNext = () => {
                    socketIo.emit('deleteKeyPairNext');
                    return keypair.delete_btn_view(false);
                };
                socketIo.on('deleteKeyPairNoite', () => {
                    return keypair.showDeleteKeyPairNoite(true);
                });
                keypair.showDeleteKeyPairNoite = ko.observable(false);
            }
            else {
                config.keypair = null;
                let _keyPairGenerateForm = new keyPairGenerateForm(() => {
                    return this.keyPairGenerateForm(_keyPairGenerateForm = null);
                });
                this.keyPairGenerateForm(_keyPairGenerateForm);
            }
            this.localServerConfig(config);
            this.keyPair(this.localServerConfig().keypair);
            return this.isFreeUser(this.localServerConfig().freeUser);
        }
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
            obj.each((index, element) => {
                const ele = $(element);
                const data = ele.attr('ve-data-bind');
                if (data && data.length) {
                    ele.text(eval(data));
                }
            });
            $('.languageText').shape(`flip ${this.LocalLanguage}`);
            return $('.KnockoutAnimation').transition('jiggle');
        }
        openClick() {
            this.sectionWelcome(false);
            if (this.localServerConfig().firstRun) {
                return this.sectionAgreement(true);
            }
            this.sectionLogin(true);
            return $('.activating.element').popup({
                on: 'focus',
                movePopup: false
            });
        }
        agreeClick() {
            this.sectionAgreement(false);
            socketIo.emit('agreeClick');
            this.localServerConfig().firstRun = false;
            return this.openClick();
        }
        showUserDetail() {
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
const view = new view_layout.view();
ko.applyBindings(view, document.getElementById('body'));
$(`.${view.tLang()}`).addClass('active');
