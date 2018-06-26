const DAY_MS = 24 * 60 * 60 * 1000

const isLeapYear = (year) => {
  if (year % 4 > 0 || (year % 100 === 0 && year % 400 > 0)) {
    return false
  } else {
    return true
  }
}

const daysInMonth = {
  1: 31,
  2: (year) => isLeapYear(year) ? 29 : 28,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31,
}

class CalendarDays {
  constructor() {
    const date = new Date()
    this.offset = date.getTimezoneOffset()
    this.month = {}
  }

  getDaysInMonth(year, month) {
    const days = daysInMonth[month + 1]

    if (typeof days === 'function') {
      return days(year)
    } else {
      return days
    }
  }

  getStartDayInMonth(year, month) {
    return new Date(year, month, 1, 0, -this.offset)
  }

  getDaysTime(startTime, length) {
    const days = []

    for (let i = 0; i < length; i++) {
      days[i] = startTime

      startTime += DAY_MS
    }

    return days
  }

  getLazyMonthMeta(year, month) {
    const key = `${year}-${month}`

    if (!this.month[key]) {
      const startDay = this.getStartDayInMonth(year, month)
      const startTime = startDay.getTime()
      const daysInMonth = this.getDaysInMonth(year, month)
      const beforeDays = startDay.getDay() - 1
      const afterDays = 7 - (daysInMonth % 7),

      const month = {
        days: this.getDaysTime(startTime, daysInMonth),
        daysInMonth,
        beforeDays,
        afterdays,
      }

      this.month[key] = month
    }

    return this.month[key]
  }

  renderDays(days, offset, render) {
    let start = offset || 0

    if (start < 0) {
      start = days.length + offset
    }

    for (let i = offset; i < days.length; i++) {
      const time = days[i];
      
      render(time , i + 1)
    }
  }

  renderMonthDays(year, month, render) {
    const beforeMonthMeta = this.getLazyMonthMeta(year, month)
    const monthMeta = this.getLazyMonthMeta(year, month)
    const afterMonthMeta = this.getLazyMonthMeta(year, month)

    this.renderDaysInMonth(beforeMonthMeta, beforeMonthMeta.daysInMonth - monthMeta.beforeDays)
  }
}