"use strict";
exports.__esModule = true;
/// <reference path="../CoNET.d.ts" />
var Fs = require("fs");
var Path = require("path");
var Os = require("os");
var Async = require("async");
var Crypto = require("crypto");
var OpenPgp = require("openpgp");
var Util = require("util");
/**
 * 		define
 */
var InitKeyPair = function () {
    var keyPair = {
        publicKey: null,
        privateKey: null,
        keyLength: null,
        nikeName: null,
        createDate: null,
        email: null,
        passwordOK: false,
        verified: false,
        publicKeyID: null
    };
    return keyPair;
};
exports.QTGateFolder = Path.join(!/^android$/i.test(process.platform) ? Os.homedir() : Path.join(__dirname, "../../../../.."), '.CoNET');
exports.QTGateLatest = Path.join(exports.QTGateFolder, 'latest');
exports.QTGateTemp = Path.join(exports.QTGateFolder, 'tempfile');
exports.QTGateVideo = Path.join(exports.QTGateTemp, 'videoTemp');
exports.ErrorLogFile = Path.join(exports.QTGateFolder, 'systemError.log');
exports.CoNET_Home = Path.join(__dirname);
exports.LocalServerPortNumber = 3000;
exports.configPath = Path.join(exports.QTGateFolder, 'config.json');
var packageFilePath = Path.join('..', '..', 'package.json');
exports.packageFile = require(packageFilePath);
exports.QTGateSignKeyID = /3acbe3cbd3c1caa9/i;
exports.checkFolder = function (folder, CallBack) {
    Fs.access(folder, function (err) {
        if (err) {
            return Fs.mkdir(folder, function (err1) {
                if (err1) {
                    return CallBack(err1);
                }
                return CallBack();
            });
        }
        return CallBack();
    });
};
exports.convertByte = function (byte) {
    if (byte < 1000) {
        return byte + " B";
    }
    var kbyte = Math.round(byte / 10.24) / 100;
    if (kbyte < 1000) {
        return kbyte + " KB";
    }
    var mbyte = Math.round(kbyte / 10) / 100;
    if (mbyte < 1000) {
        return mbyte + " MB";
    }
    var gbyte = Math.round(mbyte / 10) / 100;
    if (gbyte < 1000) {
        return gbyte + " GB";
    }
    var tbyte = Math.round(mbyte / 10) / 100;
    return tbyte + " TB";
};
exports.checkSystemFolder = function (CallBack) {
    var callback = function (err, kkk) {
        if (err) {
            console.log("checkSystemFolder return error", err);
            return CallBack(err);
        }
        console.log("checkSystemFolder QTGateFolder = [" + exports.QTGateFolder + "]");
        return CallBack();
    };
    return Async.series([
        function (next) { return exports.checkFolder(exports.QTGateFolder, next); },
        function (next) { return exports.checkFolder(exports.QTGateLatest, next); },
        function (next) { return exports.checkFolder(exports.QTGateTemp, next); },
        function (next) { return exports.checkFolder(exports.QTGateVideo, next); }
    ], callback);
};
exports.getLocalInterface = function () {
    var ifaces = Os.networkInterfaces();
    var ret = [];
    Object.keys(ifaces).forEach(function (n) {
        ifaces[n].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }
            ret.push(iface.address);
        });
    });
    return ret;
};
exports.InitConfig = function () {
    var ret = {
        firstRun: true,
        alreadyInit: false,
        multiLogin: false,
        version: exports.packageFile.version,
        newVersion: null,
        newVerReady: false,
        keypair: InitKeyPair(),
        salt: Crypto.randomBytes(64),
        iterations: 2000 + Math.round(Math.random() * 2000),
        keylen: Math.round(16 + Math.random() * 30),
        digest: 'sha512',
        freeUser: true,
        account: null,
        serverGlobalIpAddress: null,
        serverPort: exports.LocalServerPortNumber,
        connectedQTGateServer: false,
        localIpAddress: exports.getLocalInterface(),
        lastConnectType: 1,
        connectedImapDataUuid: null
    };
    return ret;
};
var getBitLength = function (key) {
    var algorithm = key.primaryKey.getAlgorithmInfo();
    return algorithm.bits;
};
var getKeyId = function (key) {
    var algorithm = key.primaryKey.getAlgorithmInfo();
    return algorithm.algorithm;
};
exports.getNickName = function (str) {
    var uu = str.split('<');
    return uu[0];
};
exports.getEmailAddress = function (str) {
    var uu = str.split('<');
    return uu[1].substr(0, uu[1].length - 1);
};
exports.getQTGateSign = function (user) {
    if (!user.otherCertifications || !user.otherCertifications.length) {
        return null;
    }
    var Certification = false;
    user.otherCertifications.forEach(function (n) {
        if (exports.QTGateSignKeyID.test(n.issuerKeyId.toHex().toLowerCase())) {
            return Certification = true;
        }
    });
    return Certification;
};
exports.getKeyPairInfo = function (publicKey, privateKey, password, CallBack) {
    if (!publicKey || !privateKey) {
        return CallBack(new Error('no key'));
    }
    var _privateKey = OpenPgp.key.readArmored(privateKey);
    var _publicKey = OpenPgp.key.readArmored(publicKey);
    if (_privateKey.err || _publicKey.err) {
        return CallBack(new Error('no key'));
    }
    var privateKey1 = _privateKey.keys[0];
    var publicKey1 = _publicKey.keys;
    var user = publicKey1[0].users[0];
    var ret = InitKeyPair();
    ret.publicKey = publicKey;
    ret.privateKey = privateKey;
    ret.keyLength = getBitLength(privateKey1);
    ret.nikeName = exports.getNickName(user.userId.userid);
    ret.createDate = privateKey1.primaryKey.created.toLocaleString();
    ret.email = exports.getEmailAddress(user.userId.userid);
    ret.verified = exports.getQTGateSign(user);
    ret.publicKeyID = publicKey1[0].primaryKey.fingerprint.toString('hex').toLocaleUpperCase();
    ret.passwordOK = false;
    if (!password) {
        return CallBack(null, ret);
    }
    return privateKey1.decrypt(password).then(function (keyOK) {
        ret.passwordOK = keyOK;
        return CallBack(null, ret);
    })["catch"](function () {
        return CallBack(null, ret);
    });
};
exports.emitConfig = function (config, passwordOK) {
    if (!config) {
        return null;
    }
    var ret = {
        keypair: config.keypair,
        firstRun: config.firstRun,
        alreadyInit: config.alreadyInit,
        newVerReady: config.newVerReady,
        version: config.version,
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
    return ret;
};
exports.saveConfig = function (config, CallBack) {
    return Fs.writeFile(exports.configPath, JSON.stringify(config), CallBack);
};
exports.checkConfig = function (CallBack) {
    Fs.access(exports.configPath, function (err) {
        if (err) {
            return CallBack(null, exports.InitConfig());
        }
        var config = null;
        try {
            config = require(exports.configPath);
        }
        catch (e) {
            return CallBack(null, exports.InitConfig());
        }
        config.salt = Buffer.from(config.salt['data']);
        //		update?
        config.version = exports.packageFile.version;
        config.newVerReady = false;
        config.newVersion = null;
        config.serverPort = exports.LocalServerPortNumber;
        config.localIpAddress = exports.getLocalInterface();
        if (!config.keypair || !config.keypair.publicKey) {
            return CallBack(null, config);
        }
        return exports.getKeyPairInfo(config.keypair.publicKey, config.keypair.privateKey, null, function (err, key) {
            if (err) {
                CallBack(err);
                return console.log("checkConfig getKeyPairInfo error", err);
            }
            console.log("getKeyPairInfo = [" + Util.inspect(key) + "]");
            config.keypair = key;
            return CallBack(null, config);
        });
    });
};
exports.newKeyPair = function (emailAddress, nickname, password, CallBack) {
    var userId = {
        name: nickname,
        email: emailAddress
    };
    var option = {
        passphrase: password,
        userIds: [userId],
        curve: "ed25519"
    };
    console.log(Util.inspect(option));
    return OpenPgp.generateKey(option).then(function (keypair) {
        var ret = {
            publicKey: keypair.publicKeyArmored,
            privateKey: keypair.privateKeyArmored
        };
        return CallBack(null, ret);
    })["catch"](function (err) {
        // ERROR
        return CallBack(err);
    });
};
