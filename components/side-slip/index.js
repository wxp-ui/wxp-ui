Component({
	properties: {},
	data: {
		/* 未渲染数据 */
		deleteBtnWidth: 0, // 删除按钮宽度
		diff: 0, // x轴 偏移距离
		open: false, // 是否是侧滑状态

		/* 渲染数据 */
		move: 0 // 手动设置位移值
	},
	methods: {
		/**
		 * 删除事件
		 */
		delete() {
			this.triggerEvent('delete');
		},
		/**
		 * movable-view 滚动监听
		 */
		change(e) {
			this.setData({
				diff: e.detail.x
			});
		},
		/**
		 * movable-view 触摸结束事件
		 */
		touchend(e) {
			let {diff, deleteBtnWidth} = this.data;

			if (!this.data.open) {
				if (diff < -20) {
					this.setData({
						move: -deleteBtnWidth,
						open: true
					})
				} else {
					this.setData({
						move: 0,
						open: false
					})
				}
			} else {
				if (diff > -deleteBtnWidth + 10) {
					this.setData({
						move: 0,
						open: false
					})
				} else {
					this.setData({
						move: -deleteBtnWidth,
						open: true
					})
				}
			}
		}
	},
	ready() {
		let {windowWidth} = wx.getSystemInfoSync();
		this.setData({
			deleteBtnWidth: (windowWidth || 375) / 375 * 80
		});
	}
});
