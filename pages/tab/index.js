const app = getApp();

Page({
	data: {
		isIphoneX: app.globalData.isIphoneX,
		tabCur1: 3,
		tabData1: [],
		tabCur2: 2,
		tabData2: [],
		size: 90,
		color: "#3F82FD",
		items: [
			{name: '蓝', value: '#3F82FD', checked: 'true'},
			{name: '红', value: '#ff4158'},
		],
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
	tabChange(e) {
		console.log(e)
	},
	onLoad() {
		// 模拟异步获取数据场景
		setTimeout(() => {
			this.setData({
				tabData1: ["推荐", "精选集锦", "最新体验", "资料", "版本", "攻略", "排行", "热门"],
				tabData2: ["推荐", "精选", "最新", "资料", "版本"]
			});
		}, 100)
	}
});

