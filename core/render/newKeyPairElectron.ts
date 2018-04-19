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

import * as openpgp from 'openpgp'
openpgp.config.aead_protect = true
const { remote } = require ( "electron" )

const NewKeyPair = ( emailAddress, nickname, bitLength, password, CallBack ) => {
    
    const userId = {
        name: nickname,
        email: emailAddress
    }
    
    const option: openpgp.KeyOptions = {
        numBits: parseInt ( bitLength) || 2048,
        passphrase: password,
        userIds: [ userId ]
        
    }

    openpgp.generateKey ( option ).then (( keypair: { publicKeyArmored: string, privateKeyArmored: string }) => {
        
        const ret: keyPair = {
            publicKey: keypair.publicKeyArmored,
            privateKey: keypair.privateKeyArmored
		}
        return CallBack ( null, ret )
    }).catch ( err => {
		// ERROR
        return CallBack ( err )
    })
}

remote.getCurrentWindow().once ( 'firstCallBack', ( data: string[] ) => {

    return NewKeyPair ( data[0], data[1], data[2], data[3], ( err, _data ) => {
        
        if ( err ) {

            return remote.getCurrentWindow().emit ( 'firstCallBackFinished' )
        }

        remote.getCurrentWindow().emit ( 'firstCallBackFinished', _data )
    })
})

remote.getCurrentWindow().emit ( 'first' )