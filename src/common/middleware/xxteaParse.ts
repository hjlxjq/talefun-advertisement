'use strict';
import { Context } from 'koa';
import XxteaNew from '../../xxtea';
const xxtea = require('xxtea-node');

function check(req: { body: object, headers: { v: string, debug: string } }) {
    if (
        req.headers &&
        parseInt(req.headers.v, 10) > 1 &&
        !req.headers.debug &&
        req.body
    ) {
        return true;
    }
    return false;
}

function checkAcig(path: string) {
    if (path.endsWith('acig')) {
        return true;
    }
    return false;
}

function decrypt(v: any, params: string, options: { XXTEA_KEY: string, XXTEA_KEY_2: string }) {
    let decryptData;
    if (parseInt(v, 10) === 2) {
        decryptData = xxtea.decryptToString(params, options.XXTEA_KEY);
    } else {
        decryptData = XxteaNew.decryptToString(params, options.XXTEA_KEY_2);
    }
    return JSON.parse(decryptData);
}

function encrypt(v: any, body: object, options: { XXTEA_KEY: string, XXTEA_KEY_2: string }) {
    let encryptData;
    if (parseInt(v, 10) === 2) {
        encryptData = xxtea.encryptToString(JSON.stringify(body), options.XXTEA_KEY);
    } else {
        encryptData = XxteaNew.encryptToString(JSON.stringify(body), options.XXTEA_KEY_2);
    }
    return encryptData;
}

export default (options: { XXTEA_KEY: string, XXTEA_KEY_2: string }, app: any) => {
    return async (ctx: Context, next: () => Promise<any>) => {
        // console.log(`req body: ${JSON.stringify(ctx.request['body'])}`);
        // tslint:disable-next-line:no-string-literal
        const reqBody = ctx.request['body']['post'];
        const path = ctx.path;
        const headers = ctx.header;
        const req = { body: reqBody, headers };
        if (checkAcig(path)) {
            try {
                if (reqBody.params) {
                    // tslint:disable-next-line:no-string-literal
                    ctx.request['body']['post'] = decrypt(3, reqBody.params, options);
                } else {
                    // tslint:disable-next-line:no-string-literal
                    ctx.request['body']['post'] = [];
                }
                await next();
                ctx.type = 'text/html; charset=utf-8';
                ctx.body = encrypt(3, ctx.body, options);
            } catch (err) {
                ctx.status = 500;
                ctx.type = 'text/html; charset=utf-8';
                ctx.body = encrypt(3, {}, options);
            }
        } else if (check(req)) {
            if (reqBody.params) {
                // tslint:disable-next-line:no-string-literal
                ctx.request['body']['post'] = decrypt(headers.v, reqBody.params, options);
            }
            await next();
            ctx.type = 'text/html; charset=utf-8';
            ctx.body = encrypt(headers.v, ctx.body, options);
        } else {
            await next();
        }
    };
};