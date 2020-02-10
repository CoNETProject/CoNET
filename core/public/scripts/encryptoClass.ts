declare const openpgp: any 

const requestTimeOut = 1000 * 180
class encryptoClass {
	private _privateKey
	private CoNET_publicKey

	private requestPool: Map < string, { CallBack: ( err?: Error, cmd?: QTGateAPIRequestCommand ) => void, cmd: QTGateAPIRequestCommand, timeOut: NodeJS.Timeout } > = new Map ()

	private makeKeyReady = async() => {
		//this.CoNET_publicKey = ( await openpgp.key.readArmored ( CoNET_publicKey )).keys
		this._privateKey = ( await openpgp.key.readArmored ( this._keypair.privateKey )).keys
		await this._privateKey[0].decrypt ( this._keypair._password )
	}

	public decryptMessage =  ( encryptoText: string, CallBack ) => {
		return this.decryptMessageToZipStream ( encryptoText, async ( err, _data ) => {
			if ( err ) {
				return CallBack ( err )
			}
			let ret = null
			const data = Buffer.from ( _data, 'base64').toString ()
			if ( /^-----BEGIN PGP/i.test ( data )) {
				CallBack ()
				return this.CoNET_publicKey = ( await openpgp.key.readArmored( data )).keys
			}

			try {
				ret = JSON.parse ( data )
			} catch ( ex ) {
				return CallBack ( ex )
			}
			return CallBack ( null, ret )
		})
		
	}

	public decryptMessageToZipStream ( encryptoText: string, CallBack ) {
		const option = {
			privateKeys: this._privateKey,
			publicKeys: this.CoNET_publicKey,
			message: null
		}


		let ret = null
		return openpgp.message.readArmored ( encryptoText ).then ( data => {
			option.message = data
			return openpgp.decrypt( option )
		}).then ( _plaintext => {
			
			return CallBack ( null, _plaintext.data )
		})
		.catch ( ex => {
			return CallBack ( ex )
		})

	}

	private onDoingRequest = async ( encryptoText: string, uuid: string ) => {
		
		const request = this.requestPool.get ( uuid )
		if ( !request ) {
			return 
		}
		
		
		return this.decryptMessage ( encryptoText, ( err, obj: QTGateAPIRequestCommand ) => {

			if ( err ) {
				return _view.connectInformationMessage.showErrorMessage ( err )
			}
			if ( obj.error !== -1 ) {
				clearTimeout ( request.timeOut )
			}
			
			return request.CallBack ( null, obj )
		})
		
		

	}

	constructor ( private _keypair: keypair ) {
		this.makeKeyReady ()
		_view.connectInformationMessage.socketIo.on ( 'doingRequest', ( encryptoText: string, uuid: string ) => {
			 return this.onDoingRequest ( encryptoText, uuid )
		})
	}

	public encrypt ( message, CallBack ) {
		
		const option = {
			privateKeys: this._privateKey,
			publicKeys: this.CoNET_publicKey,
			message: openpgp.message.fromText ( message ),
			compression: openpgp.enums.compression.zip
		}
		const  self = this
		return openpgp.encrypt ( option ).then ( ciphertext => {
			return CallBack ( null, ciphertext.data )
			
		}).catch ( err => {
			return CallBack ( 'systemError' )
		})

	}



	public emitRequest ( cmd: QTGateAPIRequestCommand, CallBack ) {
		const uuid = cmd.requestSerial = uuid_generate()
		const self = this
		const option = {
			privateKeys: this._privateKey,
			publicKeys: this.CoNET_publicKey,
			message: openpgp.message.fromText ( JSON.stringify ( cmd )),
			compression: openpgp.enums.compression.zip
		}
		
		this.requestPool.set ( uuid, { CallBack: CallBack, cmd: cmd, timeOut: setTimeout(() => {
			self.requestPool.delete ( uuid )
			return CallBack ( new Error ( 'timeOut' ))
		}, requestTimeOut )})

		
		return openpgp.encrypt ( option ).then ( ciphertext => {
			return _view.connectInformationMessage.sockEmit ( 'doingRequest' , uuid, ciphertext.data, err => {
				return CallBack ( err )
			})
			
		}).catch ( err => {
			return CallBack ( 'systemError' )
		})
		
		
	}

}