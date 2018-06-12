const fs = require('fs')
const path = require('path')

const Source = require('./Source')

const source = fs.readFileSync(path.resolve('source.js'), 'utf8')

const code = new Source(source)


const locMulti = {
  start: { line: 6, column: 2 },
  end: { line: 8, column: 3 },
}

const locOne = {
  start: { line: 10, column: 2 },
  end: { line: 10, column: 7 },
}

var a = code.getFragmentWithExtraLines(loc, 2)

var aa = a.fragment.substr(a.start, a.length)
var aaa = a.fragment.substring(a.start, a.end)