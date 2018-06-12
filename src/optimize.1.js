const t = require('@babel/types')
const WasCreated = Symbol('WasCreated')

const valueToLiteral = value => {
  let node
  switch (typeof value) {
    case 'string': {
      node = t.stringLiteral(value)
      node[WasCreated] = true
      return node
    }
    case 'number': {
      node = t.numericLiteral(value)
      node[WasCreated] = true
      return node
    }
    case 'boolean': {
      node = t.booleanLiteral(value)
      node[WasCreated] = true
      return node
    }
  }
}

const evaluateVisitor = {
  exit: (nodePath) => {
    if (nodePath.node[WasCreated]) { 
      nodePath.node[WasCreated] = false
      return
    }
    nodePath.scope.crawl()
    const {confident, value} = nodePath.evaluate()
    if (confident) {
      const val = valueToLiteral(value)
        val ? nodePath.replaceWith(val) : nodePath.remove()
    }
  },
  ReferencedIdentifier: (nodePath) => {
    nodePath.scope.crawl()
    const {name} = nodePath.node
    if (name in nodePath.scope.bindings) {
      const binding = nodePath.scope.bindings[name]
      const statement = nodePath.getStatementParent()
      const violations = statement.getAllPrevSiblings().filter(p => {
        return binding.constantViolations.filter(v => v.node.start === p.node.start).length > 0
      })
      if (violations.length === 0) {
        const {confident, value} = binding.path.get('init').evaluate()
        nodePath.replaceWith(valueToLiteral(value))
        return
      }

      // console.log('!', violations.getSource())
    }
  },
  AssignmentExpression: {
    exit: (nodePath) => {
      nodePath.scope.crawl()
      if (nodePath.get('left').isIdentifier()) {
        const {name} = nodePath.node.left
        if (name in nodePath.scope.bindings) {
          const binding = nodePath.scope.bindings[name]
          const statement = nodePath.getStatementParent()
          const refs = statement.getAllPrevSiblings().filter(p => {
            return binding.referencePaths.filter(r => r.node.start === p.node.start).length > 0
          })
          if (refs.length === 0) {
            const {operator, right} = nodePath.node
            if (operator === '=') {
              binding.path.get('init').replaceWith(right)
            } else {
              const left = binding.path.node.init
              const init = t.binaryExpression(operator.substr(0, 1), left, right)
              binding.path.get('init').replaceWith(init)
            }
            nodePath.remove()
          }
        }
      }
    }
  },
}

module.exports = {
  // Program: (nodePath) => {
  //   nodePath.traverse(evaluateVisitor)
  // },
  // VariableDeclarator: (nodePath) => {
  //   nodePath.scope.crawl()
    
  //   if (nodePath.get('id').isIdentifier()) {
  //     const {name} = nodePath.node.id
  //     if (name in nodePath.scope.bindings) {
  //       nodePath.remove()
  //     }
  //   }
  // }
}
