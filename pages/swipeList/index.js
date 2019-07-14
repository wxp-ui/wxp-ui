const app = getApp()

let pageStart = 0;
let pageSize = 15;

let categoryMenu

let testData = [
    {
        title: "数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数",
        description: "数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题",
        images: [
            "../../assets/image/1.png"
        ],
        type: 1
    },
    {
        title: "数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数",
        description: "数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题",
        images: [
            "../../assets/image/2.png",
            "../../assets/image/3.png",
            "../../assets/image/4.png"
        ],
        type: 2
    },
    {
        title: "数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数",
        description: "数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题",
        images: [
            "../../assets/image/1.png"
        ],
        type: 1
    },
    {
        title: "数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数",
        description: "数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题",
        images: [
            "../../assets/image/2.png",
            "../../assets/image/3.png",
            "../../assets/image/4.png"
        ],
        type: 2
    },
    {
        title: "数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数",
        description: "数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题",
        images: [
            "../../assets/image/1.png"
        ],
        type: 1
    },
    {
        title: "数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数",
        description: "数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题",
        images: [
            "../../assets/image/2.png",
            "../../assets/image/3.png",
            "../../assets/image/4.png"
        ],
        type: 2
    },
    {
        title: "数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数",
        description: "数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题",
        images: [
            "../../assets/image/1.png"
        ],
        type: 1
    },
    {
        title: "数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数",
        description: "数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题",
        images: [
            "../../assets/image/2.png",
            "../../assets/image/3.png",
            "../../assets/image/4.png"
        ],
        type: 2
    }
]

Page({
    data: {
        categoryCur: 0,
        categoryMenu: ["推荐", "精选", "美食", "时尚美妆", "明星综艺", "影视", "搞笑", "游戏"],
        categoryData: [
            {
                name: "推荐",
                requesting: false,
                end: false,
                page: pageStart,
                listData: []
            },
            {
                name: "精选",
                requesting: false,
                end: false,
                page: pageStart,
                listData: []
            },
            {
                name: "美食",
                requesting: false,
                end: false,
                page: pageStart,
                listData: []
            },
            {
                name: "时尚美妆",
                requesting: false,
                end: false,
                page: pageStart,
                listData: []
            },
            {
                name: "明星综艺",
                requesting: false,
                end: false,
                page: pageStart,
                listData: []
            },
            {
                name: "影视",
                requesting: false,
                end: false,
                page: pageStart,
                listData: []
            },
            {
                name: "搞笑",
                requesting: false,
                end: false,
                page: pageStart,
                listData: []
            },
            {
                name: "游戏",
                requesting: false,
                end: false,
                page: pageStart,
                listData: []
            }
        ]
    },
    getList(type, currentPage) {
        let pageData = this.getCurrentData()

        pageData.requesting = true

        this.setCurrentData(pageData)

        wx.showNavigationBarLoading()

        setTimeout(() => {
            pageData.requesting = false

            wx.hideNavigationBarLoading()

            if(type === 'refresh') {
                pageData.listData = testData
                pageData.page = currentPage + 1

            } else {
                pageData.listData = pageData.listData.concat([
                    {
                        title: "数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数",
                        description: "数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题",
                        images: [
                            "../../assets/image/1.png"
                        ],
                        type: 1
                    },
                    {
                        title: "数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数",
                        description: "数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题数字数字标题",
                        images: [
                            "../../assets/image/2.png",
                            "../../assets/image/3.png",
                            "../../assets/image/4.png"
                        ],
                        type: 2
                    }
                ])
                pageData.page = currentPage + 1
            }

            this.setCurrentData(pageData)
        }, 1000)

    },
    // 顶部菜单切换事件
    toggleMenu(e) {
        this.setData({
            categoryCur: e.detail.index
        })
    },
    // 页面滑动切换事件
    swipeChange(e) {
        categoryMenu.scrollByIndex(e.detail.current)
        this.setData({
            categoryCur: e.detail.current
        })
        this.loadData()
    },
    // 更新页面数据
    setCurrentData(pageData) {
        let categoryData = this.data.categoryData
        categoryData[this.data.categoryCur] = pageData
        this.setData({
            categoryData: categoryData
        })
    },
    // 获取当前激活页面的数据
    getCurrentData() {
        return this.data.categoryData[this.data.categoryCur]
    },
    // 判断是否为加载新的页面,如果是去加载数据
    loadData() {
        let pageData = this.getCurrentData()
        if(pageData.listData.length == 0) {
            this.getList('refresh', pageStart);
        }
    },
    // 刷新数据
    refresh() {
        this.getList('refresh', pageStart);
    },
    // 加载更多
    more() {
        this.getList('more', this.getCurrentData().page);
    },
    onLoad() {
        categoryMenu = this.selectComponent('#category')

        this.getList('refresh', pageStart);
    }
});

