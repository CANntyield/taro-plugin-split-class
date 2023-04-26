import path from "path"
import { IPluginContext } from '@tarojs/service'
import { isDev } from './utils'
import { TARO_CSS_RULE } from './constant'
import HandleRepeatCssPropertyPlugin from './handleRepeatCssPropertyPlugin'
import RebuildModulePlugin from './rebuildModulePlugin'
import HandleCssPostcssPlugin from './handleCssPostcssPlugin'

const CssModulesLoader = path.resolve(__dirname, './cssModulesLoader')
const ReplaceJsClassNameBabelPlugin = path.resolve(__dirname, './replaceJsClassNameBabelPlugin.js')

const TaroPluginSplitClass = (ctx: IPluginContext, pluginOpts: { classNameWhite: (string | RegExp)[] }) => {
  const fileOldClassNameMap = {} // 全局对象，保存对应css文件的原新类名映射，如{"src/pages/index/index.module.scss", {"box": "_a _b", "item": "_a _c", "txt": "-a"}}
  const propertyClassNameMap = {} // 全局className映射propertyValue，便于后续分包去重，分包样式可以使用全局样式 如 {"_a": "display!flex"}
  const hasCssModulesList: string[] = [] // 用于rebuildModule 引入了.module.scss文件的js文件名数组 如 ["src/pages/index/index.js"]

  ctx.modifyWebpackChain(args => {
    const classNameWhite = pluginOpts.classNameWhite

    const chain = args.chain
    chain.module.rule('script').use('babelLoader').tap(options => {
      const plugins = options.plugins || []
      plugins.push([ReplaceJsClassNameBabelPlugin, {
        hasCssModulesList,
        fileOldClassNameMap
      }])
      options.plugins = plugins

      return options
    })

    chain.plugin('HandleRepeatCssPropertyPlugin').use(new HandleRepeatCssPropertyPlugin()).after('miniPlugin')

    if (!isDev) {
      chain.plugin('RebuildPlugin').use(new RebuildModulePlugin(hasCssModulesList)).before('miniPlugin')
    }

    if (isDev) {
      TARO_CSS_RULE.forEach(cssRule => {
        chain.module.rule(cssRule).oneOf('0').use('handleLocalsLoader').loader(CssModulesLoader).options({
          fileOldClassNameMap
        }).before('1')
      })
    }

    TARO_CSS_RULE.forEach(cssRule => {
      chain.module.rule(cssRule).oneOf('0').use('2').tap(postcssLoaderOptions => {
        if(!postcssLoaderOptions) return
        const plugins = postcssLoaderOptions.postcssOptions.plugins
        plugins.unshift(HandleCssPostcssPlugin({
          fileOldClassNameMap,
          propertyClassNameMap,
          classNameWhite
        }))
  
        return postcssLoaderOptions
      });
    })
  })
}

export default TaroPluginSplitClass