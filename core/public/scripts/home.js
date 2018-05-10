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
var InitKeyPair = function () {
    var keyPair = {
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
var socketIo = io({ reconnectionAttempts: 5, timeout: 500 });
var makeKeyPairData = function (keypair) {
    var length = keypair.publicKeyID.length;
    keypair.publicKeyID = keypair.publicKeyID.substr(length - 8).toUpperCase();
    keypair.publicKeyID = keypair.publicKeyID.substr(0, 4) + " " + keypair.publicKeyID.substr(4);
    var keyPairPasswordClass = new keyPairPassword(function () {
        keypair.keyPairPassword(keyPairPasswordClass = null);
        keypair.showLoginPasswordField(false);
    });
    keypair.keyPairPassword = ko.observable(keyPairPasswordClass);
    keypair.showLoginPasswordField = ko.observable(false);
    keypair.delete_btn_view = ko.observable(true);
    keypair.showConform = ko.observable(false);
    keypair.delete_btn_click = function () {
        keypair.delete_btn_view(false);
        return keypair.showConform(true);
    };
    keypair.showLoginPasswordFieldClick = function () {
        keypair.showLoginPasswordField(!keypair.showLoginPasswordField());
        return keypair.keyPairPassword().inputFocus(keypair.showLoginPasswordField());
    };
    keypair.deleteKeyPairNext = function () {
        socketIo.emit('deleteKeyPairNext');
        return keypair.delete_btn_view(false);
    };
    socketIo.on('deleteKeyPairNoite', function () {
        return keypair.showDeleteKeyPairNoite(true);
    });
    keypair.showDeleteKeyPairNoite = ko.observable(false);
};
var initPopupArea = function () {
    var popItem = $('.activating.element').popup('hide');
    return popItem.popup({
        on: 'focus',
        movePopup: false,
        position: 'right center',
        inline: true
    });
};
var view_layout;
(function (view_layout) {
    var view = /** @class */ (function () {
        function view() {
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
            this.socketListen();
        }
        view.prototype.systemError = function () {
            this.modalContent(infoDefine[this.languageIndex()].emailConform.formatError[10]);
            $('#CoNETError').modal('setting', 'closable', false).modal('show');
            return this.CoNETLocalServerError(true);
        };
        view.prototype.initConfig = function (self, config) {
            if (config.keypair && config.keypair.publicKeyID) {
                var keypair = config.keypair;
                makeKeyPairData(keypair);
            }
            else {
                config.keypair = null;
                var _keyPairGenerateForm_1 = new keyPairGenerateForm(function (_keyPair) {
                    makeKeyPairData(_keyPair);
                    _keyPair.passwordOK = true;
                    var keyPairPassword = _keyPair.keyPairPassword();
                    _keyPair.keyPairPassword(keyPairPassword = null);
                    config.keypair = _keyPair;
                    self.localServerConfig(config);
                    self.keyPair(_keyPair);
                    initPopupArea();
                    return self.keyPairGenerateForm(_keyPairGenerateForm_1 = null);
                });
                self.keyPairGenerateForm(_keyPairGenerateForm_1);
            }
            self.localServerConfig(config);
            self.keyPair(self.localServerConfig().keypair);
            return self.isFreeUser(self.localServerConfig().freeUser);
        };
        view.prototype.socketListen = function () {
            var self = this;
            socketIo.once('reconnect_failed', function (err) {
                if (self.CoNETLocalServerError()) {
                    return;
                }
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
        };
        view.prototype.selectItem = function (that, site) {
            var tindex = lang[this.tLang()];
            var index = tindex + 1;
            if (index > 3) {
                index = 0;
            }
            this.languageIndex(index);
            this.tLang(lang[index]);
            $.cookie('langEH', this.tLang(), { expires: 180, path: '/' });
            var obj = $("span[ve-data-bind]");
            obj.each(function (index, element) {
                var ele = $(element);
                var data = ele.attr('ve-data-bind');
                if (data && data.length) {
                    ele.text(eval(data));
                }
            });
            $('.languageText').shape("flip " + this.LocalLanguage);
            $('.KnockoutAnimation').transition('jiggle');
            return initPopupArea();
        };
        view.prototype.openClick = function () {
            this.sectionWelcome(false);
            if (this.localServerConfig().firstRun) {
                return this.sectionAgreement(true);
            }
            this.sectionLogin(true);
            return initPopupArea();
        };
        view.prototype.agreeClick = function () {
            this.sectionAgreement(false);
            socketIo.emit('agreeClick');
            this.localServerConfig().firstRun = false;
            return this.openClick();
        };
        view.prototype.exit = function () {
            if (typeof require === 'undefined') {
                this.modalContent(infoDefine[this.languageIndex()].emailConform.formatError[11]);
                return this.hacked(true);
            }
            var remote = require('electron').remote;
            return remote.app.quit();
        };
        return view;
    }());
    view_layout.view = view;
})(view_layout || (view_layout = {}));
var _view = new view_layout.view();
ko.applyBindings(_view, document.getElementById('body'));
$("." + _view.tLang()).addClass('active');
