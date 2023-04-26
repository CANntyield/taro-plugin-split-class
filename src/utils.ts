import path from 'path'
import { REG_CSS_MODULES, PROPERTY_VALUE_CLASS_NAME_PREFIX } from './constant'

const isDev: boolean = process.env.NODE_ENV === 'development'

// 递增的生成唯一的className
function generateClassName(prefix: string): () => string {
  let index: number = 0
  return (): string => {
    let name = ''
    const arr: number[] = []
    const prevString = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const charString = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'
    const prevStringLength = prevString.length // 52
    const charStringLength = charString.length // 64
  
    if (index <= prevStringLength - 1) {
      name = prevString[index]
    } else {
      arr[0] = index % prevStringLength
      arr[1] = Math.floor(index / prevStringLength) - 1

      let temp = 0, quotient = 1
      do {
        temp = arr[quotient]
        if (temp >= charStringLength) {
          arr[quotient] = temp % charStringLength
          arr[++quotient] = Math.floor(temp / charStringLength) - 1
        } else {
          arr[quotient] = temp
          break
        }
      } while(true)
      
      name += prevString[arr[0]]
      for(let i = 1; i < arr.length ; i++) {
          if (arr[i] >= 0) {
            name += charString[arr[i]]
          }
      }
    }

    index++
    return prefix + name
  }
}

interface RepeatPropertyClassName {
  underlineClassNameList: string[],
  underlineClassNameMap: Record<string, boolean>,
  source: string,
}

// css: wxss、ttss等css文件内容
// globalUnderlineClassNameMap: 在app.wxss中已有的cssProperty
function handleRepeatPropertyClassName(css: string, globalUnderlineClassNameMap = {}): RepeatPropertyClassName {
  if (!css.includes(`.${PROPERTY_VALUE_CLASS_NAME_PREFIX}`)) {
    return {
      underlineClassNameList: [],
      underlineClassNameMap: {},
      source: css,
    }
  }
  if (css) {
    const underlineClassNameReg = new RegExp(`\\.${PROPERTY_VALUE_CLASS_NAME_PREFIX}[^{}]+{[^{}]+}`, 'g')
    const list = css.match(underlineClassNameReg) || [] // 匹配所有的以下划线_ 开头的class
    const newCode = css.replace(underlineClassNameReg, '') // 剔除掉下划线_开头 后的css 如.b{font-size:20px}
    const newList = list.filter(i => !globalUnderlineClassNameMap[i]) // 过滤掉所有app.wxss中的下划线样式
    const newClassNameList = Array.from(new Set(newList)) // 去重
    const newClassName = newClassNameList.join(isDev ? '\n' : '')

    const underlineClassNameMap = {}
    newClassNameList.forEach(cssProperty => { // css形如._a{font-size}
      underlineClassNameMap[cssProperty] = true
    })

    return {
      underlineClassNameList: newClassNameList,
      underlineClassNameMap: underlineClassNameMap,
      source: newClassName + '\n' + newCode,
    }
  }
  
  return {
    underlineClassNameList: [],
    underlineClassNameMap: {},
    source: '',
  }
}


// 是否是普通的className语法 .a, .b::before,  .c:first-child, .d ,
// 非普通className语法 .a.b, page .c, .e > .f
const isCommonClassNameSelector = (selector: string): boolean => {
  if (!selector) return false

  const common = selector.trim()
  const r = /\.[a-zA-Z_-][a-zA-Z0-9-_]*[:]{0,2}/g

  const s = selector.match(r)?.[0] || ''
  
  return (common.startsWith(s) && s !== selector && s.endsWith(':')) || s === selector
}

// .t::before   =>   {name: '.t', pseudo: '::before'}
const handlePseudoClassOrElement = (selector: string): {name: string, pseudo: string} => {
  const index = selector.indexOf(':')
  return {
    name: index !== -1 ? selector.slice(0, index) : selector,
    pseudo: index !== -1 ? selector.slice(index) : '',
  }
}
// .t => t
const getClassName = (selector: string): string => {
  return selector.split('.')[1]
}

const isCssModulesFile = (filename: string): boolean => {
  return REG_CSS_MODULES.test(filename)
}

// src/pages/home/index.module.scss => home_index-Module 文件加名称 + _ + 不带后缀的文件名
const devSourceClassName = (filePath: string): string => {
  if (!filePath) return filePath

  return path.basename(path.dirname(filePath)) + '_' + path.basename(filePath, path.extname(filePath)).replace(/\./g, '-')
}


export {
  isDev,
  generateClassName,
  handleRepeatPropertyClassName,
  isCommonClassNameSelector,
  handlePseudoClassOrElement,
  getClassName,
  isCssModulesFile,
  devSourceClassName,
}