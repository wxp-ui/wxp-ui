Component({
	options: {
		multipleSlots: true
	},
	properties: {
		beforeExtraNodes: {type: Array, value: []},             // 插入正常节点之前的额外节点
		afterExtraNodes: {type: Array, value: []},              // 插入正常节点之后的额外节点
		listData: {type: Array, value: []},                     // 数据源
	},
	data: {
		/* 未渲染数据 */
		windowWidth: 0,                                         // 视窗宽度
		platform: '',                                           // 平台信息
		maxScroll: 0,                                           // 最大滚动距离
		itemDom: {width: 0, height: 0, left: 0, top: 0},        // 每一项 item 的 dom 信息, 由于大小一样所以只存储一个
		itemWrapDom: {width: 0, height: 0, left: 0, top: 0},    // 整个拖拽区域的 dom 信息
		startTouch: {pageX: 0, pageY: 0, identifier: 0},        // 初始触摸点 identifier
		preStartKey: -1,                                        // 前一次排序时候的起始 sortKey 值

		/* 渲染数据 */
		list: [],                                               // 渲染数据列
		cur: -1,                                                // 当前激活的元素
		curZ: -1,                                               // 当前激活的元素, 用于控制激活元素z轴显示
		tranX: 0,                                               // 当前激活元素的 X轴 偏移量
		tranY: 0,                                               // 当前激活元素的 Y轴 偏移量
		wrapStyle: "",                                          // 父级 item 元素样式
		dragging: false,                                        // 是否在拖拽中
		itemTransition: false,                                  // item 变换是否需要过渡动画, 首次渲染不需要
		scrollLeft: 0,                                          // scroll-view 滚动距离
		currentItem: {},                                        // 当前拖拽元素信息
	},
	methods: {
		scroll(e) {
			this.data.scrollLeft = e.detail.scrollLeft;
		},
		getKeyByClientX(clientX) {
			let {scrollLeft, itemDom} = this.data;

			let tranX = clientX - itemDom.width / 2 + scrollLeft;

			return Math.round(tranX / itemDom.width);
		},
		/**
		 * 长按触发移动排序
		 */
		longPress(e) {
			// 获取触摸点信息
			let startTouch = e.changedTouches[0];
			if (!startTouch) return;

			this.startKey = this.getKeyByClientX(startTouch.clientX);

			const currentItem = this.data.list.find(item => item.sortKey === this.startKey);
			const index = this.data.list.findIndex(item => item.sortKey === this.startKey);
			this.setData({currentItem});

			// 固定项则返回
			if (this.isFixed(index)) return;

			// 防止多指触发 drag 动作, 如果已经在 drag 中则返回, touchstart 事件中有效果
			if (this.data.dragging) return;
			this.setData({dragging: true});

			let {platform, maxScroll, scrollLeft, itemDom, itemWrapDom, windowWidth} = this.data,
				{pageX: startPageX, pageY: startPageY, identifier: startId} = startTouch;

			// 计算X,Y轴初始位移, 使 item 中心移动到点击处
			let tranX = startPageX - itemDom.width / 2,
				tranY = startPageY - itemDom.height / 2 - itemWrapDom.top;

			this.data.startTouch = startTouch;
			this.setData({cur: index, tranX, tranY});

			if (platform !== "devtools") wx.vibrateShort();
		},

		touchMove(e) {
			// 获取触摸点信息
			let currentTouch = e.changedTouches[0];
			if (!currentTouch) return;

			if (!this.data.dragging) return;

			let {windowWidth, maxScroll, scrollLeft, itemDom, itemWrapDom, preStartKey, startTouch} = this.data,
				{identifier: currentId, clientX: currentClientX, clientY: currentClientY} = currentTouch;

			// 如果不是同一个触发点则返回
			if (startTouch.identifier !== currentId) return;

			// 通过 当前坐标点, 初始坐标点, 初始偏移量 来计算当前偏移量
			let tranX = currentClientX - itemDom.width / 2, tranY = currentClientY - itemDom.height / 2 - itemWrapDom.top;

			// 设置当前激活元素偏移量
			this.setData({tranX: tranX, tranY: tranY});

			// 获取 startKey 和 endKey
			let startKey = this.startKey;
			let endKey = this.getKeyByClientX(currentClientX), curY = Math.round(tranY / itemDom.height);

			clearTimeout(this.timer)
			// 到侧边自动滑动
			if (currentClientX + itemDom.width / 2 >= windowWidth - 20) {
				// 根据偏移距离计算速度
				let speed = (currentClientX + itemDom.width / 2) - (windowWidth - 20);
				if (speed > 0 && speed < 40) speed = 2;

				this.timer = setTimeout(() => {
					let _scrollLeft = scrollLeft + speed;
					_scrollLeft = _scrollLeft >= maxScroll ? maxScroll : _scrollLeft;
					this.setData({
						scrollLeft: _scrollLeft,
					});
					this.touchMove(e);
				}, 10)
			} else if (currentClientX - itemDom.width / 2 <= 20) {
				// 根据距离计算速度
				let speed = 20 - (currentClientX - itemDom.width / 2);
				if (speed > 0 && speed < 40) speed = 2;

				this.timer = setTimeout(() => {
					let _scrollLeft = scrollLeft - speed;
					_scrollLeft = _scrollLeft <= 0 ? 0 : _scrollLeft;
					this.setData({
						scrollLeft: _scrollLeft,
					})
					this.touchMove(e);
				}, 10)
			}

			// 遇到固定项和超出范围则返回,以及是否需要排序
			if (this.isFixed(endKey) || curY !== 0 || endKey < 0 || endKey >= this.data.list.length) return;

			// 防止拖拽过程中发生乱序问题
			if (startKey === endKey || startKey === preStartKey) return;
			this.data.preStartKey = startKey;

			// 触发排序
			this.sort(startKey, endKey);
			this.startKey = endKey;
		},
		touchEnd() {
			if (!this.data.dragging) return;
			this.triggerCustomEvent(this.data.list, "sortend");
			this.clearData();
			clearInterval(this.interval)
			this.interval = null;

		},
		/**
		 * 根据 startKey 和 endKey 去重新计算每一项 sortKey
		 */
		sort(startKey, endKey) {
			this.setData({itemTransition: true});
			let list = this.data.list.map((item) => {
				if (item.fixed) return item;
				if (startKey < endKey) { // 正序拖动
					if (item.sortKey > startKey && item.sortKey <= endKey) {
						item.sortKey = this.excludeFix(item.sortKey - 1, startKey, 'reduce');
					} else if (item.sortKey === startKey) {
						item.sortKey = endKey;
					}
					return item;
				} else if (startKey > endKey) { // 倒序拖动
					if (item.sortKey >= endKey && item.sortKey < startKey) {
						item.sortKey = this.excludeFix(item.sortKey + 1, startKey, 'add');
					} else if (item.sortKey === startKey) {
						item.sortKey = endKey;
					}
					return item;
				}
			});
			this.updateList(list);
		},
		/**
		 * 排除固定项得到最终 sortKey
		 */
		excludeFix(sortKey, startKey, type) {
			if (sortKey === startKey) return startKey;
			if (this.data.list[sortKey].fixed) {
				let _sortKey = type === 'reduce' ? sortKey - 1 : sortKey + 1;
				return this.excludeFix(_sortKey, startKey, type);
			} else {
				return sortKey;
			}
		},
		/**
		 * 根据排序后 list 数据进行位移计算
		 */
		updateList(data, vibrate = true) {
			let {platform} = this.data;
			let list = data.map((item, index) => {
				item.tranX = `${item.sortKey * 100}%`;
				item.tranY = 0;
				return item;
			});
			this.setData({
				list: list
			});

			if (!vibrate) return;
			if (platform !== "devtools") wx.vibrateShort();

			this.triggerCustomEvent(list, "change");
		},
		/**
		 * 判断是否是固定的 item
		 */
		isFixed(index) {
			let list = this.data.list;
			if (list && list[index] && list[index].fixed) return 1;
			return 0;
		},
		/**
		 * 清除参数
		 */
		clearData() {
			this.setData({
				preStartKey: -1,
				dragging: false,
				cur: -1,
				tranX: 0,
				tranY: 0
			});
			// 延迟清空
			setTimeout(() => {
				this.setData({
					curZ: -1,
				})
			}, 300)
		},
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
		/**
		 * 封装自定义事件
		 * @param list 当前渲染的数据
		 * @param type 事件类型
		 */
		triggerCustomEvent(list, type) {
			let _list = [], listData = [];

			list.forEach((item) => {
				_list[item.sortKey] = item;
			});

			_list.forEach((item) => {
				if (!item.extraNode) {
					listData.push(item.data);
				}
			});

			this.triggerEvent(type, {listData: listData});
		},
		/**
		 *  初始化获取 dom 信息
		 */
		initDom(isMaxScroll) {
			let {windowWidth, platform} = wx.getSystemInfoSync();
			let remScale = (windowWidth || 375) / 375;

			this.data.windowWidth = windowWidth;
			this.data.platform = platform;

			this.createSelectorQuery().select(".item").boundingClientRect((res) => {
				this.data.itemDom = res;
				let wrapStyle = `width: ${this.data.list.length * res.width}px;height: ${res.height}px;`
				this.setData({
					wrapStyle: wrapStyle
				});

				this.createSelectorQuery().select("#item-wrap").boundingClientRect((res) => {
					let maxScroll = res.width - windowWidth;
					maxScroll = maxScroll < 0 ? 0 : maxScroll;
					this.data.maxScroll = maxScroll;
					this.data.itemWrapDom = res;
				}).exec();
			}).exec();
		},
		/**
		 *  初始化函数
		 *  {listData, columns, topSize, bottomSize} 参数改变需要重新调用初始化方法
		 */
		init(needTranFirst = false) {
			this.clearData();
			this.setData({itemTransition: needTranFirst});
			// 避免获取不到节点信息报错问题
			if (this.data.listData.length === 0) {
				this.setData({list: [], wrapStyle: ""});
				return;
			}

			let {listData, beforeExtraNodes, afterExtraNodes} = this.data;
			let _listData = [];

			let delItem = (item, extraNode) => ({
				id: item.dragId,
				slot: item.slot,
				fixed: item.fixed,
				extraNode: extraNode,
				tranX: "0%",
				tranY: "0%",
				data: item
			});

			// 遍历数据源增加扩展项, 以用作排序使用
			listData.forEach((item, index) => {
				beforeExtraNodes.forEach((_item) => {
					if (_item.destKey === index) _listData.push(delItem(_item, true));
				});

				_listData.push(delItem(item, false));

				afterExtraNodes.forEach((_item, _index) => {
					if (_item.destKey === index) _listData.push(delItem(_item, true));
				});
			});

			let list = _listData.map((item, index) => {
				return {
					sortKey: index, // 初始化 sortKey 为当前项索引值
					...item
				};
			});

			this.updateList(list, false);
			// 异步加载数据时候, 延迟执行 initDom 方法, 防止基础库 2.7.1 版本及以下无法正确获取 dom 信息
			setTimeout(() => this.initDom(), 0);
		}
	},
	ready() {
		this.init();
	}
});
