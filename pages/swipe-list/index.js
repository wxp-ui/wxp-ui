const app = getApp();

let pageStart = 1;

Page({
	data: {
		duration: 300,  // swiper-item 切换过渡时间
		categoryCur: 0, // 当前数据列索引
		categoryMenu: [], // 分类菜单数据, 字符串数组格式
		categoryData: [], // 所有数据列
	},
	getList(type, currentPage) {
		let currentCur = this.data.categoryCur;
		let pageData = this.getCurrentData(currentCur);

		if (pageData.end) return;

		pageData.requesting = true;
		this.setCurrentData(currentCur, pageData);

		app.httpGet({
			url: `/wxarticle/list/${pageData.id}/${currentPage}/json`
		}).then((res) => {
			let data = res.data || {
				datas: [],
				over: false
			};
			let listData = data.datas || [];
			pageData.requesting = false;

			if (type === 'refresh') {
				pageData.listData = listData;
				pageData.end = data.over;
				pageData.page = currentPage + 1;
			} else {
				pageData.listData = pageData.listData.concat(listData);
				pageData.end = data.over;
				pageData.page = currentPage + 1;
			}

			this.setCurrentData(currentCur, pageData);
		});
	},
	// 更新页面数据
	setCurrentData(currentCur, pageData) {
		let categoryData = this.data.categoryData
		categoryData[currentCur] = pageData
		this.setData({
			categoryData: categoryData
		})
	},
	// 获取当前激活页面的数据
	getCurrentData() {
		return this.data.categoryData[this.data.categoryCur]
	},
	// 顶部tab切换事件
	toggleCategory(e) {
		console.log(1212)
		this.setData({
			duration: 0
		});
		setTimeout(() => {
			this.setData({
				categoryCur: e.detail.index
			});
		}, 0);
	},
	// 页面滑动切换事件
	animationFinish(e) {
		console.log(1313)

		this.setData({
			duration: 300
		});
		setTimeout(() => {
			this.setData({
				categoryCur: e.detail.current
			});
			let pageData = this.getCurrentData();
			if (pageData.listData.length === 0) {
				this.getList('refresh', pageStart);
			}
		}, 0);
	},
	// 刷新数据
	refresh() {
		this.getList('refresh', pageStart);
	},
	// 加载更多
	more() {
		this.getList('more', this.getCurrentData(this.data.categoryCur).page);
	},
	showArticle(e) {
		wx.setClipboardData({
			data: e.currentTarget.dataset.link,
			success(res) {
				wx.showToast({
					icon: "none",
					title: "链接已复制到剪切板"
				})
			}
		})
		// wx.navigateTo({
		// 	url: `/pages/swipe-list/webview/index?link=${e.currentTarget.dataset.link}`
		// })
	},
	onLoad() {
		app.httpGet({
			url: "/wxarticle/chapters/json"
		}).then((res) => {
			let menus = res.data || [];

			let categoryMenu = [];
			let categoryData = [];

			menus.forEach((item, index) => {
				categoryMenu.push(item.name.replace("&amp;", "&"));
				categoryData.push({
					id: item.id,
					categoryCur: index,
					requesting: false,
					end: false,
					emptyShow: false,
					page: pageStart,
					listData: []
				});
			});

			this.setData({
				categoryMenu,
				categoryData
			});

			// 第一次加载延迟 350 毫秒 防止第一次动画效果不能完全体验
			setTimeout(() => {
				this.refresh();
			}, 350);
		})
	}
});

