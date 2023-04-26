import { generateClassName, devSourceClassName } from '../src/utils'
import {describe,expect,it} from "vitest"


describe("#generateClassName",()=>{
  const g1 = generateClassName('-')

  it("1 times",()=>{
    expect(g1()).toBe('-a') // 第一次
  })
  it("2 time",()=>{
    expect(g1()).toBe('-b') // 第二次
  })

  const g2 = generateClassName('-')

  for (let i = 0; i < 51; i++) {
    g2()
  }

  it("52 times",()=>{
    expect(g2()).toBe('-Z')
  })
  it("53 times",()=>{
    expect(g2()).toBe('-aa')
  })
  it("54 times",()=>{
    expect(g2()).toBe('-ba')
  })

  const g3 = generateClassName('-')

  for (let i = 0; i < 52 * 65; i++) {
    g3()
  }

  it("52 times",()=>{
    expect(g3()).toBe('-aaa') // 第52次
  })
  it("53 times",()=>{
    expect(g3()).toBe('-baa') // 第53次
  })
  it("54 times",()=>{
    expect(g3()).toBe('-caa') // 第53次
  })
})

describe("#devSourceClassName",()=>{
  it("1",()=>{
    expect(devSourceClassName('C://src/pages/home/index.module.scss')).toBe('home_index-module') // 第一次
  })
  it("2",()=>{
    expect(devSourceClassName('C://src/pages/home/index-module.styl')).toBe('home_index-module') // 第一次
  })
  it("3",()=>{
    expect(devSourceClassName('')).toBe('') // 第一次
  })
  it("4",()=>{
    expect(devSourceClassName('pages/home/index_module.scss')).toBe('home_index_module') // 第一次
  })
  it("5",()=>{
    expect(devSourceClassName('pages/tab/index_module')).toBe('tab_index_module') // 第一次
  })
})