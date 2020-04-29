/**
 * 清理项目中的非必要目录和文件
 * framework使用需要fork会有较多文件需要移除
 * 
 */
var shell = require('shelljs');
var fs = require('fs');  
var data = fs.readFileSync('./package.json', 'utf-8');
var package = JSON.parse(data);
console.log(package)