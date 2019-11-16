Component({
	properties: {
		// 数据源
		tabData: {
			type: Array,
			value: [],
			observer: "dataChange"
		},
		// 是否可以超出滚动
		tabCur: {
			type: Number,
			value: 0,
			observer: "tabCurChange"
		},
		// 是否可以超出滚动
		scroll: {
			type: Boolean,
			value: false
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
			value: ""
		}
	},
	data: {
		/* 未渲染数据 */
		windowWidth: 0, // 屏幕宽度
		tabItems: [], // 所有 tab 节点信息

		/* 渲染数据 */
		scrolling: true, // 控制 scroll-view 滚动以在异步加载数据的时候能正确获得 dom 信息
		needTransition: false, // 下划线是否需要过渡动画
		translateX: 0, // 下划 line 的左边距离
		lineWidth: 0, // 下划 line 宽度
		scrollLeft: 0, // scroll-view 左边滚动距离
	},
	methods: {
		/**
		 * 切换菜单
		 */
		toggleTab(e) {
			this.triggerEvent('change', {index: e.currentTarget.dataset.index});
			this.scrollByIndex(e.currentTarget.dataset.index);
		},
		/**
		 * 滑动到指定位置
		 * @param tabCur: 当前激活的tabItem的索引
		 * @param needTransition: 下划线是否需要过渡动画, 第一次进来应设置为false
		 */
		scrollByIndex(tabCur, needTransition = true) {
			let item = this.data.tabItems[tabCur];
			if (!item) return;
			let itemWidth = item.width || 0,
				itemLeft = item.left || 0;

			this.setData({needTransition: needTransition});

			if (this.data.scroll) { // 超出滚动的情况
				// 保持滚动后当前 item '尽可能' 在屏幕中间
				let scrollLeft = itemLeft - (this.data.windowWidth - itemWidth) / 2;

				this.setData({
					tabCur: tabCur,
					scrollLeft: scrollLeft,
					translateX: itemLeft,
					lineWidth: itemWidth
				});
			} else { // 不超出滚动的情况
				this.setData({
					tabCur: tabCur,
					translateX: itemLeft,
					lineWidth: itemWidth
				});
			}
		},
		/**
		 * 监听数据变化, 如果改变重新初始化参数
		 */
		dataChange(newVal, oldVal) {
			this.setData({
				scrolling: false
			});
			// 异步加载数据时候, 延迟执行 init 方法, 防止基础库 2.7.1 版本及以下无法正确获取 dom 信息
			setTimeout(() => this.init(), 10);
		},
		/**
		 *  监听 tabCur 变化, 做对应处理
		 */
		tabCurChange(newVal, oldVal) {
			this.scrollByIndex(newVal);
		},
		/**
		 *  监听 tab 高度变化, 最小值为80rpx
		 */
		sizeChange(newVal, oldVal) {
			if (newVal <= 80) {
				this.setData({size: 80});
			}
		},
		/**
		 *  初始化函数
		 */
		init() {
			const {windowWidth} = wx.getSystemInfoSync();
			this.setData({windowWidth: windowWidth || 375});

			this.createSelectorQuery().selectAll(".tabs__item-child").boundingClientRect((res) => {
				this.setData({
					scrolling: true,
					tabItems: res
				});
				this.scrollByIndex(this.data.tabCur, false);
			}).exec();
		}
	},
	ready() {
		this.init();
	}
});
