sap.ui.define(["sap/ui/integration/Extension"], (Extension) => {
	"use strict";

	let iCw = 20;

	const aRevenues = [
		{ Week: "CW14", Revenue: 431000.22, Cost: 230000.00 },
		{ Week: "CW15", Revenue: 494000.30, Cost: 238000.00 },
		{ Week: "CW16", Revenue: 491000.17, Cost: 221000.00 },
		{ Week: "CW17", Revenue: 536000.34, Cost: 280000.00 },
		{ Week: "CW18", Revenue: 675000.00, Cost: 230000.00 },
		{ Week: "CW19", Revenue: 680000.00, Cost: 250000.00 },
		{ Week: "CW20", Revenue: 659000.14, Cost: 325000.00 }
	];

	function getNextWeek() {
		return `CW${++iCw}`;
	}

	function getRevenueChange() {
		const sign = Math.random() < 0.5 ? -1 : 1;
		return sign * Math.random() * 100000;
	}

	function updateRevenues() {
		for (const oRevenue of aRevenues) {
			oRevenue.Week = getNextWeek();
			oRevenue.Revenue += getRevenueChange();
			oRevenue.Cost += getRevenueChange();
		}
	}

	const DataModeExtension = Extension.extend("sap.f.cardsdemo.cardcontent.dataMode.Extension");

	DataModeExtension.prototype.getData = function () {
		updateRevenues();
		return Promise.resolve(aRevenues);
	};

	return DataModeExtension;
});
