// const Ajv = require('ajv');
import { think } from 'thinkjs';
import * as Ajv from 'ajv';

const adMapSchemaPath = think.ROOT_PATH + '/schema/admap.json';
const ajv = new Ajv({ allErrors: true });
const adMapSchema = require(adMapSchemaPath);

// 编译 json schema 文件
const adMapValidator = ajv.compile(adMapSchema);

// 对 JSON 数据校验
function genSchemaRule(validator: Ajv.ValidateFunction) {
    return (value: object, { argName }: { argName: string }) => {
        const result = validator(value);

        if (result) { return true; }

        return {
            [argName]: ajv.errorsText(validator.errors)
        };

    };

}

module.exports = {
    rules: {
        isAdMap: genSchemaRule(adMapValidator),
        cusTrim(value: string) {
            if (value.startsWith(' ') || value.endsWith(' ')) {
                return false;

            }
            return true;
        },
        cusTrimAll(value: string) {
            if (value.indexOf(' ') !== -1) {
                return false;

            }
            return true;
        }

    },
    messages: {
        cusTrim: '{name} 前后不能有空格',
        cusTrimAll: '{name} 不能有空格',
        regexp: '{name} 数据格式不正确',

    }

};