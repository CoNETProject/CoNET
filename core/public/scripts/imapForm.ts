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
const availableImapServer = /imap\-mail\.outlook\.com$|imap\.mail\.yahoo\.(com|co\.jp|co\.uk|au)$|imap\.mail\.me\.com$|imap\.gmail\.com$|gmx\.(com|us|net)$|imap\.zoho\.com$/i
/**
 * 			getImapSmtpHost
 * 		@param email <string>
 * 		@return Imap & Smtp info
 */

const getImapSmtpHost = function ( _email: string ) {
	const email = _email.toLowerCase()
	const yahoo = function ( domain: string ) {
		
		if ( /yahoo.co.jp$/i.test ( domain ))
			return 'yahoo.co.jp';
			
		if ( /((.*\.){0,1}yahoo|yahoogroups|yahooxtra|yahoogruppi|yahoogrupper)(\..{2,3}){1,2}$/.test ( domain ))
			return 'yahoo.com';
		
		if ( /(^hotmail|^outlook|^live|^msn)(\..{2,3}){1,2}$/.test ( domain ))
			return 'hotmail.com';
			
		if ( /^(me|^icould|^mac)\.com/.test ( domain ))
			return 'me.com'

		return domain
	}

	const emailSplit = email.split ( '@' )
	
	if ( emailSplit.length !== 2 ) 
		return null
		
	const domain = yahoo ( emailSplit [1] )
	
	const ret = {
		imap: 'imap.' + domain,
		smtp: 'smtp.' + domain,
		SmtpPort: [465,587,994],
		ImapPort: 993,
		imapSsl: true,
		smtpSsl: true,
		haveAppPassword: false,
		ApplicationPasswordInformationUrl: ['']
	}
	
	switch ( domain ) {
		//		yahoo domain have two different 
		//		the yahoo.co.jp is different other yahoo.*
		case 'yahoo.co.jp': {
			ret.imap = 'imap.mail.yahoo.co.jp';
			ret.smtp = 'smtp.mail.yahoo.co.jp'
		}
		break;

		//			gmail
		case 'google.com':
		case 'googlemail.com':
		case 'gmail': {
			ret.haveAppPassword = true;
			ret.ApplicationPasswordInformationUrl = [
				'https://support.google.com/accounts/answer/185833?hl=zh-Hans',
				'https://support.google.com/accounts/answer/185833?hl=ja',
				'https://support.google.com/accounts/answer/185833?hl=en'
			]
		}
		break;

        case 'gandi.net':
            ret.imap = ret.smtp = 'mail.gandi.net'
        break
		
		//				yahoo.com
		case 'rocketmail.com':
		case 'y7mail.com':
		case 'ymail.com':
		case 'yahoo.com': {
			ret.imap = 'imap.mail.yahoo.com'
			ret.smtp = (/^bizmail.yahoo.com$/.test(emailSplit[1]))
				? 'smtp.bizmail.yahoo.com'
				: 'smtp.mail.yahoo.com'
			ret.haveAppPassword = true;
			ret.ApplicationPasswordInformationUrl = [
				'https://help.yahoo.com/kb/SLN15241.html',
				'https://help.yahoo.com/kb/SLN15241.html',
				'https://help.yahoo.com/kb/SLN15241.html'
			]
		}
		break;

        case 'mail.ee':
            ret.smtp = 'mail.ee'
            ret.imap = 'mail.inbox.ee'
        break

		
        //		gmx.com
        case 'gmx.co.uk':
        case 'gmx.de':
		case 'gmx.us':
		case 'gmx.com' : {
            ret.smtp = 'mail.gmx.com'
            ret.imap = 'imap.gmx.com'
        }
        
		break;
		
		//		aim.com
		case 'aim.com': {
			ret.imap = 'imap.aol.com'
		}
		break;
		
		//	outlook.com
		case 'windowslive.com':
		case 'hotmail.com': 
		case 'outlook.com': {
			ret.imap = 'imap-mail.outlook.com'
            ret.smtp = 'smtp-mail.outlook.com'
		}
		break;
		
		//			apple mail
        case 'icloud.com':
        case 'mac.com':
		case 'me.com': {
			ret.imap = 'imap.mail.me.com'
            ret.smtp = 'smtp.mail.me.com'
		}
		break;
		
		//			163.com
		case '126.com':
		case '163.com': {
			ret.imap = 'appleimap.' + domain
			ret.smtp = 'applesmtp.' + domain
		}
		break;
		
		case 'sina.com':
		case 'yeah.net': {
			ret.smtpSsl = false
		}
		break;
		
	}
	
	return ret
	
}

