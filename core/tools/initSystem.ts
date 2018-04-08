/// <reference path="../CoNET.d.ts" />
import * as Fs from 'fs'
import localServer from '../localWebServer'
import * as Path from 'path'
import * as Os from 'os'
import * as Async from 'async'
import * as Crypto from 'crypto'
import * as OpenPgp from 'openpgp'

/**
 * 		define
 */

const InitKeyPair = () => {
	const keyPair: keypair = {
		publicKey: null,
		privateKey: null,
		keyLength: null,
		nikeName: null,
		createDate: null,
		email: null,
		passwordOK: false,
		verified: false,
		publicKeyID: null
		
	}
	return keyPair
}

export const QTGateFolder = Path.join ( Os.homedir(), '.QTGate' )
export const QTGateLatest = Path.join ( QTGateFolder, 'latest' )
export const QTGateTemp = Path.join ( QTGateFolder, 'tempfile' )
export const QTGateVideo = Path.join ( QTGateTemp, 'videoTemp')
export const ErrorLogFile = Path.join ( QTGateFolder, 'systemError.log' )
export const CoNET_Home = Path.join ( __dirname )

export const LocalServerPortNumber = 2000
export const configPath = Path.join ( QTGateFolder, 'config.json' )
const packageFilePath = Path.join ( '..', '..','package.json')
export const packageFile = require ( packageFilePath )
export const QTGateSignKeyID = /3acbe3cbd3c1caa9/i
export const checkFolder = ( folder: string, CallBack: ( err?: Error ) => void ) => {
    Fs.access ( folder, err => {
        if ( err ) {
            return Fs.mkdir ( folder, err1 => {
                if ( err1 ) {
                    
                    return CallBack ( err1 )
                }
                return CallBack ()
            })
        }
        return CallBack ()
    })
}

export const convertByte = ( byte: number ) => {
	if ( byte < 1000 ) {
		return `${ byte } B`
	}
	const kbyte = Math.round ( byte / 10.24 ) / 100
	if ( kbyte < 1000 ) {
		return `${ kbyte } KB`
	}
	const mbyte = Math.round ( kbyte / 10 ) / 100
	if ( mbyte < 1000 ) {
		return `${ mbyte } MB`
	}
	const gbyte = Math.round ( mbyte / 10 ) / 100
	if ( gbyte < 1000 ) {
		return `${ gbyte } GB`
	}
	const tbyte = Math.round ( mbyte / 10 ) / 100
	return `${ tbyte } TB`
}

export const checkSystemFolder = ( CallBack ) => {
	return Async.series ([
		next => checkFolder ( QTGateFolder, next ),
        next => checkFolder ( QTGateLatest, next ),
        next => checkFolder ( QTGateTemp, next ),
        next => checkFolder ( QTGateVideo, next )
	], ( err, kkk ) => {
		if ( err ) {
			console.log ( `checkSystemFolder return error`, err )
			return CallBack ( err )
		}
		return CallBack ()
	})
}
export const getLocalInterface = () => {
	const ifaces = Os.networkInterfaces()
	const ret = []
	Object.keys ( ifaces ).forEach ( n => {
		ifaces[ n ].forEach ( iface => {
			
			if ( 'IPv4' !== iface.family || iface.internal !== false ) {
				// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
				return
			}
			ret.push ( iface.address )
		})
	})
	return ret
}

export const InitConfig = () => {
	const ret: install_config = {
		firstRun: true,
		alreadyInit: false,
		multiLogin: false,
		version: packageFile.version,
		newVersion: null,
		newVerReady: false,
		keypair: InitKeyPair (),
		salt: Crypto.randomBytes ( 64 ),
		iterations: 2000 + Math.round ( Math.random () * 2000 ),
		keylen: Math.round ( 16 + Math.random() * 30 ),
		digest: 'sha512',
		freeUser: true,
		account: null,
		serverGlobalIpAddress: null,
		serverPort: LocalServerPortNumber,
		connectedQTGateServer: false,
		localIpAddress: getLocalInterface (),
		lastConnectType: 1,
		connectedImapDataUuid: null
	}
	return ret
}

const getBitLength = ( key: OpenPgp.key.Key ) => {
	const algorithm = key.primaryKey.getAlgorithmInfo ()
    return algorithm.bits
}

