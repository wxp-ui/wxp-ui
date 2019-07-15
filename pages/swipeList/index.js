const app = getApp()

let pageStart = 0;
let pageSize = 15;

let categoryMenu

let testData1 = [
    {
        title: "广汽本田新缤智上市，售价12.78万-17.68万元",
        description: "新缤智融合了SUV和轿车的造型设计，采用一体式镀铬前格栅与飞翼动感前脸，配上高辨识度的羽翼式LED前大灯以及并排式五灯珠雾灯，带来更强的视觉冲击。",
        images: [
            "../../assets/image/swipe/1.jpeg"
        ],
        type: 1
    },
    {
        title: "建于1951年的什刹海人民游泳场，曾是当年北京人消夏休闲的好去处",
        description: "解放初期，北京市政府在完成龙须沟整修工程之后，即大力开展全市河湖水系的整理，疏通三海（中南海、北海、什刹海），并利用天然水系和原有地形，在前什刹海西小海建立起人民游泳场，于1951年6月6日正式对外开放。",
        images: [
            "../../assets/image/swipe/3.jpeg",
            "../../assets/image/swipe/4.jpeg",
            "../../assets/image/swipe/5.jpeg"
        ],
        type: 2
    },
    {
        title: "为什么会做梦，并且更经常做不太好的梦？为何睡醒之后容易忘记自己的梦？原来梦的重点不是内容",
        description: "睡觉是自然界的普遍现象。所有的动物都睡觉，连培植器皿中的细菌都会睡觉。但梦却是进化较新的产物——快速眼动睡眠（REM）只在人类和其他温血哺乳类动物、鸟类身上发现过。",
        images: [
            "../../assets/image/swipe/2.jpeg"
        ],
        type: 1
    },
    {
        title: "一只特立独行的猫！被欺负逃上树一住6年没下来",
        description: "波兰东北部小镇巴尔托希采有一只独特的小猫咪。它独来独往，在一棵橡树上生活了整整6年。",
        images: [
            "../../assets/image/swipe/6.jpeg",
            "../../assets/image/swipe/7.jpeg",
            "../../assets/image/swipe/8.jpeg"
        ],
        type: 2
    }
]

Page({
    data: {
        categoryCur: 0,
        categoryMenu: ["推荐", "美食", "时尚美妆", "明星综艺", "搞笑", "游戏"],
        categoryData: [
            {
                name: "推荐",
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
                pageData.listData = testData1
                pageData.page = currentPage + 1

            } else {
                pageData.listData = pageData.listData.concat([
                    {
                        title: "一个冰激凌，需要走5700步才能消耗掉",
                        description: "人们常感叹减肥过程中难以抵挡美食的诱惑，怎么办呢？在忍不住食指大动前，不妨看一看食物的热量以及需要多少运动量才能将其消耗掉吧！这样也能帮助你“三思而后行”。",
                        images: [
                            "../../assets/image/swipe/12.jpeg"
                        ],
                        type: 1
                    },
                    {
                        title: "被历史遗忘的一段齐长城：既没有被拆毁，也没有被重建",
                        description: "我们在山东寻访《诗经》地理，最初试图了解“泰山岩岩”究竟是何种气派，又去寻找“徂莱之松”，在徂莱林场见识到千年古松和成片成片的松林。",
                        images: [
                            "../../assets/image/swipe/9.jpeg",
                            "../../assets/image/swipe/10.jpeg",
                            "../../assets/image/swipe/11.jpeg"
                        ],
                        type: 2
                    },
                ])
                pageData.end = true
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

