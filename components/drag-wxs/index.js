/**
 * 版本号比较
 */
const compareVersion = (v1, v2) => {
	v1 = v1.split('.')
	v2 = v2.split('.')
	const len = Math.max(v1.length, v2.length)

	while (v1.length < len) {
		v1.push('0')
	}
	while (v2.length < len) {
		v2.push('0')
	}

	for (let i = 0; i < len; i++) {
		const num1 = parseInt(v1[i])
		const num2 = parseInt(v2[i])

		if (num1 > num2) {
			return 1
		} else if (num1 < num2) {
			return -1
		}
	}

	return 0
}

Component({
	options: {
		multipleSlots: true
	},
	properties: {
		extraNodes: {            // 额外节点
			type: Array,
			value: []
		},
		listData: {              // 数据源
			type: Array,
			value: []
		},
		columns: {               // 列数
			type: Number,
			value: 1
		},
		topSize: {               // 顶部固定高度
			type: Number,
			value: 0
		},
		bottomSize: {            // 底部固定高度
			type: Number,
			value: 0
		},
		scrollTop: {             // 页面滚动高度
			type: Number,
			value: 0
		}
	},
	data: {
		/* 未渲染数据 */
		baseData: {},
		pageMetaSupport: false,                                 // 当前版本是否支持 page-meta 标签
		platform: '',                                           // 平台信息

		/* 渲染数据 */
		list: [],                                               // 渲染数据列
		itemWrapHeight: 0,                                      // 动态计算父级元素高度
		dragging: false,
	},
	methods: {
		/**
		 * 点击每一项后触发事件
		 */
		itemClick(e) {
			let {index, key} = e.currentTarget.dataset;
			let list = this.data.list;
			let currentItem = list[index];

			if (!currentItem.extraNode) {
				let _list = [];

				list.forEach((item) => {
					_list[item.sortKey] = item;
				});

				let currentKey = -1;

				for (let i = 0, len = _list.length; i < len; i++) {
					let item = _list[i];
					if (!item.extraNode) {
						currentKey++;
					}
					if (item.sortKey === currentItem.sortKey) {
						break;
					}
				}

				this.triggerEvent('click', {
					key: currentKey,
					data: currentItem.data
				});
			}
		},
		vibrate() {
			if (this.data.platform !== "devtools") wx.vibrateShort();
		},
		pageScroll(e) {
			if (this.data.pageMetaSupport) {
				this.triggerEvent("scroll", {
					scrollTop: e.scrollTop
				});
			} else {
				wx.pageScrollTo({
					scrollTop: e.scrollTop,
					duration: 300
				});
			}
		},
		drag(e) {
			this.setData({
				dragging: e.dragging
			})
		},
		/**
		 *  初始化获取 dom 信息
		 */
		initDom() {
			let {windowWidth, windowHeight, platform, SDKVersion} = wx.getSystemInfoSync();
			let remScale = (windowWidth || 375) / 375;

			this.data.pageMetaSupport = compareVersion(SDKVersion, '2.9.0') >= 0;
			this.data.platform = platform;

			let baseData = {};
			baseData.windowHeight = windowHeight;
			baseData.realTopSize = this.data.topSize * remScale / 2;
			baseData.realBottomSize = this.data.bottomSize * remScale / 2;

			this.createSelectorQuery().select(".item").boundingClientRect((res) => {
				let columns = this.data.columns;
				let rows = Math.ceil(this.data.list.length / columns);

				baseData.columns = columns;
				baseData.rows = rows;
				baseData.itemWidth = res.width;
				baseData.itemHeight = res.height;
				this.setData({
					dragging: false,
					itemWrapHeight: rows * res.height,
				});

				this.createSelectorQuery().select(".item-wrap").boundingClientRect((res) => {
					baseData.wrapLeft = res.left;
					baseData.wrapTop = res.top + this.data.scrollTop;
					this.setData({
						baseData
					});
				}).exec();
			}).exec();
		},
		/**
		 *  初始化函数
		 *  {listData, columns, topSize, bottomSize} 参数改变需要重新调用初始化方法
		 */
		init() {
			// 初始必须为true以绑定wxs中的函数,
			this.setData({dragging: true});

			let delItem = (item, extraNode) => ({
				id: item.dragId,
				slot: item.slot,
				fixed: item.fixed,
				extraNode: extraNode,
				tranX: "0%",
				tranY: "0%",
				data: item
			});

			let {listData, extraNodes} = this.data;
			let _list = [], _before=[], _after=[], destBefore = [], destAfter = [];

			extraNodes.forEach((item, index) => {
				if(item.type === "before") {
					_before.push(delItem(item, true));
				} else if(item.type === "after") {
					_after.push(delItem(item, true));
				} else if(item.type === "destBefore") {
					destBefore.push(delItem(item, true));
				} else if(item.type === "destAfter") {
					destAfter.push(delItem(item, true));
				}
			});

			// 遍历数据源增加扩展项, 以用作排序使用
			listData.forEach((item, index) => {
				destBefore.forEach((i) => {
					if (i.data.destKey === index) _list.push(i);
				});
				_list.push(delItem(item, false));
				destAfter.forEach((i) => {
					if (i.data.destKey === index) _list.push(i);
				});
			});

			let list = _before.concat(_list, _after).map((item, index) => {
				item.sortKey = index; // 初始化 sortKey 为当前项索引值
				item.tranX = `${(item.sortKey % this.data.columns) * 100}%`;
				item.tranY = `${Math.floor(item.sortKey / this.data.columns) * 100}%`;
				return item;
			});

			this.setData({
				list
			});

			if (list.length === 0) {
				this.setData({itemWrapHeight: 0});
				return;
			}
			// 异步加载数据时候, 延迟执行 initDom 方法, 防止基础库 2.7.1 版本及以下无法正确获取 dom 信息
			setTimeout(() => this.initDom(), 0);
		}
	},
	ready() {
		this.init();
	}
});
