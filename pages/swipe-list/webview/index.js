const app = getApp();

Page({
	data: {
		link: ''
	},
	onLoad(options) {
		console.log(options)

		this.setData({
			link: options.link
		});
	}
});

