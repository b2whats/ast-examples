const fs = require('fs')
const esprima = require('esprima')
const { performance } = require('perf_hooks')

const source = fs.readFileSync('./src/highlight/source.js', 'utf8')

const generateTokens = (source) => {
  const tokens = esprima.tokenize(source, {
      comment: true,
      range: true
  })

  let offset = 0

  const lines = source.split('\n').map(line => {
    return { type: 'Line', start: offset, end: (offset += line.length+ 1)}
  })

  return [].concat(
    lines,
    tokens.map(({range: [start, end], ...token}) => ({ ...token, start, end }))
  )
}

const generateStepPoint = (ranges) => {
  const points = {}

  for (const range of ranges) {
    if (points[range.start]) {
      points[range.start].push(range)
    } else {
      points[range.start] = [range]
    }

    points[range.end] = null
  }

  return points
}

const generateStartPointRanges = (ranges) => {
  const points = {}

  for (const range of ranges) {
    if (points[range.start]) {
      points[range.start].push(range)
    } else {
      points[range.start] = [range]
    }

    points[range.end] = null
  }

  return points
}
const splitRanges = (ranges, points) => {
  const result = {}

  const hashMapPoints = Object.keys(points).reduce((acc, x, index) => {
    acc[x] = index
  
    return acc
  }, {})

  for (const range of ranges) {
    const start = hashMapPoints[range.start]
    const end = hashMapPoints[range.end]

    for (let i = start; i < end; i++) {
      const startPoint = points[i]

      if (result[startPoint]) {
        result[startPoint].push(range.type)
      } else {
        result[startPoint] = [range.type]
      }
    }
  }

  return result
}

const print = (source, points, startPointRanges) => {
  let result = source.slice(0, points[0])

  for (let i = 0; i < points.length - 1; i++) {
    const point = points[i]
    const ranges = startPointRanges[point]
    const entry = source.slice(point, points[i + 1])

    if (ranges) {
      result += `<span class='${ranges.join(' ')}'>${entry}</span>`
    } else {
      result += entry
    }
  }

  if (source.length > points[points.length - 1]) {
    result += source.slice(points[points.length - 1])
  }

  return result
}

const printRanges = (source, ranges) => {
  let result = ''
  let cursor = 0

  let className = []

  for (const range of ranges) {
    if (cursor < range.start) {
      const entry = source.slice(cursor, range.start)
      
      if (className.length) {
        result += `<span class='${className.join(' ')}'>${entry}</span>`

        className = []
      } else {
        result += entry
      }
    }

    className.push(range.type)

    cursor = range.start
  }

  return result
}

const html = (text) => `
<style>
  .Numeric { color: blue; }
  .Identifier { font-weight: bold; }
  .Line:hover { background-color: rgba(182, 182, 182, 0.247) }
</style>

<pre>${text}</pre>
`
const algoritmPoints = () => {
  const start = performance.now()

  const tokens = generateTokens(source)
  const points = generateStepPoint(tokens)
  const ranges = splitRanges(tokens, points)
  const result = print(source, points, ranges)

  const end = performance.now()
  console.log(`Timing points: ${end - start}ms`)

  return result
}

const algoritmRanges = () => {
  const start = performance.now()

  const tokens = generateTokens(source)
  const points = generateStartPointRanges(tokens)

  let buffer = []
  const ranges = []

  for (let point in points) {
    point = point | 0
    const range = points[point]

    if (range) {
      buffer = buffer.concat(range)
    }

    for (const index in buffer) {
      const item = buffer[index]

      if (item.start < point && item.end > point) {
        buffer.splice(index, 1, { ...item, end: point }, { ...item, start: point })
      }
    }

    for (const index in buffer) {
      const item = buffer[index]

      if (item.end <= point) {
        ranges.push(buffer.splice(index, 1)[0])
      }
    }

    // for (const index in buffer) {
    //   const item = buffer[index]

    //   if (item.start < point && item.end > point) {
    //     ranges.push({ ...item, end: point })

    //     item.start = point
    //   }
      
    //   if (item.end <= point) {
    //     ranges.push(buffer.splice(index, 1)[0])
    //   }
    // }

  }

  const result = printRanges(source, ranges)

  // const ranges = generateTypeRanges(tokens, points)
  // const result = print(source, points, ranges)

  const end = performance.now()
  console.log(`Timing ranges: ${end - start}ms`)
  
  return result
}

fs.writeFileSync('./src/highlight/outputRange.html', html(algoritmRanges()), 'utf8')
fs.writeFileSync('./src/highlight/output.html', html(algoritmPoints()), 'utf8')



