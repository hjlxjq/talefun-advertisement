const path = require('path');
const Application = require('thinkjs');
const typescript = require('think-typescript');
const watcher = require('think-watcher');
const notifier = require('node-notifier');
const packjson = require('./package.json')
let TALE_ENV = process.env.TALE_ENV
// console.log('process.env.TALE_ENV', process.env.TALE_ENV)
// console.log('args', process.argv)
if (!TALE_ENV) TALE_ENV = 'local';
console.log('==========================================')
console.log('当前运行项目：', packjson.name)
console.log('TALE_ENV ：', TALE_ENV)
console.log('tlf_version ：', packjson.talefun.tlf_version)
console.log('==========================================')
const instance = new Application({
    ROOT_PATH: __dirname,
    APP_PATH: path.join(__dirname, 'app'),
    watcher: watcher,
    transpiler: [typescript, {
        compilerOptions: {
            module: 'commonjs',
            target: 'es2016',
            sourceMap: true,
            noImplicitAny: true,
            removeComments: true,
            preserveConstEnums: true,
            suppressImplicitAnyIndexErrors: true
        }
    }],
    notifier: notifier.notify.bind(notifier),
    env: TALE_ENV
});

instance.run();
