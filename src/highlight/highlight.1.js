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

const generateStepperPoint = (ranges) => {
  const points = {}

  for (const range of ranges) {
    points[range.start] = true
    points[range.end] = true
  }

  return Object.keys(points)
}

function swap(points){
  let result = {}

  for (let i = 0; i < points.length; i++) {
    result[points[i]] = i
  }

  return result
}

const matchPointToRange = (ranges, points) => {
  const result = {}

  const indexesPoint = swap(points)

  for (const range of ranges) {
    const start = indexesPoint[range.start]
    const end = indexesPoint[range.end]

    for (let i = start; i < end; i++) {
      const point = points[i]

      if (result[point]) {
        result[point].push(range.type)
      } else {
        result[point] = [range.type]
      }
    }
  }

  return result
}

const print2 = (source, points, pointsWithRanges) => {
  let cursor = 0
  let result = ''
  let notClosedTag = false

  for (let i = 0; i < points.length; i++) {
    const point = points[i]
    const className = pointsWithRanges[point]

    result += source.slice(cursor, point)

    if (notClosedTag) {
      result += `</span>`

      notClosedTag = false
    }

    if (className) {
      result += `<span class='${className.join(' ')}'>`

      notClosedTag = true
    }

    cursor = point
  }

  if (source.length > points[points.length - 1]) {
    result += source.slice(points[points.length - 1])
  }

  return result
}
const print = (source, points, pointWithRanges) => {
  let result = source.slice(0, points[0])

  for (let i = 0; i < points.length - 1; i++) {
    const point = points[i]
    const className = pointWithRanges[point]
    const entry = source.slice(point, points[i + 1])

    if (className) {
      result += `<span class='${className.join(' ')}'>${entry}</span>`
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

  const ranges = generateRanges(source)
  const points = generateStepperPoint(ranges)
  const pointsWithRanges = matchPointToRange(ranges, points)


  const result = print(source, points, pointsWithRanges)


  const end = performance.now()
  console.log(`Timing points: ${end - start}ms`)

  return result
}

const algoritmPoints2 = () => {
  const start = performance.now()

  const ranges = generateRanges(source)
  const points = generateStepperPoint(ranges)
  const pointsWithRanges = matchPointToRange(ranges, points)


  const result = print(source, points, pointsWithRanges)


  const end = performance.now()
  console.log(`Timing points2: ${end - start}ms`)

  return result
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


const algoritmRanges = () => {
  const start = performance.now()

  const ranges = generateRanges(source)

  let stack = []
  const ranges = {}

  for (let range of ranges) {

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

// fs.writeFileSync('./src/highlight/outputRange.html', html(algoritmRanges()), 'utf8')
// fs.writeFileSync('./src/highlight/output.html', html(algoritmPoints()), 'utf8')






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

const emptyRanges = (step) => {
  const ranges = new Map()

  for (let i = 0; i < step.length - 1; i++) {
    const start = step[i]
    const end = step[i + 1]

    ranges.set(`${start}-${end}`, { start, end, className: [] })
  }

  return ranges
}

const matchStepsToRange = (ranges, steps) => {
  const result = {}

  const hashStep = swap(steps)
  for (let indexRange = 0; indexRange < ranges.length; indexRange++) {
    const range = ranges[indexRange];

    const start = hashStep[range.start]
    const end = hashStep[range.end]

    for (let i = start; i < end; i++) {
      const step = steps[i]

      if (result[step]) {
        result[step].push(range.type)
      } else {
        result[step] = [range.type]
      }
    }
  }

  return result
}

const print4 = (source, steps, stepsWithRange) => {
  let result = ''

  for (let i = 0; i < steps.length - 1; i++) {
    const start = steps[i]
    const end = steps[i + 1]
    const className = stepsWithRange[start]
    const entry = source.slice(start, end)

    if (className) {
      result += `<span class='${className.join(' ')}'>${entry}</span>`
    } else {
      result += entry
    }
  }

  return result
}

const splitRanges = (ranges, steps) => {
  const result = emptyRanges(steps)

  const hashStep = swap(steps)

  for (const range of ranges) {
    const start = hashStep[range.start]
    const end = hashStep[range.end]

    for (let i = start; i < end; i++) {
      const rangeIndex = `${steps[i]}-${steps[i+1]}`
      const item = result.get(rangeIndex)

      item.className.push(range.type)
    }
  }

  return result
}

const print3 = (source, ranges) => {
  let result = ''

  for (let range of ranges.values()) {
    const entry = source.slice(range.start, range.end)

    result += `<span class='${range.className.join(' ')}'>${entry}</span>`
  }

  return result
}

const algoritm3 = () => {
  const start = performance.now()

  const ranges = generateRanges(source)
  const steps = generateSteps(source, ranges)
  const rangeToPoint = splitRanges(ranges, steps)
  const result = print3(source, rangeToPoint)

  const end = performance.now()
  console.log(`Timing ranges2: ${end - start}ms`)

  return result
}

const algoritm4 = () => {
  const start = performance.now()

  const ranges = generateRanges(source)
  const steps = generateSteps(source, ranges)
  const stepsWithRange = matchStepsToRange(ranges, steps)
  const result = print4(source, steps, stepsWithRange)

  const end = performance.now()
  console.log(`Timing point4: ${end - start}ms`)

  return result
}


// fs.writeFileSync('./src/highlight/outputRange2.html', html(algoritm3()), 'utf8')
// fs.writeFileSync('./src/highlight/outputSteps.html', html(algoritm4()), 'utf8')

algoritmRanges()
// algoritmPoints2()
// algoritmPoints()