module.exports = {
  Program: (nodePath) => {
    console.log('Program')
    // nodePath.traverse(evaluateVisitor)
  },
  VariableDeclarator: (nodePath) => {
    nodePath.scope.crawl()
    
    if (nodePath.get('id').isIdentifier()) {
      const {name} = nodePath.node.id
      if (name in nodePath.scope.bindings) {
        const binding = nodePath.scope.bindings[name]
        nodePath.remove()
      }
    }
  }
}
