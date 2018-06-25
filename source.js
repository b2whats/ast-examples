'use strict'

const a = 1

function innerScope() {
  const b = a

  for (let index = 0; index < 5; index++) {
    acc1[index] = true
  } // comment
  
  a = 3

  return a + b
}