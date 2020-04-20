const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });
const _ = require('lodash');
const fs = require('fs');
const Validates = {};

const schemaFiles = _.filter(fs.readdirSync(__dirname), filename => {
  const stat = fs.statSync(__dirname + '/' + filename);
  if (stat.isFile()) {
    return filename.endsWith('.json');
  }
});

_.each(schemaFiles, schemaFile => {
  const validateName = schemaFile.replace('Schema.json', '');
  Validates[validateName] = ajv.compile(require(__dirname + '/' + schemaFile));
});

function getValidateName(name) {
  if (!Validates[name]) console.error(`${name} schema is not exist`);
  return Validates[name];
};

function isValid(validateName, data) {
  const valid = validateName(data);
  if (!valid) console.error(validateName.errors);
  // console.log(valid);
  return valid;
}

module.exports = Object.create(null, {
  getValidateName: { value: getValidateName },
  isValid: { value: isValid }
});