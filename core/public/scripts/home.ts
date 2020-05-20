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
declare const mhtml2html
const InitKeyPair = function () {
	const keyPair: keypair = {
		publicKey: null,
		privateKey: null,
		keyLength: null,
		nikeName: null,
		createDate: null,
		email: null,
		passwordOK: false,
		verified: false,
		publicKeyID: null,
		_password: null
	}
	return keyPair
}



const makeKeyPairData = function ( view: view_layout.view, keypair: keypair ) {
    
    const length = keypair.publicKeyID.length
    keypair.publicKeyID = keypair.publicKeyID.substr ( length - 16 )
    
    let keyPairPasswordClass = new keyPairPassword ( keypair.privateKey, function ( passwd: string ) {
        //      password OK

        keypair.keyPairPassword ( keyPairPasswordClass = null )
		keypair.passwordOK = true
		view.password = passwd
        keypair.showLoginPasswordField ( false )
        return view.keyPairCalss = new encryptoClass ( keypair, view.password, view.connectInformationMessage, err => {
            view.showKeyPair ( false )

            if ( view.keyPairCalss.imapData && view.keyPairCalss.imapData.imapTestResult ) {
                return view.imapSetupClassExit ( view.keyPairCalss.imapData )
            }
            let uu = null
            return view.imapSetup ( uu = new imapForm ( keypair.email, view.keyPairCalss.imapData, function ( imapData: IinputData ) {
                view.imapSetup ( uu = null )
                view.keyPairCalss.imapData = imapData
                return view.keyPairCalss.saveImapIInputData ( err => {
                    return view.imapSetupClassExit ( imapData )
                })
            }))
        })

        
        
    })
    
    keypair.keyPairPassword = ko.observable( keyPairPasswordClass )
    keypair.showLoginPasswordField = ko.observable ( false )
    keypair.delete_btn_view = ko.observable ( true )
    keypair.showConform = ko.observable ( false )
    keypair['showDeleteKeyPairNoite'] = ko.observable ( false )
    keypair.delete_btn_click = function () {
        keypair.delete_btn_view ( false )
        return keypair.showConform ( true )
    }
    
    
    keypair.deleteKeyPairNext = function () {

        localStorage.setItem ( "config", JSON.stringify ({}))
        view.localServerConfig ( null )
        view.showIconBar ( false )
        view.connectedCoNET ( false )
        view.connectToCoNET ( false )
        view.CoNETConnect ( view.CoNETConnectClass = null )
        view.imapSetup ( view.imapFormClass = null )
        keypair.showDeleteKeyPairNoite ( false )
        keypair.delete_btn_view ( false )
        localStorage.clear()
        return view.reFreshLocalServer()
        
        
    }

    
}

const initPopupArea = function () {
    const popItem = $( '.activating.element' ).popup('hide')
    const inline = popItem.hasClass ('inline')
    return popItem.popup({
        on: 'focus',
        movePopup: false,
        position: 'top left',
        inline: inline
    })
}

class showWebPageClass {
    
	public showLoading = ko.observable ( true )
	public htmlIframe = ko.observable ( null )
	public showErrorMessage = ko.observable ( false )
	public showHtmlCodePage = ko.observable ( false )
	public showImgPage = ko.observable ( true )
	public showErrorMessageProcess () {
		this.showLoading ( false )
		this.showErrorMessage ( true )
	}
    public png = ko.observable ('')
    public mHtml = ko.observable ('')
    
    private urlBlobList = []
	
	public close () {
		this.showImgPage ( false )
		this.showHtmlCodePage ( false )
        this.png ( null )
        this.htmlIframe ( null )
        this.urlBlobList.forEach ( n => {
            ( URL || webkitURL ).revokeObjectURL ( n )
        })
		this.exit ()
	}

	public imgClick () {
		this.showHtmlCodePage ( false )
		this.showImgPage ( true )
	}
	
