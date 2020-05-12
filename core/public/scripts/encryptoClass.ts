declare const openpgp: any 

const requestTimeOut = 1000 * 180

const KloakNode_publicKey = 
`-----BEGIN PGP PUBLIC KEY BLOCK-----

mDMEXjMkUBYJKwYBBAHaRw8BAQdAFD5n6LecvYdEOn65nCjOvn/C2bco7JPkGg2a
xY0rGoa0NEtsb2FrIEluZm9ybWF0aW9uIFRlY2hub2xvZ2llcyBJbmMuIDxub2Rl
QEtsb2FrLmFwcD6IeAQQFgoAIAUCXjMkUAYLCQcIAwIEFQgKAgQWAgEAAhkBAhsD
Ah4BAAoJEIZGYoUSMbEZH4sA/06bmj/UPFTsEnsL20hJqNs3hgf9/3cSSoCLTLix
BM93AP9LlfBWMgUtF5N1Aah6pDABTtgCAk+dlODe1vh8PuwHB9HfxN/CARAAAQEA
AAAAAAAAAAAAAAD/2P/gABBKRklGAAEBAABIAEgAAP/hAExFeGlmAABNTQAqAAAA
CAABh2kABAAAAAEAAAAaAAAAAAADoAEAAwAAAAEAAQAAoAIABAAAAAEAAAD4oAMA
BAAAAAEAAAD6AAAAAP/tADhQaG90b3Nob3AgMy4wADhCSU0EBAAAAAAAADhCSU0E
JQAAAAAAENQdjNmPALIE6YAJmOz4Qn7/wgARCAD6APgDASIAAhEBAxEB/8QAHwAA
AQUBAQEBAQEAAAAAAAAAAwIEAQUABgcICQoL/8QAwxAAAQMDAgQDBAYEBwYECAZz
AQIAAxEEEiEFMRMiEAZBUTIUYXEjB4EgkUIVoVIzsSRiMBbBctFDkjSCCOFTQCVj
FzXwk3OiUESyg/EmVDZklHTCYNKEoxhw4idFN2WzVXWklcOF8tNGdoDjR1ZmtAkK
GRooKSo4OTpISUpXWFlaZ2hpand4eXqGh4iJipCWl5iZmqClpqeoqaqwtba3uLm6
wMTFxsfIycrQ1NXW19jZ2uDk5ebn6Onq8/T19vf4+fr/xAAfAQADAQEBAQEBAQEB
AAAAAAABAgADBAUGBwgJCgv/xADDEQACAgEDAwMCAwUCBQIEBIcBAAIRAxASIQQg
MUETBTAiMlEUQAYzI2FCFXFSNIFQJJGhQ7EWB2I1U/DRJWDBROFy8ReCYzZwJkVU
kiei0ggJChgZGigpKjc4OTpGR0hJSlVWV1hZWmRlZmdoaWpzdHV2d3h5eoCDhIWG
h4iJipCTlJWWl5iZmqCjpKWmp6ipqrCys7S1tre4ubrAwsPExcbHyMnK0NPU1dbX
2Nna4OLj5OXm5+jp6vLz9PX29/j5+v/bAEMADAwMDAwMFAwMFB0UFBQdJx0dHR0n
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
PT17OWXpUfDuuSaA+2Px8WMtc9trMDIiGCEM
=mdDQ
-----END PGP PUBLIC KEY BLOCK-----
`
const Kloak_API_PublicKey =
`
-----BEGIN PGP PUBLIC KEY BLOCK-----

mDMEXqT4zhYJKwYBBAHaRw8BAQdA7/0QRxAraH+3wvR4nWaAW9cFl32CS5J9JC+B
vUspCDm0E0FQSSA8QVBJQEtsb2FrLmFwcD6IeAQQFgoAIAUCXqT4zgYLCQcIAwIE
FQgKAgQWAgEAAhkBAhsDAh4BAAoJEF9YG3WhPvBOzkcA/3f9B3e8PE78qFJHPy37
Cd6BIESJmXEGqheucTRczOOLAQCCChwHN8zArHRKdE+4bZ42iqKCW84fM8sXazbe
XPFQDbg4BF6k+M4SCisGAQQBl1UBBQEBB0B7NFm+kreqw0D9mUp9qPDK54xeKmor
/hnICKjiRxtpVAMBCAeIYQQYFggACQUCXqT4zgIbDAAKCRBfWBt1oT7wTkycAQC7
LLsNzS2Zra2hm9kvKafeTYpTmiEUQbxIuyPEySP9xQEAkB70RnDuoJQzKuEeeAEd
ToNMnoWOMu0xq5gTORcSDgI=
=jcgy
-----END PGP PUBLIC KEY BLOCK-----
`

/**
 * 
 * @param public_key 
 * 
 * 
 * @param private_key 
 * https://github.com/openpgpjs/openpgpjs/issues/97
 */
