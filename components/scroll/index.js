Component({
	properties: {
		// 加载中
		requesting: {
			type: Boolean,
			value: false,
			observer: 'requestingEnd',
		},
		// 加载完毕
		end: {
			type: Boolean,
			value: false,
		},
		// 控制空状态的显示
		emptyShow: {
			type: Boolean,
			value: false,
		},
		// 当前列表长度
		listCount: {
			type: Number,
			value: 0,
		},
		// 空状态的图片
		emptyUrl: {
			type: String,
			value: "/assets/image/empty/empty.png"
		},
		// 空状态的文字提示
		emptyText: {
			type: String,
			value: "未找到数据"
		},
		// 是否有header
		hasTop: {
			type: Boolean,
			value: false
		},
		// 下拉刷新的高度
		refreshSize: {
			type: Number,
			value: 90,
			observer: 'refreshChange'
		},
		// 底部高度
		bottomSize: {
			type: Number,
			value: 0,
		},
		// 颜色
		color: {
			type: String,
			value: ""
		},
	},
	data: {
		mode: 'refresh', // refresh 和 more 两种模式
		successShow: false, // 显示success
		successTran: false, // 过度success
		refreshStatus: 1, // 1: 下拉刷新, 2: 松开更新, 3: 加载中, 4: 加载完成
		move: -45, // movable-view 偏移量
		scrollHeight1: 0, // refresh view 高度负值
		scrollHeight2: 0, // refresh view - success view 高度负值
		scrollTop: 0,
		overOnePage: false
	},
	methods: {
		/**
		 * 处理 bindscrolltolower 失效情况
		 */
		scroll(e) {
			// 可以触发滚动表示超过一屏
			this.setData({
				overOnePage: true
			})
			clearTimeout(this.timer)
			this.timer = setTimeout(() => {
				this.setData({
					scrollTop: e.detail.scrollTop
				})
			}, 100)
		},
		/**
		 * movable-view 滚动监听
		 */
		change(e) {
			const {refreshStatus} = this.data;

			// 判断如果状态大于3则返回
			if (refreshStatus >= 3) {
				return
			}

			let diff = e.detail.y

			if (diff > -10) {
				this.setData({
					refreshStatus: 2
				})
			} else {
				this.setData({
					refreshStatus: 1
				})
			}
		},
		/**
		 * movable-view 触摸结束事件
		 */
		touchend() {
			const {refreshStatus} = this.data;

			if (refreshStatus >= 3) {
				return
			}

			if (refreshStatus == 2) {
				wx.vibrateShort();
				this.setData({
					refreshStatus: 3,
					move: 0,
					mode: 'refresh'
				})
				this.triggerEvent('refresh');
			} else if (refreshStatus == 1) {
				this.setData({
					move: this.data.scrollHeight1
				})
			}
		},
		/**
		 * 加载更多
		 */
		more() {
			if (!this.properties.end) {
				this.setData({
					mode: 'more'
				})
				this.triggerEvent('more');
			}
		},
		/**
		 * 监听 requesting 字段变化, 来处理下拉刷新对应的状态变化
		 */
		requestingEnd(newVal, oldVal) {
			if (this.data.mode == 'more') {
				return
			}

			if (oldVal === true && newVal === false) {
				setTimeout(() => {
					this.setData({
						successShow: true,
						refreshStatus: 4,
						move: this.data.scrollHeight2
					});
					setTimeout(() => {
						this.setData({
							successTran: true,
							move: this.data.scrollHeight1
						});
						setTimeout(() => {
							this.setData({
								refreshStatus: 1,
								successShow: false,
								successTran: false,
								move: this.data.scrollHeight1
							});
						}, 350)
					}, 1500)
				}, 600)
			} else {
				if (this.data.refreshStatus != 3) {
					this.setData({
						refreshStatus: 3,
						move: 0
					});
				}
			}
		},
		/**
		 * 监听下拉刷新高度变化, 如果改变重新初始化参数, 最小高度80rpx
		 */
		refreshChange(newVal, oldVal) {
			if (newVal <= 80) {
				this.setData({
					refreshSize: 80
				})
			}
			setTimeout(() => {
				this.init()
			},0)
		},
		/**
		 * 初始化scroll组件参数, 动态获取 下拉刷新区域 和 success 的高度
		 */
		init() {
			let query = this.createSelectorQuery();
			query.select("#refresh").boundingClientRect()
			query.select("#success").boundingClientRect()
			query.exec(function (res) {
				this.setData({
					scrollHeight1: -res[0].height,
					scrollHeight2: res[1].height - res[0].height,
				})
			}.bind(this));
		},
	},
	ready() {
		this.init()
	}
})
