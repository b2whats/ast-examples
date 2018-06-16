const t = require('@babel/types')

module.exports = {
  ImportDeclaration(path, state) {
    const { imports } = state
    const { specifiers, source } = path.node
    
    const meta = {
      component: null,
      references: null,
      alias: false,
      namespace: false,
      source: source.value,
      fragment: path.getSource(),
    }
    
    // import './path'
    // import {} from './path'
    if (specifiers.length === 0) {
      imports.push(meta)
    
      return
    }
    
    for (const specifier of specifiers) {
      const localName = specifier.local.name
      const references = path.scope.getBinding(localName).referencePaths
        
      // import A from './path'
      // import { default as A } from './path'
      if (t.isSpecifierDefault(specifier) ) {
        imports.push({
          ...meta,
          references,
          component: localName,
        })
      
        continue
      }
      

      // import { A } from './path'
      // import { A as ... } from './path'
      if (t.isImportSpecifier(specifier) ) {
        const importedName = specifier.imported.name
        const isAlias = localName !== importedName
        
        imports.push({
          ...meta,
          references,
          alias: isAlias && localName,
          component: importedName,
        })
      
        continue
      }

      // import * as A from './path'
      if (t.isImportNamespaceSpecifier(specifier)) {
        imports.push({
          ...meta,
          references,
          namespace: true,
        })
      
        continue
      }
    }
  }
}