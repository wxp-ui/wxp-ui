# 假装有个 CHANGELOG ~~

## [1.0.4] - 2019-10-24
### Fixed
整理 drag 组件代码结构, 增加唯一触摸点判断
整理 index-list 组件代码结构
部分代码增加空值判断

## [1.0.3] - 2019-10-22
### Added
- drag 组件新增 `click` 方法

### Fixed
- 调整 tab line 宽度
- 修复线上 tab 报错信息

## [1.0.2] - 2019-10-17
### Added
- index-list 新增 `topSize`, `bottomSize`, `emptyUrl`, `emptyText`, `emptyShow` 属性
- index-list 新增 `click` 方法
- 新增 CHANGELOG.md

### Fixed
- 修复 index-list 索引树滑动和 scroll-view 弹性滚动冲突问题
- 修复 index-list 索引树滑动偶尔报错问题

### Removed
- index-list/custom-style 移除该页面功能合并到 index-list, 维护两个代码差不多的组件真的太累了OTZ～～

## [1.0.1] - 2019-10-16
### Fixed
- 解决 index-list 异步加载数据问题, 增加 index-list 数据结构文档说明.

## [1.0.0] - 2019-10-13
### Added
- 这只是新的开始, 之前的所有版本归一到 1.0.0 版本
- init swipe-list
- init scroll
- init tab
- init drag
- init date-picker
- init side-slip
- init index-list
