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

interface connectInfo {
	text: KnockoutObservable < string >
	err: KnockoutObservable < boolean >
}

class CoNETConnect {
	public showSendImapDataWarning = ko.observable ( false )
	public showConnectCoNETProcess = ko.observable ( true )
	public connectStage = ko.observable ( 0 )
	public connetcError = ko.observable ( -1 )
	public connectedCoNET = ko.observable ( false )
	public maynotConnectConet = ko.observable ( false )
	public Loading = ko.observable ( false )
	public listenFun = null
	public showTryAgain = ko.observable ( false )
	public showSendConnectMail = ko.observable ( false )
	public showNetworkError = ko.observable ( false )
	public infoTextArray: KnockoutObservableArray < connectInfo > = ko.observableArray ([])
	public keyPairSign: KnockoutObservable< keyPairSign > = ko.observable ( null )
	private imapData:IinputData = this.view.imapData
	public account = this.imapData.account
	public email = this.imapData.imapUserName
	public nodeEmail = "node@Kloak.app"
	private inSendMail = false
	private pingTimeOut () {
		return this.listingConnectStage ( null, 0, null )
	}

	constructor ( private view: view_layout.view, private isKeypairBeSign: boolean, private ready: ( err ) => void ) {
		const self = this
		if ( !this.view.imapData.confirmRisk ) {
			this.showSendImapDataWarning ( true )
		} else {
			this.imapConform ()
			this.Loading ( true )
			_view.connectInformationMessage.socketIo.on ( 'pingTimeOut', () => {
				return self.pingTimeOut ()
			})
		}
	}


	public listingConnectStage ( err, stage, publicKeyMessage ) {
		const self = this
		this.showConnectCoNETProcess ( true )
		

		switch ( stage ) {
			case 1: {
				const index = this.infoTextArray ()[ this.infoTextArray ().length -1 ]
				if ( !index ) {
					return
				}
				index.text ( 'connectedMailServer' )
				return index.err ( false )
			}

			/**
			 * 	waiting pong
			 */

			case 2: {
				return this.infoTextArray.push ({ text: ko.observable ('waitingPong'), err: ko.observable ( null )})
			}

			/**
			 * 	sendConnectRequestMail
			 */
			case 3: {
				
				return this.infoTextArray.push ({ text: ko.observable ('sendConnectRequestMail'), err: ko.observable ( null )})
				
			}

			/**
			 * 	timeOut error!
			 */
			case 0: {
				self.Loading ( false )
				self.showSendConnectMail ( true )
				return self.infoTextArray.push ({ text: ko.observable ( 'timeOut' ), err: ko.observable ( true )})
			}


			/**
			 * 	connected node
			 */
			case 4: {
				this.Loading ( false )
				this.showConnectCoNETProcess ( false )
				this.connectedCoNET ( true )
				_view.connectInformationMessage.socketIo.removeListener ( 'tryConnectCoNETStage', this.listenFun )

				return _view.keyPairCalss.decryptMessage ( publicKeyMessage, ( err, data ) => {
					if ( err ) {
						return self.infoTextArray.push ({ text: ko.observable ( 'unKnowError' ), err: ko.observable ( true )})
					}
					
					if ( ! this.isKeypairBeSign ) {
						if ( ! this.keyPairSign ()) {
							let u = null
							return this.keyPairSign ( u = new keyPairSign (( function () {
								
								self.keyPairSign ( u = null )
								self.ready ( null )
								return localStorage.setItem ( "config", JSON.stringify ( self.view.localServerConfig() ))
							})))
						}
						return
					}
					_view.showIconBar ( true )
					return this.ready ( null )
				})

				
			}

			/**
			 * 	connectToMailServer
			 */
			case 5: {
				return this.infoTextArray.push ({ text: ko.observable ( 'connectToMailServer' ), err: ko.observable ( null ) })
			}

			/**
			 * 	Client error!
			 */
			case -1: {
				this.Loading ( false )
				_view.connectInformationMessage.socketIo.removeListener ( 'tryConnectCoNETStage', this.listenFun )
				return this.infoTextArray.push ({ text: ko.observable ( 'systemError' ), err: ko.observable ( true ) })
			}

			/**
			 * 	network error!
			 */
			case -2: {
				this.Loading ( false )
				this.showNetworkError ( true )
				return this.infoTextArray.push ({ text: ko.observable ( 'offline' ), err: ko.observable ( true ) })
			}

		}
		
	}


