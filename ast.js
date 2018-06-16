const fs = require('fs')
const { performance } = require('perf_hooks')
const { parse, traverse } = require('@babel/core')
const generate = require('@babel/generator').default

// const source = fs.readFileSync('./source.js', 'utf8')
// const visitor = require('./src/optimize.js')
const source = fs.readFileSync('./src/import/source.js', 'utf8')
const visitor = require('./src/import/import.js')

const start = performance.now()

const options = {
  parserOpts: {
    sourceType: 'module',
    plugins: ['jsx'],
  },
}

const state = {
  imports: [],
}

const ast = parse(source, options)

traverse(ast, visitor, null, state)

const output = generate(ast, {}, source);

const end = performance.now()

console.log('\n')
console.log('========= Input ==========')
console.log(source)
console.log('==========================')

console.log('\n')
console.log('========= Output =========')
console.log(output.code)
console.log('==========================')
console.log(`Performance time: ${end - start}ms`)
