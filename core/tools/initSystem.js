"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../CoNET.d.ts" />
const Fs = require("fs");
const Path = require("path");
const Os = require("os");
const Async = require("async");
const Crypto = require("crypto");
const OpenPgp = require("openpgp");
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
        publicKeyID: null
    };
    return keyPair;
};
exports.QTGateFolder = Path.join(Os.homedir(), '.QTGate');
exports.QTGateLatest = Path.join(exports.QTGateFolder, 'latest');
exports.QTGateTemp = Path.join(exports.QTGateFolder, 'tempfile');
exports.QTGateVideo = Path.join(exports.QTGateTemp, 'videoTemp');
exports.ErrorLogFile = Path.join(exports.QTGateFolder, 'systemError.log');
exports.CoNET_Home = Path.join(__dirname);
exports.LocalServerPortNumber = 2000;
exports.configPath = Path.join(exports.QTGateFolder, 'config.json');
const packageFilePath = Path.join('..', '..', 'package.json');
exports.packageFile = require(packageFilePath);
exports.QTGateSignKeyID = /3acbe3cbd3c1caa9/i;
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
exports.checkSystemFolder = (CallBack) => {
    return Async.series([
        next => exports.checkFolder(exports.QTGateFolder, next),
        next => exports.checkFolder(exports.QTGateLatest, next),
        next => exports.checkFolder(exports.QTGateTemp, next),
        next => exports.checkFolder(exports.QTGateVideo, next)
    ], (err, kkk) => {
        if (err) {
            console.log(`checkSystemFolder return error`, err);
            return CallBack(err);
        }
        return CallBack();
    });
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
exports.InitConfig = () => {
    const ret = {
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
const getBitLength = (key) => {
    const algorithm = key.primaryKey.getAlgorithmInfo();
    return algorithm.bits;
};
const getKeyId = (key) => {
    const algorithm = key.primaryKey.getAlgorithmInfo();
    return algorithm.algorithm;
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
        if (exports.QTGateSignKeyID.test(n.issuerKeyId.toHex().toLowerCase())) {
            return Certification = true;
        }
    });
    return Certification;
};
exports.getKeyPairInfo = (keyPair) => {
    if (!keyPair || !keyPair.publicKey || !keyPair.privateKey) {
        return keyPair = null;
    }
    const _privateKey = OpenPgp.key.readArmored(keyPair.privateKey);
    const _publicKey = OpenPgp.key.readArmored(keyPair.publicKey);
    if (_privateKey.err || _publicKey.err) {
        return keyPair = null;
    }
    const privateKey1 = _privateKey.keys[0];
    const publicKey1 = _publicKey.keys;
    const user = publicKey1[0].users[0];
    const ret = {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
        keyLength: getBitLength(privateKey1),
        nikeName: exports.getNickName(user.userId.userid),
        createDate: privateKey1.primaryKey.created.toLocaleString(),
        email: exports.getEmailAddress(user.userId.userid),
        passwordOK: false,
        verified: exports.getQTGateSign(user),
        publicKeyID: publicKey1[0].primaryKey.fingerprint
    };
    return keyPair = ret;
};
exports.KeyPairDeleteKeyDetail = (keyPair, passwordOK) => {
    if (!keyPair) {
        return null;
    }
    const ret = {
        nikeName: keyPair.nikeName,
        email: keyPair.email,
        keyLength: keyPair.keyLength,
        createDate: keyPair.createDate,
        passwordOK: passwordOK,
        verified: keyPair.verified,
        publicKeyID: keyPair.publicKeyID
    };
    return ret;
};
exports.emitConfig = (config, passwordOK) => {
    if (!config) {
        return null;
    }
    const ret = {
        keypair: exports.KeyPairDeleteKeyDetail(config.keypair, passwordOK),
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
exports.saveConfig = (config, CallBack) => {
    return Fs.writeFile(exports.configPath, JSON.stringify(config), CallBack);
};
exports.checkConfig = (CallBack) => {
    Fs.access(exports.configPath, err => {
        if (err) {
            return CallBack(null, exports.InitConfig());
        }
        let config = null;
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
        config.keypair = exports.getKeyPairInfo(config.keypair);
        return CallBack(null, config);
    });
};
