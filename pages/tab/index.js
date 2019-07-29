const app = getApp()
let tabs

Page({
	data: {
		isIphoneX: app.globalData.isIphoneX,
		tabCur: 0,
		tabData: ["推荐", "精选集锦", "最新体验", "资料", "版本", "攻略", "排行", "热门"],
		size: 90,
		scroll: true,
		color: "#ff4158",
		items: [
			{name: 'red', value: '#ff4158', checked: 'true'},
			{name: 'black', value: '#003333'},
			{name: 'green', value: '#00FF33'},
			{name: 'yellow', value: '#CCFF00'},
		]
	},
	radioChange: function (e) {
		this.setData({
			color: e.detail.value
		})
	},
	sizeChange(e) {
		this.setData({
			size: e.detail.value
		})
	},
	scrollChange(e) {
		if (e.detail.value) {
			this.setData({
				tabData: ["推荐", "精选集锦", "最新体验", "资料", "版本", "攻略", "排行", "热门"]
			})
		} else {
			this.setData({
				tabData: ["推荐", "版本", "攻略", "排行", "热门"]
			})
		}
		this.setData({
			scroll: e.detail.value
		});
		tabs.init();
	},
	tabChange(e) {
		console.log(e)
	},
	onLoad() {
		tabs = this.selectComponent('#tabs');
	}
});

