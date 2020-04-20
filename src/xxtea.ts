'use strict';

import * as _ from 'lodash';
const delta = 0x9E3779B8;

export default class XxteaNew {
    public static toBytes(str: any) {
        const n = str.length;
        // A single code unit uses at most 3 bytes.
        // Two code units at most 4.
        const bytes = new Uint8Array(n * 3);
        let length = 0;
        for (let i = 0; i < n; i++) {
            const codeUnit = str.charCodeAt(i);
            if (codeUnit < 0x80) {
                bytes[length++] = codeUnit;
            } else if (codeUnit < 0x800) {
                // tslint:disable-next-line:no-bitwise
                bytes[length++] = 0xC0 | (codeUnit >> 6);
                 // tslint:disable-next-line:no-bitwise
                bytes[length++] = 0x80 | (codeUnit & 0x3F);
            } else if (codeUnit < 0xD800 || codeUnit > 0xDFFF) {
                 // tslint:disable-next-line:no-bitwise
                bytes[length++] = 0xE0 | (codeUnit >> 12); // tslint:disable-next-line:no-bitwise
                bytes[length++] = 0x80 | ((codeUnit >> 6) & 0x3F); // tslint:disable-next-line:no-bitwise
                bytes[length++] = 0x80 | (codeUnit & 0x3F);
            } else {
                if (i + 1 < n) {
                    const nextCodeUnit = str.charCodeAt(i + 1);
                    if (codeUnit < 0xDC00 && 0xDC00 <= nextCodeUnit && nextCodeUnit <= 0xDFFF) {
                        // tslint:disable-next-line:no-bitwise
                        const rune = (((codeUnit & 0x03FF) << 10) | (nextCodeUnit & 0x03FF)) + 0x010000;
                         // tslint:disable-next-line:no-bitwise
                        bytes[length++] = 0xF0 | (rune >> 18); // tslint:disable-next-line:no-bitwise
                        bytes[length++] = 0x80 | ((rune >> 12) & 0x3F); // tslint:disable-next-line:no-bitwise
                        bytes[length++] = 0x80 | ((rune >> 6) & 0x3F); // tslint:disable-next-line:no-bitwise
                        bytes[length++] = 0x80 | (rune & 0x3F); // tslint:disable-next-line:no-bitwise
                        i++;
                        continue;
                    }
                }
                throw new Error('Malformed string');
            }
        }
        return bytes.subarray(0, length);
    }

    public static toString(bytes: any) {
        const n = bytes.length;
        if (n === 0) { return ''; }
        return ((n < 0xFFFF) ?
          this.toShortString(bytes, n) :
          this.toLongString(bytes, n));
      }

    public static encrypt(data: any, key: any) {
        if (typeof data === 'string') { data = this.toBytes(data); }
        if (typeof key === 'string') { key = this.toBytes(key); }
        if (data === undefined || data === null || data.length === 0) {
            return data;
        }
        return this.toUint8Array(
            this.encryptUint32Array(this.toUint32Array(data, true),
            this.toUint32Array(this.fixk(key), false)),
            false
        );
    }

    public static encryptToString(data: any, key: any) {
        return new Buffer(this.encrypt(data, key)).toString('base64');
    }

    public static decrypt(data: any, key: any) {
        if (typeof data === 'string') { data = new Buffer(data, 'base64'); }
        if (typeof key === 'string') { key = this.toBytes(key); }
        if (data === undefined || data === null || data.length === 0) {
            return data;
        }
        return this.toUint8Array(
            this.decryptUint32Array(this.toUint32Array(data, false),
            this.toUint32Array(this.fixk(key), false)),
            true
        );
    }

    public static decryptToString(data: any, key: any) {
        return this.toString(this.decrypt(data, key));
    }

