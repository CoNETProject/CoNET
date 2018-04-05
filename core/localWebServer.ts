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

/**
 * 		define
 */
const QTGateFolder = Path.join ( Os.homedir(), '.QTGate' )
const CoNET_Home = Path.join ( __dirname )
const LocalServerPortNumber = 2000

export default class {
	private expressServer = Express()
	private httpServer = HTTP.createServer ( this.expressServer )
	private socketServer = SocketIo ( this.httpServer )
	private socketServerConnected ( socket: SocketIO.Socket ) {

	}
	constructor() {
		this.expressServer.set ( 'views', Path.join ( CoNET_Home, 'views' ))
		this.expressServer.set ( 'view engine', 'pug' )
		this.expressServer.use ( Express.static ( QTGateFolder ))
		this.expressServer.use ( Express.static ( Path.join ( CoNET_Home, 'public' )))
		this.expressServer.get ( '/', ( req, res ) => {
            res.render( 'home', { title: 'home' })
		})
		this.socketServer.on ('connection', socker => {
			return this.socketServerConnected ( socker )
		})
		this.httpServer.listen ( LocalServerPortNumber )
	}
}