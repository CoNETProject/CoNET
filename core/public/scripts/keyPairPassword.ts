class keyPairPassword {
	public showPasswordErrorMessage = ko.observable ( false )
	public systemSetup_systemPassword = ko.observable ('')
	public passwordChecking = ko.observable ( false )
	public inputFocus = ko.observable ( false )
	constructor ( private exit: () => void ) {
		this.systemSetup_systemPassword.subscribe ( newValue => {
			if ( !newValue || !newValue.length ) {
				return 
			}
			this.showPasswordErrorMessage ( false )
		})
	}
	private showPasswordError() {
		this.showPasswordErrorMessage ( true )
		this.systemSetup_systemPassword ('')
		return $( '.activating.element' ).popup({
			on: 'click',
			movePopup: false
		})
	}
	public keyPair_checkPemPasswordClick = () => {
		this.showPasswordErrorMessage ( false )
		if ( !this.systemSetup_systemPassword() || this.systemSetup_systemPassword().length < 5 ) {
			return this.showPasswordError ()
		}
		this.passwordChecking ( true )
		return socketIo.emit ( 'checkPemPassword', this.systemSetup_systemPassword(), err => {
			this.passwordChecking ( false )
			if ( err ) {
				return this.showPasswordError()
			}
			return this.exit()
		})
	}
}