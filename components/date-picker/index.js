const app = getApp();
Component({
	properties: {
		date: { // 当前日期, 时间戳格式
			type: Number,
			observer(newVal, oldVal, path) {
				this.initDate(newVal);
			}
		},
		rangeStart: { // 最早可选日期, 时间戳格式
			type: Number,
			observer(newVal, oldVal, path) {
				this.initRangeStart(newVal);
			}
		},
		rangeEnd: { // 最晚可选日期, 时间戳格式
			type: Number,
			observer(newVal, oldVal, path) {
				this.initRangeStart(newVal);
			}
		},
		needWeek: { // 是否禁用周末, 默认不禁用
			type: Boolean,
			value: true
		},
		pickerShow: { // 控制控件显示
			type: Boolean,
			value: false
		}
	},
	data: {
		mode: 'date', // date:选择日期模式, time:选择时间模式
		startDate: null, // 最早可选日期
		endDate: null, // 最晚可选日期
		currentDate: null, // 当前月日期
		currentDateStr: null, // 2018-12
		selectedDate: null, // 选中日期
		selectedDateStr: null, // 选中日期字符格式,用于和dayStr比较
		selectedDateShow: null, // 选中日期显示 2018-12-12
		currentData: null, // 当前渲染数据
		hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
		minutes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 26, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
		seconds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 26, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
		initTimeValue: [0, 0, 0], // 初始化选中时间的时,分,秒
		timeValue: [0, 0, 0], // 选中时间的时,分,秒
	},
	methods: {
		bindChange: function (e) {
			const values = e.detail.value

			this.setData({
				timeValue: values
			});
		},
		toggleMode() { //切换模式
			if (this.data.mode === 'date') {
				let date = this.data.date ? new Date(this.data.date) : new Date();
				let hour = date.getHours();
				let minute = date.getMinutes();
				let second = date.getSeconds();
				this.setData({
					initTimeValue: [hour, minute, second],
					timeValue: [hour, minute, second],
					mode: 'time'
				});
			} else {
				this.setData({
					mode: 'date'
				});
			}
		},
		cancel() {
			this.setData({
				pickerShow: false
			});
			setTimeout(() => {
				this.setData({
					mode: 'date'
				});
			}, 300)
			this.initDate(this.data.date);
		},
		confirm() {
			this.setData({
				pickerShow: false,
				mode: 'date'
			});
			let selectedDate = this.data.selectedDate;
			let year = selectedDate.getFullYear(), month = selectedDate.getMonth(), day = selectedDate.getDate();
			let timeValue = this.data.timeValue;
			let newDate = new Date(year, month, day, timeValue[0], timeValue[1], timeValue[2]);
			let dateStr = [year, month, day].map(this.fixZero).join('-');
			let dateTimeStr = [year, month, day].map(this.fixZero).join('-') + ' ' + timeValue.map(this.fixZero).join(':');
			this.triggerEvent('select', {date: newDate, dateStr: dateStr, dateTimeStr: dateTimeStr});
		},
		isValidDay(date) {
			let {startDate, endDate, needWeek} = this.data;

			let valid = false;

			if (startDate && endDate) { // 开始日期和结束日期都存在
				if (date >= startDate && date < endDate) {
					valid = true;
				}
			} else if (startDate && !endDate) { // 开始日期存在结束日期不存在
				if (date >= startDate) {
					valid = true;
				}
			} else if (!startDate && endDate) { // 开始日期不存在结束日期存在
				if (date < endDate) {
					valid = true;
				}
			} else {
				valid = true;
			}

			if (!needWeek) {
				let weekDay = date.getDay();
				if (weekDay === 0 || weekDay === 6) {
					valid = false;
				}
			}
			return valid;
		},
		setMonthData() {
			const currentDate = this.data.currentDate;

			let year = currentDate.getFullYear(), month = currentDate.getMonth();

			// 当月所有天数的数据结构
			let currentData = [];

			// 获取当月1号的星期0~6
			let firstDayWeek = new Date(year, month, 1).getDay();

			// 天数, 用来标识当前是本月中的哪一天
			let dayIndex = 0;

			// 第1行
			let firstCol = [];

			for (let i = 0; i < 7; i++) {
				if (i < firstDayWeek) {
					let date = new Date(year, month, dayIndex - (firstDayWeek - i) + 1);
					let valid = this.isValidDay(date);
					firstCol.push({
						date: date,
						dateStr: date.toString(),
						day: date.getDate(),
						valid: valid,
						currentMonth: false
					})
				} else {
					dayIndex += 1;
					let date = new Date(year, month, dayIndex);
					let valid = this.isValidDay(date);
					firstCol.push({
						date: date,
						dateStr: date.toString(),
						day: dayIndex,
						valid: valid,
						currentMonth: true
					});
				}
			}

			currentData.push(firstCol);

			// 第2～4行
			for (let i = 0; i < 3; i++) {
				let col = [];
				for (let j = 0; j < 7; j++) {
					dayIndex += 1;
					let date = new Date(year, month, dayIndex);
					let valid = this.isValidDay(date);
					col.push({
						date: date,
						dateStr: date.toString(),
						day: dayIndex,
						valid: valid,
						currentMonth: true
					});
				}
				currentData.push(col);
			}

			// 第5行
			let lastCol = [];

			// 余下一行中本月的天数
			let restDay = new Date(year, month + 1, 0).getDate() - dayIndex;

			for (let i = 0; i < 7; i++) {
				if (i < restDay) {
					dayIndex += 1;
					let date = new Date(year, month, dayIndex);
					let valid = this.isValidDay(date);
					lastCol.push({
						date: date,
						dateStr: date.toString(),
						day: dayIndex,
						valid: valid,
						currentMonth: true
					});
				} else {
					let date = new Date(year, month + 1, i - restDay + 1);
					let valid = this.isValidDay(date);
					lastCol.push({
						date: date,
						dateStr: date.toString(),
						day: date.getDate(),
						valid: valid,
						currentMonth: false
					});
				}
			}

			currentData.push(lastCol);

			let restDay2 = restDay - 7;

			// 第6行
			let lastCol2 = [];

			for (let i = 0; i < 7; i++) {
				if (i < restDay2) {
					dayIndex += 1;
					let date = new Date(year, month, dayIndex);
					let valid = this.isValidDay(date);
					lastCol2.push({
						date: date,
						dateStr: date.toString(),
						day: dayIndex,
						valid: valid,
						currentMonth: true
					});
				} else {
					let date = new Date(year, month + 1, i - restDay2 + 1);
					let valid = this.isValidDay(date);
					lastCol2.push({
						date: date,
						dateStr: date.toString(),
						day: date.getDate(),
						valid: valid,
						currentMonth: false
					});
				}
			}

			currentData.push(lastCol2);

			this.setData({
				currentData: currentData
			});

		},
		changeDate(event) {
			let currentDate = this.data.currentDate;
			let year = currentDate.getFullYear(), month = currentDate.getMonth();
			let type = event.currentTarget.dataset.type;

			switch (type) {
				case 'year-':
					currentDate.setFullYear(year - 1)
					break;
				case 'year+':
					currentDate.setFullYear(year + 1)
					break;
				case 'month-':
					currentDate.setMonth(month - 1)
					break;
				case 'month+':
					currentDate.setMonth(month + 1)
					break;
			}

			this.setCurrentDate(currentDate);

			this.setMonthData();
		},
		chooseDate(event) {
			let {i, j} = event.currentTarget.dataset;

			let td = this.data.currentData[i][j];

			if (td.valid) {
				this.setSelectedDate(td.date);
			}

		},
		fixZero: function (value) {
			if (value < 10) {
				return "0" + value;
			} else {
				return value;
			}
		},
		setCurrentDate(date) {
			if (!date) {
				this.setData({
					currentDate: null,
					currentDateStr: null
				});
			} else {
				const year = date.getFullYear();
				const month = date.getMonth() + 1;
				const dateStr = [year, month].map(this.fixZero).join('-');

				this.setData({
					currentDate: date,
					currentDateStr: dateStr
				});
			}
		},
		setSelectedDate(date) {
			if (!date) {
				this.setData({
					selectedDate: null,
					selectedDateStr: null,
					selectedDateShow: null
				});
				return;
			} else {
				const year = date.getFullYear();
				const month = date.getMonth() + 1;
				const day = date.getDate();
				const selectedDateShow = [year, month, day].map(this.fixZero).join('-');
				this.setData({
					selectedDate: date,
					selectedDateStr: date.toString(),
					selectedDateShow: selectedDateShow
				});
			}
		},
		initRangeStart(value) {
			if (value) {
				let date = new Date(value);
				this.setData({
					startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate())
				})
			}
		},
		initRangeEnd(value) {
			if (value) {
				let date = new Date(value);
				this.setData({
					endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 24)
				})
			}
		},
		initDate(value) {
			let date = value ? new Date(value) : new Date();
			let year = date.getFullYear(), month = date.getMonth(), day = date.getDate();
			this.setCurrentDate(new Date(year, month, day));
			this.setSelectedDate(new Date(year, month, day));
			this.setMonthData();
		}
	},
	ready() {
		let {rangeStart, rangeEnd, date} = this.data;
		this.initRangeStart(rangeStart);
		this.initRangeEnd(rangeEnd);
		this.initDate(date);
	}
});
