const app = getApp()

Page({
	data: {},
	onShareAppMessage: function (options) {
		let that = this;
		// 设置菜单中的转发s按钮触发转发事件时的转发内容
		let shareObj = {
			title: "WxP UI",        // 默认是小程序的名称(可以写slogan等)
			imageUrl: '/assets/image/share.png',     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
			success(res) {
				// 转发成功之后的回调
				if (res.errMsg == 'shareAppMessage:ok') {
				}
			},
			fail() {
				// 转发失败之后的回调
				if (res.errMsg == 'shareAppMessage:fail cancel') {
					// 用户取消转发
				} else if (res.errMsg == 'shareAppMessage:fail') {
					// 转发失败，其中 detail message 为详细失败信息
				}
			},
			complete() {
				// 转发结束之后的回调（转发成不成功都会执行）
			}
		};
		// 来自页面内的按钮的转发
		if (options.from == 'button') {

		}
		// 返回shareObj
		return shareObj;
	},
	copyUrl(e) {
		wx.setClipboardData({
			data: 'https://github.com/singletouch/wx-plugin',
			success (res) {
				wx.showToast({
					icon: "none",
					title: "已复制到剪切板"
				})
			}
		})
	},
	onLoad(query) {
		if(query.scene && query.scene != "main") {
			wx.navigateTo({
				url: `/pages/${query.scene}/index`
			})
		}
	}
});

