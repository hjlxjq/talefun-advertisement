// const Ajv = require('ajv');
import { think } from 'thinkjs';
const adMapSchemaPath = think.ROOT_PATH + '/schema/admap.json';
const ABGroupSchemaPath = think.ROOT_PATH + '/schema/ABGroup.json';
import * as Ajv from 'ajv';
const ajv = new Ajv({ allErrors: true });
const adMapSchema = require(adMapSchemaPath);
const ABGroupSchema = require(ABGroupSchemaPath);
// think.logger.debug(`adMapSchema path4: ${adMapSchemaPath}`);

// 编译 json schema 文件
const adMapValidator = ajv.compile(adMapSchema);
const ABGroupValidator = ajv.compile(ABGroupSchema);

function genSchemaRule(validator: Ajv.ValidateFunction) {
  return (value: object, { argName }: { argName: string }) => {
    const result = validator(value);
    if (result) {return true; }
    return {
      [argName]: ajv.errorsText(validator.errors)
    };
  };
}

module.exports = {
  rules: {
    isAdMap: genSchemaRule(adMapValidator),
    isABGroup: genSchemaRule(ABGroupValidator),
  }
};