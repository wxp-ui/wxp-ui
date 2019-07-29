//工具方法
const appUtils = {
	combineArray: function (a, b) {//合并数组
		if (a && b && a.constructor === Array && b.constructor === Array) {
			if (a.length > b.length) {
				a.push.apply(a, b);
			} else {
				b.push.apply(a, b);
			}
		} else {
			console.log('要合并的数组不存在')
		}
	},
	fixZero: function (value) {
		if (value < 10) {
			return "0" + value;
		} else {
			return value;
		}
	},
	formatDate: function (date, fullDate) {
		if (!date) {
			return "";
		}
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const hour = date.getHours();
		const minute = date.getMinutes();
		const second = date.getSeconds();
		if (fullDate) {
			return [year, month, day].map(this.fixZero).join('-') + ' ' + [hour, minute, second].map(this.fixZero).join(':');
		} else {
			return [year, month, day].map(this.fixZero).join('-');
		}
	},
	formatMoney: function (money) {
		return (money || "0").toString().split("").reverse().join("").replace(/(\d{3}\B)/g, "$1,").split("").reverse().join("")
	},
}

module.exports = {
	appUtils: appUtils
}
