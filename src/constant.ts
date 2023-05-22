
const CSS_EXT = ['.css', '.scss', '.sass', '.less', '.styl', '.stylus']

const PLATFORM_CSS = ['.wxss', '.css', '.acss', '.ttss', '.css', '.qss']

const TARO_CSS_RULE = ['sass', 'scss', 'less', 'stylus', 'nomorlCss']

const REG_CSS_MODULES = /(.*\.module).*\.(css|s[ac]ss|less|styl|stylus)\b/

const GLOBAL_CLASS_NAME = ':global'

const PROPERTY_VALUE_CLASS_NAME_PREFIX = '_'

const PSEUDO_CLASS_NAME_PREFIX = '-'

// https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties#font_properties
const CSS_SHORTHAND_PROPERTIES_MAP = { // 缩写属性对应的完整属性
  'background': ['background-clip', 'background-color', 'background-image', 'background-origin', 'background-position', 'background-repeat', 'background-size', 'background-attachment'],
  'font': ['font-stretch', 'font-size', 'font-family', 'font-style', 'font-variant', 'font-weight', 'line-height'],
  'grid': ['grid-auto-columns', 'grid-auto-flow', 'grid-auto-rows', 'grid-template-areas', 'grid-template-columns', 'grid-template-rows'],
  'margin': ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
  'border-radius': ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
  'outline': ['outline-color', 'outline-style', 'outline-width'],
  'padding': ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
  'border': ['border-style', 'border-color', 'border-width'],
  'flex': ['flex-grow', 'flex-shrink', 'flex-basis'],
  'animation': ['animation-name', 'animation-duration', 'animation-timing-function', 'animation-delay', 'animation-iteration-count', 'animation-direction', 'animation-fill-mode', 'animation-play-state'],
  'transition': ['transition-property', 'transition-duration', 'transition-property', 'transition-timing-function'],
  'overflow': ['overflow-x', 'overflow-y'],
}

const CSS_PROPERTIES_TO_SHORTHAND_MAP = {} // 完整属性可能对应的 缩写写法映射
Object.keys(CSS_SHORTHAND_PROPERTIES_MAP).forEach(key => {
  CSS_PROPERTIES_TO_SHORTHAND_MAP[key] = key
  CSS_SHORTHAND_PROPERTIES_MAP[key].forEach(prop => {
    CSS_PROPERTIES_TO_SHORTHAND_MAP[prop] = key
  })
})

export {
  CSS_EXT,
  REG_CSS_MODULES,
  PLATFORM_CSS,
  TARO_CSS_RULE,
  GLOBAL_CLASS_NAME,
  PROPERTY_VALUE_CLASS_NAME_PREFIX,
  PSEUDO_CLASS_NAME_PREFIX,
  CSS_SHORTHAND_PROPERTIES_MAP,
  CSS_PROPERTIES_TO_SHORTHAND_MAP,
}