	public htmlClick () {
        
		this.showHtmlCodePage ( true )
        this.showImgPage ( false )
        const docu = this.mHtml()
        if ( docu ) {
            $('iframe').contents().find( "head" ).html ( docu["window"].document.head.outerHTML )
            $('iframe').contents().find( "body" ).html ( docu["window"].document.body.outerHTML )
        }
	}

	constructor ( public showUrl: string, private zipBase64Stream: string, private zipBase64StreamUuid: string, private exit: ()=> void ) {
		const self = this
		_view.showIconBar ( false )
		
		showHTMLComplete ( zipBase64StreamUuid, zipBase64Stream, ( err, data: { mhtml: string, img: string, html: string, folder: [ { filename: string, data: string }]} ) => {
            if ( err ) {
                return self.showErrorMessageProcess ()
            }
            
            _view.bodyBlue ( false )
        

            let html = data.html
            //      support HTMLComplete
            if ( html ) {
                html = html.replace ( / srcset="[^"]+" /ig, ' ').replace ( / srcset='[^']+' /ig, ' ')
                let det = data.folder.shift()
                const getData =  ( filename: string, _data: string, CallBack ) => {
                
                    const pointStart = html.indexOf ( `${ filename }` )
                    

                    const doCallBack = () => {
                        det = data.folder.shift()
                        if ( ! det ) {
                            return CallBack ()
                        }
                        return getData ( det.filename, det.data, CallBack )
                    }
                    
                    if ( pointStart > -1 ) {
                        
                        return getFilenameMime ( filename, ( err, mime ) => {

                            if ( mime && ! /javascript/.test( mime ) ) {
                                /**
                                 * 
                                 *          css link tag format support
                                 * 
                                 */
                                const _filename = filename.replace(/\-/g,'\\-').replace(/\//g,'\\/').replace(/\./g,'\\.').replace(/\(/g,'\\(').replace(/\)/g,'\\)')
                                const regex = new RegExp (` src=("|')\.\/${ _filename }("|')`, 'g')
                                const regex1 = new RegExp (` href=("|')\.\/${ _filename }("|')`, 'g')
                                /*
                                if ( /^ src/i.test( hrefTest )) {
                                    
                                    const data1 = `data:${ mime };base64,` + _data
                                    html = html.replace ( regex, data1 ).replace ( regex, data1 )
                                    return doCallBack ()
                                    
                                }
                                */
                                const blob = new Blob ([ /^image/.test( mime ) ? Buffer.from ( _data,'base64' ) : Buffer.from ( _data,'base64' ).toString()], { type: mime })
                                const link = ( URL || webkitURL ).createObjectURL( blob )
                                html = html.replace ( regex, ` src="${ link }"` ).replace ( regex1, ` href="${ link }"` )
                                this.urlBlobList.push ( link )
                            }
                            doCallBack ()
                        })
                        
                        
                    }

                    doCallBack ()
                    
                    
                }

                return getData ( det.filename, det.data, err => {
                    
                    self.png ( data.img )
                    
                    const htmlBolb = new Blob ([ html ], { type: 'text/html'})
                    const _url = ( URL || webkitURL ).createObjectURL ( htmlBolb )
                    
                    
                    self.showLoading ( false )
                    self.htmlIframe ( _url )
                    self.urlBlobList.push ( _url )

                })
            }
            html = mhtml2html.convert( data.mhtml )
            self.png ( data.img )
            self.showLoading ( false )
            self.mHtml ( html )
        })
		
		
	}
}

class workerManager {
    public workers: Map<string, Worker > = new Map()
    private callbackPool: Map< string, any > = new Map ()

    private doEvent ( evt: MessageEvent ) {
        const jsonData = Buffer.from ( Buffer.from ( evt.data ).toString(), 'base64').toString()
        let data: workerDataEvent = null
        try {
            data = JSON.parse ( jsonData )
        } catch ( ex ) {
            return new EvalError ( `workerManager JSON.parse error [${ ex.message }]`)
        }
        
        const callBack = this.callbackPool.get ( data.uuid )
        if ( !callBack ) {
            return console.log (`workerManager: [${ new Date().toLocaleTimeString()}] have not callback about message from [${ data.workerName }] content = [${ data.data }]`)
        }
        return callBack ( null, data )
    }

