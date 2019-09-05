Component({
	properties: {
		item: {
			type: String,
			value: ""
		},
	},
	data: {
		color: "",
		firstChar: ""
	},
	methods: {
		generateColor() {
			let color="#";
			for(let i=0;i<6;i++){
				color += (Math.random()*16 | 0).toString(16);
			}
			return color;
		}
	},
	ready() {
		let firstChar = this.data.item.slice(0,1);

		this.setData({
			color: this.generateColor(),
			firstChar: firstChar
		});
	}
})
