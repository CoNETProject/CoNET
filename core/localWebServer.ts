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

import * as Express from 'express'
import * as Path from 'path'
import * as cookieParser from 'cookie-parser'
import * as Os from 'os'
import * as HTTP from 'http'
import * as SocketIo from 'socket.io'
import * as Tool from './tools/initSystem'
import * as Async from 'async'
import * as Fs from 'fs'
import * as Util from 'util'
import * as freePort from 'portastic'
import * as Uuid from 'node-uuid'
import * as Imap from './tools/imap'
import CoNETConnectCalss from './tools/coNETConnect'
import * as Crypto from 'crypto'
import * as ProxyServer from './tools/proxyServer'

interface localConnect {
	socket: SocketIO.Socket
	login: boolean
	listenAfterPasswd: boolean
}
let logFileFlag = 'w'
const conetImapAccount = /^qtgate_test\d\d?@icloud.com$/i
const saveLog = ( err: {} | string ) => {
	if ( !err ) {
		return 
	}
	const data = `${ new Date().toUTCString () }: ${ typeof err === 'object' ? ( err['message'] ? err['message'] : '' ) : err }\r\n`
	console.log ( data )
	return Fs.appendFile ( Tool.ErrorLogFile, data, { flag: logFileFlag }, () => {
		return logFileFlag = 'a'
	})
}

const saveServerStartup = ( localIpaddress: string ) => {
	const info = `\n*************************** CoNET Platform [ ${ Tool.packageFile.version } ] server start up *****************************\n` +
			`Access url: http://${localIpaddress}:${ Tool.LocalServerPortNumber }\n`

	console.log ( info )
	saveLog ( info )
}

const saveServerStartupError = ( err: {} ) => {
	const info = `\n*************************** CoNET Platform [ ${ Tool.packageFile.version } ] server startup falied *****************************\n` +
			`platform ${ process.platform }\n` +
			`${ err['message'] }\n`
	console.log ( info )
	saveLog ( info )
}

const yy: Map <string, number > = new Map ()

const imapErrorCallBack = ( message: string ) => {
	if ( message && message.length ) {
		if ( /auth|login|log in|Too many simultaneous|UNAVAILABLE/i.test( message )) {
			return 1
		}
			
		if ( /ECONNREFUSED/i.test ( message )) {
			return 5
		}

		if (/OVERQUOTA/i.test ( message )) {
			return 6
		}
			
		if ( /certificate/i.test ( message )) {
			return 2
		}
			
		if ( /timeout|ENOTFOUND/i.test ( message )) {
			return 0
		}

		return 5
	}
	
	return -1

}

const findPort = ( port: number, CallBack ) => {
    return freePort.test ( port ).then ( isOpen => {
        if ( isOpen )
            return CallBack ( null, port )
        ++ port
        return findPort ( port, CallBack )
    })
}

export default class localServer {
	private expressServer = Express()
	private httpServer = HTTP.createServer ( this.expressServer )
	private socketServer = SocketIo ( this.httpServer )
	public config: install_config  = null
	public keyPair: keypair = null
	public savedPasswrod: string = ''
	public imapConnectData: IinputData = null
	public localConnected: Map < string, localConnect > = new Map ()
	private CoNETConnectCalss: CoNETConnectCalss = null
	private openPgpKeyOption: openpgp.option_KeyOption = null
	private pingChecking = false
	private regionV1: regionV1[] = null
	private connectCommand: IConnectCommand[] = null
	private proxyServer: ProxyServer.proxyServer = null
	private whiteIpList = []
	private domainBlackList = []
	private domainPool: Map < string, domainData > = new Map ()

	public CoNET_systemError () {
		return this.socketServer.emit ( 'CoNET_systemError' )
	}
	
