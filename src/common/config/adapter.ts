/**
 * 配置
 */
const fileCache = require('think-cache-file');
const nunjucks = require('think-view-nunjucks');
const fileSession = require('think-session-file');
const redisCache = require('think-cache-redis');
// const taleRedisCache = require("tale-cache-redis");
const mysql = require('think-model-mysql');
const path = require('path');
const socketio = require('think-websocket-socket.io');
// const jsonrpc = require('@talefunframework/think-jsonrpcio');
import { think } from "thinkjs";
// const isDev = think.env === "development";
const isDev = false;

/**
 * cache adapter config
 * @type {Object}
 */
exports.cache = {
    type: 'redis',
    common: {
        timeout: 24 * 3600 * 1000 // millisecond
    },
    redis: {
        handle: redisCache,
        port: 7997,
        host: 'df.163py.com',
        password: ''
    }
};
/**
 * model adapter config
 * @type {Object}
 */
exports.model = {
    type: 'mysql',
    common: {
        logConnect: isDev,
        logSql: isDev,
        logger: (msg: string) => think.logger.info(msg),
    },
    mysql: {
        handle: mysql,
        database: 'talefun_ad',
        encoding: 'utf8',
        host: 'rm-7go06o7588dmv0bfy.mysql.rds.aliyuncs.com',
        port: '3306',
        user: 'addispatch_user',
        password: 'talefun@#$ADdispatcher', // talefun@#$ADdispatcher
        dateStrings: true
    }
};

/**
 * session adapter config
 * @type {Object}
 */
exports.session = {
    type: 'file',
    common: {
        cookie: {
            name: 'thinkjs'
            // keys: ['werwer', 'werwer'],
            // signed: true
        }
    },
    file: {
        handle: fileSession,
        sessionPath: path.join(think.ROOT_PATH, 'runtime/session')
    }
};

/**
 * view adapter config
 * @type {Object}
 */
exports.view = {
    type: 'nunjucks',
    common: {
        viewPath: path.join(think.ROOT_PATH, 'view'),
        sep: '_',
        extname: '.html'
    },
    nunjucks: {
        handle: nunjucks
    }
};

// exports.jsonrpc = {
//     type: 'jsonrpc',
//     common: {
//         // common config
//     },
//     jsonrpc: {
//         handle: jsonrpc,
//         adapter: null,                  // 默认无 adapter
//         port: 8361,
//         host: 'localhost',
//         path: '/jsonrpc',
//         messages: [{
//             helloworld: '/jsonrpc/helloworld',
//             test2: '/jsonrpc/test2'
//         }]
//     }
// };
// exports.websocket = {
//     type: 'socketio',
//     common: {
//         // common config
//     },
//     socketio: {
//         handle: socketio,
//         allowOrigin: '127.0.0.1:8360',  // 默认所有的域名都允许访问
//         path: '/socket.io',             // 默认 '/socket.io'
//         adapter: null,                  // 默认无 adapter
//         messages: [{
//             open: '/websocket/open',
//             addUser: '/websocket/addUser'
//         }]
//     }
// }