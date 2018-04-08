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
const socketIo = io({ reconnectionAttempts: 5, timeout: 1000 });
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
            this.keyPairGenerateForm = ko.observable();
            this.tLang = ko.observable(initLanguageCookie());
            this.languageIndex = ko.observable(lang[this.tLang()]);
            this.localServerConfig = ko.observable();
            this.keyPair = ko.observable(InitKeyPair());
            socketIo.emit('init', (config) => {
                if (config.keypair && config.keypair.publicKeyID) {
                    const length = config.keypair.publicKeyID.length;
                    config.keypair.publicKeyID = config.keypair.publicKeyID.substr(length - 8).toUpperCase();
                    config.keypair.publicKeyID = `${config.keypair.publicKeyID.substr(0, 4)} ${config.keypair.publicKeyID.substr(4)}`;
                }
                else {
                    config.keypair = null;
                    this.keyPairGenerateForm(new keyPairGenerateForm());
                }
                this.localServerConfig(config);
                this.keyPair(this.localServerConfig().keypair);
                return this.isFreeUser(this.localServerConfig().freeUser);
            });
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
            return this.sectionLogin(true);
        }
        agreeClick() {
            this.sectionAgreement(false);
            socketIo.emit('agreeClick');
            this.localServerConfig().firstRun = false;
            return this.openClick();
        }
        showUserDetail() {
        }
    }
    view_layout.view = view;
})(view_layout || (view_layout = {}));
const view = new view_layout.view();
ko.applyBindings(view, document.getElementById('body'));
$(`.${view.tLang()}`).addClass('active');
