import * as path from 'path';
import { think } from 'thinkjs';
import { SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG } from 'constants';
const isDev = think.env === 'development';
const cors = require('koa-cors');
const XXTEA_KEY = think.config('XXTEA_KEY');
const XXTEA_KEY_2 = think.config('XXTEA_KEY_2');
module.exports = [
    {
        handle: 'meta',
        options: {
            logRequest: isDev,
            sendResponseTime: isDev
        }
    },
    {
        handle: 'resource',
        enable: true,
        options: {
            root: path.join(think.ROOT_PATH, 'www'),
            publicPath: /^\/(static|favicon\.ico)/,
            setHeaders: (res: any) => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Headers', 'Tale-Real-Ip');
            },
        }
    },
    {
        handle: 'trace',
        enable: !think.isCli,
        options: {
            debug: isDev
        }
    },
    {
        handle: 'payload',
        options: {
            keepExtensions: true,
            limit: '5mb'
        }
    },
    {// 跨域相关设置
        handle: cors,
        options: {
            origin: true,
            exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
            maxAge: 1728000,
            credentials: true,
            allowMethods: ['GET', 'POST'],
            allowHeaders: ['Content-Type', 'authorization', 'Accept', 'tlf-appid', 'tlf-sign', 'Tale-Real-Ip',
                'tlf-native-packagename', 'tlf-native-channel'],
        }
    },
    { // 环境变量控制模块
        handle: 'routerCtr',
        options: {}
    },
    { // 加解密相关设置
        handle: 'xxteaParse',
        options: {
            XXTEA_KEY,
            XXTEA_KEY_2
        }
    },
    {
        handle: 'router',
        options: {
            defaultModule: 'common',
            defaultController: 'main',
            defaultAction: 'index',
            prefix: [],
            suffix: ['.html'],
            enableDefaultRouter: true,
            subdomainOffset: 2,
            subdomain: {},
            denyModules: []
        }
    },
    { // 错误处理,返回json错误信息
        handle: 'handleLogic',
        options: {}
    },
    'logic',
    'controller'
];
