const app = getApp()

Component({
    properties: {
        isScroll: {
            type: Boolean,
            value: false
        },
        min: {
            type: Boolean,
            value: false
        },
        menuData: {
            type: Array,
            value: []
        },
    },
    data: {
        windowWidth: 0,
        menuCur: 0,
        scrollLeft: 0,
    },
    methods: {
        /**
         * 切换菜单
         */
        toggleMenu(e) {
            this.triggerEvent('change', {index: e.currentTarget.dataset.index});
            this.scrollByIndex(e.currentTarget.dataset.index)
        },
        /**
         * 获取当前menuItem的左边距离
         * @param menuCur: 当前激活的menuItem的索引
         */
        getOffsetLeftByIndex(menuCur) {
            let offsetLeft = 0;
            for(let i = 0; i < menuCur; i++) {
                offsetLeft += this.data.items[i].width
            }
            return offsetLeft;
        },
        /**
         * 滑动到指定位置
         * @param menuCur: 当前激活的menuItem的索引
         * @param needTransition: 下划线是否需要过渡动画, 第一次进来应设置为false
         */
        scrollByIndex(menuCur, needTransition = true) {
            let animation;
            if(needTransition) {
                animation = wx.createAnimation({
                    duration: 300,
                    timingFunction: 'ease',
                })
            } else {
                animation = wx.createAnimation({
                    duration: 0
                })
            }

            let query = this.createSelectorQuery();

            query.select(`#item${menuCur}`).boundingClientRect();

            query.select(`#item_wrap${menuCur}`).fields({
                size: true,
                computedStyle: ['paddingLeft']
            });

            query.exec(function (res) {
                // 子item宽度
                let itemWidth = res[0].width

                // 父item左边距离
                let offsetLeft = this.getOffsetLeftByIndex(menuCur)

                if(this.data.isScroll) { // 超出滚动的情况
                    // 父item左边距
                    let paddingLeft = parseInt(res[1].paddingLeft.slice(0,-2)||0)

                    animation.width(res[0].width).translateX(offsetLeft + paddingLeft).step()

                    this.setData({
                        animationData: animation.export()
                    })

                    // 保持滚动后当前item'尽可能'在屏幕中间
                    let scrollLeft = offsetLeft - (this.data.windowWidth - itemWidth) / 2;

                    this.setData({
                        menuCur: menuCur,
                        scrollLeft: scrollLeft,
                    })
                } else { // 不超出滚动的情况
                    // 父item宽度
                    let itemWrapWidth = res[1].width

                    animation.width(res[0].width).translateX(offsetLeft + (itemWrapWidth - itemWidth) / 2).step()

                    this.setData({
                        animationData: animation.export()
                    })

                    this.setData({
                        menuCur: menuCur,
                    })
                }
            }.bind(this));
        }
    },
    attached() {
        this.setData({
            windowWidth: app.globalData.systemInfo.windowWidth
        })

        let query = this.createSelectorQuery();

        for(let i = 0; i < this.data.menuData.length; i++) {
            query.select(`#item_wrap${i}`).boundingClientRect()
        }

        query.exec(function (res) {
            this.setData({
                items: res
            })
            this.scrollByIndex(0, false)
        }.bind(this));
    }
})