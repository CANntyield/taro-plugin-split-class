
const CSS_EXT = ['.css', '.scss', '.sass', '.less', '.styl', '.stylus']

const PLATFORM_CSS = ['.wxss', '.css', '.acss', '.ttss', '.css', '.qss']

const TARO_CSS_RULE = ['sass', 'scss', 'less', 'stylus', 'nomorlCss']

const REG_CSS_MODULES = /(.*\.module).*\.(css|s[ac]ss|less|styl|stylus)\b/

const GLOBAL_CLASS_NAME = ':global'

const PROPERTY_VALUE_CLASS_NAME_PREFIX = '_'

const PSEUDO_CLASS_NAME_PREFIX = '-'

export {
  CSS_EXT,
  REG_CSS_MODULES,
  PLATFORM_CSS,
  TARO_CSS_RULE,
  GLOBAL_CLASS_NAME,
  PROPERTY_VALUE_CLASS_NAME_PREFIX,
  PSEUDO_CLASS_NAME_PREFIX,
}