	private tryConnectCoNET ( socket: SocketIO.Socket ) {

		//		have CoGate connect
		if ( this.connectCommand && this.connectCommand.length ) {
			socket.emit ( 'tryConnectCoNETStage', 4, true )
			setTimeout (() => {
				socket.emit ( 'QTGateGatewayConnectRequest', null, this.connectCommand )
			}, 200 )
			
		}

		let sendMail = false
		const exit = err => {
			console.trace ( `tryConnectCoNET exit! err =`, err )
			switch ( err ) {
				///			connect conet had timeout
				case 1: {
					return socket.emit ( 'tryConnectCoNETStage', 0 )
				}
				case 2: {
					return console.log (`CoNETConnectCalss exit with 2, stop remake CoNETConnectCalss!`)
				}
				case 3: {
					return makeConnect ( sendMail = false )
				}
				case null:
				case undefined:
				default: {
					 
					if ( ! sendMail ) {
						return makeConnect ( sendMail = true )
					}

					return makeConnect ( sendMail = false )
				}
			}
			
		}

		const catchUnSerialCmd = ( cmd: QTGateAPIRequestCommand ) => {

		}

		const makeConnect = ( sendMail: boolean ) => {
			
			if ( !this.imapConnectData.sendToQTGate || sendMail ) {
				this.imapConnectData.sendToQTGate = true
				Tool.saveImapData( this.imapConnectData, this.config, this.savedPasswrod, () => {})
				this.socketServer.emit ( 'tryConnectCoNETStage', null, 3 )
				return Tool.sendCoNETConnectRequestEmail ( this.imapConnectData, this.openPgpKeyOption, this.config.version, this.keyPair.publicKey, ( err: Error ) => {
					if ( err ) {
						console.log (`sendCoNETConnectRequestEmail callback error`, err )
						saveLog ( `tryConnectCoNET sendCoNETConnectRequestEmail got error [${ err.message ? err.message : JSON.stringify ( err ) }]`)
						return socket.emit ( 'tryConnectCoNETStage', imapErrorCallBack ( err.message ))
					}
					
					socket.emit ( 'tryConnectCoNETStage', null, 3 )
					return this.CoNETConnectCalss = new CoNETConnectCalss ( this.imapConnectData, this.socketServer, this.openPgpKeyOption, true, catchUnSerialCmd, exit )
				})
			
			}
			console.log ( `makeConnect without sendMail`)
			return this.CoNETConnectCalss = new CoNETConnectCalss ( this.imapConnectData, this.socketServer, this.openPgpKeyOption, false, catchUnSerialCmd, exit )
			
		}
		
		if ( !this.CoNETConnectCalss || this.CoNETConnectCalss.alreadyExit ) {
			return makeConnect ( false )
		}
		
		return this.CoNETConnectCalss.tryConnect1 ()
		
	}

	private sendrequest ( socket: SocketIO.Socket, cmd: QTGateAPIRequestCommand, CallBack ) {
		if ( !this.openPgpKeyOption) {
			console.log ( `sendrequest keypair error! !this.config [${ !this.config }] !this.keyPair[${ !this.keyPair }] !this.keyPair.passwordOK [${ !this.keyPair.passwordOK }]`)
			return CallBack (1)
		}
		if ( !this.CoNETConnectCalss ) {
			console.log (`sendrequest no CoNETConnectCalss`)
			this.tryConnectCoNET ( socket )
			return CallBack ( 0 )
		}
		saveLog (`sendrequest send [${ cmd.command }]`)
		return this.CoNETConnectCalss.request ( cmd, ( err: number, res: QTGateAPIRequestCommand ) => {
			saveLog (`request response [${ cmd.command }]`)
			if ( err ) {
				this.socketServer.emit ('CoNET_offline')
				return saveLog ( `QTClass.request error! [${ err }]`)
			}
			return CallBack ( null, res )
		})
		
	}

	private checkPort ( portNum, socket: SocketIO.Socket ) {
		const num = parseInt ( portNum.toString())
		if (! /^[0-9]*$/.test( portNum.toString()) || !num || num < 3000 || num > 65535 ) {
			return socket.emit ( 'checkPort', true )
		}
			
		return findPort ( portNum, ( err, kk ) => {
			saveLog( `check port [${ typeof portNum }] got back kk [${ typeof kk }]`)
			if ( kk !== portNum ) {
				return socket.emit ( 'checkPort', true, kk )
			}
			return socket.emit ( 'checkPort' )
		})
	}

	public makeOpnConnect ( arg: IConnectCommand[] ) {
		const uu = arg[0]
		saveLog (`makeOpnConnect arg = ${ JSON.stringify (arg)}`)
		
		ProxyServer.proxyServer

		return this.proxyServer = new ProxyServer.proxyServer ( this.whiteIpList, this.domainPool, uu.localServerPort, 'pac', 5000, arg, 50000, true, this.domainBlackList  )
	}

