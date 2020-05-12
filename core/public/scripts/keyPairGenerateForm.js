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
/**
 *      check email address
 *      @param email <string>
 *      @param return <string>  Valid = '' Err = errorMessage
 */
const insideChinaEmail = /(\@|\.)(sina|sohu|qq|126|163|tom)\.com|(\.|\@)yeah\.net/i;
const getNickName = function (email) {
    var ret = '';
    if (email.length) {
        ret = email.split('@')[0];
        ret = ret.charAt(0).toUpperCase() + ret.slice(1);
    }
    return ret;
};
const QTGateSignKeyID = /3acbe3cbd3c1caa9|864662851231B119/i;
const getEmailAddress = (str) => {
    const uu = str.split('<');
    return uu[1].substr(0, uu[1].length - 1);
};
const getQTGateSign = (user) => {
    if (!user.otherCertifications || !user.otherCertifications.length) {
        return null;
    }
    let Certification = false;
    user.otherCertifications.forEach(n => {
        //console.log (`user.otherCertifications\n${ n.issuerKeyId.toHex ().toLowerCase() }`)
        if (QTGateSignKeyID.test(n.issuerKeyId.toHex().toLowerCase())) {
            return Certification = true;
        }
    });
    return Certification;
};
const getKeyInfo = async (keyPair, CallBack) => {
    if (!keyPair.publicKey || !keyPair.privateKey) {
        return CallBack(new Error('publicKey or privateKey empty!'));
    }
    const _privateKey = await openpgp.key.readArmored(keyPair.privateKey);
    const _publicKey = await openpgp.key.readArmored(keyPair.publicKey);
    if (_privateKey.err || _publicKey.err) {
        console.log(`_privateKey.err = [${_privateKey.err}], _publicKey.err [${_publicKey.err}]`);
        return CallBack(new Error('no key'));
    }
    //console.log (`getKeyPairInfo success!\nprivateKey\npublicKey`)
    const privateKey1 = _privateKey.keys[0];
    const publicKey1 = _publicKey.keys;
    const user = publicKey1[0].users[0];
    const ret = InitKeyPair();
    let didCallback = false;
    ret.publicKey = keyPair.publicKey;
    ret.privateKey = keyPair.privateKey;
    ret.nikeName = keyPair.nikeName;
    ret.createDate = privateKey1.primaryKey.created.toDateString();
    ret.email = keyPair.email;
    ret.verified = false;
    ret.publicKeyID = publicKey1[0].primaryKey.getFingerprint().toUpperCase();
    ret.passwordOK = false;
    if (!keyPair._password) {
        return CallBack(null, ret);
    }
    //console.log (`getKeyPairInfo test password!`)
    return privateKey1.decrypt(keyPair._password).then(keyOK => {
        //console.log (`privateKey1.decrypt then keyOK [${ keyOK }] didCallback [${ didCallback }]`)
        ret.passwordOK = keyOK;
        ret._password = keyPair._password;
        didCallback = true;
        return CallBack(null, ret);
    });
};
class IsNullValidator {
    isAcceptable(s) {
        if (s === undefined) {
            return true;
        }
        if (s === null) {
            return true;
        }
        if (s.length == 0) {
            return true;
        }
    }
}
class EmailValidator {
    isAcceptable(s) {
        return EmailRegexp.test(s);
    }
}
const testVal = new IsNullValidator();
const testEmail = new EmailValidator();
const checkEmail = function (email) {
    if (testVal.isAcceptable(email)) {
        return 'required';
    }
    if (!testEmail.isAcceptable(email)) {
        return 'EmailAddress';
    }
    return '';
};
class keyPairGenerateForm {
    constructor(exit) {
        this.exit = exit;
        this.EmailAddressError = ko.observable(false);
        this.SystemAdministratorEmailAddress = ko.observable('');
        this.showInsideFireWallEmail = ko.observable(false);
        this.NickNameError = ko.observable(false);
        this.passwordError = ko.observable(false);
        this.SystemAdministratorNickName = ko.observable('');
        this.systemSetup_systemPassword = ko.observable('');
        this.showKeyPairPorcess = ko.observable(false);
        this.delete_btn_view = ko.observable(false);
        this.doingProcessBarTime = null;
        this.keyPairGenerateFormMessage = ko.observable(false);
        this.message_cancel = ko.observable(false);
        this.message_keyPairGenerateError = ko.observable(false);
        this.message_keyPairGenerateSuccess = ko.observable(false);
        this.showKeyPairForm = ko.observable(true);
        this.showKeyInfomation = ko.observable(false);
        const self = this;
        this.SystemAdministratorEmailAddress.subscribe(function (newValue) {
            return self.checkEmailAddress(newValue);
        });
        this.SystemAdministratorNickName.subscribe(function (newValue) {
            return self.checkNickname(newValue);
        });
        /*
        this.systemSetup_systemPassword.subscribe ( function ( newValue ) {
            return self.checkPassword ( newValue )
        })
        */
    }
    checkEmailAddress(email) {
        $('.ui.checkbox').checkbox();
        this.EmailAddressError(false);
        this.NickNameError(false);
        if (!email || !email.length) {
            this.EmailAddressError(true);
            return initPopupArea();
        }
        if (conetImapAccount.test(email)) {
            this.EmailAddressError(true);
            return initPopupArea();
        }
        if (checkEmail(email).length) {
            this.EmailAddressError(true);
            return initPopupArea();
        }
        if (!this.SystemAdministratorNickName().length) {
            this.SystemAdministratorNickName(getNickName(email));
        }
        if (insideChinaEmail.test(email)) {
            this.showInsideFireWallEmail(true);
        }
        return true;
    }
    checkNickname(nickname) {
        this.NickNameError(false);
        if (!nickname || !nickname.length) {
            initPopupArea();
            this.NickNameError(true);
        }
        return true;
    }
    checkPassword(password) {
        this.passwordError(false);
        if (!password || password.length < 5) {
            this.passwordError(true);
            initPopupArea();
        }
        return true;
    }
    stopDoingProcessBar() {
        clearTimeout(this.doingProcessBarTime);
        this.showKeyPairPorcess(false);
        return $('.keyPairProcessBar').progress({
            percent: 0
        });
    }
    form_AdministratorEmail_submit() {
        const self = this;
        this.checkEmailAddress(this.SystemAdministratorEmailAddress());
        this.checkNickname(this.SystemAdministratorNickName());
        this.checkPassword(this.systemSetup_systemPassword());
        if (this.passwordError() || this.EmailAddressError() || this.NickNameError()) {
            return false;
        }
        this.showKeyPairPorcess(true);
        this.showKeyPairForm(false);
        const email = this.SystemAdministratorEmailAddress();
        const sendData = {
            password: this.systemSetup_systemPassword(),
            nikeName: this.SystemAdministratorNickName(),
            email: email
        };
        let percent = 1;
        $('.keyPairProcessBar').progress('reset');
        const timeSet = 10000;
        const doingProcessBar = function () {
            clearTimeout(self.doingProcessBarTime);
            self.doingProcessBarTime = setTimeout(function () {
                $('.keyPairProcessBar').progress({
                    percent: percent++
                });
                if (percent < 100)
                    return doingProcessBar();
            }, timeSet);
        };
        /*
        _view.connectInformationMessage.sockEmit ( 'NewKeyPair', sendData, function ( err, keyPair, newKeyPairCallBack ) {
            self.stopDoingProcessBar ()
            self.keyPairGenerateFormMessage ( true )
            if ( !keyPair ) {
                return self.message_keyPairGenerateError ( true )
            }
            self.exit ( keyPair, newKeyPairCallBack )
            return self.message_keyPairGenerateSuccess ( true )
        })
        */
        this.NewKeyPair(sendData, (err, data) => {
            self.stopDoingProcessBar();
            self.keyPairGenerateFormMessage(true);
            if (err) {
                return self.message_keyPairGenerateError(true);
            }
            getKeyInfo(data, (err, _data) => {
                return self.exit(_data);
            });
            self.message_keyPairGenerateSuccess(true);
        });
        return doingProcessBar();
    }
    NewKeyPair(sendData, CallBack) {
        const userId = {
            name: sendData.nikeName,
            email: sendData.email
        };
        const option = {
            passphrase: sendData.password,
            userIds: [userId],
            curve: "ed25519",
            aead_protect: true,
            aead_protect_version: 4
        };
        return openpgp.generateKey(option).then((out) => {
            const keypair = {
                keyLength: null,
                nikeName: sendData.nikeName,
                createDate: null,
                email: sendData.email,
                publicKeyID: null,
                publicKey: out.publicKeyArmored,
                privateKey: out.privateKeyArmored,
                passwordOK: true,
                _password: sendData.password,
                verified: false
            };
            return CallBack(null, keypair);
        }).catch(err => {
            // ERROR
            return CallBack(err);
        });
    }
    CloseKeyPairGenerateFormMessage() {
        this.message_cancel(false);
        this.message_keyPairGenerateError(false);
        this.message_keyPairGenerateSuccess(false);
        this.keyPairGenerateFormMessage(false);
        return this.showKeyPairForm(true);
    }
}
