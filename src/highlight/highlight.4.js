const fs = require('fs')
const { performance } = require('perf_hooks')
const { parse, traverse } = require('@babel/core')

const source = fs.readFileSync('./source.js', 'utf8')

const options = {
  parserOpts: {
    sourceType: 'module',
    plugins: ['jsx'],
  },
}

const state = {
  ranges: [],
}

const generateRanges = (source) => {
  const start = performance.now()

  const ast = parse(source, options)

  const visitor = {
    enter(path, state) {
      state.ranges.push({
        start: path.node.start,
        end: path.node.end,
        type: path.type,
        length: path.node.end - path.node.start,
        split: [],
      })
    }
  }

  traverse(ast, visitor, null, state)

  const end = performance.now()
  console.log(`Timing generateRanges ${end - start}ms`)

  return state.ranges
}

const sortStart = (ranges, item) => {
  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i]

    if (item.length > range.length) {
      ranges.splice(i, 0, item)

      return ranges
    }
  }

  ranges.push(item)

  return ranges
}

const sortEnd = (ranges, item) => {
  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i]

    if (item.length < range.length) {
      ranges.splice(i, 0, item)

      return ranges
    }
  }

  ranges.push(item)

  return ranges
}

function sortByStartAndLength(a, b) {
  const startA = a.start
  const startB = b.start

  const lengthA = a.length
  const lengthB = b.length

  if (startA < startB) return -1;
  if (startA > startB) return 1;

  if (lengthA > lengthB) return -1;
  if (lengthA < lengthB) return 1;
  
  return 0
}

const sortNumber = (a, b) => {
  return a - b
}

const insertSort = (arr) => {
  for (let i = 0, len = arr.length; i < len; i++) {
      let j = i
      let item = arr[j]

      for(; j > 0 && arr[j - 1] > item; j--) {
          arr[j] = arr[j - 1]
      }

      arr[j] = item
  }

  return arr
}

const generatePoints = (ranges) => {
  const start = performance.now()
  ranges.unshift({ start: 75, end: 95, length: 20, type: 'high', noSplit: true, split: [] })
  const startSort = performance.now()
  const sortRanges = ranges.sort(sortByStartAndLength)
  const endSort = performance.now()
  console.log(`Timing sortRanges ${endSort - startSort}ms`)

  const points = {}
  let stacks = []
  let cursor = 0

  for (let i = 0; i < sortRanges.length; i++) {
    const range = ranges[i]
    cursor = range.start

    if (!points[range.start]) {
      points[range.start] = { start: [], end: [] }
    }

    if (!points[range.end]) {
      points[range.end] = { start: [], end: [] }
    }

    let stacksLength = stacks.length
    while (stacksLength--) {
      let stackRange = stacks[stacksLength]

      if (stackRange.end <= cursor) {
        // points[stackRange.start].start.push(stackRange)
        // points[stackRange.end].end.push(stackRange)
        points[stackRange.start].start = sortStart(points[stackRange.start].start, stackRange)
        points[stackRange.end].end = sortEnd(points[stackRange.end].end, stackRange)

        stacks.splice(stacksLength, 1)

        continue
      }

      //--|=====|----- stackRange
      //-----|=====|-- range
      if (range.start > stackRange.start && range.start < stackRange.end && range.end > stackRange.end) {
        //--|=====|----- stackRange
        //-----|==|----- range1
        //--------|==|-- range2
        if (range.noSplit) {
          stacks.splice(stacksLength, 1,
            { ...stackRange, end: range.start },
            { ...stackRange, start: range.start },
          )
        } else {
          range.split.push(stackRange.end)
        }

        continue
      }

      //-----|=====|-- stackRange
      //--|=====|----- range
      if (range.start < stackRange.start && range.end > stackRange.start && range.end < stackRange.end) {
        //-----|=====|-- stackRange
        //--|==|-------- range1
        //-----|==|----- range2
        if (range.noSplit) {
          stacks.splice(stacksLength, 1,
            { ...stackRange, end: range.end },
            { ...stackRange, start: range.end },
          )
        } else {
          range.split.push(stackRange.start)
        }

        continue
      }
    }

    if (range.noSplit) {
      stacks.unshift(range)
    } else {
      if (range.split.length === 0) {
        stacks.push(range)

        continue
      }

      insertSort(range.split)

      let cursor = range.start

      range.split.forEach(point => {
        stacks.push({ ...range, start: cursor, end: point, length: point - cursor })

        cursor = point
      })

      range.start = cursor
      range.length = range.end - cursor
      
      stacks.push(range)
    }
  }

  for (let i = 0; i < stacks.length; i++) {
    const range = stacks[i]
    
    // points[range.start].start.push(range)
    // points[range.end].end.push(range)

    points[range.start].start = sortStart(points[range.start].start, range)
    points[range.end].end = sortEnd(points[range.end].end, range)
  }

  const end = performance.now()
  console.log(`Timing generatePoints ${end - start}ms`)

  return points
}


const html = (text) => `
<style>
  .Numeric { color: blue; }
  .Identifier { font-weight: bold; }
  .Line:hover { background-color: rgba(182, 182, 182, 0.247) }
</style>

<pre>${text}</pre>
`

const print = (source, points) => {
  const start = performance.now()

  let result = ''
  const steps = Object.keys(points)
  let cursor = 0

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]

    // const start = points[step].start.sort((a, b) => {
    //   if (!!a.noSplit < !!b.noSplit) return 1
    //   if (!!a.noSplit > !!b.noSplit) return -1

    //   if (a.length < b.length) return 1
    //   if (a.length > b.length) return -1

    //   return 0
    // })

    // const end = points[step].end.sort((a, b) => {
    //   if (!!a.noSplit > !!b.noSplit) return 1
    //   if (!!a.noSplit < !!b.noSplit) return -1

    //   if (a.length > b.length) return 1
    //   if (a.length < b.length) return -1

    //   return 0
    // })

    const { start, end } = points[step]

    result += source.slice(cursor, step)
    result += end.map(range => `</span>`).join('')
    result += start.map(range => `<span class='${range.type}'>`).join('')

    cursor = step
  }

  const end = performance.now()
  console.log(`Timing print ${end - start}ms`)

  return result
}

const ranges = generateRanges(source)

const start = performance.now()

const points = generatePoints(ranges)

const text = print(source, points)

const end = performance.now()
console.log(`Timing payload ${end - start}ms`)

fs.writeFileSync('./src/highlight/output.html', html(text), 'utf8')


module.exports = {
  sortStart,
  sortEnd,
}