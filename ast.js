const fs = require('fs')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generate = require('@babel/generator').default

const source = fs.readFileSync('./source.js', 'utf8')
const visitor = require('./src/optimize.js')
// const source = fs.readFileSync('./src/import/source.js', 'utf8')
// const visitor = require('./src/import/import.js')

const options = {
  sourceType: 'module',
  plugins: ['jsx']
}

const ast = parser.parse(source, options)

traverse(ast, visitor)

const output = generate(ast, {}, source);

console.log('\n')
console.log('========= Input ==========')
console.log(source)
console.log('==========================')

console.log('\n')
console.log('========= Output =========')
console.log(output.code)
console.log('==========================')
