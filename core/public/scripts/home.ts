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
module view_layout {
	export class view {
		constructor () {

		}
		public LocalLanguage = 'up'
		public menu = Menu
		public tLang = ko.observable ( initLanguageCookie ())
		public languageIndex = ko.observable ( lang [ this.tLang() ])
		public selectItem = ( that: any, site: () => number ) => {

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
                const self = this
                const ele = $( element )
                const data = ele.attr ( 've-data-bind' )
                if ( data && data.length ) {
                    ele.text ( eval ( data ))
                }
            })
            
            $('.languageText').shape (`flip ${ this.LocalLanguage }`)
            return $('.KnockoutAnimation').transition('jiggle')
        }
	}
}
const view = new view_layout.view ()
ko.applyBindings ( view , document.getElementById ( 'body' ))
$(`.${view.tLang()}`).addClass('active')