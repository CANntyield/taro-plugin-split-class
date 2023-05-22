import parser from 'postcss-selector-parser'
import { PROPERTY_VALUE_CLASS_NAME_PREFIX, PSEUDO_CLASS_NAME_PREFIX, GLOBAL_CLASS_NAME, CSS_SHORTHAND_PROPERTIES_MAP, CSS_PROPERTIES_TO_SHORTHAND_MAP } from './constant'
import { isDev, generateClassName, isCommonClassNameSelector, handlePseudoClassOrElement, getClassName, isCssModulesFile, devSourceClassName } from './utils'

const transformFunc = (generatePseudoClassName: () => string, classNameMap, noCommonClassNameMap, white?: (string | RegExp)[]) => {
  return function transform(selector){
    if (!selector) return
    if (selector.type === 'root') {
      const nodes = selector.nodes || []
      for (let i = 0; i < nodes.length; i++) {
        const selector = nodes[i]
        if (selector.type === 'selector') {
          const nodes = selector.nodes || []
          for (let i = 0; i < nodes.length; i++) {
            const selector = nodes[i]
            if (selector.type === 'class') {
              if (white && white.some?.(r => selector.value.match(r))) {

              } else {
                if (classNameMap[selector.value]) {
                  selector.value = classNameMap[selector.value]
                } else {
                  const newClassName = generatePseudoClassName()
                  classNameMap[selector.value] = newClassName
                  noCommonClassNameMap[selector.value] = newClassName
                  selector.value = newClassName
                }
              }
            } else if (selector.type === 'pseudo') {
              if (selector.value === GLOBAL_CLASS_NAME) {
                if (selector.nodes && selector.nodes.length > 0) {
                  const node = selector.nodes[0].nodes[0] || []
                  const className = parser.className({value: node.value});
                  selector.replaceWith(className)
                } else {
                  selector.remove()
                  break
                }
              }
            }
          }
        }
      }
    }
  }
};

interface Options {
  propertyClassNameMap?: Record<string, string>
  fileOldClassNameMap: Record<string, Record<string, string>>
  classNameWhite?: (string | RegExp)[]
}

const plugin = (options?: Options) => {
    // 生成rule时的最短类名 如 ._a {display:flex}
    const generateOneClassName: () => string = generateClassName(PROPERTY_VALUE_CLASS_NAME_PREFIX)
    
    // 生成用于处理伪类的类名 如 .txt::after   =>   .-a::after
    const generatePseudoClassName: () => string = generateClassName(PSEUDO_CLASS_NAME_PREFIX)

    const propertyClassNameMap = options?.propertyClassNameMap || {} // 全局property对应的className
    const fileOldClassNameMap = options?.fileOldClassNameMap || {} // 全局压缩前className对应的压缩后className
    const classNameWhite = options?.classNameWhite

    return ({
        postcssPlugin: 'split-css-property-postcss',
        Once(root, { Rule, Declaration }) {
          const filePath = root.source.input.file
          const devClassName = devSourceClassName(filePath)
          if (!isCssModulesFile(filePath)) {
            return
          }
          const map = {}

          const cssProperty = {} // propertyValue ex. {'padding': "padding!11px&padding-bottom!22px"}
          const classNameMinifyMap = {} // 用于存储缩小className时的映射 ex. {txt: '-a'}

          root.walkRules(rule => {
            let selector = rule.selector
            if (selector.startsWith(GLOBAL_CLASS_NAME + ' ')) { // 以:global 开头的rule，不进行后续类名替换
              rule.selector = selector = selector.replace(GLOBAL_CLASS_NAME + ' ', '')
              return
            }

            if (isCommonClassNameSelector(selector)) {
              const { name: classNameSelector, pseudo } = handlePseudoClassOrElement(selector)
              const className = getClassName(classNameSelector)
              if (classNameWhite && classNameWhite.some?.(r => className.match(r))) {
                return
              }
              let newClassName = ''
              if (pseudo.length === 0) {
                const propertyMap = new Map()
                const shorthandCssPropertySet = new Set() // 该rule包含了哪些缩写属性

                rule.walkDecls(decl => {
                  if (CSS_SHORTHAND_PROPERTIES_MAP[decl.prop]) {
                    shorthandCssPropertySet.add(decl.prop)
                  }
                })

                rule.walkDecls(decl => {
                  const shorthandPropertyName = CSS_PROPERTIES_TO_SHORTHAND_MAP[decl.prop] // 该属性是否有对应的缩写属性 
                  if (shorthandCssPropertySet.has(shorthandPropertyName)) { // rule中是否有过该缩写属性
                    const shorthandPropertyValue = propertyMap.get(shorthandPropertyName)
                    if (shorthandPropertyValue) {
                      propertyMap.set(shorthandPropertyName, shorthandPropertyValue + '&' + decl.prop + '!' + decl.value)
                    } else {
                      propertyMap.set(shorthandPropertyName, decl.prop + '!' + decl.value)
                    }
                  } else {
                    propertyMap.set(decl.prop, decl.prop + '!' + decl.value)
                  }
                  decl.remove()
                });

                propertyMap.forEach((value) => {
                  const cssProperty = value

                  if (map[cssProperty]) {
                    newClassName += ' ' + map[cssProperty]
                  } else {
                    if (propertyClassNameMap[cssProperty]) { // 全局有同样的propertyValue对应的className了
                      const oldClassName = propertyClassNameMap[cssProperty]
                      map[cssProperty] = oldClassName
                      newClassName += ' ' + oldClassName
                    } else {
                      const oneClassName = generateOneClassName()
                      propertyClassNameMap[cssProperty] = oneClassName
                      map[cssProperty] = oneClassName
                      newClassName += ' ' + oneClassName
                    }
                  }

                })
                rule.remove()
              } else {
                if (classNameMinifyMap[className]) {
                  newClassName = classNameMinifyMap[className]
                } else {
                  newClassName = generatePseudoClassName()
                }
                rule.selector = '.' + newClassName + pseudo
              }
              cssProperty[className] = cssProperty[className] ? cssProperty[className] + ' ' + newClassName : newClassName
              if (isDev) {
                const devName = devClassName + '_' + className
                if (!cssProperty[className].includes(devName)) {
                  cssProperty[className] = devName  + ' ' + cssProperty[className]
                }
              }
            } else {
              const noCommonClassNameMap = {}
              const processor = parser(transformFunc(generatePseudoClassName, classNameMinifyMap, noCommonClassNameMap, classNameWhite))
              const newSelector = processor.processSync(rule.selector)
              rule.selector = newSelector

              Object.keys(noCommonClassNameMap).forEach(item => {
                cssProperty[item] = cssProperty[item] ? cssProperty[item] + ' ' + noCommonClassNameMap[item] : noCommonClassNameMap[item]
                if (isDev) {
                  const devName = devClassName + '_' + item
                  if (!cssProperty[item].includes(devName)) {
                    cssProperty[item] = devName  + ' ' + cssProperty[item]
                  }
                }
              })
            }
          });
          for (let key in map) {
            let rule = new Rule({ selector: '.' + map[key], raws: {between: '', after: '', semicolon: false} })

            const cssPropertyList = key.split('&')
            cssPropertyList.forEach(prop => {
              const list = prop.split('!')
              let decl = new Declaration({ prop: list[0], value: list[1], raws: {before: '', between: ':'} })
              rule.append(decl)
            })

            root.append(rule)
          }

          fileOldClassNameMap[filePath] = cssProperty
        }
    })
};

plugin.postcss = true;

export default plugin
