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
const socketIo = io ({ reconnectionAttempts: 5, timeout: 1000 })

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
        public keyPairGenerateForm: KnockoutObservable< keyPairGenerateForm> = ko.observable ()
		public tLang = ko.observable ( initLanguageCookie ())
        public languageIndex = ko.observable ( lang [ this.tLang() ])
        public localServerConfig: KnockoutObservable < install_config > = ko.observable ()
        public keyPair: KnockoutObservable < keypair > = ko.observable (InitKeyPair())
		constructor () {
            socketIo.emit ( 'init', ( config: install_config ) => {

                if ( config.keypair && config.keypair.publicKeyID ) {
                    const length = config.keypair.publicKeyID.length
                    config.keypair.publicKeyID = config.keypair.publicKeyID.substr ( length - 8 ).toUpperCase()
                    config.keypair.publicKeyID = `${ config.keypair.publicKeyID.substr (0, 4 ) } ${ config.keypair.publicKeyID.substr (4) }`
                } else {
                    config.keypair = null
                    this.keyPairGenerateForm ( new keyPairGenerateForm())
                }
                this.localServerConfig ( config )
                this.keyPair ( this.localServerConfig ().keypair )
                return this.isFreeUser ( this.localServerConfig().freeUser )

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
            return this.sectionLogin ( true )
        }

        public agreeClick () {
            this.sectionAgreement ( false )
            socketIo.emit ( 'agreeClick' )
            this.localServerConfig().firstRun = false
            return this.openClick()
        }
        public showUserDetail () {

        }
	}
}
const view = new view_layout.view ()

ko.applyBindings ( view , document.getElementById ( 'body' ))
$(`.${view.tLang()}`).addClass('active')