	constructor ( list: string[] ) {
		list.forEach ( n => {
            const work = new Worker(`scripts/${ n }.js`)
            work.onmessage = evt => {
                return this.doEvent ( evt )
            }
			return this.workers.set ( n, work )
		})
    }
    /**
     * 
     * 
     */

    public postFun ( workerName: string, data: any, CallBack ) {
        const worker = this.workers.get ( workerName )
        if ( !worker ) {
            return CallBack ( new Error ('no worker'))
        }

        const callback: workerDataEvent  = {
            data: data,
            uuid: uuid_generate (),
            workerName: workerName
        }

        const kk = Buffer.from ( Buffer.from ( JSON.stringify( callback )).toString ('base64'))

        
        this.callbackPool.set ( callback.uuid, CallBack )
        return worker.postMessage ( kk, [ kk.buffer ] )

    }
}

module view_layout {
    export class view {
        public connectInformationMessage = new connectInformationMessage( '/' )
        public sectionLogin = ko.observable ( false )
        public sectionAgreement = ko.observable ( false )
        public sectionWelcome = ko.observable ( true )
        public isFreeUser = ko.observable ( true )
        public QTTransferData = ko.observable ( false )
        public LocalLanguage = 'up'
        public menu = Menu
        public modalContent = ko.observable ('')
        public keyPairGenerateForm: KnockoutObservable< keyPairGenerateForm> = ko.observable ()
        public tLang = ko.observable ( initLanguageCookie ())
        public languageIndex = ko.observable ( lang [ this.tLang() ])
        public localServerConfig = ko.observable ()
        public keyPair: KnockoutObservable < keypair > = ko.observable ( InitKeyPair ())
        public hacked = ko.observable ( false )
        public imapSetup: KnockoutObservable < imapForm > = ko.observable ()
        public showIconBar = ko.observable ( false )
        public connectToCoNET = ko.observable ( false )
        public connectedCoNET = ko.observable ( false )
        public showKeyPair = ko.observable ( false )
        public CoNETConnectClass: CoNETConnect = null
        public imapFormClass: imapForm = null
        public CoNETConnect: KnockoutObservable < CoNETConnect > = ko.observable ( null )
		public bodyBlue = ko.observable ( true )
        public CanadaBackground = ko.observable ( false )
        public password = null
        /*
        public worker = new workerManager ([
            'mHtml2Html'
        ])
		*/
		public keyPairCalss: encryptoClass = null

        public appsManager: KnockoutObservable< appsManager > = ko.observable ( null )
        public AppList = ko.observable ( false )

        public imapData: IinputData = null
        public newVersion = ko.observable ( null )
		public showLanguageSelect = ko.observable ( true )
		private demoTimeout
		private demoMainElm
        /*************************************
         * 
         *          for New York Times
         */
        public nytSection = ko.observable ( false )
        public nytloader = ko.observable ( true )
        public iframShow = ko.observable ( false )
        public nyt_news = ko.observable ( false )
        public nyt_detail = ko.observable ( false )
        public nyt_menu = ko.observable ( false )
        /*** */
		
        private afterInitConfig ( ) {
            
            this.keyPair ( this.localServerConfig ().keypair )
            if ( this.keyPair() && this.keyPair().keyPairPassword() &&  typeof this.keyPair().keyPairPassword().inputFocus ==='function' ) {
				this.keyPair().keyPairPassword().inputFocus ( true )
				this.sectionLogin ( false )
            }
        }

        
    
