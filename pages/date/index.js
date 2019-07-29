const app = getApp()
const {appUtils} = require('../../utils/util.js');

Page({
	data: {
		time1: undefined,
		timeStr1: '',
		timeShow1: false,

		time2: undefined,
		timeStr2: '',
		timeShow2: false,

		time3: undefined,
		timeStr3: '',
		timeShow3: false,
		rangeStart: undefined,
		rangeEnd: undefined
	},
	timeSelect1(e) {
		let {date, dateTimeStr} = e.detail;
		this.setData({
			time1: date.getTime(),
			timeStr1: dateTimeStr
		});
	},
	timeSelect2(e) {
		let {date, dateTimeStr} = e.detail;
		this.setData({
			time2: date.getTime(),
			timeStr2: dateTimeStr
		});
	},
	timeSelect3(e) {
		let {date, dateTimeStr} = e.detail;
		this.setData({
			time3: date.getTime(),
			timeStr3: dateTimeStr
		});
	},
	toggleShow1() {
		this.setData({
			timeShow1: true
		});
	},
	toggleShow2() {
		this.setData({
			timeShow2: true
		});
	},
	toggleShow3() {
		this.setData({
			timeShow3: true
		});
	},
	onLoad() {
		let date = new Date();
		this.setData({
			rangeStart: date.getTime()
		});
		date.setDate(date.getDate() + 7);
		this.setData({
			rangeEnd: date.getTime()
		})
	}
});

