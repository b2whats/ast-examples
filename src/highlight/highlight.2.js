const fs = require('fs')
const esprima = require('esprima')
const { performance } = require('perf_hooks')

const source = fs.readFileSync('./src/highlight/source.js', 'utf8')

function sortByStartAndPriority(a, b) {
  const startA = a.start
  const startB = b.start

  const priorityA = a.priority
  const priorityB = b.priority

  if (startA < startB) return -1;
  if (startA > startB) return 1;
  if (priorityA < priorityB) return -1;
  if (priorityA > priorityB) return 1;
  
  return 0
}

const generateRanges = (source) => {
  const tokens = esprima.tokenize(source, {
      comment: true,
      range: true
  })

  let offset = -1

  const lines = source.split('\n').map(line => {
    return { type: 'Line', start: (offset += 1), end: (offset += line.length), line, priority: 1 }
  })

  return [].concat(
    lines,
    tokens.map(({range: [start, end], ...token}) => ({ ...token, start, end, priority: 2 }))
  ).sort(sortByStartAndPriority)
}

const generateSteps = (source, ranges) => {
  const points = {}

  points[0] = true
  points[source.length] = true
  
  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i]
    
    points[range.start] = true
    points[range.end] = true
  }

  return Object.keys(points)
}

const start = () => {
  const start = performance.now()

  const ranges = generateRanges(source)

  let stack = []
  let currentStep = 0
  let nextStep = 0
  let endSteps = []
  const points = {}

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i]
    const { start, end } = range

    if (points[start]) {
      points[start].push({ open: range })
    } else {
      points[start] = [{ open: range }]
    }

    let stackLength = stack.length
    while (stackLength--) {
      const range = stack[stackLength]


    }

    stack.push(range)
  }

  // for (let point in points) {
  //   point = point | 0
  //   const range = points[point]

  //   if (range) {
  //     buffer = buffer.concat(range)
  //   }

  //   for (const index in buffer) {
  //     const item = buffer[index]

  //     if (item.start < point && item.end > point) {
  //       buffer.splice(index, 1, { ...item, end: point }, { ...item, start: point })
  //     }
  //   }

  //   for (const index in buffer) {
  //     const item = buffer[index]

  //     if (item.end <= point) {
  //       ranges.push(buffer.splice(index, 1)[0])
  //     }
  //   }
  // }

  const result = printRanges(source, ranges)

  // const ranges = generateTypeRanges(tokens, points)
  // const result = print(source, points, ranges)

  const end = performance.now()
  console.log(`Timing ranges: ${end - start}ms`)
  
  return result
}

start()
