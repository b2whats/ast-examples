class Source {
  constructor(code) {
    if (typeof code !== 'string') throw new Error('Source code should be a string')
    if (code === '') throw new Error('Source code is empty')

    this.source = code
    this.lines = [''].concat(code.split('\n'))
  }

  getLines(from, to = from) {
    if (typeof from !== 'number') throw new Error('Range value `from` should be a number')

    return this.lines.slice(from, to + 1).join('\n')
  }

  getFragment({ start, end }) {
    const lastLine = this.lines[end.line]

    const fragment = this.getLines(start.line, end.line)
    const fragmentStart = start.column
    const fragmentLength = fragment.length - fragmentStart - lastLine.length + end.column
    const fragmentEnd = fragmentStart + fragmentLength

    return {
      fragment,
      start: fragmentStart,
      end: fragmentEnd,
      length: fragmentLength,
    }
  }

  getFragmentWithExtraLines({ start, end }, extra) {
    const fragment = this.getFragment({ start, end })

    if (!extra) return fragment

    const beforeFragment = this.getLines(start.line - extra, start.line - 1)
    const afterFragment = this.getLines(end.line + 1, end.line + extra)

    const fragmentStart = fragment.start + beforeFragment.length + 1 // + end line

    return {
      fragment: `${beforeFragment}\n${fragment.fragment}\n${afterFragment}`,
      start: fragmentStart,
      end: fragmentStart + fragment.length,
      length: fragment.length,
    }
  }

  getFragmentTextFromSource(start, end) {
    return this.source.substring(start, end)
  }
}

module.exports = Source