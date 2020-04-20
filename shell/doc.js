/**
 * 通过调用jsdoc的api生成文档
 * 调用时须确定已安装jsdoc
 * 注意tsSymbols.txt添加不能被jsdoc识别的ts symbol
 * 流程
 * copy src => docbase
 * 将docbase中的所有ts文件后轰改成js
 * 移除所有js文件中的ts标签
 * 生成jsdoc文档
 * 生成debuuger.json用于调试
 */
var shell = require('shelljs');
var fs = require("fs");


var cmd = "rm -rf docbase;"
shell.exec(cmd);

// var cmd = "cp -rf src docbase;"
var cmd = "tsc --rootDir src --outDir docbase --removeComments false";
shell.exec(cmd);

//生成静态文件
console.log("生成日志")
var cmd = "jsdoc --package package.json -c ./shell/jsdoc.conf -t ./node_modules/ink-docstrap/template docbase/ -r -d ./www/static/doc";
shell.exec(cmd);
console.log("/www/static/doc")
//生成所有文件扫描json
console.log("生成调试api")
var cmd = "jsdoc --package package.json -c ./shell/jsdoc.conf -t ./node_modules/ink-docstrap/template docbase/ -r -X > apis.json";
shell.exec(cmd);
console.log("/www/static/debugger_api.json")
var data = fs.readFileSync("apis.json", "utf-8");
var json = JSON.parse(data);
var apis = {};
for (var i in json) {
    let item = json[i];
    if (item.comment && item.comment.indexOf("@debugger") != -1) {
        switch (item.kind) {
            case 'module':
                var name = item.name;
                name = name.replace("/controller/", "/");
                var longname = item.longname;
                apis[longname] = {
                    name: name,
                    longname: longname,
                    comment: item.comment,
                    actions: []
                };
                break;
            case 'function':
                var memberof = item.memberof;
                var mems = memberof.split("~");
                var module = mems[0];
                if (apis[module]) {
                    var name = item.name;
                    name = name.replace("Action", "");
                    var params = item.params;
                    var returns = item.returns;
                    var description = item.description;
                    apis[module].actions.push({
                        name: name,
                        params: params,
                        returns: returns,
                        description: description
                    })
                }
                break;
            case 'class':
                var memberof = item.memberof;
                if (apis[memberof]) {
                    var name = item.name;
                    name = name.replace("Action", "");
                    var params = item.params;
                    var description = item.description;
                    var classdesc = item.classdesc;
                    var comment = item.comment;
                    apis[memberof].class = ({
                        name: name,
                        classdesc: classdesc,
                        description: description,
                        comment: comment
                    })
                }
                break;
            default:
                break;
        }
        // console.log("=======================================")
        // console.log(item)
    }
}

var debuggerJsonFile = './www/static/debugger_api.json';
fs.writeFileSync(debuggerJsonFile, JSON.stringify(apis));

console.log("调试API生成成功");
/**
 * 生成api输出的验证jsonschema
 */
var returnSymbols = [];
for (var key in apis) {
    var api = apis[key];
    var actions = api.actions;
    actions.forEach(element => {
        var returns = element.returns;
        var symbol = returns[0].type.names[0];
        returnSymbols.push(symbol);
    });
}
console.log("生成以下interface的jsonschema用于测试输出校验\n", returnSymbols);
//查找项目下所有的ts定义文件 用于获取interface的定义
console.log("拉取项目的ts定义文件");
var filescontent = "";
var cmd = "find ./src -name *Define.ts\n";
cmd += "find ./src -name *defines.ts";
filescontent += shell.exec(cmd).stdout;
const defineFiles = filescontent.trim().split("\n");
var cmd = "mkdir JsonSchemaDefines;";
shell.exec(cmd);
for (var file of defineFiles) {
    cmd = `cp -rf ${file} JsonSchemaDefines`;
    shell.exec(cmd);
}
console.log("开始生成json-schema,请稍候...")
var TJS = require("typescript-json-schema");
var symbolSchemas = {};
returnSymbols.forEach(function (element) {
    var schema = getSymbolSchema(element);
    symbolSchemas[element] = schema;
});
var jsonSchemaFile = './www/static/debugger_jsonschema.json';
fs.writeFileSync(jsonSchemaFile, JSON.stringify(symbolSchemas));
console.log(`${jsonSchemaFile}生成成功!`)


/**
 *  * 取得指定interface标签的jsonschema
 */
function getSymbolSchema(msymbol) {
    // optionally pass argument to schema generator
    var settings = {
        required: true
    };
    // optionally pass ts compiler options
    var compilerOptions = {
        strictNullChecks: true
    };
    // optionally pass a base path
    var basePath = "JsonSchemaDefines";
    // const program = TJS.getProgramFromFiles([resolve(basePath + "defines.ts")], compilerOptions, basePath);
    var program = TJS.getProgramFromFiles(defineFiles, compilerOptions, basePath);
    var generator = TJS.buildGenerator(program, settings);
    var symbols = generator.getUserSymbols();
    var symbolSchema = generator.getSchemaForSymbol(msymbol);
    return symbolSchema;
}

/**
 * 移除临时文件
 */
var cmd = "rm -rf apis.json";
shell.exec(cmd);

var cmd = "rm -rf JsonSchemaDefines";
shell.exec(cmd);

var cmd = 'rm -rf docbase';
shell.exec(cmd);

console.log("final");