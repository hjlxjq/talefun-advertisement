const path = require('path');
const Application = require('thinkjs');
const packjson = require('./package.json')
if (packjson && packjson.talefun && packjson.talefun.tlf_runuser) {
    process.setuid(packjson.talefun.tlf_runuser)//指定运行用户
}
let TALE_ENV = process.env.TALE_ENV
if (!TALE_ENV) TALE_ENV = 'local';
console.log('==========================================')
console.log('当前运行项目：', packjson.name)
console.log('TALE_ENV ：', TALE_ENV)
console.log('tlf_version ：', packjson.talefun.tlf_version)
console.log('==========================================')
const instance = new Application({
    ROOT_PATH: __dirname,
    APP_PATH: path.join(__dirname, 'app'),
    proxy: true, // use proxy
    env: TALE_ENV
});

instance.run();
