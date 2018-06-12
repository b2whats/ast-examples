const t = require('@babel/types')
const imports = []

module.exports = {
  ImportDeclaration(path) {
    const specifiers = path.node.specifiers
    const source = path.node.source
    
    const meta = {
      component: null,
      references: null,
      alias: false,
      namespace: false,
      source: source.value,
    }
    
    // import './path'
    // import {} from './path'
    if (specifiers.length === 0) {
      imports.push(meta)
    
      return
    }
    
    for (const specifier of specifiers) {
      const localName = specifier.local.name
        
      // import A from './path'
      // import { default as A } from './path'
      // import A, {} from './path'
      if (t.isSpecifierDefault(specifier) ) {
        imports.push({
          ...meta,
          component: localName,
          references: path.scope.getBinding(localName).referencePaths
        })
      
        continue
      }
      

      // import { A } from './path'
      // import { A as ...} from './path'
      if (t.isImportSpecifier(specifier) ) {
        const importedName = specifier.imported.name
        const isAlias = localName !== importedName
        
        imports.push({
          ...meta,
          alias: isAlias && localName,
          component: importedName,
          references: path.scope.getBinding(localName).referencePaths
        })
      
        continue
      }

      // import * as A from './path'
      if (t.isImportNamespaceSpecifier(specifier)) {
        imports.push({
          ...meta,
          namespace: true,
          references: path.scope.getBinding(localName).referencePaths
        })
      
        continue
      }
    }
  }
}