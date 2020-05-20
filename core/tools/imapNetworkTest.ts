import * as Imap from './imap'
import * as Uuid from 'node-uuid'
import * as Async from 'async'
import * as buffer from 'buffer'
const DEBUG = true

const imapData = {
    email: 'peter@CoNETTech.ca',
    account: 'peter@CoNETTech.ca',
    smtpServer: 'smtp.mail.me.com',
    smtpUserName: 'qtgate_test26@icloud.com',
    smtpPortNumber: 587,
    smtpSsl: false,
    smtpIgnoreCertificate: false,
    smtpUserPassword: 'idbi-cuyl-ztvv-vogz',
    imapServer: 'imap.mail.me.com',
    imapPortNumber: 993,
    imapSsl: true,
    imapUserName: 'qtgate_test26@icloud.com',
    imapIgnoreCertificate: false,
    imapUserPassword: 'idbi-cuyl-ztvv-vogz',
    timeZoneOffset: 420,
    language: 'en',
    imapTestResult: true,
    clientFolder: '3ae006b9-ae33-485d-8f03-c3635ab8e213',
    serverFolder: '397176ed-b459-4a24-af4c-b8b13ecd380a',
    randomPassword: 'f1d4c2c2-699d-497c-a3b3-092fe7028320',
    uuid: 'cf744368-802f-4788-a0f2-6af09ca15fb6',
    confirmRisk: true,
    clientIpAddress: null,
    ciphers: 'SSLv3',
    sendToQTGate: false
  }


const newRead = ( imapData: IinputData, listenFolder, mailRead ) => {
	let _err = null
	const rImap = new Imap.qtGateImapRead ( imapData, listenFolder, false, mail => {
		DEBUG ? Imap.saveLog ( `rImap newRead ON 'mail' )`, true ): null
		mailRead ( mail, _err )
		rImap.logout ( err => {

		})
    })

    rImap.once ( 'end', err => {
		_err = err
		DEBUG ? Imap.saveLog ( `---------------------------------------------------------- rImap newRead ON 'END' ) err = [${ err }]`, true ): null
    })

    rImap.once ( 'error', err => {
        DEBUG ? Imap.saveLog ( `---------------------------------------------------------- rImap newRead ON 'ERROR' ) [${ err }]`, true ): null
    })
}


const _testImap = ( imapData: IinputData, data, CallBack ) => {

	const listenFolder = Uuid.v4()
	let result = { 
		upload: 0, 
		download: 0
	}
	let startTime = null
	
	const readMail = ( mail, err ) => {
		if ( err ) {
			return CallBack ( null, result )
		}
		result.download = new Date().getTime () - startTime
		
		return  CallBack ( null, result )

	}

	const ddTime = new Date().getTime()
	return Imap.seneMessageToFolder ( imapData, listenFolder, data, listenFolder, err => {
		if ( err ) {
			return CallBack ( err )
		}

		startTime = new Date().getTime()
		result.upload = startTime - ddTime
		return newRead ( imapData, listenFolder, readMail )
	})
}
const startLength = 1024 * 100 //	100 KB

const testImap = ( firstLength: number ) => {
	const buffData = Buffer.alloc ( startLength ).toString ('base64')
	return _testImap ( imapData, buffData, ( err, data ) => {
		if ( err ) {
			return console.log ( err )
		}
		return console.log (`---------------------------------------------------------- IMAP test success!`, data )
		
	})
}

testImap ( startLength )