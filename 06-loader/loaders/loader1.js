const { validate } = require('schema-utils')
const schema = require('./schema/loader-schema.json')


module.exports = function(sourceCode) {
  const options = this.getOptions()
  validate(schema, options)
  console.log('loader1', options) // { a: 1, b: 2 }
  return sourceCode
}