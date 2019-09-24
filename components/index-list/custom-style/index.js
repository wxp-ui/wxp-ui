// rgb to hex
function rgbToHex(r, g, b) {
	var hex = ((r << 16) | (g << 8) | b).toString(16);
	return "#" + new Array(Math.abs(hex.length - 7)).join("0") + hex;
}

// hex to rgb
function hexToRgb(hex) {
	var rgb = [];
	for (var i = 1; i < 7; i += 2) {
		rgb.push(parseInt("0x" + hex.slice(i, i + 2)));
	}
	return rgb;
}

// 计算渐变过渡色
function gradient(startColor, endColor, step) {
	//将hex转换为rgb
	var sColor = hexToRgb(startColor),
		eColor = hexToRgb(endColor);

	//计算R\G\B每一步的差值
	var rStep = (eColor[0] - sColor[0]) / step,
		gStep = (eColor[1] - sColor[1]) / step,
		bStep = (eColor[2] - sColor[2]) / step;

	var gradientColorArr = [];
	for (var i = 0; i < step; i++) {
		//计算每一步的hex值
		gradientColorArr.push(rgbToHex(parseInt(rStep * i + sColor[0]), parseInt(gStep * i + sColor[1]), parseInt(bStep * i + sColor[2])));
	}
	return gradientColorArr;
}

