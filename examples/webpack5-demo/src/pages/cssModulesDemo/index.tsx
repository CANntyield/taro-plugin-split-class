import React, { Component } from 'react'
import { View, Text } from '@tarojs/components'

import styles from './index.module.scss'

export default class Index extends Component {
  render() {
    return (
      <View className={styles.test}>
        <Text className={styles.txt}>Hello world!</Text>
      </View>
    )
  }
}