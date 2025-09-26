sap.ui.define([
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/Dialog",
	"sap/m/Popover"
], function (
	Button,
	Input,
	Dialog,
	Popover
) {
	"use strict";

	const button = new Button({
		text: "Open Dialog",
		press: function () {
			const oDialog = new Dialog({
				title: "Dialog with Web Components",
				contentWidth: "600px",
				contentHeight: "400px",
				afterOpen: function () {
					const scrollContDomRef = this.getDomRef("scrollCont");
					scrollContDomRef.insertAdjacentHTML("beforeend",
`
<div id="webcomponentId">
<div>
`);

					const webComponent = scrollContDomRef.querySelector("#webcomponentId");
					const shadowRoot = webComponent.attachShadow({ mode: 'open' });

					// create elements
					const text = document.createTextNode("The following elements are in the shadow DOM:");
					const br1 = document.createElement("br");

					const input = document.createElement("input");
					const br2 = document.createElement("br");

					const button = document.createElement("button");
					button.textContent = "Shadow Dom Button";

					const popover = new Popover({
						title: "Web Component",
						content: new Input({
							placeholder: "You clicked the button inside shadow DOM!"
						}),
						endButton: new Button({
							text: "Close",
							press: function () {
								popover.close();
							}
						})
					});

					// add event listener
					button.addEventListener("click", () => {
						popover.openBy(button);
					});

					const br3 = document.createElement("br");
					const br4 = document.createElement("br");

					const nestedLabel = document.createTextNode("Nested Shadow DOM:");
					const br5 = document.createElement("br");

					const nestedDiv = document.createElement("div");
					nestedDiv.id = "nestedShadowDom";

					// append all into shadow root
					shadowRoot.append(
						text,
						br1,
						input,
						br2,
						button,
						br3,
						br4,
						nestedLabel,
						br5,
						nestedDiv
					);

					const nestedShadowRoot = nestedDiv.attachShadow({ mode: 'open' });

					// create elements manually
					const br6 = document.createElement("br");
					const input1 = document.createElement("input");
					const br7 = document.createElement("br");
					const button1 = document.createElement("button");
					button1.textContent = "Nested Shadow Dom Button";

					const popover1 = new Popover({
						title: "Nested Web Component",
						content: new Input({
							placeholder: "You clicked the button inside nested shadow DOM!"
						}),
						endButton: new Button({
							text: "Close",
							press: function () {
								popover1.close();
							}
						})
					});

					// add click handler directly
					button1.addEventListener("click", () => {
						popover1.openBy(button1);
					});

					// append them into the shadow root
					nestedShadowRoot.append(br6, input1, br7, button1);
				},
				content: [
					new Input()
				],
				beginButton: new Button({
					text: "OK",
					press: function () {
						oDialog.close();
					}
				}),
				endButton: new Button({
					text: "Cancel",
					press: function () {
						oDialog.close();
					}
				}),
				afterClose: function() {
					oDialog.destroy();
				}
			});
			oDialog.open();
		}
	});

	button.placeAt("content");
});
