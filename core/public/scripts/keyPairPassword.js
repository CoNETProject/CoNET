var keyPairPassword = /** @class */ (function () {
    function keyPairPassword(exit) {
        this.exit = exit;
        this.showPasswordErrorMessage = ko.observable(false);
        this.systemSetup_systemPassword = ko.observable('');
        this.passwordChecking = ko.observable(false);
        this.inputFocus = ko.observable(false);
        this.keyPair_checkPemPasswordClick = function () {
            var self = this;
            this.showPasswordErrorMessage(false);
            if (!this.systemSetup_systemPassword() || this.systemSetup_systemPassword().length < 5) {
                return this.showPasswordError();
            }
            this.passwordChecking(true);
            return socketIo.emit('checkPemPassword', this.systemSetup_systemPassword(), function (err) {
                self.passwordChecking(false);
                if (err) {
                    return self.showPasswordError();
                }
                return self.exit();
            });
        };
        var self = this;
        this.systemSetup_systemPassword.subscribe(function newValue() {
            if (!newValue || !newValue.length) {
                return;
            }
            self.showPasswordErrorMessage(false);
        });
    }
    keyPairPassword.prototype.showPasswordError = function () {
        this.showPasswordErrorMessage(true);
        this.systemSetup_systemPassword('');
        return $('.activating.element').popup({
            on: 'click',
            movePopup: false
        });
    };
    return keyPairPassword;
}());