        private initConfig ( config ) {
            const self = this
            this.showKeyPair ( true )
            if ( config && config.keypair && config.keypair.publicKeyID ) {
                /**
                 * 
                 *      Key pair ready
                 * 
                 */
				
                makeKeyPairData ( this, config.keypair )
                if ( ! config.keypair.passwordOK ) {
                    config.keypair.showLoginPasswordField ( true )
                }
                this.localServerConfig ( config )
                return this.afterInitConfig ()
                
                //this.keyPairGenerateForm ( _keyPairGenerateForm )
                
            }
            
            /**
             * 
             *      No key pair
             * 
             */
            this.svgDemo_showLanguage ()
            config["account"] = config["keypair"] = null
            
            let _keyPairGenerateForm =  new keyPairGenerateForm (( _keyPair: keypair ) => {
                self.keyPairGenerateForm ( _keyPairGenerateForm = null )
                /**
                 *      key pair ready
                 */
                self.showKeyPair ( false )
                self.password = _keyPair._password
                _keyPair._password = null
                config.account = _keyPair.email
                config.keypair = _keyPair
                localStorage.setItem ( "config", JSON.stringify ( config ))
                _keyPair.passwordOK = true
                
                //self.localServerConfig ( config )
                self.keyPair ( _keyPair )
                return self.keyPairCalss = new encryptoClass ( _keyPair, self.password, self.connectInformationMessage, err => {
                    self.showKeyPair ( false )
        
                    
                    let uu = null
                    return self.imapSetup ( uu = new imapForm ( _keyPair.email, self.keyPairCalss.imapData, function ( imapData: IinputData ) {
                        self.imapSetup ( uu = null )
                        self.keyPairCalss.imapData = imapData
                        return self.keyPairCalss.saveImapIInputData ( err => {
                            return self.imapSetupClassExit ( imapData )
                        })
                    }))
                })
                //initPopupArea ()
                

            })
            this.localServerConfig ( config )
            this.afterInitConfig ()
            this.keyPairGenerateForm ( _keyPairGenerateForm )
            
        }


        private getConfigFromLocalStorage () {
            const configStr = localStorage.getItem ( "config" )
            if (!configStr ) {
                return this.initConfig ( {} )
            }
            let config = null
            try {
                config = JSON.parse ( configStr )
            } catch ( ex ) {
                return this.initConfig ( {} )
            }
            
            return this.initConfig ( config )
            
        }
    
        private socketListen () {
            let self = this
            return this.getConfigFromLocalStorage ()
            
        }
    
        constructor () {
            this.socketListen ()
            this.CanadaBackground.subscribe ( val => {
				if ( val ) {
					$.ajax ({
						url:'/scripts/CanadaSvg.js'

					}).done ( data => {
						eval ( data )
					})
				}
			})
			
        }
        
        //          change language
        public selectItem ( that?: any, site?: () => number ) {
			
            const tindex = lang [ this.tLang ()]
            let index =  tindex + 1
            if ( index > 3 ) {
                index = 0
            }
    
            this.languageIndex ( index )
            this.tLang( lang [ index ])
            $.cookie ( 'langEH', this.tLang(), { expires: 180, path: '/' })
            const obj = $( "span[ve-data-bind]" )
            
            obj.each ( function ( index, element ) {
                
                const ele = $( element )
                const data = ele.attr ( 've-data-bind' )
                if ( data && data.length ) {
                    ele.text ( eval ( data ))
                }
            })
            
            $('.languageText').shape (`flip ${ this.LocalLanguage }`)
            $('.KnockoutAnimation').transition('jiggle')
            return initPopupArea()
        }
        //          start click
        public openClick () {

			clearTimeout ( this.demoTimeout )
			if ( this.demoMainElm && typeof this.demoMainElm.remove === 'function' ) {
				this.demoMainElm.remove()
				this.demoMainElm = null
            }
            
            if ( !this.connectInformationMessage.socketIoOnline ) {
                return this.connectInformationMessage.showSystemError ()
            }
            
			this.sectionWelcome ( false )
			/*
            if ( this.localServerConfig().firstRun ) {
                return this.sectionAgreement ( true )
			}
            */
            
            this.sectionLogin ( true )
            return initPopupArea ()
            /*
            setTimeout (() => {
                this.nytloader ( false )
            }, 3000 )
           
           
           new Date().toDateString
           this.nyt_menu ( true )
            return this.nytSection ( true )
            */
            
        }

        public deletedKeypairResetView () {
            this.imapSetup (null)
            
        }
    
