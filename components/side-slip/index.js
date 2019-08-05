Component({
	properties: {

	},
	data: {
		x: 0,
		move: 0,
		open: false
	},
	methods: {
		delete() {
			this.triggerEvent('delete');
		},
		change(e) {
			this.setData({
				x: e.detail.x
			})
		},
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
		let {screenWidth} = wx.getSystemInfoSync()
		this.deleteBtnWidth = (screenWidth || 375) / 375 * 80;
	}
})
