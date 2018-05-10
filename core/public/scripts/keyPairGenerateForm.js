/**
 *      check email address
 *      @param email <string>
 *      @param return <string>  Valid = '' Err = errorMessage
 */
var insideChinaEmail = /(\@|\.)(sina|sohu|qq|126|163|tom)\.com|(\.|\@)yeah\.net/i;
var getNickName = function (email) {
    var ret = '';
    if (email.length) {
        ret = email.split('@')[0];
        ret = ret.charAt(0).toUpperCase() + ret.slice(1);
    }
    return ret;
};
var IsNullValidator = /** @class */ (function () {
    function IsNullValidator() {
    }
    IsNullValidator.prototype.isAcceptable = function (s) {
        if (s === undefined) {
            return true;
        }
        if (s === null) {
            return true;
        }
        if (s.length == 0) {
            return true;
        }
    };
    return IsNullValidator;
}());
var EmailValidator = /** @class */ (function () {
    function EmailValidator() {
    }
    EmailValidator.prototype.isAcceptable = function (s) {
        return EmailRegexp.test(s);
    };
    return EmailValidator;
}());
var testVal = new IsNullValidator();
var testEmail = new EmailValidator();
var checkEmail = function (email) {
    if (testVal.isAcceptable(email)) {
        return 'required';
    }
    if (!testEmail.isAcceptable(email)) {
        return 'EmailAddress';
    }
    return '';
};
var keyPairGenerateForm = /** @class */ (function () {
    function keyPairGenerateForm(exit) {
        var _this = this;
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
        this.SystemAdministratorEmailAddress.subscribe(function (newValue) {
            return _this.checkEmailAddress(newValue);
        });
        this.SystemAdministratorNickName.subscribe(function (newValue) {
            return _this.checkNickname(newValue);
        });
        this.systemSetup_systemPassword.subscribe(function (newValue) {
            return _this.checkPassword(newValue);
        });
    }
    keyPairGenerateForm.prototype.showPopUp = function () {
        $('.activating.element').popup({
            on: 'focus',
            movePopup: false
        });
    };
    keyPairGenerateForm.prototype.checkEmailAddress = function (email) {
        $('.ui.checkbox').checkbox();
        this.EmailAddressError(false);
        this.NickNameError(false);
        if (!email || !email.length) {
            this.EmailAddressError(true);
            return this.showPopUp();
        }
        if (checkEmail(email).length) {
            this.EmailAddressError(true);
            return this.showPopUp();
        }
        if (!this.SystemAdministratorNickName().length) {
            this.SystemAdministratorNickName(getNickName(email));
        }
        if (insideChinaEmail.test(email)) {
            this.showInsideFireWallEmail(true);
        }
        return true;
    };
    keyPairGenerateForm.prototype.checkNickname = function (nickname) {
        this.NickNameError(false);
        if (!nickname || !nickname.length) {
            this.showPopUp();
            this.NickNameError(true);
        }
        return true;
    };
    keyPairGenerateForm.prototype.checkPassword = function (password) {
        this.passwordError(false);
        if (!password || password.length < 5) {
            this.passwordError(true);
            this.showPopUp();
        }
        return true;
    };
    keyPairGenerateForm.prototype.stopDoingProcessBar = function () {
        clearTimeout(this.doingProcessBarTime);
        this.showKeyPairPorcess(false);
        return $('.keyPairProcessBar').progress({
            percent: 0
        });
    };
    keyPairGenerateForm.prototype.form_AdministratorEmail_submit = function () {
        var _this = this;
        var self = this;
        this.checkEmailAddress(this.SystemAdministratorEmailAddress());
        this.checkNickname(this.SystemAdministratorNickName());
        this.checkPassword(this.systemSetup_systemPassword());
        if (this.passwordError() || this.EmailAddressError() || this.NickNameError()) {
            return false;
        }
        this.showKeyPairPorcess(true);
        this.showKeyPairForm(false);
        var email = this.SystemAdministratorEmailAddress();
        var sendData = {
            password: this.systemSetup_systemPassword(),
            nikeName: this.SystemAdministratorNickName(),
            email: email
        };
        var percent = 1;
        $('.keyPairProcessBar').progress('reset');
        var timeSet = 10000;
        var doingProcessBar = function () {
            clearTimeout(_this.doingProcessBarTime);
            _this.doingProcessBarTime = setTimeout(function () {
                $('.keyPairProcessBar').progress({
                    percent: percent++
                });
                if (percent < 100)
                    return doingProcessBar();
            }, timeSet);
        };
        socketIo.once('newKeyPairCallBack', function (keyPair) {
            self.stopDoingProcessBar();
            self.keyPairGenerateFormMessage(true);
            if (!keyPair) {
                return self.message_keyPairGenerateError(true);
            }
            self.exit(keyPair);
            return self.message_keyPairGenerateSuccess(true);
        });
        socketIo.emit('NewKeyPair', sendData);
        return doingProcessBar();
    };
    keyPairGenerateForm.prototype.CloseKeyPairGenerateFormMessage = function () {
        this.message_cancel(false);
        this.message_keyPairGenerateError(false);
        this.message_keyPairGenerateSuccess(false);
        this.keyPairGenerateFormMessage(false);
        return this.showKeyPairForm(true);
    };
    return keyPairGenerateForm;
}());
