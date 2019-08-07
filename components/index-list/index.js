Component({
	properties: {
		// 数据源
		listData: {
			type: Array,
			value: []
		},
		// 颜色
		color: {
			type: String,
			value: "#ff4158",
			observer: "colorChange"
		}
	},
	data: {
		treeItemCur: 0,
		touching: false,
		scrollTop: 0,
		treeKeyHeight: 0,
		treeKeyTran: false
	},
	methods: {
		scroll(e) {
			if(this.data.touching) return;

			let scrollTop = e.detail.scrollTop;

			let blocks = this.blocks;

			let treeItemCur = 0;

			for (let i = 0, len = blocks.length; i < len; i++) {
				let block = blocks[i];

				if(scrollTop >= block.top && scrollTop < block.bottom) {
					treeItemCur = i;
				}
			}

			this.setData({
				treeItemCur: treeItemCur
			});
		},
		touchStart(e) {
			if(this.data.touching) return;

			this.setData({
				touching: true
			});

			let treeItemCur = this.getCurrentTreeItem(e.changedTouches[0].pageY),
				scrollTop = this.blocks[treeItemCur].top;

			if (treeItemCur !== this.data.treeItemCur) {
				wx.vibrateShort();
				this.setData({
					treeItemCur: treeItemCur,
					scrollTop: scrollTop
				});
				this.setIndicatorHeight();
			}
		},
		touchMove(e) {
			let treeItemCur = this.getCurrentTreeItem(e.changedTouches[0].pageY),
				scrollTop = this.blocks[treeItemCur].top;

			if (treeItemCur !== this.data.treeItemCur) {
				wx.vibrateShort();
				this.setData({
					treeItemCur: treeItemCur,
					scrollTop: scrollTop,
				});
				this.setIndicatorHeight();
			}
		},

		touchEnd(e) {
			this.setData({
				treeKeyTran: true
			})

			setTimeout(() => {
				this.setData({
					touching: false,
					treeKeyTran: false
				});
			}, 300)
		},
		/**
		 * 设置 indicator 高度
		 */
		setIndicatorHeight() {
			let {top, itemHeight, indicatorOffset} = this.treeInfo;
			let {treeItemCur} = this.data;

			this.setData({
				treeKeyHeight: itemHeight/2 + treeItemCur * itemHeight + top - indicatorOffset
			})
		},
		/**
		 * 获取当前触摸的 tree-item
		 * @param pageY: 当前触摸点pageY
		 */
		getCurrentTreeItem(pageY) {
			let {top, bottom, itemHeight, len} = this.treeInfo;

			if(pageY < top) {
				return 0
			} else if(pageY > bottom) {
				return len - 1
			} else {
				return Math.floor((pageY - top) / itemHeight)
			}
		},
		/**
		 *  初始化函数
		 */
		init() {
			let {screenWidth} = wx.getSystemInfoSync()

			this.createSelectorQuery().select("#tree").boundingClientRect((res) => {
				this.treeInfo = {
					len: this.data.listData.length,
					itemHeight: res.height / this.data.listData.length,
					top: res.top,
					bottom: res.top + res.height,
					indicatorOffset: (screenWidth || 375) / 375 * 25
				};
				this.setIndicatorHeight();
			}).exec()

			this.createSelectorQuery().selectAll(".block").boundingClientRect((res) => {
				this.blocks = res.map((item) => {
					return {
						top: item.top,
						bottom: item.top + item.height
					}
				});
			}).exec();
		},
	},
	ready() {
		this.init();
	}
})
