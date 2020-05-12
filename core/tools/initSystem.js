"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.CoNET_version = '0.1.8';
const Fs = require("fs");
const Path = require("path");
const Os = require("os");
const Async = require("async");
const OpenPgp = require("openpgp");
const Http = require("http");
const Https = require("https");
const Net = require("net");
const Nodemailer = require("nodemailer");
const Url = require("url");
/**
 * 		define
 */
const InitKeyPair = () => {
    const keyPair = {
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
    };
    return keyPair;
};
exports.checkUrl = (url) => {
    const urlCheck = Url.parse(url);
    const ret = /^http:|^https:$/.test(urlCheck.protocol) && !/^localhost|^127.0.0.1/.
        test(urlCheck.hostname);
    if (ret) {
        return true;
    }
    return false;
};
exports.QTGateFolder = Path.join(!/^android$/i.test(process.platform) ? Os.homedir() : Path.join(__dirname, "../../../../.."), '.CoNET');
exports.QTGateLatest = Path.join(exports.QTGateFolder, 'latest');
exports.QTGateTemp = Path.join(exports.QTGateFolder, 'tempfile');
exports.QTGateVideo = Path.join(exports.QTGateTemp, 'videoTemp');
exports.ErrorLogFile = Path.join(exports.QTGateFolder, 'systemError.log');
exports.CoNETConnectLog = Path.join(exports.QTGateFolder, 'CoNETConnect.log');
exports.imapDataFileName1 = Path.join(exports.QTGateFolder, 'imapData.pem');
exports.CoNET_Home = Path.join(__dirname);
exports.LocalServerPortNumber = 3000;
exports.configPath = Path.join(exports.QTGateFolder, 'config.json');
//const packageFilePath = Path.join ( __dirname,'package.json')
//export const packageFile = require ( packageFilePath )
exports.QTGateSignKeyID = /3acbe3cbd3c1caa9|864662851231B119/i;
exports.twitterDataFileName = Path.join(exports.QTGateFolder, 'twitterData.pem');
exports.checkFolder = (folder, CallBack) => {
    Fs.access(folder, err => {
        if (err) {
            return Fs.mkdir(folder, err1 => {
                if (err1) {
                    return CallBack(err1);
                }
                return CallBack();
            });
        }
        return CallBack();
    });
};
exports.convertByte = (byte) => {
    if (byte < 1000) {
        return `${byte} B`;
    }
    const kbyte = Math.round(byte / 10.24) / 100;
    if (kbyte < 1000) {
        return `${kbyte} KB`;
    }
    const mbyte = Math.round(kbyte / 10) / 100;
    if (mbyte < 1000) {
        return `${mbyte} MB`;
    }
    const gbyte = Math.round(mbyte / 10) / 100;
    if (gbyte < 1000) {
        return `${gbyte} GB`;
    }
    const tbyte = Math.round(mbyte / 10) / 100;
    return `${tbyte} TB`;
};
exports.getLocalInterface = () => {
    const ifaces = Os.networkInterfaces();
    const ret = [];
    Object.keys(ifaces).forEach(n => {
        ifaces[n].forEach(iface => {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }
            ret.push(iface.address);
        });
    });
    return ret;
};
exports.getNickName = (str) => {
    const uu = str.split('<');
    return uu[0];
};
exports.getEmailAddress = (str) => {
    const uu = str.split('<');
    return uu[1].substr(0, uu[1].length - 1);
};
exports.getQTGateSign = (user) => {
    if (!user.otherCertifications || !user.otherCertifications.length) {
        return null;
    }
    let Certification = false;
    user.otherCertifications.forEach(n => {
        //console.log (`user.otherCertifications\n${ n.issuerKeyId.toHex ().toLowerCase() }`)
        if (exports.QTGateSignKeyID.test(n.issuerKeyId.toHex().toLowerCase())) {
            return Certification = true;
        }
    });
    return Certification;
};
exports.getKeyPairInfo = async (publicKey, privateKey, password, CallBack) => {
    if (!publicKey || !privateKey) {
        return CallBack(new Error('publicKey or privateKey empty!'));
    }
    const _privateKey = await OpenPgp.key.readArmored(privateKey);
    const _publicKey = await OpenPgp.key.readArmored(publicKey);
    if (_privateKey.err || _publicKey.err) {
        console.log(`_privateKey.err = [${_privateKey.err}], _publicKey.err [${_publicKey.err}]`);
        console.log(publicKey);
        return CallBack(new Error('no key'));
    }
    //console.log (`getKeyPairInfo success!\nprivateKey\npublicKey`)
    const privateKey1 = _privateKey.keys[0];
    const publicKey1 = _publicKey.keys;
    const user = publicKey1[0].users[0];
    const ret = InitKeyPair();
    let didCallback = false;
    ret.publicKey = publicKey;
    ret.privateKey = privateKey;
    ret.nikeName = exports.getNickName(user.userId.userid);
    ret.createDate = privateKey1.primaryKey.created.toDateString();
    ret.email = exports.getEmailAddress(user.userId.userid);
    ret.verified = exports.getQTGateSign(user);
    ret.publicKeyID = publicKey1[0].primaryKey.getFingerprint().toUpperCase();
    ret.passwordOK = false;
    if (!password) {
        return CallBack(null, ret);
    }
    //console.log (`getKeyPairInfo test password!`)
    return privateKey1.decrypt(password).then(keyOK => {
        //console.log (`privateKey1.decrypt then keyOK [${ keyOK }] didCallback [${ didCallback }]`)
        ret.passwordOK = keyOK;
        ret._password = password;
        didCallback = true;
        return CallBack(null, ret);
    }).catch(err => {
        console.log(`privateKey1.decrypt catch ERROR didCallback = [${didCallback}]`, err);
        if (!didCallback) {
            return CallBack(null, ret);
        }
    });
};
exports.getPublicKeyInfo = (publicKey, CallBack) => {
    return OpenPgp.key.readArmored(publicKey).then(_key => {
        const key = _key.keys[0];
        const user = key.users[0];
        const ret = {
            nikeName: exports.getNickName(user.userId.userid),
            email: exports.getEmailAddress(user.userId.userid),
            keyID: key.primaryKey.getFingerprint().toUpperCase(),
            otherValid: user.otherCertifications.map(n => { return n.issuerKeyId.toHex().toUpperCase(); }),
            KloakValid: exports.getQTGateSign(user),
            publicKeys: _key.keys
        };
        return CallBack(null, ret);
    }).catch(ex => {
        return CallBack(ex);
    });
};
exports.emitConfig = (config, passwordOK) => {
    if (!config) {
        return null;
    }
    const ret = {
        keypair: config.keypair,
        firstRun: config.firstRun,
        alreadyInit: config.alreadyInit,
        newVerReady: config.newVerReady,
        version: exports.CoNET_version,
        multiLogin: config.multiLogin,
        freeUser: config.freeUser,
        account: config.keypair && config.keypair.email ? config.keypair.email : null,
        serverGlobalIpAddress: config.serverGlobalIpAddress,
        serverPort: config.serverPort,
        connectedQTGateServer: config.connectedQTGateServer,
        localIpAddress: exports.getLocalInterface(),
        lastConnectType: config.lastConnectType,
        iterations: config.iterations,
        connectedImapDataUuid: config.connectedImapDataUuid
    };
    ret.keypair.passwordOK = false;
    return ret;
};
exports.saveConfig = (config, CallBack) => {
    return Fs.writeFile(exports.configPath, JSON.stringify(config), CallBack);
};
exports.newKeyPair = (emailAddress, nickname, password, CallBack) => {
    const userId = {
        name: nickname,
        email: emailAddress
    };
    const option = {
        passphrase: password,
        userIds: [userId],
        curve: "ed25519",
        aead_protect: true,
        aead_protect_version: 4
    };
    return OpenPgp.generateKey(option).then(async (keypair) => {
        const ret = {
            publicKey: await (OpenPgp.key.readArmored(keypair.publicKeyArmored)),
            privateKey: await (OpenPgp.key.readArmored(keypair.privateKeyArmored)),
            public: keypair.publicKeyArmored
        };
        await ret.privateKey.keys[0].decrypt(password);
        ret.publicKey = ret.publicKey.keys;
        ret.privateKey = ret.privateKey.keys;
        return CallBack(null, ret);
    }).catch(err => {
        // ERROR
        return CallBack(err);
    });
};
exports.getImapSmtpHost = function (_email) {
    const email = _email.toLowerCase();
    const yahoo = (domain) => {
        if (/yahoo.co.jp$/i.test(domain))
            return 'yahoo.co.jp';
        if (/((.*\.){0,1}yahoo|yahoogroups|yahooxtra|yahoogruppi|yahoogrupper)(\..{2,3}){1,2}$/.test(domain))
            return 'yahoo.com';
        if (/(^hotmail|^outlook|^live|^msn)(\..{2,3}){1,2}$/.test(domain))
            return 'hotmail.com';
        if (/^(me|^icould|^mac)\.com/.test(domain))
            return 'me.com';
        return domain;
    };
    const emailSplit = email.split('@');
    if (emailSplit.length !== 2)
        return null;
    const domain = yahoo(emailSplit[1]);
    const ret = {
        imap: 'imap.' + domain,
        smtp: 'smtp.' + domain,
        SmtpPort: [465, 587, 994],
        ImapPort: 993,
        imapSsl: true,
        smtpSsl: true,
        haveAppPassword: false,
        ApplicationPasswordInformationUrl: ['']
    };
    switch (domain) {
        //		yahoo domain have two different 
        //		the yahoo.co.jp is different other yahoo.*
        case 'yahoo.co.jp':
            {
                ret.imap = 'imap.mail.yahoo.co.jp';
                ret.smtp = 'smtp.mail.yahoo.co.jp';
            }
            break;
        //			gmail
        case 'google.com':
        case 'googlemail.com':
        case 'gmail':
            {
                ret.haveAppPassword = true;
                ret.ApplicationPasswordInformationUrl = [
                    'https://support.google.com/accounts/answer/185833?hl=zh-Hans',
                    'https://support.google.com/accounts/answer/185833?hl=ja',
                    'https://support.google.com/accounts/answer/185833?hl=en'
                ];
            }
            break;
        case 'gandi.net':
            ret.imap = ret.smtp = 'mail.gandi.net';
            break;
        //				yahoo.com
        case 'rocketmail.com':
        case 'y7mail.com':
        case 'ymail.com':
        case 'yahoo.com':
            {
                ret.imap = 'imap.mail.yahoo.com';
                ret.smtp = (/^bizmail.yahoo.com$/.test(emailSplit[1]))
                    ? 'smtp.bizmail.yahoo.com'
                    : 'smtp.mail.yahoo.com';
                ret.haveAppPassword = true;
                ret.ApplicationPasswordInformationUrl = [
                    'https://help.yahoo.com/kb/SLN15241.html',
                    'https://help.yahoo.com/kb/SLN15241.html',
                    'https://help.yahoo.com/kb/SLN15241.html'
                ];
            }
            break;
        case 'mail.ee':
            ret.smtp = 'mail.ee';
            ret.imap = 'mail.inbox.ee';
            break;
        //		gmx.com
        case 'gmx.co.uk':
        case 'gmx.de':
        case 'gmx.us':
        case 'gmx.com':
            {
                ret.smtp = 'mail.gmx.com';
                ret.imap = 'imap.gmx.com';
            }
            break;
        //		aim.com
        case 'aim.com':
            {
                ret.imap = 'imap.aol.com';
            }
            break;
        //	outlook.com
        case 'windowslive.com':
        case 'hotmail.com':
        case 'outlook.com':
            {
                ret.imap = 'imap-mail.outlook.com';
                ret.smtp = 'smtp-mail.outlook.com';
            }
            break;
        //			apple mail
        case 'icloud.com':
        case 'mac.com':
        case 'me.com':
            {
                ret.imap = 'imap.mail.me.com';
                ret.smtp = 'smtp.mail.me.com';
            }
            break;
        //			163.com
        case '126.com':
        case '163.com':
            {
                ret.imap = 'appleimap.' + domain;
                ret.smtp = 'applesmtp.' + domain;
            }
            break;
        case 'sina.com':
        case 'yeah.net':
            {
                ret.smtpSsl = false;
            }
            break;
    }
    return ret;
};
exports.availableImapServer = /imap\-mail\.outlook\.com$|imap\.mail\.yahoo\.(com|co\.jp|co\.uk|au)$|imap\.mail\.me\.com$|imap\.gmail\.com$|gmx\.(com|us|net)$|imap\.zoho\.com$/i;
const doUrl = (url, CallBack) => {
    let ret = '';
    const res = res => {
        res.on('data', (data) => {
            ret += data.toString('utf8');
        });
        res.once('end', () => {
            return CallBack(null, ret);
        });
    };
    if (/^https/.test(url))
        return Https.get(url, res)
            .once('error', err => {
            console.log('on err ', err);
            return CallBack(err);
        });
    return Http.get(url, res)
        .once('error', err => {
        console.log('on err ', err);
        return CallBack(err);
    });
};
const _smtpVerify = (imapData, CallBack) => {
    const option = {
        host: Net.isIP(imapData.smtpServer) ? null : imapData.smtpServer,
        hostname: Net.isIP(imapData.smtpServer) ? imapData.smtpServer : null,
        port: imapData.smtpPortNumber,
        secure: imapData.smtpSsl,
        auth: {
            user: imapData.smtpUserName,
            pass: imapData.smtpUserPassword
        },
        connectionTimeout: (1000 * 15).toString(),
        tls: {
            rejectUnauthorized: imapData.smtpIgnoreCertificate,
            ciphers: imapData.ciphers
        },
        debug: true
    };
    const transporter = Nodemailer.createTransport(option);
    return transporter.verify(CallBack);
    //DEBUG ? saveLog ( `transporter.verify callback [${ JSON.stringify ( err )}] success[${ success }]` ) : null
    /*
    if ( err ) {
        const _err = JSON.stringify ( err )
        if ( /Invalid login|AUTH/i.test ( _err ))
            return CallBack ( 8 )
        if ( /certificate/i.test ( _err ))
            return CallBack ( 9 )
        return CallBack ( 10 )
    }

    return CallBack()
    */
};
exports.smtpVerify = (imapData, CallBack) => {
    console.log(`doing smtpVerify!`);
    let testArray = null;
    let _ret = false;
    let err1 = null;
    if (typeof imapData.smtpPortNumber === 'object') {
        testArray = imapData.smtpPortNumber.map(n => {
            const ret = JSON.parse(JSON.stringify(imapData));
            ret.smtpPortNumber = n;
            ret.ciphers = null;
            return ret;
        });
    }
    else {
        testArray = [imapData];
    }
    testArray = testArray.concat(testArray.map(n => {
        const ret = JSON.parse(JSON.stringify(n));
        ret.ciphers = 'SSLv3';
        ret.smtpSsl = false;
        return ret;
    }));
    return Async.each(testArray, (n, next) => {
        return _smtpVerify(n, (err, success) => {
            if (err && err.message) {
                if (/Invalid login|AUTH/i.test(err.message)) {
                    return next(err);
                }
                return next();
            }
            console.log(success);
            if (!_ret) {
                _ret = true;
                imapData.smtpPortNumber = n.smtpPortNumber;
                imapData.smtpSsl = n.smtpSsl;
                imapData.ciphers = n.ciphers;
                return CallBack();
            }
        });
    }, (err) => {
        if (err) {
            console.log(`smtpVerify ERROR = [${err.message}]`);
            return CallBack(err);
        }
        if (!_ret) {
            console.log(`smtpVerify success Async!`);
            return CallBack();
        }
        console.log(`smtpVerify already did CallBack!`);
    });
};
exports.encryptMessage = (publickeys, privatekeys, message, CallBack) => {
    const option = {
        privateKeys: privatekeys,
        publicKeys: publickeys,
        message: OpenPgp.message.fromText(message),
        compression: OpenPgp.enums.compression.zip
    };
    return OpenPgp.encrypt(option).then(ciphertext => {
        return CallBack(null, ciphertext.data);
    }).catch(CallBack);
};
async function decryptoMessage(publickeys, privatekeys, message, CallBack) {
    const option = {
        privateKeys: privatekeys,
        publicKeys: publickeys,
        message: await OpenPgp.message.readArmored(message)
    };
    return OpenPgp.decrypt(option).then(async (data) => {
        /**
         * 		verify signatures
         */
        if (data.signatures[0].valid) {
            return CallBack(null, data.data);
        }
        return CallBack(new Error('signatures error!'));
    }).catch(err => {
        return CallBack(err);
    });
}
exports.decryptoMessage = decryptoMessage;
const testSmtpAndSendMail = (imapData, CallBack) => {
    let first = false;
    if (typeof imapData === 'object') {
        first = true;
    }
    return exports.smtpVerify(imapData, err => {
        if (err) {
            if (first) {
                imapData.imapPortNumber = [25, 465, 587, 994, 2525];
                return exports.smtpVerify(imapData, CallBack);
            }
            return CallBack(err);
        }
        return CallBack();
    });
};
exports.sendCoNETConnectRequestEmail = (imapData, toEmail, message, CallBack) => {
    return Async.waterfall([
        next => testSmtpAndSendMail(imapData, next),
        next => {
            const option = {
                host: Net.isIP(imapData.smtpServer) ? null : imapData.smtpServer,
                hostname: Net.isIP(imapData.smtpServer) ? imapData.smtpServer : null,
                port: imapData.smtpPortNumber,
                secure: imapData.smtpSsl,
                auth: {
                    user: imapData.smtpUserName,
                    pass: imapData.smtpUserPassword
                },
                connectionTimeout: (1000 * 15).toString(),
                tls: !imapData.smtpSsl ? {
                    rejectUnauthorized: imapData.smtpIgnoreCertificate,
                    ciphers: imapData.ciphers
                } : null,
                debug: true
            };
            const transporter = Nodemailer.createTransport(option);
            //console.log ( Util.inspect ( option ))
            const mailOptions = {
                from: imapData.smtpUserName,
                to: toEmail,
                subject: 'node',
                attachments: [{
                        content: message
                    }]
            };
            return transporter.sendMail(mailOptions, next);
        }
    ], CallBack);
};