        public agreeClick () {
            
            this.connectInformationMessage.sockEmit ( 'agreeClick' )
            this.sectionAgreement ( false )
            this.localServerConfig().firstRun = false
            return this.openClick()
            
        }

        public refresh () {
            if ( typeof require === 'undefined' ) {
                this.modalContent ( infoDefine[ this.languageIndex() ].emailConform.formatError [ 11 ] )
                return this.hacked ( true )
            }
            const { remote } = require ('electron')
            if ( remote && remote.app && typeof remote.app.quit === 'function' ) {
                return remote.app.quit()
            }
            
        }

        public showKeyInfoClick () {
            this.sectionLogin ( true )
            this.showKeyPair ( true )
            this.AppList ( false )
            this.appsManager ( null )
        }

        public imapSetupClassExit ( _imapData: IinputData ) {
            const self = this
            this.imapData = _imapData
            return this.CoNETConnect ( this.CoNETConnectClass = new CoNETConnect ( this, this.keyPair().verified, ( err ) => {
                if ( typeof err ==='number' && err > -1 ) {
                    self.CoNETConnect ( this.CoNETConnectClass = null )
                    return self.imapSetup ( this.imapFormClass = new imapForm ( _imapData.account, null, function ( imapData: IinputData ) {
                        self.imapSetup ( this.imapFormClass = null )
                        return self.imapSetupClassExit ( imapData )
                    }))
                    
                    
                    
                }
                self.connectedCoNET ( true )
				self.homeClick ()
				
            }))

        }

        public reFreshLocalServer () {
            location.reload()

        }

        public homeClick () {
			this.AppList ( true )
			this.sectionLogin ( false )
			const connectMainMenu = () => {
				let am = null
				this.appsManager ( am = new appsManager (() => {
					am = null
					return connectMainMenu ()
				}))
				
			}
            connectMainMenu ()
            this.showKeyPair ( false )
            $('.dimmable').dimmer ({ on: 'hover' })
            $('.comeSoon').popup ({
                on: 'focus',
                movePopup: false,
                position: 'top left',
                inline: true
			})
			_view.connectInformationMessage.socketIo.removeEventListener ('tryConnectCoNETStage', this.CoNETConnectClass.listenFun )
		}

		/**
		 * 
		 * 		T/t = Translate (t is relative, T is absolute) R/r = rotate(r is relative, R is absolute) S/s = scale(s is relative, S is absolute)
		 */
		
		private svgDemo_showLanguage () {
			if ( !this.sectionWelcome()) {
				return
			}
			let i = 0
			const changeLanguage = () => {
				if ( ++i === 1 ) {
					backGround_mask_circle.attr ({
						stroke: "#FF000090",
					})
					return setTimeout (() => {
						changeLanguage()
					}, 1000 )
				}
				if ( i > 5 || !this.sectionWelcome() ) {
					main.remove()
					return this.demoMainElm = main = null
				}
				this.selectItem ()
				this.demoTimeout = setTimeout (() => {
					changeLanguage ()
				}, 2000 )
			}

			const width = window.innerWidth
			const height = window.outerHeight
			let main = this.demoMainElm = Snap( width, height )
			
			const backGround_mask_circle = main.circle( width / 2, height / 2, width / 1.7 ).attr({
				fill:'#00000000',
				stroke: "#FF000020",
				strokeWidth: 5,
			})

			const wT = width/2 - 35
			const wY = 30 - height / 2
			backGround_mask_circle.animate ({
				transform: `t${ wT } ${ wY }`,
				r: 60
			}, 3000, mina.easeout, changeLanguage )

		}
    }
}

const _view = new view_layout.view ()

ko.applyBindings ( _view , document.getElementById ( 'body' ))
$(`.${ _view.tLang()}`).addClass ('active')
openpgp.config.indutny_elliptic_path = 'lightweight/elliptic.min.js'
window[`${ "indexedDB" }`] = window.indexedDB || window["mozIndexedDB"] || window["webkitIndexedDB"] || window["msIndexedDB"]
const CoNET_version = "0.1.10"