interface keypair {
	publicKey?: string
	privateKey?: string
	keyLength: number
	nikeName: string
	createDate: string
	email: string
	passwordOK: boolean
    verified: boolean
    publicKeyID: string
}

interface install_config {
    alreadyInit: boolean
    multiLogin: boolean
    firstRun: boolean
    version: string
    newVersion?: string
    newVersionCheckFault?: boolean
    newVersionDownloadFault?: number 
    newVerReady?: boolean
    keypair: keypair
    iterations: number
    salt?: Buffer
    keylen?: number
    localIpAddress: string []
    digest?: string
    freeUser: boolean
    connectedImapDataUuid: string
    account: string
    serverGlobalIpAddress: string
    serverPort: number
    connectedQTGateServer: boolean          //      true when connect to QTGate network
    lastConnectType: number
}
interface StringValidator {
    isAcceptable(s: string): boolean;
}
interface INewKeyPair {
    email: string
    keyLength: string
    nikeName: string
    password: string
}