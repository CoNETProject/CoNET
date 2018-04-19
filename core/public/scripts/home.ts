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

const socketIo = io ({ reconnectionAttempts: 5, timeout: 500 })

module view_layout {
    
	export class view {
        public sectionLogin = ko.observable ( false )
        public sectionAgreement = ko.observable ( false )
        public sectionWelcome = ko.observable ( true )
        public isFreeUser = ko.observable ( true )
        public QTTransferData = ko.observable ( false )
        public keyPair_delete_btn_view = ko.observable ( false )
        public LocalLanguage = 'up'
        public menu = Menu
        public CoNETLocalServerError = ko.observable ( false )
        public modalContent = ko.observable ('')
        public keyPairGenerateForm: KnockoutObservable< keyPairGenerateForm> = ko.observable ()
		public tLang = ko.observable ( initLanguageCookie ())
        public languageIndex = ko.observable ( lang [ this.tLang() ])
        public localServerConfig: KnockoutObservable < install_config > = ko.observable ()
        public keyPair: KnockoutObservable < keypair > = ko.observable (InitKeyPair())
        public hacked = ko.observable ( false )
        private systemError () {
            this.modalContent ( infoDefine[ this.languageIndex() ].emailConform.formatError [ 10 ] )
            $( '#CoNETError').modal ('setting', 'closable', false ).modal ( 'show' )
            return this.CoNETLocalServerError ( true )
        }

        private initConfig ( config: install_config ) {
            if ( config.keypair && config.keypair.publicKeyID ) {
                const keypair = config.keypair
                const length = keypair.publicKeyID.length
                keypair.publicKeyID = keypair.publicKeyID.substr ( length - 8 ).toUpperCase()
                keypair.publicKeyID = `${ keypair.publicKeyID.substr (0, 4 ) } ${ keypair.publicKeyID.substr (4) }`
                let keyPairPasswordClass = new keyPairPassword (() => {
                    keypair.keyPairPassword ( keyPairPasswordClass = null )
                    keypair.showLoginPasswordField ( false )
                })
                keypair.keyPairPassword = ko.observable( keyPairPasswordClass )
                keypair.showLoginPasswordField = ko.observable ( false )
                keypair.delete_btn_view = ko.observable ( true )
                keypair.showConform = ko.observable ( false )
                keypair.delete_btn_click = () => {
                    keypair.delete_btn_view ( false )
                    return keypair.showConform ( true )
                }

                keypair.showLoginPasswordFieldClick = () => {
                    keypair.showLoginPasswordField ( !keypair.showLoginPasswordField ())
                    return keypair.keyPairPassword().inputFocus( keypair.showLoginPasswordField ())
                }
                
                keypair.deleteKeyPairNext = () => {
                    socketIo.emit ( 'deleteKeyPairNext' )
                    return keypair.delete_btn_view ( false )
                }
                socketIo.on ( 'deleteKeyPairNoite', () => {
                    return keypair.showDeleteKeyPairNoite ( true )
                })

                keypair.showDeleteKeyPairNoite = ko.observable ( false )

            } else {
                config.keypair = null
                let _keyPairGenerateForm =  new keyPairGenerateForm (() => {
                    return this.keyPairGenerateForm ( _keyPairGenerateForm = null )
                })
                this.keyPairGenerateForm ( _keyPairGenerateForm )
            }
            this.localServerConfig ( config )
            this.keyPair ( this.localServerConfig ().keypair )
            
            return this.isFreeUser ( this.localServerConfig().freeUser )
        }

		constructor () {

            socketIo.once ( 'reconnect_failed', err => {
                if ( this.CoNETLocalServerError ()) {
                    return
                }
                return this.systemError()
            })

            
            socketIo.once ( 'CoNET_systemError', () => {
                return this.systemError ()
            })

            socketIo.on ( 'init', ( config: install_config ) => {
                return this.initConfig ( config )
            })

            socketIo.emit ( 'init', ( config: install_config ) => {
                return this.initConfig ( config )
            })

            
        }
        
		
		public selectItem ( that: any, site: () => number ) {

            const tindex = lang [ this.tLang ()]
            let index =  tindex + 1
            if ( index > 3 ) {
                index = 0
            }

            this.languageIndex ( index )
            this.tLang( lang [ index ])
            $.cookie ( 'langEH', this.tLang(), { expires: 180, path: '/' })
            const obj = $( "span[ve-data-bind]" )
            
            obj.each (( index, element ) => {
                
                const ele = $( element )
                const data = ele.attr ( 've-data-bind' )
                if ( data && data.length ) {
                    ele.text ( eval ( data ))
                }
            })
            
            $('.languageText').shape (`flip ${ this.LocalLanguage }`)
            return $('.KnockoutAnimation').transition('jiggle')
        }

        public openClick () {
            this.sectionWelcome ( false )
            if ( this.localServerConfig().firstRun ) {
                return this.sectionAgreement ( true )
            }
            this.sectionLogin ( true )
            return $( '.activating.element' ).popup({
                on: 'focus',
                movePopup: false
            })
            
        }

        public agreeClick () {
            this.sectionAgreement ( false )
            socketIo.emit ( 'agreeClick' )
            this.localServerConfig().firstRun = false
            return this.openClick()
        }

        public showUserDetail () {
            
        }

        public exit () {
            if ( typeof require === 'undefined' ) {
                this.modalContent ( infoDefine[ this.languageIndex() ].emailConform.formatError [ 11 ] )
                return this.hacked ( true )
            }
            const { remote } = require ('electron')
            return remote.app.quit()
        }
	}
}
const view = new view_layout.view ()

ko.applyBindings ( view , document.getElementById ( 'body' ))
$(`.${view.tLang()}`).addClass('active')
