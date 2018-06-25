const { sortStart, sortEnd } = require('./highlight')

const initialStart = [
  { length: 10 },
  { length: 7 },
  { length: 4 },
  { length: 2 },
]
const initialEnd = [
  { length: 2 },
  { length: 4 },
  { length: 7 },
  { length: 10 },
]

let startRanges
let endRanges

beforeEach(() => {
  startRanges = [...initialStart]
  endRanges = [...initialEnd]
})

test('sortStart - insert center', () => {
  const result = sortStart(startRanges, { length: 5 })

  expect(result).toEqual([
    { length: 10 },
    { length: 7 },
    { length: 5 },
    { length: 4 },
    { length: 2 },
  ])
})

test('sortStart - insert start', () => {
  const result = sortStart(startRanges, { length: 11 })

  expect(result).toEqual([
    { length: 11 },
    { length: 10 },
    { length: 7 },
    { length: 4 },
    { length: 2 },
  ])
})

test('sortStart - insert end', () => {
  const result = sortStart(startRanges, { length: 1 })

  expect(result).toEqual([
    { length: 10 },
    { length: 7 },
    { length: 4 },
    { length: 2 },
    { length: 1 },
  ]);
})

test('sortEnd - insert center', () => {
  const result = sortEnd(endRanges, { length: 5 })

  expect(result).toEqual([
    { length: 2 },
    { length: 4 },
    { length: 5 },
    { length: 7 },
    { length: 10 },
  ])
})

test('sortEnd - insert start', () => {
  const result = sortEnd(endRanges, { length: 1 })

  expect(result).toEqual([
    { length: 1 },
    { length: 2 },
    { length: 4 },
    { length: 7 },
    { length: 10 },
  ])
})

test('sortEnd - insert end', () => {
  const result = sortEnd(endRanges, { length: 11 })

  expect(result).toEqual([
    { length: 2 },
    { length: 4 },
    { length: 7 },
    { length: 10 },
    { length: 11 },
  ])
})