const getKeyId = ( key: OpenPgp.key.Key ) => {
	const algorithm = key.primaryKey.getAlgorithmInfo ()
    return algorithm.algorithm
}

export const getNickName = ( str: string ) => {
	const uu = str.split ('<')
	return uu[0]
}

export const getEmailAddress = ( str: string ) => {
	const uu = str.split ('<')
	return uu[1].substr( 0, uu[1].length -1 )
}
export const getQTGateSign = ( user: OpenPgp.key.users ) => {
    if ( !user.otherCertifications || !user.otherCertifications.length ) {
		return null
	}
	let Certification = false
	user.otherCertifications.forEach ( n => {
		if ( QTGateSignKeyID.test ( n.issuerKeyId.toHex ().toLowerCase())) {
			return Certification = true
		}
	})
	return Certification
}

export const getKeyPairInfo = ( keyPair: keypair ) => {
	if ( ! keyPair || ! keyPair.publicKey || ! keyPair.privateKey ) {
		return keyPair = null
	}
	const _privateKey = OpenPgp.key.readArmored ( keyPair.privateKey )
	const _publicKey = OpenPgp.key.readArmored ( keyPair.publicKey )
	if ( _privateKey.err || _publicKey.err ) {
		
		return keyPair = null
	}
	const privateKey1 = _privateKey.keys[0]
	const publicKey1 = _publicKey.keys
	const user = publicKey1[0].users[0]
	const ret: keypair = {
		publicKey: keyPair.publicKey,
		privateKey: keyPair.privateKey,
		keyLength: getBitLength ( privateKey1 ),
		nikeName: getNickName ( user.userId.userid ),
		createDate:  privateKey1.primaryKey.created.toLocaleString (),
		email: getEmailAddress ( user.userId.userid ) ,
		passwordOK: false,
		verified: getQTGateSign ( user ),
		publicKeyID: publicKey1[0].primaryKey.fingerprint
		
	}
	return keyPair = ret
}
export const KeyPairDeleteKeyDetail = ( keyPair: keypair, passwordOK: boolean ) => {
	if ( !keyPair ) {
		return null
	}
	const ret: keypair = {
		nikeName: keyPair.nikeName,
		email: keyPair.email,
		keyLength: keyPair.keyLength,
		createDate: keyPair.createDate,
		passwordOK: passwordOK,
		verified: keyPair.verified,
		publicKeyID: keyPair.publicKeyID
	}
	return ret
}
export const emitConfig = ( config: install_config, passwordOK: boolean ) => {
	if ( !config ) {
		return null
	}
	const ret: install_config = {
		keypair: KeyPairDeleteKeyDetail ( config.keypair, passwordOK ),
		firstRun: config.firstRun,
		alreadyInit: config.alreadyInit,
		newVerReady: config.newVerReady,
		version: config.version,
		multiLogin: config.multiLogin,
		freeUser: config.freeUser,
		account: config.keypair && config.keypair.email ? config.keypair.email : null,
		serverGlobalIpAddress: config.serverGlobalIpAddress,
		serverPort: config.serverPort,
		connectedQTGateServer: config.connectedQTGateServer,
		localIpAddress: getLocalInterface(),
		lastConnectType: config.lastConnectType,
		iterations: config.iterations,
		connectedImapDataUuid: config.connectedImapDataUuid
	}
	return ret
}

export const saveConfig = ( config: install_config, CallBack ) =>{
	return Fs.writeFile ( configPath, JSON.stringify ( config ), CallBack )
}

export const checkConfig = ( CallBack ) => {

	Fs.access ( configPath, err => {
		
		if ( err ) {
			return CallBack ( null, InitConfig ())
		}
		let config: install_config = null

		try {
			config = require ( configPath )
		} catch ( e ) {
			return CallBack ( null, InitConfig ())
		}
		config.salt = Buffer.from ( config.salt['data'] )
		
		//		update?

		config.version = packageFile.version
		config.newVerReady = false
		config.newVersion = null
		config.serverPort = LocalServerPortNumber
		config.localIpAddress = getLocalInterface ()
		config.keypair = getKeyPairInfo ( config.keypair )
		return CallBack ( null, config )

	})
}
