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

interface ReadonlyArray<T> {
    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    find<S extends T>(predicate: (this: void, value: T, index: number, obj: ReadonlyArray<T>) => value is S, thisArg?: any): S | undefined;
    find(predicate: (value: T, index: number, obj: ReadonlyArray<T>) => boolean, thisArg?: any): T | undefined;

    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    findIndex(predicate: (value: T, index: number, obj: ReadonlyArray<T>) => boolean, thisArg?: any): number;
}


interface Map<K, V> {
    clear(): void;
    delete(key: K): boolean;
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
    get(key: K): V | undefined;
    has(key: K): boolean;
    set(key: K, value: V): this;
    readonly size: number;
}

interface MapConstructor {
    new (): Map<any, any>;
    new <K, V>(entries?: ReadonlyArray<[K, V]>): Map<K, V>;
    readonly prototype: Map<any, any>;
}
declare var Map: MapConstructor;

interface ReadonlyMap<K, V> {
    forEach(callbackfn: (value: V, key: K, map: ReadonlyMap<K, V>) => void, thisArg?: any): void;
    get(key: K): V | undefined;
    has(key: K): boolean;
    readonly size: number;
}

interface WeakMap<K extends object, V> {
    delete(key: K): boolean;
    get(key: K): V | undefined;
    has(key: K): boolean;
    set(key: K, value: V): this;
}

interface WeakMapConstructor {
    new (): WeakMap<object, any>;
    new <K extends object, V>(entries?: ReadonlyArray<[K, V]>): WeakMap<K, V>;
    readonly prototype: WeakMap<object, any>;
}
declare var WeakMap: WeakMapConstructor;

interface Set<T> {
    add(value: T): this;
    clear(): void;
    delete(value: T): boolean;
    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void;
    has(value: T): boolean;
    readonly size: number;
}

interface SetConstructor {
    new (): Set<any>;
    new <T>(values?: ReadonlyArray<T>): Set<T>;
    readonly prototype: Set<any>;
}
declare var Set: SetConstructor;

interface ReadonlySet<T> {
    forEach(callbackfn: (value: T, value2: T, set: ReadonlySet<T>) => void, thisArg?: any): void;
    has(value: T): boolean;
    readonly size: number;
}

interface WeakSet<T extends object> {
    add(value: T): this;
    delete(value: T): boolean;
    has(value: T): boolean;
}

interface WeakSetConstructor {
    new (): WeakSet<object>;
    new <T extends object>(values?: ReadonlyArray<T>): WeakSet<T>;
    readonly prototype: WeakSet<object>;
}
declare var WeakSet: WeakSetConstructor;


interface imapConnect {
    imapServer: string
    imapUserName: string
    imapUserPassword: string
    imapPortNumber: number|number[]
    imapSsl: boolean
    imapIgnoreCertificate: boolean
}

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
    showLoginPasswordField?: KnockoutObservable < boolean >
    delete_btn_view?: KnockoutObservable < boolean >
    delete_btn_click?: () => void
    showConform?: KnockoutObservable < boolean >
    deleteKeyPairNext?: () => void
    keyPairPassword?: KnockoutObservable < keyPairPassword >
    showDeleteKeyPairNoite?: KnockoutObservable < boolean >
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
    nikeName: string
    password: string
}

interface keyPair {
    publicKey: string;
    privateKey: string;
}

interface imapData {
    email: string
}

interface requestPoolData {
    CallBack: ( err?: Error, returnData?: any ) => void
    timeout: any
}

interface regionV1 {
    regionName: string
    testHostIp: string
    testUrl: string
    testHost: string
}

interface IinputData extends imapConnect {
    account:string
    email: string
    smtpServer:string
    smtpUserName:string
    smtpUserPassword:string
    smtpPortNumber:number|number[]
    smtpSsl:boolean
    smtpIgnoreCertificate: boolean
    imapTestResult: boolean
    language: string
    clientFolder: string
    serverFolder: string
    timeZoneOffset: number
    randomPassword: string
    uuid: string
    clientIpAddress: string
    ciphers: string
    confirmRisk: boolean
    sendToQTGate: boolean
}

interface iTransferData {
    startDate: string
    transferDayLimit: number
    transferMonthly: number
    account: string
    resetTime: string
    usedDayTransfer: number
    productionPackage: string
    usedMonthlyTransfer: number
    availableDayTransfer: number
    availableMonthlyTransfer: number
    usedMonthlyOverTransfer: number
    uploaded?: number
    downloaded?: number
    power: number
    timeZoneOffset: number
    expire: string
    isAnnual: boolean
    paidID: string[]
    automatically: boolean
}

interface QTGate_DnsAddress {
	dnsName: string,
	ipv4: string,
	url: string
}

interface QTGateAPIRequestCommand {
	command: string
    myIpServer?: QTGate_DnsAddress []
    account?: string
	error: number
	requestSerial: string
    Args: any[]
    fingerprint?: string
    dataTransfer?: iTransferData
}

interface QTGateCommand {
    account: string
    QTGateVersion: string
    command: string
    imapData?: IinputData
    language: string
    error: Error
    callback: any
    publicKey: string
}

interface IQTGateRegionsSetup {
    title: string
}

interface QTGateRegions {
    icon: string
    content: string[]
    description: string[]
    meta: string[]
    canVoe: KnockoutObservable < boolean >
    canVoH: KnockoutObservable < boolean >
    available: KnockoutObservable < boolean >
    selected: KnockoutObservable < boolean >
    showExtraContent: KnockoutObservable < boolean >
    QTGateRegionsSetup: IQTGateRegionsSetup[]
    qtRegion: string
    error: KnockoutObservable<number >
    showRegionConnectProcessBar: KnockoutObservable < boolean >
    showConnectedArea: KnockoutObservable < boolean >
    ping: KnockoutObservable <number >
    downloadSpeed: KnockoutObservable <number >
}