const signPublicKey = ( public_key, private_key ) => {
	// Returns a new public key which is public_key + signature(public_key)
	var dataToSign = {
		userid: public_key.users[0].userId,
		key: public_key.primaryKey
	}

  
	const signaturePacket = new openpgp.packet.Signature ()
	signaturePacket.signatureType = openpgp.enums.signature.cert_generic
	signaturePacket.publicKeyAlgorithm = 1
	signaturePacket.hashAlgorithm = 2
	signaturePacket.keyFlags = [ openpgp.enums.keyFlags.certify_keys | openpgp.enums.keyFlags.sign_data ]
	signaturePacket.preferredSymmetricAlgorithms = []
	signaturePacket.preferredSymmetricAlgorithms.push (openpgp.enums.symmetric.aes256 )
	signaturePacket.preferredSymmetricAlgorithms.push (openpgp.enums.symmetric.aes192 )
	signaturePacket.preferredSymmetricAlgorithms.push (openpgp.enums.symmetric.aes128 )
	signaturePacket.preferredSymmetricAlgorithms.push (openpgp.enums.symmetric.cast5 )
	signaturePacket.preferredSymmetricAlgorithms.push ( openpgp.enums.symmetric.tripledes )
	signaturePacket.preferredHashAlgorithms = []
	signaturePacket.preferredHashAlgorithms.push ( openpgp.enums.hash.sha256 )
	signaturePacket.preferredHashAlgorithms.push ( openpgp.enums.hash.sha1 )
	signaturePacket.preferredHashAlgorithms.push ( openpgp.enums.hash.sha512 )
	signaturePacket.preferredCompressionAlgorithms = []
	signaturePacket.preferredCompressionAlgorithms.push ( openpgp.enums.compression.zlib )
	signaturePacket.preferredCompressionAlgorithms.push ( openpgp.enums.compression.zip )
	signaturePacket.sign ( private_key.getEncryptionKeyPacket(), dataToSign )
  
	var originalPackets = public_key.toPacketlist ()
	var packetlist = new openpgp.packet.List ()
	for ( let i = 0; i < originalPackets.length; i++ ) {
	  packetlist.push ( originalPackets [i] )
	}
	packetlist.push ( public_key.users[0].userId )
	packetlist.push ( signaturePacket )
	return new openpgp.key.Key ( packetlist )
}

class encryptoClass {
	private _privateKey = null
	private KloakNode_publicKey = null
	private Kloak_API_PublicKey = null
	private Kloak_AP_publicKey = null
	private myPublicKey = null
	public imapData: IinputData = null
	public localServerPublicKey = ""

	private requestPool: Map < string, { CallBack: ( err?: Error, cmd?: QTGateAPIRequestCommand ) => void, cmd: QTGateAPIRequestCommand, timeOut: NodeJS.Timeout } > = new Map ()

	private makeKeyReady = ( CallBack ) => {

		openpgp.key.readArmored ( this._keypair.privateKey ).then ( data => {
			this._privateKey = data.keys
			return this._privateKey[0].decrypt ( this.password ).then ( data => {
				
				return openpgp.key.readArmored ( this._keypair.publicKey ).then ( data => {

					this.myPublicKey = data.keys
					return openpgp.key.readArmored ( KloakNode_publicKey ).then ( data => {
						this.KloakNode_publicKey = data.keys
						return openpgp.key.readArmored ( Kloak_API_PublicKey ).then ( data => {
							this.Kloak_API_PublicKey = data
							return this.readImapIInputData ( CallBack )
						})
						
					})
					
				})
			})
		})
		
		
	}

