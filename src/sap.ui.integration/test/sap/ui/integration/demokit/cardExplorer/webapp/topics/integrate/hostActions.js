function init() {
	sap.ui.require([
		"sap/m/FlexBox",
		"sap/ui/integration/widgets/Card",
		"sap/ui/integration/Host",
		"sap/m/MessageToast"
	], function (FlexBox, Card, Host, MessageToast) {
		const oHost = new Host({
			actions: [
				{
					type: 'Navigation',
					icon: 'sap-icon://world',
					text: 'Open SAP website',
					tooltip: 'Open www.sap.com',
					url: 'https://www.sap.com',
					target: '_blank'
				},
				{
					type: 'Custom',
					icon: 'sap-icon://add',
					text: 'Add to mobile',
					tooltip: 'Add card to your mobile',
					action: function (oCard, oButton) {
						MessageToast.show("Added to mobile: " + oCard.getManifestEntry("/sap.app/title"));
					}
				}
			]
		});

		const oCard = new Card({
			id: "quickLinksCardExample",
			manifest: "./manifests/quickLinksCard.manifest.json",
			width: "352px",
			host: oHost
		}).addStyleClass("sapUiSmallMargin");

		const oFlexBoxCardExample = new FlexBox({
			direction: "Row",
			wrap: "Wrap",
			justifyContent: "Start",
			alignItems: "Stretch",
			width: "100%",
			items: [oCard]
		});

		oFlexBoxCardExample.placeAt("cardContainer");
	});
};