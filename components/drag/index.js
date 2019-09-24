Component({
	properties: {
		// 数据源
		listData: {
			type: Array,
			value: []
		},
		// 列数
		columns: {
			type: Number,
			value: 1,
			observer: 'columnsChange'
		},
	},
	data: {
		cur: -1, // 当前激活的元素
		curZ: -1, // 当前激活的元素, 用于控制激活元素z轴显示
		tranX: 0, // 当前激活元素的 X轴 偏移量
		tranY: 0, // 当前激活元素的 Y轴 偏移量
		itemWrapHeight: 0, // 动态计算父级元素高度
		touch: false, // 是否在移动中
		list: [],
		overOnePage: false, // 整个区域是否超过一个屏幕
		itemTransition: false, // item 变换是否需要过渡动画, 首次渲染不需要
	},
	methods: {
		/**
		 * 长按触发移动排序
		 */
		longPress(e) {
			let index = e.currentTarget.dataset.index;

			if(this.data.list[index].fixed) return;

			this.setData({
				touch: true
			});

			this.startX = e.changedTouches[0].pageX
			this.startY = e.changedTouches[0].pageY


			if(this.data.columns === 1) { // 单列时候X轴初始不做位移
				this.tranX = 0;
			} else {  // 多列的时候计算X轴初始位移, 使 item 水平中心移动到点击处
				this.tranX = this.startX - this.item.width / 2 - this.itemWrap.left;
			}

			// 计算Y轴初始位移, 使 item 垂直中心移动到点击处
			this.tranY = this.startY - this.item.height / 2 - this.itemWrap.top;

			this.setData({
				cur: index,
				curZ: index,
				tranX: this.tranX,
				tranY: this.tranY,
			});

			wx.vibrateShort();
		},
		touchMove(e) {
			if (!this.data.touch) return;
			let tranX = e.touches[0].pageX - this.startX + this.tranX,
				tranY = e.touches[0].pageY - this.startY + this.tranY;

			let overOnePage = this.data.overOnePage;

			// 判断是否超过一屏幕, 超过则需要判断当前位置动态滚动page的位置
			if(overOnePage) {
				if(e.touches[0].clientY > this.windowHeight - this.item.height) {
					wx.pageScrollTo({
						scrollTop: e.touches[0].pageY + this.item.height - this.windowHeight,
						duration: 300
					});
				} else if(e.touches[0].clientY < this.item.height) {
					wx.pageScrollTo({
						scrollTop: e.touches[0].pageY - this.item.height,
						duration: 300
					});
				}
			}

			this.setData({tranX: tranX, tranY: tranY});

			let originKey = e.currentTarget.dataset.key;

			let endKey = this.calculateMoving(tranX, tranY);

			if(this.data.list[endKey].fixed) return;

			// 防止拖拽过程中发生乱序问题
			if (originKey == endKey || this.originKey == originKey) return;

			this.originKey = originKey;

			this.insert(originKey, endKey);
		},
		touchEnd() {
			if (!this.data.touch) return;

			this.clearData();
		},
		/**
		 * 清除参数
		 */
		clearData() {
			this.originKey = -1;

			this.setData({
				touch: false,
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
		 * 根据排序后 list 数据进行位移计算
		 */
		getPosition(data, vibrate = true) {
			let list = data.map((item, index) => {
				item.tranX = this.item.width * (item.key % this.data.columns);
				item.tranY = Math.floor(item.key / this.data.columns) * this.item.height;
				return item
			});

			this.setData({
				list: list
			});

			if(!vibrate) return;

			if(this.platform != "devtools") wx.vibrateShort();

			let listData= [];

			list.forEach((item) => {
				listData[item.key] = item.data
			});

			this.triggerEvent('change', {listData: listData});
		},
		/**
		 * 正序拖动 key 值和固定项判断逻辑
		 */
		l2r(key, origin) {
			if(key == origin) return origin;

			if(this.data.list[key].fixed) {
				return this.l2r(key - 1, origin);
			} else {
				return key;
			}
		},
		/**
		 * 倒序拖动 key 值和固定项判断逻辑
		 */
		r2l(key, origin) {
			if(key == origin) return origin;

			if(this.data.list[key].fixed) {
				return this.r2l(key + 1, origin);
			} else {
				return key;
			}
		},
		/**
		 * 根据起始key和目标key去重新计算每一项的新的key
		 */
		insert(origin, end) {
			this.setData({
				itemTransition: true
			});

			let list;

			if (origin < end) { // 正序拖动
				list = this.data.list.map((item) => {
					if(item.fixed) return item;

					if (item.key > origin && item.key <= end) {
						item.key = this.l2r(item.key - 1, origin);
					} else if (item.key == origin) {
						item.key = end;
					}

					return item
				});

				this.getPosition(list);

			} else if (origin > end) { // 倒序拖动
				list = this.data.list.map((item) => {
					if(item.fixed) return item;

					if (item.key >= end && item.key < origin) {
						item.key = this.r2l(item.key + 1, origin);
					} else if (item.key == origin) {
						item.key = end;
					}

					return item
				});

				this.getPosition(list);
			}
		},
		/**
		 * 根据当前的手指偏移量计算目标key
		 */
		calculateMoving(tranX, tranY) {
			let rows = Math.ceil(this.data.list.length / this.data.columns) - 1,
				i = Math.round(tranX / this.item.width),
				j = Math.round(tranY / this.item.height);

			i = i > (this.data.columns - 1) ? (this.data.columns - 1) : i;
			i = i < 0 ? 0 : i;

			j = j < 0 ? 0 : j;
			j = j > rows ? rows : j;

			let endKey = i + this.data.columns * j;

			endKey = endKey >= this.data.list.length ? this.data.list.length - 1 : endKey;

			return endKey
		},
		/**
		 * 监听列数变化, 如果改变重新初始化参数
		 */
		columnsChange(newVal, oldVal) {
			setTimeout(() => {
				wx.pageScrollTo({
					scrollTop: 0,
					duration: 0
				});
				this.clearData();
				this.init()
			},0)
		},
		init() {
			// 遍历数据源增加扩展项, 以用作排序使用
			let list = this.data.listData.map((item, index) => {
				let data = {
					fixed: item.fixed,
					key: index,
					tranX: 0,
					tranY: 0,
					data: item
				}
				return data;
			});

			this.setData({
				list: list,
				itemTransition: false
			});

			let {windowHeight, platform} = wx.getSystemInfoSync();

			this.windowHeight = windowHeight;
			this.platform = platform;

			// 获取每一项的宽高等属性
			this.createSelectorQuery().select(".item").boundingClientRect((res) => {

				let rows = Math.ceil(this.data.list.length / this.data.columns);

				this.item = res;

				this.getPosition(this.data.list, false);

				let itemWrapHeight = rows * res.height;

				this.setData({
					itemWrapHeight: itemWrapHeight
				});

				this.createSelectorQuery().select(".item-wrap").boundingClientRect((res) => {
					this.itemWrap = res;

					let overOnePage = itemWrapHeight + res.top > this.windowHeight;

					this.setData({
						overOnePage: overOnePage
					});

				}).exec();
			}).exec();
		}
	},
	ready() {
		this.init();
	}
})
