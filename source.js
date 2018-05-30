const mainScope = 1

function innerScope() {
  let b = 0

  console.log(b)
  b = b + 2
  console.log(b)
}