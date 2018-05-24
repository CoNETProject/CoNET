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
import * as SocketIo from 'socket.io'
import * as Imap from './imap'
import * as OpenPgp from 'openpgp'
import * as Tool from './initSystem'
import * as Fs from 'fs'


let logFileFlag = 'w'
const saveLog = ( err: {} | string, _console = false ) => {
	if ( !err ) {
		return 
	}
	const data = `${ new Date().toUTCString () }: ${ typeof err === 'object' ? ( err['message'] ? err['message'] : '' ) : err }\r\n`
	_console ? console.log ( data ) : null
	return Fs.appendFile ( Tool.CoNETConnectLog, data, { flag: logFileFlag }, () => {
		return logFileFlag = 'a'
	})
}
const timeOutWhenSendConnectRequestMail = 1000 * 60
const commandRequestTimeOutTime = 1000 * 15

export default class extends Imap.imapPeer {
	private commandCallBackPool: Map <string, requestPoolData > = new Map ()
	private CoNETConnectReady = false
	public connectStage = -1
	private timeOutWhenSendConnectRequestMail: NodeJS.Timer = null

	private sendFeedback () {
		return
	}

	private makeTimeOutEvent ( request: boolean ) {
		const self = this
		saveLog ( `doing makeTimeOutEvent request [${ request }]`, true )
		clearTimeout ( this.timeOutWhenSendConnectRequestMail )
		return this.timeOutWhenSendConnectRequestMail = setTimeout (() => {
			saveLog (`timeOutWhenSendConnectRequestMail UP! request [${ request }]`, true )
			if ( this.ready ) {
				return saveLog (`timeOutWhenSendConnectRequestMail ready!`)
			}

			
			saveLog (`destroy connect!`, true )
			return self.destroy (0)
		}, request ? commandRequestTimeOutTime : commandRequestTimeOutTime )

	}

	private ready () {
		
		saveLog( `doReady`)

		this.on ( 'wImapReady', () => {
			console.log ( 'on imapReady !' )
			this.connectStage = 1
			return this.sockerServer.emit ( 'tryConnectCoNETStage', null, 1 )
		})

		return this.on ( 'ready', () => {
			clearTimeout ( this.timeOutWhenSendConnectRequestMail )
			
			this.CoNETConnectReady = true
			saveLog ( 'Connected CoNET!', true )
			this.connectStage = 4
			this.sockerServer.emit ( 'tryConnectCoNETStage', null, 4 )
			
			return this.sendFeedback ()
		})
	}


	constructor ( public imapData: IinputData, private sockerServer: SocketIo.Server, private openKeyOption: OpenPgp.option_KeyOption, public doNetSendConnectMail: boolean,
		cmdResponse: ( cmd: QTGateAPIRequestCommand ) => void, exit: ( err ) => void ) {
		super ( imapData, imapData.clientFolder, imapData.serverFolder, ( encryptText: string, CallBack ) => {
			
			return Tool.encryptMessage ( openKeyOption, encryptText, ( err, text ) => {
				if ( err ) {
					console.log (`encryptText error`, err )
				}
				console.log (`encryptText success` )
				return CallBack ( err, text )
			})
		}, ( decryptText: string, CallBack ) => {
			return Tool.decryptoMessage ( openKeyOption, decryptText, CallBack )
		}, err => {
			console.log (`coNETConnect class exit with err: [${ err }] doing this.exit(err)!`)
			return exit ( err )
		})
		console.log (`new CoNET connect() doNetSendConnectMail = [${ doNetSendConnectMail }]`)
		if ( !doNetSendConnectMail ) {
			this.once ( 'pingTimeOut', () => {
				if ( !this.CoNETConnectReady ) {
					return this.destroy ( 1 )
				}
			})
		} else {
			this.makeTimeOutEvent ( false )
		}

		this.newMail = ( ret: QTGateAPIRequestCommand ) => {
			//		have not requestSerial that may from system infomation
			saveLog ( 'clearTimeout timeOutWhenSendConnectRequestMail !' )
			
			if ( ! ret.requestSerial ) {
				return cmdResponse ( ret )
			}
			saveLog ( `on newMail command [${ ret.command }] have requestSerial [${ ret.requestSerial }]`)
			const poolData = this.commandCallBackPool.get ( ret.requestSerial )

			if ( ! poolData || typeof poolData.CallBack !== 'function' ) {
				return saveLog ( `QTGateAPIRequestCommand got commandCallBackPool ret.requestSerial [${ ret.requestSerial }] have not callback `)
			}
			return poolData.CallBack ( null, ret )
			
		}

		this.ready ()
	}

	public request ( command: QTGateAPIRequestCommand, CallBack ) {

		saveLog ( `request command [${ command.command }] requestSerial [${ command.requestSerial }]` )
		if ( command.requestSerial ) {
			const poolData: requestPoolData = {
				CallBack: CallBack
			}
			this.commandCallBackPool.set ( command.requestSerial, poolData )
		}
			
		return Tool.encryptMessage ( this.openKeyOption, JSON.stringify ( command ), ( err1, data: string ) => {
			if ( err1 ) {
				saveLog ( `request _deCrypto got error [${ JSON.stringify ( err1 )}]` )
				this.commandCallBackPool.delete ( command.requestSerial )
				return CallBack ( err1 )
			}

			return this.trySendToRemote ( Buffer.from ( data ), () => {
				return this.makeTimeOutEvent ( true )
			})
		})
		
	}

	public tryConnect () {
		this.connectStage = 1
		this.sockerServer.emit ( 'tryConnectCoNETStage', null, this.connectStage = 1 )
		this.Ping ()
		this.makeTimeOutEvent ( true )
	}
}