	public decryptMessage =  ( encryptoText: string, CallBack ) => {
		return this.decryptMessageToZipStream ( encryptoText, async ( err, _data ) => {
			if ( err ) {
				return CallBack ( err )
			}
			let ret = null
			const data = Buffer.from ( _data, 'base64' ).toString ()
			if ( /^-----BEGIN PGP/i.test ( data )) {
				CallBack ()
				return this.Kloak_AP_publicKey = ( await openpgp.key.readArmored( data )).keys
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
			publicKeys: this.Kloak_API_PublicKey,
			message: null
		}
		let ret = false
		return openpgp.message.readArmored ( encryptoText ).then ( data => {
			option.message = data
			return openpgp.decrypt( option )
		}).then ( _plaintext => {

			if ( !ret) {
				ret = true
				return CallBack ( null, _plaintext.data )
			}
			
		})
		/*
		.catch ( ex => {
			if ( !ret) {
				ret = true
				return CallBack ( ex )
			}
			
		})
		*/

	}

	private onDoingRequest = async ( encryptoText: string, uuid: string ) => {
		const self = this
		const request = this.requestPool.get ( uuid )
		if ( !request ) {
			return 
		}
		
		
		return this.decryptMessage ( encryptoText, ( err, obj: QTGateAPIRequestCommand ) => {

			if ( err ) {
				return self.connectInformationMessage.showErrorMessage ( err )
			}
			if ( obj.error !== -1 ) {
				clearTimeout ( request.timeOut )
			}
			
			return request.CallBack ( null, obj )
		})
		
		

	}

	constructor ( private _keypair: keypair, private password: string, private connectInformationMessage: connectInformationMessage, ready: ( err?: Error ) => void ) {
		this.makeKeyReady (() => {
			return this.getServerPublicKey ( ready )
		})
		connectInformationMessage.socketIo.on ( 'doingRequest', ( encryptoText: string, uuid: string ) => {
			return this.onDoingRequest ( encryptoText, uuid )
		})


	}

	public getServerPublicKey ( CallBack ) {
		const publicKey = this._keypair.publicKey
		const self = this
		return this.connectInformationMessage.sockEmit ( 'keypair', publicKey, async ( err, data ) => {
			if ( err ) {
				self.connectInformationMessage.showErrorMessage ( err )
				return CallBack ( err )
			}
			
			const uu = await openpgp.key.readArmored ( data )
			self.localServerPublicKey = uu.keys
			return CallBack ()
			
		})
	}

	public encrypt ( message, CallBack ) {
		
		const option = {
			privateKeys: this._privateKey,
			publicKeys: this.KloakNode_publicKey,
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
			publicKeys: this.Kloak_AP_publicKey,
			message: openpgp.message.fromText ( JSON.stringify ( cmd )),
			compression: openpgp.enums.compression.zip
		}
		
		this.requestPool.set ( uuid, { CallBack: CallBack, cmd: cmd, timeOut: setTimeout(() => {
			self.requestPool.delete ( uuid )
			return CallBack ( new Error ( 'timeOut' ))
		}, requestTimeOut )})

		
		return openpgp.encrypt ( option ).then ( ciphertext => {
			return self.connectInformationMessage.sockEmit ( 'doingRequest' , uuid, ciphertext.data, err => {
				return CallBack ( err )
			})
			
		}).catch ( err => {
			return CallBack ( 'systemError' )
		})
		
		
	}

	public async decrypt_withMyPublicKey ( message, CallBack ) {
		const option = {
			privateKeys: this._privateKey,
			publicKeys: this.myPublicKey,
			message: await openpgp.message.readArmored ( message )
		}
		return openpgp.decrypt( option ).then ( data => {
			if ( data.signatures[0].valid ) {
				return CallBack ( null, data.data )
			}
			return ( new Error ('signatures error!'))
		}).catch ( ex => {
			return CallBack ( ex )
		})
		
		
	}

	public encrypt_withMyPublicKey ( message, CallBack ) {
		const option = {
			privateKeys: this._privateKey,
			publicKeys: this.myPublicKey,
			message: openpgp.message.fromText ( message ),
			compression: openpgp.enums.compression.zip
		}
		
		return openpgp.encrypt ( option ).then ( ciphertext => {
			return CallBack ( null, ciphertext.data )
			
		}).catch ( err => {
			return CallBack ( err )
		})
	}

	public saveImapIInputData ( CallBack ) {
		return this.encrypt_withMyPublicKey ( JSON.stringify ( this.imapData ), ( err, data ) => {
			if ( err ) {
				return CallBack ( err )
			}
			localStorage.setItem ( "imapData", data )
			return CallBack ()
		})
	}

	public emitLocalCommand ( emitName: string, command: any, CallBack ) {
		const self = this
		const option = {
			privateKeys: this._privateKey,
			publicKeys: this.localServerPublicKey,
			message: openpgp.message.fromText ( JSON.stringify ( command )),
			compression: openpgp.enums.compression.zip
		}
		return openpgp.encrypt ( option ).then ( ciphertext => {
			return self.connectInformationMessage.sockEmit ( emitName, ciphertext.data, CallBack )
			
		}).catch ( err => {
			return CallBack ( err )
		})

	}

	public async decrypt_withLocalServerKey ( command, CallBack ) {
		const self = this
		const option = {
			privateKeys: this._privateKey,
			publicKeys: this.localServerPublicKey,
			message: await openpgp.message.readArmored ( command )
		}

		const data = await openpgp.decrypt( option )
		
		if ( ! data.signatures[0].valid ) {
			return CallBack ( new Error ('Key signatures error!'))
		}

		let ret = null

		try {
			ret = JSON.parse ( data.data )
		} catch ( ex ) {
			return CallBack ( ex )
		}
		return CallBack ( null, ret )
			
		

	}

	public readImapIInputData ( CallBack ) {
		const data = localStorage.getItem ( "imapData" )
		if ( !data || !data.length ) {
			return CallBack ()
		}

		return this.decrypt_withMyPublicKey ( data, ( err, data ) => {
			if ( err ) {
				return CallBack ()
			}
			try {
				this.imapData = JSON.parse ( data )
			} catch ( ex ) {
				return CallBack ( )
			}

			return CallBack ()
		})
	}

}
