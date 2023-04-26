import type { Compiler, NormalModule } from 'webpack'
const PLUGIN_NAME = 'RebuildModulePlugin'


class RebuildModulePlugin {
  hasCssModulesList: string[] = []

  constructor(hasCssModulesList: string[]) {
    this.hasCssModulesList = hasCssModulesList
  }

  apply(compiler: Compiler) {
    compiler.hooks.make.tap(PLUGIN_NAME, (compilation) => {
        compilation.hooks.finishModules.tapAsync(PLUGIN_NAME, (modules: Iterable<NormalModule>, callback) => {
          const needRebuildModuleList: NormalModule[] = []
          for (const module of modules) {
            if (module.resource && this.hasCssModulesList.includes(module.resource)) {
              needRebuildModuleList.push(module)
            }
          }

          const promise = Promise.all(needRebuildModuleList.map(module => new Promise(resolve => {
            compilation.rebuildModule(module, err => {
              resolve(err);
            })
          })))
          
          promise.then(() => {
            callback()
          })
        })
    })

  }
}

export default RebuildModulePlugin