    private static toUint8Array(v: any, includeLength: any) {
        const length = v.length;
        // tslint:disable-next-line:no-bitwise
        let n = length << 2;
        if (includeLength) {
            const m = v[length - 1];
            n -= 4;
            if ((m < n - 3) || (m > n)) {
            return null;
            }
            n = m;
        }
        const bytes = new Uint8Array(n);
        for (let i = 0; i < n; ++i) {
            // tslint:disable-next-line:no-bitwise
            bytes[i] = v[i >> 2] >> ((i & 3) << 3);
        }
        return bytes;
    }

    private static toUint32Array(bytes: any, includeLength: any) {
        const length = bytes.length;
        // tslint:disable-next-line:no-bitwise
        let n = length >> 2;
        // tslint:disable-next-line:no-bitwise
        if ((length & 3) !== 0) {
            ++n;
        }
        let v;
        if (includeLength) {
            v = new Uint32Array(n + 1);
            v[n] = length;
        } else {
            v = new Uint32Array(n);
        }
        for (let i = 0; i < length; ++i) {
            // tslint:disable-next-line:no-bitwise
            v[i >> 2] |= bytes[i] << ((i & 3) << 3);
        }
        return v;
    }

    private static mx(sum: any, y: any, z: any, p: any, e: any, k: any) {
        // tslint:disable-next-line:no-bitwise
        return ((z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4)) ^ ((sum ^ y) + (k[p & 3 ^ e] ^ z));
    }

    private static fixk(k: any) {
        if (k.length < 16) {
            const key = new Uint8Array(16);
            key.set(k);
            k = key;
        }
        return k;
    }

    private static encryptUint32Array(v: any, k: any) {
        const length = v.length;
        const n = length - 1;
        // tslint:disable-next-line:one-variable-per-declaration
        let y, z, sum, e, p, q;
        z = v[n];
        sum = 0;
        // tslint:disable-next-line:no-bitwise
        for (q = Math.floor(2 + 52 / length) | 0; q > 0; --q) {
            sum += delta;
            // tslint:disable-next-line:no-bitwise
            e = sum >>> 2 & 3;
            for (p = 0; p < n; ++p) {
            y = v[p + 1];
            z = v[p] += this.mx(sum, y, z, p, e, k);
            }
            y = v[0];
            z = v[n] += this.mx(sum, y, z, p, e, k);
        }
        return v;
    }

    private static decryptUint32Array(v: any, k: any) {
        const length = v.length;
        const n = length - 1;
        // tslint:disable-next-line:one-variable-per-declaration
        let y, z, sum, e, p, q;
        y = v[0];
        q = Math.floor(2 + 52 / length);
        for (sum = q * delta; sum !== 0; sum -= delta) {
            // tslint:disable-next-line:no-bitwise
            e = sum >>> 2 & 3;
            for (p = n; p > 0; --p) {
            z = v[p - 1];
            y = v[p] -= this.mx(sum, y, z, p, e, k);
            }
            z = v[n];
            y = v[0] -= this.mx(sum, y, z, p, e, k);
        }
        return v;
    }

