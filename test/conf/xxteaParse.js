'use strict';
const xxtea = require('xxtea-node');
const xxteaNew = require('./xxtea');
const XXTEA_KEY = 'gn:g>-7WSWN/';
const XXTEA_KEY_2 = '):NGnA.>L5yO';

function encrypt(data, v = 3) {
    let encrypt_data;
    if (v === 2) {
        encrypt_data = xxtea.encryptToString(JSON.stringify(data), XXTEA_KEY);
    } else {
        encrypt_data = xxteaNew.encryptToString(JSON.stringify(data), XXTEA_KEY_2);
    }
    return encrypt_data;
}

function decrypt(data, v = 3) {
    let decrypt_data;
    if (v === 2) {
        decrypt_data = xxtea.decryptToString(data, XXTEA_KEY);
    } else {
        decrypt_data = xxteaNew.decryptToString(data, XXTEA_KEY_2);
        // console.log(`decrypt_data: ${decrypt_data}`);
    }
    return JSON.parse(decrypt_data);
}

module.exports = {
    decrypt,
    encrypt
};