	public returnToImapSetup () {
		return this.ready ( 0 )
	}


	public sendConnectMail () {
		const self = this
		this.Loading ( true )
		this.showTryAgain ( false )
		this.showSendConnectMail ( false )
		const qtgateCommand: QTGateCommand = {
			account: this.imapData.account,
			QTGateVersion: CoNET_version,
			imapData: this.imapData,
			command: 'connect',
			error: null,
			callback: null,
			language: this.imapData.language,
			publicKey: this.view.keyPair().publicKey
		}

		return this.view.keyPairCalss.encrypt ( JSON.stringify ( qtgateCommand ), ( err, data ) => {
			if ( err ) {
				return self.listingConnectStage ( null, -1, "" )
			}
			return _view.connectInformationMessage.sockEmit ( 'sendRequestMail', data, self.imapData, this.nodeEmail )
		})

		
	}

	public tryAgain () {
		this.resetAll ()
		this.infoTextArray ([])
		return this.imapConform ()
	}

	private resetAll () {
		this.showNetworkError ( false )
		this.showSendConnectMail ( false )
		this.showSendImapDataWarning ( false )
		this.showTryAgain ( false )
	}


	public imapConform () {
		if ( !this.view.imapData.confirmRisk ) {
			this.view.imapData.confirmRisk = true
			
			this.view.keyPairCalss.saveImapIInputData ( err => {})
			
			return this.sendConnectMail ()
		}
		const self = this
		this.showSendImapDataWarning ( false )
		this.connetcError ( -1 )
		this.Loading ( true )

		//return this.test ()


		this.listenFun = (  err, stage, message  ) => {
			return self.listingConnectStage ( err, stage, message )
		}

		_view.connectInformationMessage.socketIo.on ( 'tryConnectCoNETStage', this.listenFun )
		
		_view.connectInformationMessage.sockEmit ( 'tryConnectCoNET', this.imapData )
		
	}

	/**
	 * 			test unit
	 */
	private test () {
		/**
		 * 		localServerError
		 */
		/*
		this.listingConnectStage ( null, 5 )
		setTimeout (() => {
			this.listingConnectStage ( null, -1 )
		}, 3000 )
		/** */

		/**
		 * 		connect to mail server error
		 */
		/*
		this.listingConnectStage ( null, 5 )
		setTimeout (() => {
			this.listingConnectStage ( null, -2 )
		}, 3000 )
		/** */

		/**
		 * 		waiting pong
		 */
		/*
		this.listingConnectStage ( null, 5 )
		setTimeout (() => {
			this.listingConnectStage ( null, 1 )
			this.listingConnectStage ( null, 2 )
		}, 3000 )
		/** */

		/**
		 * 		waiting pong error automatic send request mail
		 */
		/*
		this.listingConnectStage ( null, 5 )
		setTimeout (() => {
			this.listingConnectStage ( null, 1 )
			this.listingConnectStage ( null, 2 )
			setTimeout (() => {
				this.listingConnectStage ( null, 3 )
			})
		}, 3000 )
		/** */

		/**
		 * 		waiting pong error automatic send request mail and timeout error
		 */
		/*
		this.listingConnectStage ( null, 5 )
		setTimeout (() => {
			this.listingConnectStage ( null, 1 )
			this.listingConnectStage ( null, 2 )
			setTimeout (() => {
				this.listingConnectStage ( null, 3 )
				setTimeout (() => {
					this.listingConnectStage ( null, 0 )
				}, 2000 )
			})
		}, 3000 )
		/** */

	}

	
}

