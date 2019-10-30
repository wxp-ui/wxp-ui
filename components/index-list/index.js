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
			value: [],
			observer: "dataChange"
		},
		// 颜色
		color: {
			type: String,
			value: ""
		},
		// 顶部高度
		topSize: {
			type: Number,
			value: 0,
			observer: 'dataChange'
		},
		// 底部高度
		bottomSize: {
			type: Number,
			value: 0,
			observer: 'dataChange'
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
		// 控制空状态的显示
		emptyShow: {
			type: Boolean,
			value: false,
		},
	},
	data: {
		list: [], // 处理后数据
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
			// 大于最大滚动距离时候返回
			if (scrollTop > this.maxScrollTop) return;
			// 处理未获到 blocks 异常时候返回
			if (!this.blocks) return;
			let blocks = this.blocks;
			// 计算获得 .block__title 高度
			let stickyTitleHeight = this.remScale * 30
			for (let i = blocks.length - 1; i >= 0; i--) {
				let block = blocks[i];
				// 判断当前滚动值 scrollTop 所在区间, 以得到当前聚焦项
				if (scrollTop >= block.top && scrollTop < block.bottom) {
					// 判断当前滚动值 scrollTop 是否在当前聚焦项底一个 .block__title 高度范围内, 如果是则开启过度色值计算
					if (scrollTop > block.bottom - stickyTitleHeight) {
						let percent = Math.floor(((scrollTop - (block.bottom - stickyTitleHeight)) / stickyTitleHeight) * 100);
						let style1 = `background: rgba(237, 237, 237, ${percent}%);color: ${this.colors[percent]}`;
						let style2 = `background: rgba(237, 237, 237, ${100 - percent}%);color: ${this.colors[100 - percent]}`;
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
							treeItemCur: i,
							listItemCur: i
						});
					}
					break;
				}
			}
		},
		/**
		 * 触摸之后后设置对应value
		 */
		setValue(treeItemCur) {
			if (treeItemCur == this.data.treeItemCur) return;
			if(!(this.blocks && this.blocks[treeItemCur])) return;
			let {scrollTop, scrollIndex} = this.blocks[treeItemCur];
			let indicatorTop = this.indicatorTopList[treeItemCur];
			this.setData({
				style1: "",
				style2: "",
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
			// 获取触摸点信息
			let startTouch = e.changedTouches[0];
			if(!startTouch) return;
			this.setData({touching: true});
			let treeItemCur = this.getCurrentTreeItem(startTouch.pageY);
			this.setValue(treeItemCur);
		},
		/**
		 * tree 触摸移动
		 */
		touchMove(e) {
			// 获取触摸点信息
			let currentTouch = e.changedTouches[0];
			if(!currentTouch) return;
			// 滑动结束后迅速开始第二次滑动时候 touching 为 false 造成不显示 indicator 问题
			if(!this.data.touching) {
				this.setData({
					touching: true
				});
			}
			let treeItemCur = this.getCurrentTreeItem(currentTouch.pageY);
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
			} else if (pageY >= bottom) {
				return len - 1
			} else {
				return Math.floor((pageY - top) / itemHeight)
			}
		},
		/**
		 *  初始化处理数据, 不于 init 方法合并以防止2.7.1版本及以下版本无法及时获取到dom信息
		 */
		initData(){
			let list = this.data.listData.map((item, index) => {
				let data = item.data.map((chItem, chIndex) => {
					return {
						firstChar: chItem.name.slice(0,1),
						color: generateColor(),
						...chItem
					}
				});
				item.data = data;
				return item
			});
			this.setData({
				list: list
			});
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
			this.topSize = this.data.topSize * this.remScale / 2;
			this.bottomSize = this.data.bottomSize * this.remScale / 2;
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
					let {top, itemHeight} = this.treeInfo, remScale = this.remScale;
					let indicatorTop = itemHeight / 2 + index * itemHeight + top - remScale * 25;
					return indicatorTop
				});
				this.indicatorTopList = indicatorTopList;
			}).exec();

			// 获取整个列表元素信息
			this.createSelectorQuery().select(".block-wrap").boundingClientRect((res) => {
				// 获取最大滚动高度
				let maxScrollTop = Math.round(res.height - (windowHeight - this.topSize - this.bottomSize));
				this.maxScrollTop = maxScrollTop;
				// 获取每个块的节点信息
				this.createSelectorQuery().selectAll(".block").boundingClientRect((res) => {
					// 获取最大滚动项的index
					let maxScrollIndex = -1;
					// 保存每个块的 top 和 bottom 信息
					let blocks = res.map((item, index) => {
						let top = Math.round(item.top - this.topSize) , bottom = Math.round(item.top + item.height - this.topSize) ;
						let scrollTop = top >= maxScrollTop ? maxScrollTop : top;
						if (maxScrollTop >= top && maxScrollTop < bottom) {
							maxScrollIndex = index;
						}
						let scrollIndex = maxScrollIndex == -1 ? index : maxScrollIndex;
						return {
							scrollTop: scrollTop,
							scrollIndex: scrollIndex,
							top: top,
							bottom: bottom
						}
					});
					this.blocks = blocks;
				}).exec();
			}).exec();
		},
		/**
		 * 清除参数
		 */
		clearData() {
			this.setData({
				treeItemCur: 0, // 索引树的聚焦项
				listItemCur: 0, // 节点树的聚焦项
				touching: false, // 是否在触摸索引树中
				scrollTop: 0, // 节点树滚动高度
				indicatorTop: -1, // 指示器顶部距离
				treeKeyTran: false,
				style1: "",
				style2: ""
			});
		},
		/**
		 * 监听列数变化, 如果改变重新初始化参数
		 */
		dataChange(newVal, oldVal) {
			// 防止初次进入init方法无法获取到dom信息
			if(newVal.length > 0 || (oldVal.length > 0 && newVal.length == 0)) {
				this.clearData();
				this.initData();
				setTimeout(() => this.init(),10)
			}
		},
		/**
		 * 点击每一项后触发事件
		 */
		itemClick(e) {
			let {i, j} = e.currentTarget.dataset;
			let data = this.data.list[i].data[j];
			this.triggerEvent('click', data);
		}
	},
	ready() {
		console.log(`init listData length: ${this.data.listData.length}`)
		if(this.data.listData.length > 0) {
			this.initData();
			setTimeout(() => this.init(),10)
		}
	}
})
