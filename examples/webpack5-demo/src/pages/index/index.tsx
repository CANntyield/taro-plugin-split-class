import { Component, PropsWithChildren } from 'react'
import { View } from '@tarojs/components'
import styles from './index.module.scss'

interface IsState {
  color: string
}

export default class Index extends Component<PropsWithChildren, IsState> {

  constructor(props) {
    super(props)
    this.state = {
      color: 'red'
    }
  }

  changeColor() {
    this.setState({
      color: this.state.color === 'red' ? 'green' : 'red'
    })
  }
  
  render () {
    const {
      color,
    } = this.state

    return (
      <View className={styles.box}>
        <View className={styles.tit + ' extra'}>标题</View>
        <View className={styles.price}>100</View>
        <View className={styles.item1}>item1</View>
        <View className={styles.item2}>item2</View>
        <View className={styles.item3}>item3</View>
        <View className="iconfont ifont-arr">ifont-arr</View>
        <View className={color === 'red' ? styles.red : styles.green} onClick={this.changeColor.bind(this)}>变化颜色</View>
        <View className='normal'>
          使用非cssModules语法
          <View className='tit'>小标题</View>
          <View className='price'>1000</View>
        </View>
      </View>
    )
  }
}