// 生成随机颜色值
function  generateColor() {
	let color="#";
	for(let i=0;i<6;i++){
		color += (Math.random()*16 | 0).toString(16);
	}
	return color;
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
			value: ""
		}
	},
	data: {
		treeItemCur: 0, // 索引树的聚焦项
		listItemCur: 0, // 节点树的聚焦项
		touching: false, // 是否在触摸索引树中
		scrollTop: 0, // 节点树滚动高度
		indicatorTop: -1, // 指示器顶部距离
		treeKeyTran: false,
		style1: "",
		style2: ""
	},
	methods: {
		/**
		 * scroll-view 滚动监听
		 */
		scroll(e) {
			if (this.data.touching) return;

			let scrollTop = e.detail.scrollTop;

			if (scrollTop > this.maxScrollTop) return;

			let blocks = this.blocks;

			let stickyTitleHeight = this.remScale * 30

			for (let i = blocks.length - 1; i >= 0; i--) {
				let block = blocks[i];

				if (scrollTop >= block.top && scrollTop < block.bottom) {
					if (scrollTop > block.bottom - stickyTitleHeight) {
						let percent = Math.floor(((scrollTop - (block.bottom - stickyTitleHeight)) / stickyTitleHeight) * 100);

						console.log(percent)

						let style1 = `background: rgba(237, 237, 237, ${percent}%);color: ${this.colors[percent]}`
						let style2 = `background: rgba(237, 237, 237, ${100 - percent}%);color: ${this.colors[100 - percent]}`

						this.setData({
							style1: style1,
							style2: style2,
							treeItemCur: i,
							listItemCur: i
						});
					} else if (scrollTop <= block.bottom - stickyTitleHeight) {
						this.setData({
							style1: "",
							style2: "",
							percent: 1,
							treeItemCur: i,
							listItemCur: i
						});
					}
					break
				}
			}
		},
		/**
		 * 触摸之后后设置对应value
		 */
		setValue(treeItemCur) {
			if (treeItemCur == this.data.treeItemCur) return;

			let {scrollTop, scrollIndex} = this.blocks[treeItemCur];
			let indicatorTop = this.indicatorTopList[treeItemCur];

			this.setData({
				style1: "",
				style2: "",
				percent: 1,
				treeItemCur: treeItemCur,
				scrollTop: scrollTop,
				listItemCur: scrollIndex,
				indicatorTop: indicatorTop
			});

			if(this.platform != "devtools") wx.vibrateShort();
		},
		/**
		 * tree 触摸开始
		 */
		touchStart(e) {
			if(this.data.touching) return;

			this.setData({
				touching: true
			});

			let treeItemCur = this.getCurrentTreeItem(e.changedTouches[0].pageY);

			this.setValue(treeItemCur);
		},
		/**
		 * tree 触摸移动
		 */
		touchMove(e) {
			if(!this.data.touching) {
				this.setData({
					touching: true,
					style1: "",
					style2: ""
				});
			}

			let treeItemCur = this.getCurrentTreeItem(e.changedTouches[0].pageY);

			this.setValue(treeItemCur);
		},
		/**
		 * tree 触摸结束
		 */
		touchEnd(e) {
			let {treeItemCur, listItemCur} = this.data;

			if (treeItemCur != listItemCur) {
				this.setData({
					treeItemCur: listItemCur,
					indicatorTop: this.indicatorTopList[treeItemCur]
				});
			}

			this.setData({
				treeKeyTran: true
			});

			setTimeout(() => {
				this.setData({
					touching: false,
					treeKeyTran: false
				});
			}, 300);
		},
		/**
		 * 获取当前触摸的 tree-item
		 * @param pageY: 当前触摸点pageY
		 */
		getCurrentTreeItem(pageY) {
			let {top, bottom, itemHeight, len} = this.treeInfo;

			if (pageY < top) {
				return 0
			} else if (pageY > bottom) {
				return len - 1
			} else {
				return Math.floor((pageY - top) / itemHeight)
			}
		},
		/**
		 *  初始化函数
		 */
		init() {
			// 获取主题色到灰色之间100阶色值
			this.colors = gradient(this.data.color, "#767676", 100);

			// 获取系统信息
			let {windowHeight, windowWidth, platform} = wx.getSystemInfoSync();

			this.platform = platform;

			// 计算缩放比
			this.remScale = (windowWidth || 375) / 375;

			// 获取索引树元素信息
			this.createSelectorQuery().select("#tree").boundingClientRect((res) => {
				// 保存索引树节点信息
				this.treeInfo = {
					len: this.data.listData.length,
					itemHeight: res.height / this.data.listData.length,
					top: res.top,
					bottom: res.top + res.height
				};

				// 保存指示器节点信息
				let indicatorTopList = this.data.listData.map((item, index) => {
					let {top, itemHeight} = this.treeInfo,
						remScale = this.remScale;

					let indicatorTop = itemHeight / 2 + index * itemHeight + top - remScale * 25;

					return indicatorTop
				});

				this.indicatorTopList = indicatorTopList;

			}).exec();

			// 获取整个列表元素信息
			this.createSelectorQuery().select(".block-wrap").boundingClientRect((res) => {
				// 获取最大滚动高度
				let maxScrollTop = res.height - windowHeight;

				this.maxScrollTop = maxScrollTop;

				// 获取每个块的节点信息
				this.createSelectorQuery().selectAll(".block").boundingClientRect((res) => {
					// 获取最大滚动项的index
					let maxScrollIndex = -1;

					// 保存每个块的 top 和 bottom 信息
					let blocks = res.map((item, index) => {
						let top = Math.round(item.top), bottom = Math.round(item.top + item.height);

						let scrollTop = top >= maxScrollTop ? maxScrollTop : top;

						if (maxScrollTop >= top && maxScrollTop < bottom) {
							maxScrollIndex = index;
						}

						let scrollIndex = maxScrollIndex == -1 ? index : maxScrollIndex;

						return {
							scrollTop: scrollTop,
							scrollIndex: scrollIndex,
							top: Math.round(item.top),
							bottom: Math.round(item.top + item.height)
						}
					});

					this.blocks = blocks;
				}).exec();
			}).exec();
		},
	},
	ready() {
		let listData = this.data.listData.map((item, index) => {
			let data = item.data.map((chItem, chIndex) => {
				return {
					data: chItem,
					firstChar: chItem.slice(0,1),
					color: generateColor()
				}
			});

			item.data = data;

			return item
		});

		this.setData({
			listData: listData
		});

		this.init();
	}
})


