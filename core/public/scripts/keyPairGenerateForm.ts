/**
 *      check email address
 *      @param email <string>
 *      @param return <string>  Valid = '' Err = errorMessage
 */
const insideChinaEmail = /(\@|\.)(sina|sohu|qq|126|163|tom)\.com|(\.|\@)yeah\.net/i
const getNickName = ( email: string ) => {
    var ret = '';
    if ( email.length ){
        ret = email.split ('@')[0];
        ret = ret.charAt (0).toUpperCase () + ret.slice(1);
    }
    return ret;
}
class IsNullValidator implements StringValidator {
    isAcceptable ( s: string ) {
        if ( s === undefined ) {
            return true
        }
        if ( s === null ) {
            return true
        }
        if ( s.length == 0 ) {
            return true
        }
    }
}
class EmailValidator implements StringValidator {
    isAcceptable ( s: string ) {
        return EmailRegexp.test( s )
    }
}
const testVal = new IsNullValidator()
const testEmail = new EmailValidator()
const checkEmail = ( email: string ) => {
    
    if ( testVal.isAcceptable ( email )) {
       return 'required'
    } 
    
    if ( ! testEmail.isAcceptable ( email ))
    {
        return 'EmailAddress'
    }
    
    return ''
}
class keyPairGenerateForm {
	public EmailAddressError = ko.observable ( false )
	public SystemAdministratorEmailAddress = ko.observable ('')
	public showInsideFireWallEmail = ko.observable ( false )
	public NickNameError = ko.observable ( false )
	public passwordError = ko.observable ( false )
	public SystemAdministratorNickName = ko.observable ('')
	public systemSetup_systemPassword = ko.observable ('')
	public keyLengthInfoShow = ko.observable ( true )
	public keyPairLengthSelect = ko.observable ('2048')
	public showKeyPairPorcess = ko.observable ( false )
	public newKeyPairRunningCancelButtonShow = ko.observable ( false )
	public delete_btn_view = ko.observable ( false )
	public doingProcessBarTime = null
	private checkEmailAddress ( email: string ) {
		$ ('.ui.checkbox').checkbox()
		
		this.EmailAddressError ( false )
		this.NickNameError ( false )

		if ( ! email || ! email.length ) {
			this.EmailAddressError ( true )
			return true
		}
			
		if ( checkEmail ( email ).length ) {

			this.EmailAddressError ( true )
			$( '.activating.element').popup({
				on: 'focus',
				movePopup: false
			})
		}

		
		if ( ! this.SystemAdministratorNickName ().length ){
			this.SystemAdministratorNickName ( getNickName ( email ))
		}

		if ( insideChinaEmail.test ( email ) ) {
			this.showInsideFireWallEmail ( true )
		}
		
		return true
	}
	private checkNickname ( nickname: string ) {
		this.NickNameError ( false )
		if ( !nickname || !nickname.length ) {
			this.NickNameError ( true )
		}
		return true
	}
	private checkPassword ( password: string ) {
		this.passwordError(false)
		if ( !password || password.length < 5 ) {
			this.passwordError ( true )
		}
		return true
	}

	constructor () {
		this.SystemAdministratorEmailAddress.subscribe ( newValue => {
			return this.checkEmailAddress ( newValue )
		})
		this.SystemAdministratorNickName.subscribe ( newValue => {
			return this.checkNickname ( newValue )
		})
		this.systemSetup_systemPassword.subscribe ( newValue => {
			return this.checkPassword ( newValue )
		})
	}
	public form_AdministratorEmail_submit () {
		this.checkEmailAddress ( this.SystemAdministratorEmailAddress ())
		this.checkNickname ( this.SystemAdministratorNickName ())
		this.checkPassword ( this.systemSetup_systemPassword ())
		if ( this.passwordError() || this.EmailAddressError() || this.NickNameError()) {
			return true
		}
		this.showKeyPairPorcess ( true )
		this.newKeyPairRunningCancelButtonShow ( true )
		const email = this.SystemAdministratorEmailAddress ()
		const sendData: INewKeyPair = {
			password: this.systemSetup_systemPassword (),
			keyLength: this.keyPairLengthSelect (),
			nikeName: this.SystemAdministratorNickName (),
			email: email
		}
		let percent = 1
		$('.keyPairProcessBar').progress ('reset')
		const timeSet = parseInt ( sendData.keyLength ) * 0.2
		const doingProcessBar = () => {
			clearTimeout ( this.doingProcessBarTime )
			this.doingProcessBarTime = setTimeout (() => {
				$('.keyPairProcessBar').progress ({
					percent: percent++
				})
				if ( percent < 100 )
					return doingProcessBar ()
			}, timeSet )
		}
		return doingProcessBar ()
	}
	public tileClick ( data: string ) {
		this.keyPairLengthSelect ( data )
		return true
	}

	public CancelCreateKeyPair () {
		
		clearTimeout ( this.doingProcessBarTime )
		this.showKeyPairPorcess ( false )
		this.newKeyPairRunningCancelButtonShow ( false )
		$('.keyPairProcessBar').progress ({
			percent: 0
		})
	}
}