"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Openpgp = require("openpgp");
Openpgp.config.aead_protect = true;
if (process.argv.length < 6) {
    process.exit(2);
}
const emailAddress = process.argv[2];
const nickname = process.argv[3];
const bitLength = process.argv[4];
const password = process.argv[5];
const userId = {
    name: nickname,
    email: emailAddress
};
const option = {
    numBits: parseInt(bitLength) || 2048,
    passphrase: password,
    userIds: [userId]
};
Openpgp.generateKey(option).then((keypair) => {
    const ret = {
        publicKey: keypair.publicKeyArmored,
        privateKey: keypair.privateKeyArmored
    };
    return process.send(ret);
}).catch(err => {
    // ERROR
    return process.exit(2);
});
