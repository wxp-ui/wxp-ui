// rgb to hex
function rgbToHex(r, g, b)
{
	var hex = ((r<<16) | (g<<8) | b).toString(16);
	return "#" + new Array(Math.abs(hex.length-7)).join("0") + hex;
}

// hex to rgb
function hexToRgb(hex)
{
	var rgb = [];
	for(var i=1; i<7; i+=2){
		rgb.push(parseInt("0x" + hex.slice(i,i+2)));
	}
	return rgb;
}

// 计算渐变过渡色
function gradient (startColor,endColor,step)
{
	//将hex转换为rgb
	var sColor = hexToRgb(startColor),
		eColor = hexToRgb(endColor);

	//计算R\G\B每一步的差值
	var rStep = (eColor[0] - sColor[0]) / step,
	gStep = (eColor[1] - sColor[1]) / step,
	bStep = (eColor[2] - sColor[2]) / step;

	var gradientColorArr = [];
	for(var i=0;i<step;i++){
		//计算每一步的hex值
		gradientColorArr.push(rgbToHex(parseInt(rStep*i+sColor[0]),parseInt(gStep*i+sColor[1]),parseInt(bStep*i+sColor[2])));
	}
	return gradientColorArr;
}

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
			value: "#ff4158"
		}
	},
	data: {
		treeItemCur: 0,
		touching: false,
		scrollTop: 0,
		treeKeyHeight: 0,
		treeKeyTran: false,
		style1: "",
		style2: ""
	},
	methods: {
		scroll(e) {
			if(this.data.touching) return;

			let scrollTop = e.detail.scrollTop;

			let blocks = this.blocks;

			let stickyTitleHeight = this.remScale * 30

			for (let i = 0, len = blocks.length; i < len; i++) {
				let block = blocks[i];

				if(scrollTop >= block.top && scrollTop < block.bottom) {
					if(scrollTop > block.bottom - stickyTitleHeight) {
						let percent = Math.floor(((scrollTop - (block.bottom - stickyTitleHeight)) / stickyTitleHeight) * 100);

						let style1 = `background: rgba(237, 237, 237, ${percent}%);color: ${this.colors[percent]}`
						let style2 = `background: rgba(237, 237, 237, ${100-percent}%);color: ${this.colors[100-percent]}`

						this.setData({
							style1: style1,
							style2: style2
						});
					} else if(scrollTop <= block.bottom - stickyTitleHeight) {
						this.setData({
							style1: "",
							style2: "",
							percent: 1
						});
					}

					this.setData({
						treeItemCur: i
					});

					break
				}
			}


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
		 * 设置 indicator 顶部距离
		 */
		setIndicatorHeight() {
			let {top, itemHeight, indicatorOffset} = this.treeInfo,
				{treeItemCur} = this.data,
				remScale = this.remScale;

			this.setData({
				treeKeyHeight: itemHeight/2 + treeItemCur * itemHeight + top - remScale * 25
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
			let {screenWidth} = wx.getSystemInfoSync();

			this.remScale = (screenWidth || 375) / 375;

			this.createSelectorQuery().select("#tree").boundingClientRect((res) => {
				this.treeInfo = {
					len: this.data.listData.length,
					itemHeight: res.height / this.data.listData.length,
					top: res.top,
					bottom: res.top + res.height
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
		this.colors = gradient(this.data.color, "#767676", 100);

		this.init();
	}
})


