/**
 *      check email address
 *      @param email <string>
 *      @param return <string>  Valid = '' Err = errorMessage
 */
const insideChinaEmail = /(\@|\.)(sina|sohu|qq|126|163|tom)\.com|(\.|\@)yeah\.net/i;
const getNickName = (email) => {
    var ret = '';
    if (email.length) {
        ret = email.split('@')[0];
        ret = ret.charAt(0).toUpperCase() + ret.slice(1);
    }
    return ret;
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
const checkEmail = (email) => {
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
        this.keyLengthInfoShow = ko.observable(true);
        this.keyPairLengthSelect = ko.observable('2048');
        this.showKeyPairPorcess = ko.observable(false);
        this.newKeyPairRunningCancelButtonShow = ko.observable(false);
        this.delete_btn_view = ko.observable(false);
        this.doingProcessBarTime = null;
        this.keyPairGenerateFormMessage = ko.observable(false);
        this.message_cancel = ko.observable(false);
        this.message_keyPairGenerateError = ko.observable(false);
        this.message_keyPairGenerateSuccess = ko.observable(false);
        this.showKeyPairForm = ko.observable(true);
        this.showKeyInfomation = ko.observable(false);
        this.SystemAdministratorEmailAddress.subscribe(newValue => {
            return this.checkEmailAddress(newValue);
        });
        this.SystemAdministratorNickName.subscribe(newValue => {
            return this.checkNickname(newValue);
        });
        this.systemSetup_systemPassword.subscribe(newValue => {
            return this.checkPassword(newValue);
        });
    }
    showPopUp() {
        $('.activating.element').popup({
            on: 'focus',
            movePopup: false
        });
    }
    checkEmailAddress(email) {
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
    }
    checkNickname(nickname) {
        this.NickNameError(false);
        if (!nickname || !nickname.length) {
            this.showPopUp();
            this.NickNameError(true);
        }
        return true;
    }
    checkPassword(password) {
        this.passwordError(false);
        if (!password || password.length < 5) {
            this.passwordError(true);
            this.showPopUp();
        }
        return true;
    }
    stopDoingProcessBar() {
        clearTimeout(this.doingProcessBarTime);
        this.newKeyPairRunningCancelButtonShow(false);
        this.showKeyPairPorcess(false);
        return $('.keyPairProcessBar').progress({
            percent: 0
        });
    }
    form_AdministratorEmail_submit() {
        this.checkEmailAddress(this.SystemAdministratorEmailAddress());
        this.checkNickname(this.SystemAdministratorNickName());
        this.checkPassword(this.systemSetup_systemPassword());
        if (this.passwordError() || this.EmailAddressError() || this.NickNameError()) {
            return false;
        }
        this.showKeyPairPorcess(true);
        this.newKeyPairRunningCancelButtonShow(true);
        this.showKeyPairForm(false);
        const email = this.SystemAdministratorEmailAddress();
        const sendData = {
            password: this.systemSetup_systemPassword(),
            keyLength: this.keyPairLengthSelect(),
            nikeName: this.SystemAdministratorNickName(),
            email: email
        };
        let percent = 1;
        $('.keyPairProcessBar').progress('reset');
        const timeSet = parseInt(sendData.keyLength) * 0.2;
        const doingProcessBar = () => {
            clearTimeout(this.doingProcessBarTime);
            this.doingProcessBarTime = setTimeout(() => {
                $('.keyPairProcessBar').progress({
                    percent: percent++
                });
                if (percent < 100)
                    return doingProcessBar();
            }, timeSet);
        };
        /*
        socketIo.once ( 'newKeyPairCallBack', keyPair => {
            this.stopDoingProcessBar ()
            this.keyPairGenerateFormMessage ( true )
            if ( !keyPair ) {
                return this.message_keyPairGenerateError ( true )
            }
            this.exit ()
            return this.message_keyPairGenerateSuccess ( true )
        })

        socketIo.emit ( 'NewKeyPair', sendData )
        */
        return doingProcessBar();
    }
    tileClick(data) {
        this.keyPairLengthSelect(data);
        return true;
    }
    CancelCreateKeyPair() {
        this.stopDoingProcessBar();
        this.message_cancel(true);
        this.newKeyPairRunningCancelButtonShow(false);
        this.delete_btn_view(false);
        socketIo.emit('cancelNewKeyPair');
        //this.showKeyPairForm ( true )
        return this.keyPairGenerateFormMessage(true);
    }
    CloseKeyPairGenerateFormMessage() {
        this.message_cancel(false);
        this.message_keyPairGenerateError(false);
        this.message_keyPairGenerateSuccess(false);
        this.keyPairGenerateFormMessage(false);
        return this.showKeyPairForm(true);
    }
}