const conetImapAccount = /^qtgate_test\d\d?@icloud.com$/i
class keyPairSign {
	public signError = ko.observable ( false )
	public conformButtom = ko.observable ( false )
	public requestActivEmailrunning = ko.observable ( false )
	public showSentActivEmail = ko.observable ( -1 )
	public conformText = ko.observable ('')
	public conformTextError = ko.observable ( false )
	public requestError = ko.observable (-1)
	public conformTextErrorNumber = ko.observable ( -1 )
	public activeing = ko.observable ( false )
	
	constructor ( private exit: () => void ) {
		const self = this
		this.conformText.subscribe ( newValue => {
			if ( !newValue || !newValue.length ) {
				self.conformButtom ( false )
			} else {
				self.conformButtom ( true )
			}

		})
	}

	public checkActiveEmailSubmit () {
		const self = this
		this.conformTextError ( false )
		this.activeing ( true )
		return socketIo.emit ( 'checkActiveEmailSubmit', this.conformText(), ( err, req: QTGateAPIRequestCommand ) => {
			self.activeing ( false )
			if ( err !== null && err > -1 || req && req.error != null && req.error > -1 ) {
				self.conformTextErrorNumber ( err !== null && err > -1 ? err :
					 req.error )
					 self.conformTextError ( true )
				return $( '.activating.element1' ).popup({
					on: 'click',
					onHidden: () => {
						self.conformTextError ( false )
					}
				})
			}
			if (!req ) {
				const config =  _view.localServerConfig()
				config.keypair.verified = true
				_view.localServerConfig(config)
				_view.keyPair (config.keypair)
				self.exit ()
			}
			
		})
		
		
	}

	public requestActivEmail () {
		this.requestActivEmailrunning ( true )
		this.showSentActivEmail (-1)
		return socketIo.emit ( 'requestActivEmail', ( err, res ) => {
			this.requestActivEmailrunning ( false )
			if ( err !== null && err > -1 ) {
				return this.requestError ( err )
			}
			return this.showSentActivEmail (1)
			
			
		})
	}
}

class CoNETConnect1 {
	public showSendImapDataWarning = ko.observable ( false )
	public showConnectCoNETProcess = ko.observable ( false )
	public connectStage = ko.observable ( -1 )
	public connetcError = ko.observable ( -1 )
	public keyPairSign: KnockoutObservable< keyPairSign > = ko.observable ( null )
	constructor ( public email: string, private isKeypairBeSign: boolean, showSendImapData: boolean, public account: string, private exit: ( err? ) => void ) {
		
		this.showSendImapDataWarning ( showSendImapData )
		if ( !showSendImapData ) {
			this.imapConform ()
		}
	}


	public imapConform () {
		const self = this
		
		let processBarCount = 0
		let sendconnectMail = false
		this.showSendImapDataWarning ( false )
		this.connetcError ( -1 )
		this.showConnectCoNETProcess ( true )
		const listingConnectStage = function ( err, stage ) {
			self.showConnectCoNETProcess ( true )
			if ( err !== null && err > -1 ) {
				self.connectStage ( -1 )
				return self.connetcError ( err )
			}
			if ( stage === 4 ) {
				processBarCount = 67
				if ( !self.isKeypairBeSign ) {
					let u = null
					self.keyPairSign ( u = new keyPairSign ((() => {
						
						self.keyPairSign ( u = null )
						self.exit ()
					})))
				}
				self.showConnectCoNETProcess ( false )
				if ( !self.keyPairSign()) {
					return self.exit ()
				}
				return 
			}
			$('.keyPairProcessBar').progress ({
				percent: processBarCount += 33
			})
			
			return self.connectStage ( stage )
		}
		this.connectStage (0)
		socketIo.on ( 'tryConnectCoNETStage', listingConnectStage )
		self.showConnectCoNETProcess ( true )
		return socketIo.emit ( 'tryConnectCoNET' )
	}

	public returnToImapSetup () {
		return this.exit ( true )
	}
}



