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
var view_layout;
(function (view_layout) {
    class view {
        constructor() {
            this.LocalLanguage = 'up';
            this.menu = Menu;
            this.tLang = ko.observable(initLanguageCookie());
            this.languageIndex = ko.observable(lang[this.tLang()]);
            this.selectItem = (that, site) => {
                const tindex = lang[this.tLang()];
                let index = tindex + 1;
                if (index > 3) {
                    index = 0;
                }
                this.languageIndex(index);
                this.tLang(lang[index]);
                $.cookie('langEH', this.tLang(), { expires: 180, path: '/' });
                const obj = $("span[ve-data-bind]");
                obj.each((index, element) => {
                    const self = this;
                    const ele = $(element);
                    const data = ele.attr('ve-data-bind');
                    if (data && data.length) {
                        ele.text(eval(data));
                    }
                });
                $('.languageText').shape(`flip ${this.LocalLanguage}`);
                return $('.KnockoutAnimation').transition('jiggle');
            };
        }
    }
    view_layout.view = view;
})(view_layout || (view_layout = {}));
const view = new view_layout.view();
ko.applyBindings(view, document.getElementById('body'));
$(`.${view.tLang()}`).addClass('active');
