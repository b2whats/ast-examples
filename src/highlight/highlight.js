const fs = require('fs')
const { performance } = require('perf_hooks')
const { parse, traverse } = require('@babel/core')

const source = fs.readFileSync('./src/highlight/source-test.js', 'utf8')

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
        noSplit: false,
        open() {
          return `<span class='${path.type}'>`
        },
        close() {
          return `</span><!--${path.type}-->`
        },
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
  return a.start - b.start || b.end - a.end
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
  ranges.unshift({
    start: 75,
    end: 95,
    type: 'high',
    noSplit: true,
    open() {
      return `<span class='high'>`
    },
    close() {
      return `</span>`
    }
  })
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
      points[range.start] = []
    }

    if (!points[range.end]) {
      points[range.end] = []
    }

    //--|====|====|=====|--------------- stackRange
    //-------|============|------------ range
    //------------|=======|=====|------- range
    //---------------------------|==|-- range

    //--|====|=========|--------------- stackRange
    //-------|============|------------ range
    //-------|============|------- range
    //---------------------------------|==|-- range


    //--|=========|===========|--------- stackRange
    //-------|====|========|------------ range
    //------------|============|------- range
    //---------------------------|==|-- range
    let stacksLength = stacks.length
    while (stacksLength--) {
      let stackRange = stacks[stacksLength]

      if (stackRange.end <= range.start) {
        !stackRange.noSplit && points[stackRange.end].push(stackRange.close)

        stacks.splice(stacksLength, 1)
      }
    }

    for (let stackIndex = 0; stackIndex < stacks.length; stackIndex++) {
      const stackRange = stacks[stackIndex]

      if (range.start > stackRange.start && range.start < stackRange.end && range.end > stackRange.end) {
        if (stackRange.noSplit) {
          points[stackRange.end].push(range.close)
        } else {
          points[range.start].push(stackRange.close)
        }
      }
    }

    points[range.start].push(range.open)

    for (let stackIndex = 0; stackIndex < stacks.length; stackIndex++) {
      const stackRange = stacks[stackIndex]

      if (range.start > stackRange.start && range.start < stackRange.end && range.end > stackRange.end) {
        if (stackRange.noSplit) {
          points[stackRange.end].push(stackRange.close, range.open)
        } else {
          points[range.start].push(stackRange.open)
        }
      }
    }

    stacks.push(range)

    // while (stacksLength--) {
    //   let stackRange = stacks[stacksLength]


    //   //--|=====|----- stackRange
    //   //-----|=====|-- range
    //   if (range.start > stackRange.start && range.start < stackRange.end && range.end > stackRange.end) {
    //     points[range.start] = range.start

    //     continue
    //   }

    //   //-----|=====|-- stackRange
    //   //--|=====|----- range
    //   if (range.start < stackRange.start && range.end > stackRange.start && range.end < stackRange.end) {

    //     continue
    //   }
    // }
  }

  let stacksLength = stacks.length
  while (stacksLength--) {
    let stackRange = stacks[stacksLength]

    points[stackRange.end].push(stackRange.close)
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

    result += source.slice(cursor, step)

    for (let i = 0; i < points[step].length; i++) {
      result += points[step][i]()
    }

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