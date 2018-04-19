class keyPairPassword {
    constructor(exit) {
        this.exit = exit;
        this.showPasswordErrorMessage = ko.observable(false);
        this.systemSetup_systemPassword = ko.observable('');
        this.passwordChecking = ko.observable(false);
        this.inputFocus = ko.observable(false);
        this.keyPair_checkPemPasswordClick = () => {
            this.showPasswordErrorMessage(false);
            if (!this.systemSetup_systemPassword() || this.systemSetup_systemPassword().length < 5) {
                return this.showPasswordError();
            }
            this.passwordChecking(true);
            return socketIo.emit('checkPemPassword', this.systemSetup_systemPassword(), err => {
                this.passwordChecking(false);
                if (err) {
                    return this.showPasswordError();
                }
                return this.exit();
            });
        };
        this.systemSetup_systemPassword.subscribe(newValue => {
            if (!newValue || !newValue.length) {
                return;
            }
            this.showPasswordErrorMessage(false);
        });
    }
    showPasswordError() {
        this.showPasswordErrorMessage(true);
        this.systemSetup_systemPassword('');
        return $('.activating.element').popup({
            on: 'click',
            movePopup: false
        });
    }
}
