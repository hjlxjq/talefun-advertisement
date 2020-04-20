/**
 * 配置
 */
const nunjucks = require('think-view-nunjucks');
const fileSession = require('think-session-file');
const redisCache = require('think-cache-redis');
const mysql = require('think-model-mysql');
const path = require('path');
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
        port: 6379,
        host: '127.0.0.1',
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
        host: '127.0.0.1',
        port: '3306',
        user: 'root',
        pageSize: 20,
        password: 'talefun123', // talefun123
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