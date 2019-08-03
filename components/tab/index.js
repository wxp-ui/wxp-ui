Component({
	properties: {
		// 是否可以超出滚动
		scroll: {
			type: Boolean,
			value: false
		},
		// 数据源
		tabData: {
			type: Array,
			value: []
		},
		// tab高度
		size: {
			type: Number,
			value: 90,
			observer: "sizeChange"
		},
		// 颜色
		color: {
			type: String,
			value: "#ff4158",
			observer: "colorChange"
		}
	},
	data: {
		windowWidth: 375, // 屏幕宽度
		tabCur: 0, // 当前聚焦的tab
		scrollLeft: 0, // scroll-view 左边滚动距离
	},
	methods: {
		/**
		 * 切换菜单
		 */
		toggleTab(e) {
			this.triggerEvent('change', {index: e.currentTarget.dataset.index});
			this.scrollByIndex(e.currentTarget.dataset.index)
		},
		/**
		 * 获取当前tabItem的左边距离
		 * @param tabCur: 当前激活的tabItem的索引
		 */
		getOffsetLeftByIndex(tabCur) {
			let offsetLeft = 0;
			for (let i = 0; i < tabCur; i++) {
				offsetLeft += this.data.items[i].width
			}
			return offsetLeft;
		},
		/**
		 * 滑动到指定位置
		 * @param tabCur: 当前激活的tabItem的索引
		 * @param needTransition: 下划线是否需要过渡动画, 第一次进来应设置为false
		 */
		scrollByIndex(tabCur, needTransition = true) {
			let animation;
			if (needTransition) {
				animation = wx.createAnimation({
					duration: 300,
					timingFunction: 'ease',
				})
			} else {
				animation = wx.createAnimation({
					duration: 0
				})
			}

			let query = this.createSelectorQuery();

			query.select(`#item-child${tabCur}`).boundingClientRect();

			query.select(`#item${tabCur}`).fields({
				size: true,
				computedStyle: ['paddingLeft']
			});

			query.exec(function (res) {
				// 子item宽度
				let itemWidth = res[0].width

				// 父item左边距离
				let offsetLeft = this.getOffsetLeftByIndex(tabCur)

				if (this.data.scroll) { // 超出滚动的情况
					// 父item左边距
					let paddingLeft = parseInt(res[1].paddingLeft.slice(0, -2) || 0)

					animation.width(res[0].width).translateX(offsetLeft + paddingLeft).step()

					this.setData({
						animationData: animation.export()
					})

					// 保持滚动后当前item'尽可能'在屏幕中间
					let scrollLeft = offsetLeft - (this.data.windowWidth - itemWidth) / 2;

					this.setData({
						tabCur: tabCur,
						scrollLeft: scrollLeft,
					})
				} else { // 不超出滚动的情况
					// 父item宽度
					let itemWrapWidth = res[1].width

					animation.width(res[0].width).translateX(offsetLeft + (itemWrapWidth - itemWidth) / 2).step()

					this.setData({
						animationData: animation.export()
					})

					this.setData({
						tabCur: tabCur,
					})
				}
			}.bind(this));
		},
		/**
		 *  监听tab高度变化, 最小值为80rpx
		 */
		sizeChange(newVal, oldVal) {
			if (newVal <= 80) {
				this.setData({
					size: 80
				})
			}
		},
		/**
		 *  监听颜色变化, 然后调用初始化函数
		 */
		colorChange(newVal, oldVal) {
			this.init();
		},
		/**
		 *  初始化函数
		 */
		init() {
			const {windowWidth, SDKVersion} = wx.getSystemInfoSync();

			// 获取屏幕宽度
			this.setData({
				windowWidth: windowWidth
			});

			// 对比版本号, 处理兼容问题
			if (compareVersion(SDKVersion, '2.7.2')>=0) {
				// 获取每一个tab的宽高信息并存储起来
				let query = this.createSelectorQuery();
				for (let i = 0; i < this.data.tabData.length; i++) {
					query.select(`#item${i}`).boundingClientRect()
				}
				query.exec(function (res) {
					this.setData({
						items: res
					})
					this.scrollByIndex(0, false)
				}.bind(this));
			} else {
				setTimeout(() => {
					// 获取每一个tab的宽高信息并存储起来
					let query = this.createSelectorQuery();
					for (let i = 0; i < this.data.tabData.length; i++) {
						query.select(`#item${i}`).boundingClientRect()
					}
					query.exec(function (res) {
						this.setData({
							items: res
						})
						this.scrollByIndex(0, false)
					}.bind(this));
				}, 300)
			}
		}
	},
	attached() {
		this.init();
	}
})

function compareVersion(v1, v2) {
	v1 = v1.split('.')
	v2 = v2.split('.')
	const len = Math.max(v1.length, v2.length)

	while (v1.length < len) {
		v1.push('0')
	}
	while (v2.length < len) {
		v2.push('0')
	}

	for (let i = 0; i < len; i++) {
		const num1 = parseInt(v1[i])
		const num2 = parseInt(v2[i])

		if (num1 > num2) {
			return 1
		} else if (num1 < num2) {
			return -1
		}
	}

	return 0
}
