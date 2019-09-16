# WxP UI

WxP UI 是一款提供高交互小程序插件的合集, 致力于简洁和高可用性的插件实现.

## 线上演示

![WxP](./assets/image/qrcode.jpeg)

## 组件列表 

- swipe-list组件
- scroll组件
- tab组件
- drag组件
- date-picker组件
- side-slip组件(基于movable-view实现)
- index-list组件

## 功能解析

[swipe-list组件实现分析](https://www.cnblogs.com/haha1212/p/11184595.html)

[date-picker组件实现分析](https://www.cnblogs.com/haha1212/p/11191035.html)

## 如何使用

```
git clone https://github.com/singletouch/small-demo
```

将需要使用的组件代码拷至自己的小程序项目中，按照小程序官方[引入组件](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component)方式引入即可

本项目自身就是一个完整的小程序项目，也可以直接使用本项目作为小程序开发目录

## 组件配置

### Scroll 组件

#### Scroll Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| requesting | 列表数据是否处于加载中 | Boolean | -- | false |
| end | 列表数据加载完成 | Boolean | -- | false |
| listCount | 当前列表长度 | Number | -- | 0 |
| emptyUrl | 空列表的展示图片 | String | * | /assets/image/empty/empty.png |
| emptyText | 空列表的文字提示 | String | * | 未找到数据 |
| hasTop | 是否有header | Boolean | -- | false |
| refreshSize | 下拉刷新的高度 | Number | -- | 90 |
| bottomSize | 底部高度 | Number | -- | 0 |
| color | 颜色 | String | -- | "" |

#### Scroll Events

| 事件名称 | 说明 | 回调参数 |
| --- | --- | --- |
| refresh | 下拉刷新 | -- |
| more | 上拉加载 | -- |

#### Scroll Slots

| name | 说明 |
| --- | --- |
| -- | 列表组件主体 |

### Tab 组件

#### Tab Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| scroll | 是否可以超出滚动 | Boolean | -- | false |
| tabData | 数据源 | Array | -- | [] |
| size | tab高度 | Number | -- | 90 |
| color | 颜色 | String | -- | "" |

#### Tab Events

| 事件名称 | 说明 | 回调参数 |
| --- | --- | --- |
| change | tab切换事件 | 当前选中tab的index |

#### Tab Methods

| 方法名 | 说明 | 回调参数 |
| --- | --- | --- |
| scrollByIndex | 让tab组件根据传入的index进行滚动 | 需要切换tab项的index |

### DatePicker 组件

后续更新

### SideSlip 组件

#### SideSlip Methods

| 方法名 | 说明 | 回调参数 |
| --- | --- | --- |
| delete | 点击删除按钮触发的事件 | -- |

### IndexList 组件

#### IndexList Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| listData | 数据源 | Array | -- | [] |
| color | 颜色 | String | -- | "" |

### Drag 组件

#### Drag Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| listData | 数据源 | Array | -- | [] |
| columns | 列数 | Number | -- | 1 |

#### Drag Events

| 事件名称 | 说明 | 回调参数 |
| --- | --- | --- |
| change | 排序监听事件 | 排序后数据 |

## 贡献

如果有什么好的建议欢迎提issues

## License

MIT
