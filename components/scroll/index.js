module.exports = Component({
    properties: {
        requesting: {
            type: Boolean,
            value: false,
            observer: 'requestingEnd',
        },
        end: {
            type: Boolean,
            value: false,
        },
        listCount: {
            type: Number,
            value: 0,
        },
        emptyUrl: {
            type: String,
            value: "/assets/image/empty/empty.png"
        },
        emptyText: {
            type: String,
            value: "未找到数据"
        },
        hasTop: {
            type: Boolean,
            value: false
        },
        refreshSize: {
            type: Number,
            value: 90,
            observer: 'refreshChange'
        },
        bottomSize: {
            type: Number,
            value: 0,
        },
        color: {
            type: String,
            value: "#ff4158",
            observer: "colorChange"
        },
    },
    data: {
        mode: 'refresh', // refresh 和 more 两种模式
        successShow: false,
        successTran: false,
        refreshStatus: 0, // 1: 下拉刷新, 2: 松开刷新, 3: 加载中, 4: 加载完成
        move: -45,
        scrollHeight1: 0, // refresh view 高度负值
        scrollHeight2: 0  // refresh view - success view 高度负值
    },
    methods: {
        change(e) {
            const {refreshStatus} = this.data;

            // 判断如果状态大于3则返回
            if(refreshStatus >= 3) {
                return
            }

            let diff = e.detail.y

            if(diff > -10) {
                this.setData({
                    refreshStatus: 2
                })
            } else {
                this.setData({
                    refreshStatus: 1
                })
            }
        },
        touchend() {
            const {refreshStatus} = this.data;

            if(refreshStatus >= 3) {
                return
            }

            if (refreshStatus == 2) {
                wx.vibrateShort();
                this.setData({
                    refreshStatus: 3,
                    move: 0,
                    mode: 'refresh'
                })
                this.triggerEvent('refresh');
            } else if(refreshStatus == 1) {
                this.setData({
                    move: this.data.scrollHeight1
                })
            }
        },
        more() {
            if (!this.properties.end) {
                this.setData({
                    mode: 'more'
                })
                this.triggerEvent('more');
            }
        },
        requestingEnd(newVal, oldVal) {
            if(this.data.mode == 'more') {
                return
            }

            if (oldVal === true && newVal === false) {
                this.setData({
                    refreshStatus: 4,
                    move: this.data.scrollHeight2
                });

                setTimeout(() => {
                    this.setData({
                        successShow: true,
                    });
                    setTimeout(() => {
                        this.setData({
                            successTran: true,
                            move: this.data.scrollHeight1
                        });
                        setTimeout(() => {
                            this.setData({
                                refreshStatus: 1,
                                successShow: false,
                                successTran: false,
                                move: this.data.scrollHeight1
                            });
                        }, 350)
                    }, 1000)
                }, 650)

            } else {
                if(this.data.refreshStatus != 3) {
                    this.setData({
                        refreshStatus: 3,
                        move: 0
                    })
                }
            }
        },
        refreshChange(newVal, oldVal) {
            if(newVal <= 80) {
                this.setData({
                    refreshSize: 80
                })
            }
            this.init();
        },
        init() {
            let query = this.createSelectorQuery();

            query.select("#refresh").boundingClientRect()
            query.select("#success").boundingClientRect()

            query.exec(function (res) {
                this.setData({
                    scrollHeight1: -res[0].height,
                    scrollHeight2: res[1].height - res[0].height,
                    move: -res[0].height
                })
            }.bind(this));
        },
    },
    attached() {
        this.init()
    }
})