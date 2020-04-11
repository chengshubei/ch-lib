'use strict';

const crypto = require('crypto');

let Md5 = (str, secret = '') => {
    let s = str + secret;
    return crypto.createHash('md5').update(s, 'utf-8').digest('hex');
};

//已废弃的AES加密算法
let AesCipher = (str, secret = '') => {
    let cipher = crypto.createCipher('aes-256-cbc', secret);
    let crypted = cipher.update(str, 'utf8', 'hex');
    return crypted += cipher.final('hex');
};
//已废弃的AES解密算法
let AesDecipher = (str, secret = '') => {
    try {
        let decipher = crypto.createDecipher('aes-256-cbc', secret);
        let decrypted = decipher.update(str, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        console.warn('old aes, 发现使用旧版AES解密方法验证码');
        return decrypted;
    } catch (error) {
        console.warn(`Aes 解密失败, str: ${str}, message: ${error.messsage}`);
        return null;
    }
};

//128位加密，要求key和iv都必须是十六个字符
let AESEncipher = (str, key = 'aXxrS26hq6LhipSr', iv = 'anJL7eDzjqWj5aY9') => {
    let cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    cipher.setAutoPadding(true);
    let crypted = cipher.update(str, 'utf8', 'base64');
    return crypted += cipher.final('base64');
};
//128位解密，要求key和iv需与加密算法一致
let AESDecipher = (str, key = 'aXxrS26hq6LhipSr', iv = 'anJL7eDzjqWj5aY9') => {
    try {
        let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        decipher.setAutoPadding(true);
        let decrypted = decipher.update(str, 'base64', 'utf8');
        return decrypted += decipher.final('utf8');
    } catch (error) {
        console.warn(`Aes 解密失败, str: ${str}, message: ${error.messsage}`);
        return null;
    }
};

//Ed25519加密算法生成私钥
let CreatePriKey = (pwd, random = '') => {
    const sha3 = require('js-sha3');
    let keccak_256 = sha3.keccak_256;
    return keccak_256(pwd + random);
};
//Ed25519加密算法生成公钥
let PriToPubKey = priKey => {
    const nacl = require('tweetnacl');
    let pribyte = Buffer.from(priKey, 'hex');
    let seed = nacl.sign.keyPair.fromSeed(pribyte);
    return Buffer.from(seed.publicKey).toString('hex');
};

//手工分页
let Paging = (a, p = 1, pz = 10) => {
    if (!Array.isArray(a)) return null;
    let count = a.length;
    let start = (p - 1) * pz;
    let end = start + pz;
    let rows = a.slice(start, end);
    return {count, rows};
};

//json数据序列化
let QueryString = (obj, excepts = [], isReverse = false) => {
    if (obj === null || typeof obj !== 'object') return '';
    let keys = Object.keys(obj).sort();
    if (isReverse) keys = keys.reverse();
    let rs = [];
    for (let k of keys) {
        if (! excepts.includes(k)) {
            let v = ['string', 'boolean', 'number'].includes(typeof obj[k]) ? String(obj[k]) : '';
            rs.push(`${k}=${encodeURIComponent(v)}`);
        }
    }
    return rs.join('&');
};

module.exports = {
    //Md5加密
    Md5,
    //旧版Aes加密
    AesCipher,
    //旧版Aes解密
    AesDecipher,
    //AES加密(新)
    AESEncipher,
    //AES解密(新)
    AESDecipher,
    //生成Ed25519算法私钥
    CreatePriKey,
    //生成Ed25519算法公钥
    PriToPubKey,
    //数组做分页
    Paging,
    //querystring排序
    QueryString
};