	private stopGetwayConnect ( sendToCoNET: boolean ) {
		
		if ( this.connectCommand && this.connectCommand.length ) {
			this.connectCommand = null
		}
		
		if ( this.proxyServer && typeof this.proxyServer.exit === 'function') {
			console.log (`this.proxyServer = null`)
			this.proxyServer.exit ()
			this.proxyServer = null
		}
		if ( sendToCoNET ) {
			const com: QTGateAPIRequestCommand = {
				command: 'stopGetwayConnect',
				Args: null,
				error: null,
				requestSerial: null
			}
			return this.CoNETConnectCalss.request ( com, null )
		}
		
	}

	private requestConnectCoGate ( socket: SocketIO.Socket, cmd: IConnectCommand ) {
		//const arg = [{"account":"peter1@conettech.ca","imapData":{"imapPortNumber":"993","smtpPortNumber":587,"imapServer":"imap-mail.outlook.com","imapIgnoreCertificate":false,"smtpIgnoreCertificate":false,"imapSsl":true,"smtpSsl":false,"imapUserName":"proxyviaemai@outlook.com","imapUserPassword":"ajuwrcylbrobvykn","account":"Peter1@CoNETTech.ca","smtpServer":"smtp-mail.outlook.com","smtpUserName":"proxyviaemai@outlook.com","smtpUserPassword":"ajuwrcylbrobvykn","email":"Peter1@CoNETTech.ca","imapTestResult":true,"language":"en","timeZoneOffset":420,"serverFolder":"1f4953ea-6ffe-4e58-bf46-fd7a52867a41","clientFolder":"7b6b9c13-2a30-4682-adcb-751b0643020f","randomPassword":"8a510536516b92d361f94fb624310b","clientIpAddress":"172.218.175.40","requestPortNumber":null},"gateWayIpAddress":"51.15.192.239","region":"paris","connectType":2,"localServerPort":"3001","AllDataToGateway":true,"error":-1,"fingerprint":"052568B9D9742E64C6C0A5D288C08CEAC728A0D9","localServerIp":"172.218.175.40","multipleGateway":[{"gateWayIpAddress":"51.15.192.239","gateWayPort":80,"dockerName":"scaleway-decdbb5e-bb23-4e15-8d46-544d245fcab3","password":"cb5ea121c8fa2a00e91535f921184ce8"}],"requestPortNumber":80,"requestMultipleGateway":1,"webWrt":true,"connectPeer":"ddkjksi32bjsaclbkvf","totalUserPower":2,"transferData":{"account":"peter1@conettech.ca","availableDayTransfer":102400000,"usedMonthlyOverTransfer":0,"productionPackage":"free","transferDayLimit":102400000,"transferMonthly":1024000000,"startDate":"2018-04-25T00:00:00.000Z","availableMonthlyTransfer":1024000000,"resetTime":"2018-06-02T17:17:24.288Z","usedDayTransfer":0,"timeZoneOffset":420,"usedMonthlyTransfer":0,"power":1,"isAnnual":false,"expire":"2018-05-24T00:00:00.000Z","customsID":"","paidID":[],"automatically":false},"requestContainerEachPower":2,"peerUuid":"703145fc-740c-43b6-b1c8-aca935602bd7","containerUUID":"4c6c0c5b-73f9-4fb9-9bcb-c7bc6d05fe8a","runningDocker":"scaleway-decdbb5e-bb23-4e15-8d46-544d245fcab3","dockerName":"scaleway-decdbb5e-bb23-4e15-8d46-544d245fcab3","gateWayPort":80,"randomPassword":"cb5ea121c8fa2a00e91535f921184ce8"}]
		//this.connectCommand = arg
		//socket.emit ( 'QTGateGatewayConnectRequest', null, this.connectCommand )
		
		if ( !this.CoNETConnectCalss || typeof this.CoNETConnectCalss.request !== 'function') {
			console.log ( `on QTGateGatewayConnectRequest !this.CoNETConnectCalss `)
			return saveLog (`socket.on ( 'getAvaliableRegion') but !this.QTClass `)
		}
		if ( this.connectCommand ) {
			return socket.emit ( 'QTGateGatewayConnectRequest', null, this.connectCommand )
		}
		cmd.account = this.config.keypair.email.toLocaleLowerCase()
					
		//			@OPN connect
		
		const request = () => {
			
			const com: QTGateAPIRequestCommand = {
				command: 'connectRequest',
				Args: [ cmd ],
				error: null,
				requestSerial: Crypto.randomBytes(8).toString( 'hex' )
			}

			return this.CoNETConnectCalss.request ( com, ( err: number, res: QTGateAPIRequestCommand ) => {
				//		no error
				if ( err ) {
					return console.log ( `on QTGateGatewayConnectRequest CoNETConnectCalss.request return error`, err )
				}
				if ( res.error < 0 ) {

					const arg: IConnectCommand[] = this.connectCommand = res.Args
					console.log ( JSON.stringify ( res.Args ))
					this.makeOpnConnect ( arg )
					return socket.emit ( 'QTGateGatewayConnectRequest', null, this.connectCommand )
				}
				
				saveLog ( `connectRequest res.error [${ res.error }]`)
			})
		}

		//		iOPN connect 
		if ( cmd.connectType === 2 ) {
			return Tool.myIpServer (( err, data ) => {
				if ( err ) {
					return saveLog (`on QTGateGatewayConnectRequest Tool.myIpServer return error =[${ err.message ? err.message : null }]`)
				}
				if ( ! data ) {
					return saveLog (`on QTGateGatewayConnectRequest Tool.myIpServer return no data!`)
				}
				saveLog (`on QTGateGatewayConnectRequest Tool.myIpServer return localHostIP [${ data }]`)
				cmd.localServerIp = data
				
				return request ()
			})
			
		}

		return request ()
		
	}

