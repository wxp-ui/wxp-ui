Component({
	properties: {

	},
	data: {
		x: 0,
		move: 0,
		open: false
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
				x: e.detail.x
			})
		},
		/**
		 * movable-view 触摸结束事件
		 */
		touchend() {
			let diff = this.data.x;
			if (!this.data.open) {
				if (diff < -20) {
					this.setData({
						move: -this.deleteBtnWidth,
						open: true
					})
				} else {
					this.setData({
						move: 0,
						open: false
					})
				}
			} else {
				if (diff > -this.deleteBtnWidth + 10) {
					this.setData({
						move: 0,
						open: false
					})
				} else {
					this.setData({
						move: -this.deleteBtnWidth,
						open: true
					})
				}
			}
		}
	},
	ready() {
		let {windowWidth} = wx.getSystemInfoSync()
		this.deleteBtnWidth = (windowWidth || 375) / 375 * 80;
	}
})
