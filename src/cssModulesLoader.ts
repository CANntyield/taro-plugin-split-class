import { REG_CSS_MODULES } from './constant'

export default function (source) {
  const options = this.getOptions() || {}

  let newSource = source
  
  if (REG_CSS_MODULES.test(this.resourcePath) && Object.keys((options.fileOldClassNameMap && options.fileOldClassNameMap[this.resourcePath]) || []).length > 0) {
    newSource = source + `___CSS_LOADER_EXPORT___.locals = ${JSON.stringify(options.fileOldClassNameMap[this.resourcePath])}`
  } else if (REG_CSS_MODULES.test(this.resourcePath)) {
    newSource = source + `___CSS_LOADER_EXPORT___.locals = {}`
  }

  return newSource;
}