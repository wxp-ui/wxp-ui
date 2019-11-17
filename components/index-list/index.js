let ColorUtil = {
	rgbToHex(r, g, b) {
		let hex = ((r << 16) | (g << 8) | b).toString(16);
		return "#" + new Array(Math.abs(hex.length - 7)).join("0") + hex;
	},
	hexToRgb(hex) {
		let rgb = [];
		for (let i = 1; i < 7; i += 2) {
			rgb.push(parseInt("0x" + hex.slice(i, i + 2)));
		}
		return rgb;
	},
	/**
	 * 生成渐变过渡色数组 {startColor: 开始颜色值, endColor: 结束颜色值, step: 生成色值数组长度}
	 */
	gradient(startColor, endColor, step) {
		// 将hex转换为rgb
		let sColor = this.hexToRgb(startColor),
			eColor = this.hexToRgb(endColor);

		// 计算R\G\B每一步的差值
		let rStep = (eColor[0] - sColor[0]) / step,
			gStep = (eColor[1] - sColor[1]) / step,
			bStep = (eColor[2] - sColor[2]) / step;

		let gradientColorArr = [];
		for (let i = 0; i < step; i++) {
			// 计算每一步的hex值
			gradientColorArr.push(this.rgbToHex(parseInt(rStep * i + sColor[0]), parseInt(gStep * i + sColor[1]), parseInt(bStep * i + sColor[2])));
		}
		return gradientColorArr;
	},
	/**
	 * 生成随机颜色值
	 */
	generateColor() {
		let color = "#";
		for (let i = 0; i < 6; i++) {
			color += (Math.random() * 16 | 0).toString(16);
		}
		return color;
	}
}