class imapForm {
	public emailAddress = ko.observable ('')
	public password = ko.observable ('')
	public emailAddressShowError = ko.observable ( false )
	public passwordShowError = ko.observable ( false )
	public EmailAddressErrorType = ko.observable ( 0 )
	public showForm = ko.observable ( true )
	public checkProcessing = ko.observable ( false )
	public checkImapError = ko.observable (-1)
	public showCheckProcess = ko.observable ( false )
	public checkImapStep = ko.observable (0)
	
	public CoNETConnect: KnockoutObservable < CoNETConnect1 > = ko.observable ( null )
	private clearError () {
		this.emailAddressShowError ( false )
		this.EmailAddressErrorType (0)
		this.passwordShowError ( false )
	}
	
	private checkImapSetup () {
		const processBar = $('.keyPairProcessBar')
		processBar.progress ('reset')
		let self = this
		this.checkProcessing ( true )
		this.checkImapStep (0)
		
		const imapTest = function ( err ) {
			if (  err > -1 ) {
				return errorProcess ( err )
			}
			self.checkImapStep (1)
			$('.keyPairProcessBar').progress ({
				percent: 33
			})
		}

		const smtpTest = function ( err ) {
			
			if ( err > -1 ) {
				return errorProcess ( err )
			}
			self.checkImapStep (2)
			$('.keyPairProcessBar').progress ({
				percent: 66
			})
		}

		const imapTestFinish = function ( err ) {
			if ( err > -1 ) {
				return errorProcess ( err )
			}
			self.checkImapStep (3)
			$('.keyPairProcessBar').progress ({
				percent: 100
			})
			self.showCheckProcess ( false )
			/**
			 * 		start connect CoNET
			 */
			let u = null
			self.CoNETConnect( u = new CoNETConnect1 ( self.emailAddress (), false, !conetImapAccount.test (self.emailAddress()), self.account, function () {
				self.CoNETConnect( u = null )
				self.showForm ( true )
			}))

		}

		const removeAllListen = function () {
			socketIo.removeEventListener ( 'smtpTest', smtpTest )
			socketIo.removeEventListener ( 'imapTest', imapTest )
			socketIo.removeEventListener ( 'imapTestFinish', imapTestFinish )
		}

		const errorProcess = function ( err ) {
			removeAllListen ()
			return self.checkImapError ( err )
		}

		socketIo.once ( 'smtpTest', smtpTest )
		socketIo.once ( 'imapTest', imapTest )
		socketIo.once ( 'imapTestFinish', imapTestFinish )
		socketIo.emit ( 'checkImap', self.emailAddress (), self.password (), new Date ().getTimezoneOffset (), _view.tLang())
	}

	private checkEmailAddress ( email: string ) {
		this.clearError ()
		if ( checkEmail ( email ).length ) {
			this.EmailAddressErrorType (0)
			this.emailAddressShowError ( true )
			return initPopupArea ()
		}
		const imapServer = getImapSmtpHost ( email )
		if ( !availableImapServer.test ( imapServer.imap )) {
			this.EmailAddressErrorType (2)
			this.emailAddressShowError ( true )
			return initPopupArea ()
		}
	}

	constructor ( private account: string, imapData?: IinputData, private isKeypairBeSign?: boolean ) {
		const self = this
		if ( imapData ) {
			this.emailAddress ( imapData.imapUserName )
			this.password ( imapData.imapUserPassword )
			this.showForm ( false )
			/**
			 * 		start connect CoNET
			 */
			let uu = null
			this.CoNETConnect( uu = new CoNETConnect1 ( this.emailAddress (), isKeypairBeSign, !conetImapAccount.test ( imapData.imapUserName ) ? !imapData.confirmRisk: false, account, function ( err ) {
				self.CoNETConnect ( uu = null )
				if ( err ) {
					return self.showForm ( true )
				}
				
			}))
		}

		this.emailAddress.subscribe ( function ( newValue ) {
			return self.checkEmailAddress ( newValue )
		})

		this.password.subscribe ( function ( newValue ) {
			return self.clearError ()
		})
	}

	public imapAccountGoCheckClick () {
		const self = this
		this.checkEmailAddress ( this.emailAddress() )
		
		if ( this.emailAddressShowError() || !this.password().length ) {
			return
		}
		this.showForm ( false )
		this.showCheckProcess ( true )
		this.checkImapError ( -1 )
		
		return this.checkImapSetup ()
		
	}

	public returnImapSetup () {
		this.showForm ( true )
		this.showCheckProcess ( false )
		this.checkImapError ( -1 )
	}
}