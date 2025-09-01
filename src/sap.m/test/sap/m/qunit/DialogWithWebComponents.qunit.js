/*global QUnit */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/Dialog"
], function(
	qutils,
	createAndAppendDiv,
	nextUIUpdate,
	Button,
	Input,
	Dialog
) {
	"use strict";

	createAndAppendDiv("content");

	QUnit.module("Dialog with Web Components", {
		beforeEach: function () {
			this.oDialog = new Dialog({
				title: "Dialog with Web Components",
				content: [
					new Input()
				]
			});
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oDialog.destroy();
			this.oDialog = null;
		}
	});

	QUnit.test("Focusing", function (assert) {
		const done = assert.async();

		this.oDialog.attachAfterOpen(() => {
			assert.ok(this.oDialog.isOpen(), "Dialog is open");

			const scrollContDomRef = this.oDialog.getDomRef("scrollCont");
			scrollContDomRef.insertAdjacentHTML("beforeend",
`<div id="webcomponentId">
<div>
`);
			const oWebComponent = scrollContDomRef.querySelector("#webcomponentId");
			const oShadowRoot = oWebComponent.attachShadow({ mode: 'open' });
			oShadowRoot.innerHTML = `
The following elements are in the shadow DOM:
<br />
<input id="inputInShadowRootId">
<br />
<button>Shadow Dom Button</button>`;

			const oInput = this.oDialog.getContent()[0];
			assert.strictEqual(oInput.getFocusDomRef(), document.activeElement, "Input is focused");

			const oInputInShadowRoot = oWebComponent.shadowRoot.querySelector("#inputInShadowRootId");

			qutils.triggerKeydown(oInputInShadowRoot, "ENTER");
			oInputInShadowRoot.focus();

			setTimeout(() => {
				assert.strictEqual(oInputInShadowRoot, document.activeElement.shadowRoot?.activeElement, "Inner input is focused");

				done();
			}, 500);
		});

		this.oDialog.open();
	});
});