	private listenAfterPassword ( socket: SocketIO.Socket ) {
		
		socket.on ( 'checkImap', ( emailAddress: string, password: string, timeZone, tLang, CallBack1 ) => {
			CallBack1 ()
			return Tool.myIpServer (( err?, ip? ) => {
				if ( err || !ip ) {
					saveLog (`on checkImap Tool.myIpServer got error! [${ err.message ? err.message : null}]` )
					return socket.emit ( 'smtpTest', 4 )
				}
				const imapServer = Tool.getImapSmtpHost( emailAddress )
				this.imapConnectData = {
					email: this.config.account,
					account: this.config.account,
					smtpServer: imapServer.smtp,
					smtpUserName: emailAddress,
					smtpPortNumber: imapServer.SmtpPort,
					smtpSsl: imapServer.smtpSsl,
					smtpIgnoreCertificate: false,
					smtpUserPassword: password,
					imapServer: imapServer.imap,
					imapPortNumber: imapServer.ImapPort,
					imapSsl: imapServer.imapSsl,
					imapUserName: emailAddress,
					imapIgnoreCertificate: false,
					imapUserPassword: password,
					timeZoneOffset: timeZone,
					language: tLang,
					imapTestResult: null,
					clientFolder: Uuid.v4(),
					serverFolder: Uuid.v4(),
					randomPassword: Uuid.v4(),
					uuid: Uuid.v4(),
					confirmRisk: conetImapAccount.test (emailAddress),
					clientIpAddress: null,
					ciphers: null,
					sendToQTGate: false

				}

				return this.doingCheckImap ( socket )
			})
		})

		socket.on ( 'tryConnectCoNET', CallBack1 => {
			CallBack1 ()
			if ( !this.imapConnectData ) {
				return this.CoNET_systemError ()
				
			}
			if ( !this.imapConnectData.confirmRisk ) {
				this.imapConnectData.confirmRisk = true
				return Tool.saveImapData ( this.imapConnectData, this.config, this.savedPasswrod, err => {
					return this.tryConnectCoNET ( socket )
				})
			}
			return this.tryConnectCoNET ( socket )
			
		})

		socket.on ( 'requestActivEmail', CallBack1 => {
			CallBack1 ()
			saveLog (`on requestActivEmail`)
			const com: QTGateAPIRequestCommand = {
				command: 'requestActivEmail',
				Args: [],
				error: null,
				requestSerial: Crypto.randomBytes(8).toString('hex')
				
			}

			return this.sendrequest ( socket, com, ( err: number, res: QTGateAPIRequestCommand ) => {
				console.log (`requestActivEmail sendrequest callback! `)
				return socket.emit ( 'requestActivEmail', err, res )
			})
			
		})

		socket.on ( 'checkActiveEmailSubmit', ( text, CallBack1 ) => {
			CallBack1()
			saveLog (`on checkActiveEmailSubmit`)
			if ( ! text || ! text.length || !/^-----BEGIN PGP MESSAGE-----/.test ( text )) {
				socket.emit  ('checkActiveEmailSubmit', 0 )
				return saveLog ( `checkActiveEmailSubmit, no text.length ! [${ text }]` )
			}

			if ( text.indexOf ('-----BEGIN PGP MESSAGE----- Version: GnuPG v1 ') > -1 ) {
                text = text.replace (/-----BEGIN PGP MESSAGE----- Version: GnuPG v1 /,'-----BEGIN__PGP__MESSAGE-----\r\nVersion:__GnuPG__v1\r\n\r\n')
                text = text.replace (/-----END PGP MESSAGE-----/, '-----END__PGP__MESSAGE-----')
                text = text.replace (/ /g, '\r\n')
                text = text.replace ( /__/g, ' ')
            }


			return Tool.decryptoMessage ( this.openPgpKeyOption, text, ( err, data ) => {
				if ( err ) {
					socket.emit  ('checkActiveEmailSubmit', 1 )
					return saveLog ( `checkActiveEmailSubmit, decryptoMessage error [${ err.message ? err.message : null }]` )
				}
				let pass = null
				try {
					pass = JSON.parse ( data )
				} catch ( ex ) {
					return socket.emit  ('checkActiveEmailSubmit', 1 )
				}
				
				
				const com: QTGateAPIRequestCommand = {
					command: 'activePassword',
					Args: [ pass ],
					error: null,
					requestSerial: Crypto.randomBytes(8).toString('hex')
				}
				console.log ( Util.inspect ( com ))
				
				return this.sendrequest ( socket, com, ( err, data: QTGateAPIRequestCommand ) => {
					if ( err ) {
						return socket.emit  ('checkActiveEmailSubmit', err )
					}
					if ( data.error > -1 ) {
						return socket.emit  ('checkActiveEmailSubmit', null, data )
					}
					const key = Buffer.from ( data.Args[0], 'base64' ).toString ()
					if ( key && key.length ) {
						saveLog (`active key success!`)
						socket.emit  ('checkActiveEmailSubmit')
						this.keyPair.publicKey = this.config.keypair.publicKey = key
						this.keyPair.verified = this.config.keypair.verified = true 
						return Tool.saveConfig ( this.config, err => {
							
						})
						
					}
					
				})
				
			})
		})

		socket.on ( 'getAvaliableRegion', CallBack1 => {

			CallBack1 ()
			if ( !this.CoNETConnectCalss || typeof this.CoNETConnectCalss.request !== 'function') {
				console.log (`this.CoNETConnectCalss `)
				socket.emit ('getAvaliableRegion', null, 0 )
				return saveLog (`socket.on ( 'getAvaliableRegion') but !this.QTClass `)
			}
			const com: QTGateAPIRequestCommand = {
				command: 'getAvaliableRegion',
				Args: [],
				error: null,
				requestSerial: Crypto.randomBytes(8).toString('hex')
			}

			console.log (`socket.on ( 'getAvaliableRegion')`)

			return this.CoNETConnectCalss.request ( com, ( err: number, res: QTGateAPIRequestCommand ) => {
				if ( err ) {
					return saveLog ( `getAvaliableRegion QTClass.request callback error! STOP [${ err }]`)
				}
				if ( res && res.dataTransfer && res.dataTransfer.productionPackage ) {
					this.config.freeUser = /free/i.test ( res.dataTransfer.productionPackage )
				}
				saveLog (`getAvaliableRegion got return Args [0] [${ JSON.stringify ( res.Args[0] )}]`)
				socket.emit ('getAvaliableRegion', res.Args[0], res.dataTransfer, this.config )
				
				//		Have gateway connect!
				//this.saveConfig ()
				
				if ( res.Args[ 1 ]) {
					saveLog (`getAvaliableRegion got return Args [1] [${ JSON.stringify ( res.Args[1] )}]`)
					/*
					if ( ! this.proxyServer || ! this.connectCommand ) {
						const arg: IConnectCommand[] = this.connectCommand = res.Args[1]
						arg.forEach ( n => {
							n.localServerIp = Encrypto.getLocalInterface ()[0]
						})
						this.makeOpnConnect ( arg )
					}
					*/
					return socket.emit ( 'QTGateGatewayConnectRequest', -1, res.Args[ 1 ] )
				}
				
				this.regionV1 = res.Args[2]
			})
		})

		socket.on ( 'pingCheck', CallBack1 => {
			CallBack1 ()
			if ( process.platform === 'linux') {
				return socket.emit ( 'pingCheck', null, -1 )
			}
				
			
			saveLog (`socket.on ( 'pingCheck' )`)
			if ( !this.regionV1 || this.pingChecking ) {
				saveLog (`!this.regionV1 [${ !this.regionV1 }] || this.pingChecking [${ this.pingChecking }]`)
				return socket.emit ( 'pingCheck' )
			}
				
			this.pingChecking = true
			try {
				const netPing = require ('net-ping')
				const session = netPing.createSession ()
			} catch ( ex ) {
				console.log ( `netPing.createSession err`, ex )
				return socket.emit ( 'pingCheck', null, -1 )
			}
			Async.eachSeries ( this.regionV1, ( n: regionV1, next ) => {
				
				return Tool.testPing ( n.testHostIp, ( err, ping ) => {
					saveLog( `testPing [${ n.regionName }] return ping [${ ping }]`)
					socket.emit ( 'pingCheck', n.regionName, err? 9999: ping )
					return next ()
				})
			}, () => {
				saveLog (`pingCheck success!`)
				this.pingChecking = false
				return socket.emit ( 'pingCheck' )
			})
			
		})

		socket.on ('promoCode', ( promoCode, CallBack1 ) => {
			CallBack1 ()
			const com: QTGateAPIRequestCommand = {
				command: 'promoCode',
				error: null,
				Args: [ promoCode ],
				requestSerial: Crypto.randomBytes(8).toString ('hex')
			}
			saveLog (`on promoCode`)
			return this.CoNETConnectCalss.request ( com, ( err: number, res: QTGateAPIRequestCommand ) => {
				saveLog ( `promoCode got callBack: [${ JSON.stringify ( res )}]`)
				if ( err ) {
					socket.emit ( 'promoCode', err )
					return saveLog (`promoCode got QTClass.request  error!`)
				}
				if ( res.error === -1 ) {
					saveLog ( 'promoCode success!' )
					this.config.freeUser = false
					Tool.saveConfig ( this.config, () => {

					})
				}
				return socket.emit ( 'promoCode', err, res )
			})
		})

		socket.on ( 'checkPort', ( portNum, CallBack1 ) => {
			CallBack1()
			return this.checkPort ( portNum, socket )
		})

		socket.on ( 'QTGateGatewayConnectRequest', ( cmd: IConnectCommand, CallBack1 ) => {
			CallBack1 ()
			return this.requestConnectCoGate ( socket, cmd )
		})

		socket.on ( 'disconnectClick', CallBack1 => {
			CallBack1 ()
			this.stopGetwayConnect ( true )
		})
	}

