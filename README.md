# `taro-split-class-plugin`

### 介绍

针对Taro项目React框架小程序，一种新的样式解决方案，该方案被集成为一个Taro插件的形式，可以在在较少改变现有开发体验的条件下，缓解样式代码的冗余问题。

本样式方案学习借鉴了cssModules样式方案的语法规则以及原理，解决了样式冲突的问题，并且在此基础上从缩减ClassName长度和缩减PropertyValue两个方面实现了Size上的缩减，最终样式文件的瘦身效果可以达到50%-70%。有利缓解官方包Size的限制，便于业务的高速发展。

注：本插件暂时只支持Taro v3.5及其以上，需使用webpack5进行编译。

### 使用指南

1、使用

1.1 安装插件

本样式方案被集成在该Taro插件 `taro-plugin-split-class` 中，安装本插件。

    npm install -D taro-plugin-split-class

1.2 关闭cssModules功能

在Taro配置文件中，使得`mini.posetcss.cssModules.enable = false`，确保cssModules功能关闭，如下代码所示。

    // config/index.js
    {
        mini: {
            postcss: {
                cssModules: {
                    enable: false
                }
            }
        }
    }

1.3 配置本插件

在Taro配置文件中，`plugins`配置中加入本插件`taro-plugin-split-class`。本插件支持配置类名转换白名单（实现功能类似\:global，见2.4）classNameWhite，比如常用的iconfont是不需要转换的。

    plugins: [
        ['taro-plugin-split-class', {
          classNameWhite: ["iconfont", /^ifont-/]
        }]
    ]

2、语法要求

2.1 样式文件命名需以.module.xxx结尾，如index.module.scss，该样式文件方可被本插件转化处理。

2.2 在JS文件中，将样式文件作为一个对象引入，并将类名作为对象的键进行使用。如下代码所示，使用 `className={styles.box}` 而不是 `className="box"`，其中`box`为定义在样式文件的中类名。

    // 如下
    import styles from './index.module.scss'
    <View className={styles.box}></View>
    // 而不是
    import './index.module.scss'
    <View className="box"></View>

2.3 本方案支持所有选择器包括父子选择器、伪类选择器、兄弟选择器等等。但请尽可能的使用仅类选择器来定位元素，这样做可以便于插件尽可能复用PropertyValue从而更好的缩减Size。本方案解决了类名冲突问题，因此开发者不需要担心因类名命名简单而导致的类名冲突。

    // 如下仅类选择器的CssRule
    .box {
    	display: flex;
    	flex-direction: column;
    	align-items: center;
    }
    .tit {
    	display: flex;
    	font-size: 40px;
    	color: red;
    }
    // 而不是父子选择器
    .box {
    	display: flex;
    	flex-direction: column;
    	align-items: center;
        .tit {
    	    display: flex;
        	font-size: 40px;
        	color: red;
        }
    }

2.4 特殊类名不变

有时候我们希望一些特殊的ClassName不变，在JS文件中，不从styles取类名即可，如下代码中的`extra`。

    import styles from './index.module.scss'
    <View className={styles.tit + ' extra'}>标题</View>

但是在样式文件中默认所有ClassName都会被拆分或者压缩。如下代码示例，`extra`被处理成`-a`。

    // 原类名
    .extra.tit {
    	color: blue;
    }
    // 新类名
    .-a.-b {
        color: blue;
    }

因此需要特殊标识符让插件感知到不需要处理该ClasName。本方案提供了类似cssModules的`:global`的解决方案，有两种使用方式，一是`:global(.extra)`，被包裹的类名不会被替换。

```
// 编译前
:global(.extra).tit {
	color: blue;
}
// 编译后
.extra.-a {
    color: blue;
}

```

二是以`:global`开头，后续所有的类名都不会被替换。

```

// 编译前
:global .extra1 .extra2 { color: red;}
// 编译后
.extra1 .extra2 { color: red;}
```

3、打包效果展示

3.1 开发环境

使用本插件后，原类名会被替换或拆分成更短且更多的新类名。这样处理后的新类名可读性很差，开发者不能很好的定位到原类名代码。因此在开发环境下，会在更短且更多的新类名前会加上\[文件夹\_文件名\_原类名]。保留了原类名相关信息，便于开发者查找原类名。如下图代码所示，原类名为`box`，经过插件拆分和缩短后的新类名为`_a _g _h -c`，在新类名前加上了`index_indes-module_box`，最终展示的完整类名为`index_index-module_box _a _g _h -c`。


![image.png](https://images3.c-ctrip.com/zt/taroPluginSplitClass/image2.png)

3.2 生产环境

在生产环境了，不需要考虑新类名可读性，因此直接会直接将类名完全替换为新类名。如下图代码所示，`box`直接被替换成`_a _g _h -c`

![image.png](https://images3.c-ctrip.com/zt/taroPluginSplitClass/image3.png)

