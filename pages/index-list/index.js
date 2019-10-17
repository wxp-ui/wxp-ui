const app = getApp()
const {CityList} = require("../../utils/city.js")

Page({
	data: {
		listData: [],
		searchValue: '',
		emptyShow: false,
	},
	formatList(list) {
		let tempArr = [];

		["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "W", "X", "Y", "Z"].forEach(initial => {
			let tempObj = {};

			tempObj.key = initial;
			tempObj.data = list.filter(item => item.initial == initial).map(item => {
				return {name: item.city, code: item.code, short: item.short}
			});

			if(tempObj.data && tempObj.data.length > 0) {
				tempArr.push(tempObj);
			}
		})

		return tempArr;
	},
	search(e) {
		let value = e.detail.value;
		this.setData({
			searchValue: value
		});
		let cityList = CityList.filter(item => item.city.indexOf(value) > -1 || item.short.indexOf(value) > -1);
		this.setList(this.formatList(cityList));
	},
	clear() {
		this.setData({
			searchValue: ""
		});
		this.setList(this.formatList(CityList));
	},
	setList(listData) {
		let emptyShow = listData.length == 0 ? true : false;

		this.setData({
			listData: listData,
			emptyShow: emptyShow
		});
	},
	itemClick(e) {
		console.log(e);
	},
	onLoad() {
		// 模拟异步获取数据场景
		setTimeout(() => {
			this.setList(this.formatList(CityList));
		},1000)
	}
});