	private doingCheckImap ( socket: SocketIO.Socket ) {
		this.imapConnectData.imapTestResult = false
		return Async.series ([
			next => Imap.imapAccountTest ( this.imapConnectData, err => {
				if ( err ) {
					console.log (`doingCheckImap Imap.imapAccountTest return err`, err )
					return next ( err )
				}
				console.log (`imapAccountTest success!`, typeof next )
				socket.emit ( 'imapTest' )
				return next ()
			}),
			next => Tool.smtpVerify ( this.imapConnectData, next )
		], ( err: Error ) => {
			console.log (`doingCheckImap Async.series success!`)
			if ( err ) {
				return socket.emit ( 'smtpTest', imapErrorCallBack ( err.message ))
			}
			this.imapConnectData.imapTestResult = true
			return Tool.saveImapData ( this.imapConnectData, this.config, this.savedPasswrod, err => {
				console.log (`socket.emit ( 'imapTestFinish' )`)
				socket.emit ( 'imapTestFinish' , this.imapConnectData )
			})
			
		})
			
		
	}

	private socketServerConnected ( socket: SocketIO.Socket ) {
		const client = `[${ socket.id }][ ${ socket.conn.remoteAddress }]`
		this.localConnected.set ( client, { socket: socket, login: false, listenAfterPasswd: false } )

		socket.once ( 'disconnect', reason => {
			saveLog ( `socketServerConnected ${ client } on disconnect`)
			return this.localConnected.delete ( client )
		})

		socket.on ( 'init', Callback1 => {
			Callback1()
			const ret = Tool.emitConfig ( this.config, false )
			return socket.emit ('init', null, ret )
		})

		socket.once ( 'agreeClick', CallBack1 => {
			CallBack1 ()
			this.config.firstRun = false
			return Tool.saveConfig ( this.config, saveLog )
		})

		socket.on ( 'checkPemPassword', ( password: string, CallBack1 ) => {
			CallBack1 ()
			if ( !this.config.keypair || !this.config.keypair.publicKey ) {
				console.log (`checkPemPassword !this.config.keypair`)
				return socket.emit ( 'checkPemPassword', null, true )
				
			}
			if ( !password || password.length < 5 ) {
				console.log (`! password `)
				return socket.emit ( 'checkPemPassword', null, true )
			}
			if ( this.savedPasswrod && this.savedPasswrod.length ) {
				if ( this.savedPasswrod !== password ) {
					console.log (`savedPasswrod !== password `)
					return socket.emit ( 'checkPemPassword', null, true )
				}

			}
			
			return Async.waterfall ([
				next => Tool.getPbkdf2 ( this.config, password, next ),
				( Pbkdf2Password: Buffer, next ) => Tool.getKeyPairInfo ( this.config.keypair.publicKey, this.config.keypair.privateKey, Pbkdf2Password.toString('hex'), next ),
				( key, next ) => {
					if ( ! key.passwordOK ) {
						const info = `[${ client }] on checkPemPassword had try password! [${ password }]`
						
						saveLog ( info )
						return socket.emit ( 'checkPemPassword', null, true )
					}
					this.savedPasswrod = password
					this.localConnected.set ( client, { socket: socket, login: true, listenAfterPasswd: true })
					this.listenAfterPassword ( socket )
					this.keyPair = key
					return Tool.makeGpgKeyOption ( this.config, this.savedPasswrod, next )
				},
				( option_KeyOption, next ) => {
					
					this.openPgpKeyOption = option_KeyOption
					return Tool.readImapData ( password, this.config, next )
			}], ( err: Error, data: string ) => {
				if ( err ) {
					socket.emit ( 'checkPemPassword' )
					return saveLog (`Tool.makeGpgKeyOption return err [${ err && err.message ? err.message : null }]` )
				}
				
				try {
					this.imapConnectData = JSON.parse ( data )
					return socket.emit ( 'checkPemPassword', null, this.imapConnectData )
				} catch ( ex ) {
					return socket.emit ( 'checkPemPassword' )
				}
				
			})
			
		})

		socket.on ( 'deleteKeyPairNext', CallBack1 => {
			
			CallBack1 ()
			const thisConnect = this.localConnected.get ( client )

			if ( this.localConnected.size > 1 && ! thisConnect.login ) {
				
				return this.socketServer.emit ( 'deleteKeyPairNoite' )
			}
			const info = `socket on deleteKeyPairNext, delete key pair now.`
			console.log ( info )
			saveLog ( info )
			this.config = Tool.InitConfig ()
			this.config.firstRun = false
			this.keyPair = null
			Tool.saveConfig ( this.config, saveLog )
			if ( this.CoNETConnectCalss ) {
				this.CoNETConnectCalss.destroy ( 2 )
				this.CoNETConnectCalss = null
			}
			return this.socketServer.emit ( 'init', null, this.config )
		})

		socket.on ( 'NewKeyPair', ( preData: INewKeyPair, CallBack1 ) => {
			CallBack1 ()
			//		already have key pair
			if ( this.config.keypair && this.config.keypair.createDate ) {
				return saveLog (`[${ client }] on NewKeyPair but system already have keypair: ${ this.config.keypair.publicKeyID } stop and return keypair.`)
			}

			this.savedPasswrod = preData.password
			return Tool.getPbkdf2 ( this.config, this.savedPasswrod, ( err, Pbkdf2Password: Buffer ) => {
				if ( err ) {
					saveLog (`NewKeyPair getPbkdf2 Error: [${ err.message }]`)
					return this.CoNET_systemError ()
				}
				
				preData.password = Pbkdf2Password.toString ( 'hex' )

				saveLog ( `NewKeyPair doing CreateKeyPairProcess`)
				return Tool.newKeyPair( preData.email, preData.nikeName, preData.password, ( err, retData )=> {
					if ( err ) {
						console.log ( err )
						this.socketServer.emit ( 'newKeyPairCallBack' )
						return saveLog (`CreateKeyPairProcess return err: [${ err.message }]`)
					}
					
				
					if ( ! retData ) {
						const info = `newKeyPair return null key!`
						saveLog ( info )
						console.log ( info )
						return this.socketServer.emit ( 'newKeyPairCallBack' )
					}
					const kk = this.localConnected.get ( client )
					if ( !kk.listenAfterPasswd ) {
						kk.listenAfterPasswd = true
						this.localConnected.set ( client, kk )
						this.listenAfterPassword ( socket )
					}
					return Tool.getKeyPairInfo ( retData.publicKey, retData.privateKey, preData.password, ( err, key ) => {
						if ( err ) {
							const info = `Tool.getKeyPairInfo Error [${ err.message ? err.message : 'null err message '}]`
							return this.CoNET_systemError ()
						}
						this.keyPair = this.config.keypair = key
						this.config.account = this.config.keypair.email
						return Tool.makeGpgKeyOption ( this.config, this.savedPasswrod, ( err, data ) => {
							if ( err ) {
								return saveLog ( err.message )
							}
							this.openPgpKeyOption = data
							Tool.saveConfig ( this.config, saveLog )
							return this.socketServer.emit ( 'newKeyPairCallBack', this.config.keypair )
						})
						
					})
				})
								
			})
			
		})
	}

