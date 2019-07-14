Component({
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
        min: {
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
        }
    },
    data: {
        mode: 'refresh', // refresh 和 more 两种模式
        successShow: false,
        refreshStatus: 0, // 1: 下拉刷新, 2: 松开刷新, 3: 加载中, 4: 加载完成
        move: -40,
        scrollHeight1: 0,
        scrollHeight2: 0
    },
    methods: {
        change(e) {
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
            const status = this.data.refreshStatus;

            if (status == 2) {

                this.setData({
                    refreshStatus: 3,
                    move: 0
                })
                this.setData({
                    mode: 'refresh'
                })
                this.triggerEvent('refresh');

            } else if(status == 1) {

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
                    successShow: true,
                    refreshStatus: 4,
                    move: this.data.scrollHeight2
                });

                setTimeout(() => {
                    this.setData({
                        successShow: false,
                        refreshStatus: 1,
                        move: this.data.scrollHeight1
                    });
                }, 1000)
            } else {
                if(this.data.refreshStatus != 3) {
                    this.setData({
                        refreshStatus: 3,
                        move: 0
                    })
                }
            }
        },
    },
    attached() {
        let query = this.createSelectorQuery();

        query.select("#refresh").boundingClientRect()
        query.select("#success").boundingClientRect()

        query.exec(function (res) {
            this.setData({
                scrollHeight1: -res[0].height,
                scrollHeight2: res[1].height - res[0].height,
                move: -res[0].height,
            })
        }.bind(this));
    }
})
