import { Component, PropsWithChildren } from 'react'
import { View } from '@tarojs/components'
import './index.less'
import scss from './index.module.scss'
import sass from './index.module.sass'
import less from './index.module.less'
import styl from './index.module.styl'

export default class Index extends Component<PropsWithChildren> {
  
  render () {
    return (
      <View className='box'>
        <View className={sass.txt}>sass</View>
        <View className={less.txt}>less</View>
        <View className={scss.txt}>scss</View>
        <View className={styl.txt}>styl</View>
      </View>
    )
  }
}