	constructor( private cmdResponse: ( cmd: QTGateAPIRequestCommand ) => void, test: boolean ) {
		
		this.expressServer.set ( 'views', Path.join ( __dirname, 'views' ))
		this.expressServer.set ( 'view engine', 'pug' )
		this.expressServer.use ( cookieParser ())
		this.expressServer.use ( Express.static ( Tool.QTGateFolder ))
		this.expressServer.use ( Express.static ( Path.join ( __dirname, 'public' )))
		this.expressServer.get ( '/', ( req, res ) => {

            res.render( 'home', { title: 'home' })
		})

		this.expressServer.get ( '/Wrt', ( req, res ) => {
			let globalIp = ''
			if ( this.connectCommand && this.connectCommand.length ) {
				globalIp = this.connectCommand[0].localServerIp
			} else {
				console.log (`Wrt doing Tool.myIpServer`)
				return Tool.myIpServer (( err, data ) => {
					if ( err ) {
						globalIp = 'ERR'
					} else {
						globalIp = data
					}
					console.log (`Wrt doing Tool.myIpServer [${ globalIp }]`)
					res.render( 'home/Wrt', { title: 'Wrt', localIP: Tool.getLocalInterface (), globalIP: globalIp })
				})
			}
			console.log (`Wrt doingthis.connectCommand[0].localServerIp [${ globalIp }]`)
            res.render( 'home/Wrt', { title: 'Wrt', localIP: Tool.getLocalInterface (), globalIP: globalIp })
		})

		this.socketServer.on ( 'connection', socker => {
			return this.socketServerConnected ( socker )
		})

		this.httpServer.once ( 'error', err => {
			console.log (`httpServer error`, err )
			saveServerStartupError ( err )
			return process.exit (1)
		})
		Async.series ([
			next => Tool.checkSystemFolder ( next ),
			next => Tool.checkConfig ( next )	
		], ( err, data ) => {
			if ( err ) {
				return saveServerStartupError ( err )
			}
			
			this.config = data['1']
			if ( !test ) {
				this.httpServer.listen ( Tool.LocalServerPortNumber, () => {
					return saveServerStartup ( this.config.localIpAddress[0] )
				})
			}
		})
		
	}

	private catchUnSerialCmd ( cmd: QTGateAPIRequestCommand ) {
		switch ( cmd.command ) {
			//		
			case 'containerStop': {
				this.socketServer.emit ('containerStop')
				return this.stopGetwayConnect ( false )
			}

			default: {
				if ( this.cmdResponse && typeof this.cmdResponse === 'function' ) {
					return this.cmdResponse ( cmd )
				}
				saveLog (`catchUnSerialCmd unknow command: [${ cmd.command }]`)

			}
		}

	}

}