const app = getApp()
const {CityList} = require("../../utils/city.js")

Page({
	data: {
		listData: []
	},
	onLoad() {
		// 模拟异步获取数据场景
		setTimeout(() => {
			this.setData({
				listData: CityList
			})
		},350)
	}
});