Component({
	properties: {
		// 数据源
		listData: {
			type: Array,
			value: [],
			observer: "dataChange"
		},
		// 顶部高度
		topSize: {
			type: Number,
			value: 0,
			observer: "dataChange"
		},
		// 底部高度
		bottomSize: {
			type: Number,
			value: 0,
			observer: "dataChange"
		},
		// 颜色
		color: {
			type: String,
			value: ""
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
		/* 未渲染数据 */
		platform: '', // 平台信息
		remScale: 1, // 缩放比例
		realTopSize: 0, // 计算后顶部高度实际值
		realBottomSize: 0, // 计算后底部高度实际值
		colors: [], // 色值数组
		treeInfo: { // 索引树节点信息
			treeTop: 0,
			treeBottom: 0,
			itemHeight: 0,
			itemMount: 0
		},
		indicatorTopList: [], // 指示器节点信息列表
		maxScrollTop: 0, // 最大滚动高度
		blocks: [], // 节点组信息

		/* 渲染数据 */
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
		 * 点击每一项后触发事件
		 */
		itemClick(e) {
			let {i, j} = e.currentTarget.dataset;
			let data = this.data.list[i].data[j];
			this.triggerEvent('click', data);
		},
		/**
		 * scroll-view 滚动监听
		 */
		scroll(e) {
			if (this.data.touching) return;

			let scrollTop = e.detail.scrollTop;
			if (scrollTop > this.data.maxScrollTop) return;

			let blocks = this.data.blocks,
				stickyTitleHeight = this.data.remScale * 30;

			for (let i = blocks.length - 1; i >= 0; i--) {
				let block = blocks[i];
				// 判断当前滚动值 scrollTop 所在区间, 以得到当前聚焦项
				if (scrollTop >= block.itemTop && scrollTop < block.itemBottom) {
					// 判断当前滚动值 scrollTop 是否在当前聚焦项底一个 .block__title 高度范围内, 如果是则开启过度色值计算
					if (scrollTop > block.itemBottom - stickyTitleHeight) {
						let percent = Math.floor(((scrollTop - (block.itemBottom - stickyTitleHeight)) / stickyTitleHeight) * 100);
						let style1 = `background: rgba(237, 237, 237, ${percent}%);color: ${this.data.colors[percent]}`;
						let style2 = `background: rgba(237, 237, 237, ${100 - percent}%);color: ${this.data.colors[100 - percent]}`;
						this.setData({
							style1: style1,
							style2: style2,
							treeItemCur: i,
							listItemCur: i
						});
					} else if (scrollTop <= block.itemBottom - stickyTitleHeight) {
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
		 * tree 触摸开始
		 */
		touchStart(e) {
			// 获取触摸点信息
			let startTouch = e.changedTouches[0];
			if (!startTouch) return;

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
			if (!currentTouch) return;

			// 滑动结束后迅速开始第二次滑动时候 touching 为 false 造成不显示 indicator 问题
			if (!this.data.touching) {
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
			if (treeItemCur !== listItemCur) {
				this.setData({
					treeItemCur: listItemCur,
					indicatorTop: this.data.indicatorTopList[treeItemCur]
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
			let {treeTop, treeBottom, itemHeight, itemMount} = this.data.treeInfo;

			if (pageY < treeTop) {
				return 0;
			} else if (pageY >= treeBottom) {
				return itemMount - 1;
			} else {
				return Math.floor((pageY - treeTop) / itemHeight);
			}
		},
		/**
		 * 触摸之后后设置对应value
		 */
		setValue(treeItemCur) {
			if (treeItemCur === this.data.treeItemCur) return;

			let block = this.data.blocks[treeItemCur];
			if (!block) return;

			let {
					scrollTop,
					scrollIndex
				} = block,
				indicatorTop = this.data.indicatorTopList[treeItemCur];

			this.setData({
				style1: "",
				style2: "",
				treeItemCur: treeItemCur,
				scrollTop: scrollTop,
				listItemCur: scrollIndex,
				indicatorTop: indicatorTop
			});

			if (this.data.platform !== "devtools") wx.vibrateShort();
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
		 * 监听数据变化, 如果改变重新初始化参数
		 */
		dataChange(newVal, oldVal) {
			this.init();
		},
		/**
		 *  初始化获取 dom 信息
		 */
		initDom() {
			let {windowHeight, windowWidth, platform} = wx.getSystemInfoSync();
			let remScale = (windowWidth || 375) / 375,
				realTopSize = this.data.topSize * remScale / 2,
				realBottomSize = this.data.bottomSize * remScale / 2,
				colors = ColorUtil.gradient(this.data.color, "#767676", 100);

			this.setData({
				platform: platform,
				remScale: remScale,
				realTopSize: realTopSize,
				realBottomSize: realBottomSize,
				colors: colors
			});

			this.createSelectorQuery().select("#tree").boundingClientRect((res) => {
				let treeTop = res.top,
					treeBottom = res.top + res.height,
					itemHeight = res.height / this.data.listData.length,
					itemMount = this.data.listData.length;

				let indicatorTopList = this.data.listData.map((item, index) => {
					return itemHeight / 2 + index * itemHeight + treeTop - remScale * 25;
				});

				this.setData({
					treeInfo: {
						treeTop: treeTop,
						treeBottom: treeBottom,
						itemHeight: itemHeight,
						itemMount: itemMount
					},
					indicatorTopList: indicatorTopList
				});
			}).exec();

			this.createSelectorQuery().select(".block-wrap").boundingClientRect((res) => {
				let maxScrollTop = res.height - (windowHeight - realTopSize - realBottomSize);

				this.createSelectorQuery().selectAll(".block").boundingClientRect((res) => {
					let maxScrollIndex = -1;

					let blocks = res.map((item, index) => {
						// Math.ceil 向上取整, 防止索引树切换列表时候造成真机固定头部上边线显示过粗问题
						let itemTop = Math.ceil(item.top - realTopSize),
							itemBottom = Math.ceil(itemTop + item.height);

						if (maxScrollTop >= itemTop && maxScrollTop < itemBottom) maxScrollIndex = index;

						return {
							itemTop: itemTop,
							itemBottom: itemBottom,
							scrollTop: itemTop >= maxScrollTop ? maxScrollTop : itemTop,
							scrollIndex: maxScrollIndex === -1 ? index : maxScrollIndex
						};
					});

					this.setData({
						maxScrollTop: maxScrollTop,
						blocks: blocks
					});
				}).exec();
			}).exec();
		},
		/**
		 *  初始化
		 */
		init() {
			this.clearData();
			// 避免获取不到节点信息报错问题
			if (this.data.listData.length === 0) {
				this.setData({list: []});
				return;
			}
			let list = this.data.listData.map((item, index) => {
				item.data = item.data.map((chItem, chIndex) => {
					return {
						firstChar: chItem.name.slice(0, 1),
						color: ColorUtil.generateColor(),
						...chItem
					}
				});
				return item;
			});
			this.setData({list: list});
			// 异步加载数据时候, 延迟执行 initDom 方法, 防止基础库 2.7.1 版本及以下无法正确获取 dom 信息
			setTimeout(() => this.initDom(), 10);
		},
	},
	ready() {
		this.init();
	}
});