    private static toShortString(bytes: any, n: any) {
        let charCodes = new Uint16Array(n);
        // tslint:disable-next-line:one-variable-per-declaration
        let i = 0, off = 0;
        for (const len = bytes.length; i < n && off < len; i++) {
            const unit = bytes[off++];
            // tslint:disable-next-line:no-bitwise
            switch (unit >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                charCodes[i] = unit;
                break;
                case 12:
                case 13:
                if (off < len) {
                    // tslint:disable-next-line:no-bitwise
                    charCodes[i] = ((unit & 0x1F) << 6) |
                    // tslint:disable-next-line:no-bitwise
                                    (bytes[off++] & 0x3F);
                } else {
                    throw new Error('Unfinished UTF-8 octet sequence');
                }
                break;
                case 14:
                if (off + 1 < len) { // tslint:disable-next-line:no-bitwise
                    charCodes[i] = ((unit & 0x0F) << 12) | // tslint:disable-next-line:no-bitwise
                                        ((bytes[off++] & 0x3F) << 6) | // tslint:disable-next-line:no-bitwise
                                        (bytes[off++] & 0x3F);
                } else {
                    throw new Error('Unfinished UTF-8 octet sequence');
                }
                break;
                case 15:
                if (off + 2 < len) { // tslint:disable-next-line:no-bitwise
                    const rune = (((unit & 0x07) << 18) | // tslint:disable-next-line:no-bitwise
                                ((bytes[off++] & 0x3F) << 12) | // tslint:disable-next-line:no-bitwise
                                ((bytes[off++] & 0x3F) << 6) | // tslint:disable-next-line:no-bitwise
                                (bytes[off++] & 0x3F)) - 0x10000; // tslint:disable-next-line:no-bitwise
                    if (0 <= rune && rune <= 0xFFFFF) {
                        // tslint:disable-next-line:no-bitwise
                        charCodes[i++] = (((rune >> 10) & 0x03FF) | 0xD800); // tslint:disable-next-line:no-bitwise
                        charCodes[i] = ((rune & 0x03FF) | 0xDC00);
                    } else {
                        throw new Error('Character outside valid Unicode range: 0x' + rune.toString(16));
                    }
                } else {
                    throw new Error('Unfinished UTF-8 octet sequence');
                }
                break;
                default:
                throw new Error('Bad UTF-8 encoding 0x' + unit.toString(16));
            }
        }
        if (i < n) {
            charCodes = charCodes.subarray(0, i);
        }
        return String.fromCharCode.apply(String, charCodes);
    }

    private static toLongString(bytes: any, n: any) {
        const buf = [];
        const charCodes = new Uint16Array(0x8000);
        // tslint:disable-next-line:one-variable-per-declaration
        let i = 0, off = 0;
        for (const len = bytes.length; i < n && off < len; i++) {
            const unit = bytes[off++];
            // tslint:disable-next-line:no-bitwise
            switch (unit >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                charCodes[i] = unit;
                break;
                case 12:
                case 13:
                if (off < len) { // tslint:disable-next-line:no-bitwise
                    charCodes[i] = ((unit & 0x1F) << 6) | // tslint:disable-next-line:no-bitwise
                                    (bytes[off++] & 0x3F);
                } else {
                    throw new Error('Unfinished UTF-8 octet sequence');
                }
                break;
                case 14:
                if (off + 1 < len) { // tslint:disable-next-line:no-bitwise
                    charCodes[i] = ((unit & 0x0F) << 12) | // tslint:disable-next-line:no-bitwise
                                    ((bytes[off++] & 0x3F) << 6) | // tslint:disable-next-line:no-bitwise
                                    (bytes[off++] & 0x3F);
                } else {
                    throw new Error('Unfinished UTF-8 octet sequence');
                }
                break;
                case 15:
                if (off + 2 < len) { // tslint:disable-next-line:no-bitwise
                    const rune = (((unit & 0x07) << 18) | // tslint:disable-next-line:no-bitwise
                                ((bytes[off++] & 0x3F) << 12) | // tslint:disable-next-line:no-bitwise
                                ((bytes[off++] & 0x3F) << 6) | // tslint:disable-next-line:no-bitwise
                                (bytes[off++] & 0x3F)) - 0x10000;
                    if (0 <= rune && rune <= 0xFFFFF) { // tslint:disable-next-line:no-bitwise
                    charCodes[i++] = (((rune >> 10) & 0x03FF) | 0xD800); // tslint:disable-next-line:no-bitwise
                    charCodes[i] = ((rune & 0x03FF) | 0xDC00);
                    } else {
                    throw new Error('Character outside valid Unicode range: 0x' + rune.toString(16));
                    }
                } else {
                    throw new Error('Unfinished UTF-8 octet sequence');
                }
                break;
                default:
                throw new Error('Bad UTF-8 encoding 0x' + unit.toString(16));
            }
            if (i >= 0x7FFF - 1) {
                const size = i + 1;
                buf.push(String.fromCharCode.apply(String, charCodes.subarray(0, size)));
                n -= size;
                i = -1;
            }
        }
        if (i > 0) {
            buf.push(String.fromCharCode.apply(String, charCodes.subarray(0, i)));
        }
        return buf.join('');
    }
}