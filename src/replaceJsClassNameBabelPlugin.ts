import { PluginObj, PluginPass } from '@babel/core'
import * as Types from '@babel/types'

import pathUtils from 'path'
import { isCssModulesFile } from './utils'

interface ReplacePluginPass extends PluginPass {
  file: any
  importNameList: string[]
  styleMap?: null | Record<string, string>
  opts: {
    fileOldClassNameMap: Record<string, Record<string, string>>
    hasCssModulesList: string[]
  }
}

// 变量值是否来自import的
function isImportScope(path, name) {
  const bindings = path.scope.bindings[name]

  if (!bindings && path.parentPath) {
    return isImportScope(path.parentPath, name)
  } else {
    return !!bindings && bindings.kind === 'module'
  }
}

function ReplaceJsClassNameBabelPlugin({ types: t }: { types: typeof Types }): PluginObj<ReplacePluginPass> {
  return {
    pre() {
      this.importNameList = []
      this.styleMap = null
    },

    visitor: {
        Program(path, state: ReplacePluginPass) {
          const fileOldClassNameMap = state.opts.fileOldClassNameMap || {}
          const hasCssModulesList = state.opts.hasCssModulesList || []
          const curFilePath = state.filename || ''

          path.get('body').forEach(item => {
            let sourcePath = ''
            let importPath = ''
            if (t.isImportDeclaration(item)) {
              sourcePath = (item.node as Types.ImportDeclaration).source?.value || ''
              importPath = pathUtils.resolve(curFilePath, '../' , sourcePath)
              if (isCssModulesFile(importPath) && !hasCssModulesList.includes(curFilePath)) {
                hasCssModulesList.push(curFilePath) 
              }
            }
            if (t.isImportDeclaration(item) && importPath && isCssModulesFile(importPath) && fileOldClassNameMap[importPath]) {
              const specifier = (item.node as Types.ImportDeclaration).specifiers[0]
              if (t.isImportDefaultSpecifier(specifier)) {
                this.importNameList.push(specifier.local.name)
              }

              const newImportNode = t.importDeclaration([], t.stringLiteral(sourcePath)) // 替换Style['txt']为txt后，Style会未被引用，从而被treeshaking
              item.replaceWith(
                newImportNode
              ); // 改import Style from './index.module.scss'为 import './index.module.scss'
              this.styleMap = fileOldClassNameMap[importPath]
            }
          })
        },
        Identifier(path) { // 标识符替换
          if (this.styleMap && path.isReferencedIdentifier()) {
              const classNameMap = this.styleMap
              if (this.importNameList.includes(path.node.name) && isImportScope(path, path.node.name)) { // 有对应的importName
                  if (t.isMemberExpression(path.parent)) { // 有使用对应属性
                      let name;

                      if (t.isIdentifier(path.parent.property)) { // 形如 style.xx
                          name = path.parent.property.name;
                      } else if (t.isStringLiteral(path.parent.property)) { // 形如 style[xx]
                          name = path.parent.property.value
                      } else {
                          throw new Error('Style中只允许字符串，不允许表达式')
                      }

                      if (classNameMap[name]) {// 有对应的map值
                        path.parentPath.replaceWith(t.stringLiteral(classNameMap[name]))
                      } else if (classNameMap) {
                        path.parentPath.replaceWith(t.stringLiteral(name))
                      }
                  } else {
                      path.replaceWith(t.objectExpression([])) // 替换为空表达式
                  }
              }

          }
        }
    },
  }
}

export default ReplaceJsClassNameBabelPlugin