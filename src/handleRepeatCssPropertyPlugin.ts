
import { Compilation, sources } from 'webpack'
import type { Compiler  } from 'webpack'
import { handleRepeatPropertyClassName } from './utils'
import { PLATFORM_CSS } from './constant'
const { RawSource } = sources

const PLUGIN_NAME = 'HandleRepeatCssPropertyPlugin'
const APP_CSS = 'app'
const COMMON_CSS = 'common'

class HandleRepeatCssPropertyPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      compilation.hooks.processAssets.tapAsync(
        {
          name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets, callback) => {
          let appUnderlineClassNameList: string[] = []
          let appUnderlineClassNameMap: Record<string, boolean> = {}
          let commonUnderlineClassNameList: string[] = []
          // @ts-ignore
          let commonUnderlineClassNameMap: Record<string, boolean> = {}
          PLATFORM_CSS.forEach(css => {
            const appFilename = APP_CSS + css
            const appCss = assets[appFilename]
    
            if (appCss) {
              const appCssSource = appCss.source()
              const { underlineClassNameList, underlineClassNameMap, source: appNewSource } = handleRepeatPropertyClassName(appCssSource as string)
              appUnderlineClassNameList = underlineClassNameList || []
              appUnderlineClassNameMap = underlineClassNameMap || {}
              assets[appFilename] = new RawSource(appNewSource)
            }

            const commonFilename = COMMON_CSS + css
            const commonCss = assets[commonFilename]
            if (commonCss) {
              const commonCssSource = commonCss.source()
              const { underlineClassNameList, underlineClassNameMap, source: commonNewSource } = handleRepeatPropertyClassName(commonCssSource as string, appUnderlineClassNameMap)
              commonUnderlineClassNameList = underlineClassNameList || []
              commonUnderlineClassNameMap = underlineClassNameMap || {}
              assets[commonFilename] = new RawSource(commonNewSource)
            }
          })

          const globalUnderlineClassNameList: string[] = Array.from(new Set(([] as string[]).concat(appUnderlineClassNameList, commonUnderlineClassNameList)))
          const globalUnderlineClassNameMap: Record<string, boolean> = {}
          globalUnderlineClassNameList.forEach(item => {
            globalUnderlineClassNameMap[item] = true
          })
    
          // app.wxss是全局样式，其他分包样式都尝试去重，复用全局已有的propertyClassNameRule
          for (let filename in assets) {
            if (PLATFORM_CSS.some(css => (filename === APP_CSS + css || filename === COMMON_CSS + css))) {
              continue
            }
            
            if (PLATFORM_CSS.some(p => filename.endsWith(p))) {
              const a = assets[filename]
              const { source: newSource } = handleRepeatPropertyClassName(a.source() as string, globalUnderlineClassNameMap)
              assets[filename] = new RawSource(newSource)
            }
          }
    
          callback();
        },
      )
    })
  }
}

export default HandleRepeatCssPropertyPlugin
