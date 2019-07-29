App({
	onLaunch: function () {
		//判断机型(适配iphoneX)
		wx.getSystemInfo({
			success: (res) => {
				this.globalData.systemInfo = res;
				if (res.model.search('iPhone X') != -1) {
					this.globalData.isIphoneX = true
				}
			}
		});
	},
	globalData: {
		systemInfo: null,
		userInfo: null,
		version: "1.0.0",
		isIphoneX: false
	}
})
