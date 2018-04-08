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

let logFileFlag = 'w'

const saveLog = ( err: {} | string ) => {
	if ( !err ) {
		return 
	}
	const data = `${ new Date().toUTCString () }: ${ typeof err === 'object' ? ( err['message'] ? err['message'] : '' ) : err }\r\n`
	return Fs.appendFile ( Tool.ErrorLogFile, data, { flag: logFileFlag }, () => {
		return logFileFlag = 'a'
	})
}


const saveServerStartup = () => {
	saveLog ( `*************************** CoNET Platform [ ${ Tool.packageFile.version } ] server start up on [ ${ Tool.LocalServerPortNumber } ] *****************************`)
}


export default class localServer {
	private expressServer = Express()
	private httpServer = HTTP.createServer ( this.expressServer )
	private socketServer = SocketIo ( this.httpServer )
	public config: install_config  = null
	public keyPair: keypair = null
	private socketServerConnected ( socket: SocketIO.Socket ) {
		socket.on ( 'init', Callback => {
			const ret = Tool.emitConfig ( this.config, false )
			return Callback ( ret )
		})
		socket.once ( 'agreeClick', () => {
			saveLog (`socket on agreeClick`)
			this.config.firstRun = false
			return Tool.saveConfig ( this.config, saveLog )
		})
	}

	constructor() {
		Async.series ([
			next => Tool.checkSystemFolder ( next ),
			next => Tool.checkConfig ( next )
		], ( err, data ) => {
			if ( err ) {
				return saveLog ( err )
			}
			this.config = data['1']
			console.log ( Util.inspect ( this.config ))
		})
		this.expressServer.set ( 'views', Path.join ( __dirname, 'views' ))
		this.expressServer.set ( 'view engine', 'pug' )
		this.expressServer.use ( cookieParser ())
		this.expressServer.use ( Express.static ( Tool.QTGateFolder ))
		this.expressServer.use ( Express.static ( Path.join ( __dirname, 'public' )))
		this.expressServer.get ( '/', ( req, res ) => {
            res.render( 'home', { title: 'home' })
		})
		this.socketServer.on ( 'connection', socker => {
			
			return this.socketServerConnected ( socker )
		})
		this.httpServer.listen ( Tool.LocalServerPortNumber )
		saveServerStartup()
	}
}