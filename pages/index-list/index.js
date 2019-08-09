const app = getApp()
const {CityList} = require("../../utils/city.js")

Page({
	data: {
		listData: []
	},
	onLoad() {
		this.setData({
			listData: CityList
		})
	}
});

