App({
	onLaunch: function () {
		//判断机型(适配iphoneX)
		wx.getSystemInfo({
			success: (res) => {
				this.globalData.systemInfo = res;
				if (res.model.search('iPhone X') !== -1) {
					this.globalData.isIphoneX = true
				}
			}
		});
	},
	baseUrl: 'https://www.wanandroid.com',
	/**
	 * http请求封装
	 * @param method 请求方法类型
	 * @param url 请求路径
	 * @param data 请求参数
	 * @param loading 请求加载效果 {0: 正常加载, 1: 表单提交加载效果 }
	 * @param loadingMsg 请求提示信息
	 */
	httpBase: function (method, url, data, loading, loadingMsg) {
		let _this = this;

		let requestUrl = this.baseUrl + url;

		if (loading) {
			wx.showLoading({
				title: loadingMsg || '提交中...',
				mask: true
			});
		} else {
			wx.showNavigationBarLoading()
		}

		function request(resolve, reject) {
			wx.request({
				header: {
					'Content-Type': 'application/json'
				},
				method: method,
				url: requestUrl,
				data: data,
				success: function (result) {
					if (loading) {
						wx.hideLoading();
					} else {
						wx.hideNavigationBarLoading()
					}

					let res = result.data || {};
					let code = res.errorCode;

					if (code !== 0) {
						reject(res);
						if (res.message) {
							wx.showToast({
								title: res.message,
								icon: 'none'
							});
						}
					} else {
						resolve(res);
					}
				},
				fail: function (res) {
					reject(res);
					if (loading) {
						wx.hideLoading();
					} else {
						wx.hideNavigationBarLoading()
					}
					wx.showToast({
						title: '网络出错',
						icon: 'none'
					});
				}
			})
		}

		return new Promise(request);
	},
	httpGet: function ({url = "", data = {}, loading = false, loadingMsg = ""} = {}) {
		return this.httpBase("GET", url, data, loading, loadingMsg);
	},
	httpPost: function ({url, data, loading, loadingMsg}) {
		return this.httpBase("POST", url, data, loading, loadingMsg);
	},
	globalData: {
		systemInfo: null,
		userInfo: null,
		version: "1.0.0",
		isIphoneX: false
	}
})
