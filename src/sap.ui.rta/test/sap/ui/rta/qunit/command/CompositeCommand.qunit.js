/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/CompositeCommand",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], (
	Log,
	Control,
	FlexObjectFactory,
	ChangesWriteAPI,
	CommandFactory,
	CompositeCommand,
	sinon,
	RtaQunitUtils
) => {
	"use strict";
	const sandbox = sinon.createSandbox();

	QUnit.module("CompositeCommand with multiple remove commands", {
		async beforeEach() {
			this.oAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			this.oControl1 = new Control("controlId1");
			this.oControl2 = new Control("controlId2");
			sandbox.stub(ChangesWriteAPI, "create").callsFake((mPropertyBag) => {
				return Promise.resolve(FlexObjectFactory.createUIChange(mPropertyBag.changeSpecificData));
			});
			this.oRemoveCommand1 = await CommandFactory.getCommandFor(this.oControl1, "Remove", {
				removedElement: this.oControl1
			}, { getAction: () => { return { changeType: "remove" }; } }, "");
			this.oRemoveCommand2 = await CommandFactory.getCommandFor(this.oControl2, "Remove", {
				removedElement: this.oControl2
			}, { getAction: () => { return { changeType: "remove" }; } }, "");
			this.oCompositeCommand = new CompositeCommand();
		},
		afterEach() {
			this.oAppComponent._restoreGetAppComponentStub();
			this.oAppComponent.destroy();
			this.oControl1.destroy();
			this.oControl2.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("all FlexCommands should be executed and undone without error", async function(assert) {
			const oExecuteStub1 = sandbox.stub(this.oRemoveCommand1, "execute").resolves();
			const oExecuteStub2 = sandbox.stub(this.oRemoveCommand2, "execute").resolves();
			const oUndoStub1 = sandbox.stub(this.oRemoveCommand1, "undo").resolves();
			const oUndoStub2 = sandbox.stub(this.oRemoveCommand2, "undo").resolves();

			this.oCompositeCommand.addCommand(this.oRemoveCommand1);
			this.oCompositeCommand.insertCommand(this.oRemoveCommand2, 1);

			const oRemoveCompositeCommand1 = this.oRemoveCommand1.getPreparedChange().getSupportInformation().compositeCommand;
			const oRemoveCompositeCommand2 = this.oRemoveCommand2.getPreparedChange().getSupportInformation().compositeCommand;
			assert.strictEqual(oRemoveCompositeCommand1, oRemoveCompositeCommand2);
			assert.ok(oRemoveCompositeCommand1.includes("composite"), "Composite command should include 'composite'");

			await this.oCompositeCommand.execute();
			assert.ok(oExecuteStub1.calledOnce, "Remove command 1 should be executed");
			assert.ok(oExecuteStub2.calledOnce, "Remove command 2 should be executed");
			assert.ok(oExecuteStub1.calledBefore(oExecuteStub2), "Remove command 1 should be executed before Remove command 2");

			await this.oCompositeCommand.undo();
			assert.ok(oUndoStub1.calledOnce, "Remove command 1 should be undone");
			assert.ok(oUndoStub2.calledOnce, "Remove command 2 should be undone");
			assert.ok(oUndoStub2.calledBefore(oUndoStub1), "Remove command 2 should be undone before Remove command 1");
		});

		QUnit.test("with a FlexCommands not successfully executed", async function(assert) {
			assert.expect(6);
			sandbox.stub(Log, "error");
			sandbox.stub(this.oRemoveCommand1, "execute").resolves();
			sandbox.stub(this.oRemoveCommand2, "execute").rejects(new Error("Command could not be executed"));
			const oUndoStub1 = sandbox.stub(this.oRemoveCommand1, "undo").resolves();
			const oUndoStub2 = sandbox.stub(this.oRemoveCommand2, "undo").resolves();

			this.oCompositeCommand.addCommand(this.oRemoveCommand1);
			this.oCompositeCommand.insertCommand(this.oRemoveCommand2, 1);

			try {
				await this.oCompositeCommand.execute();
			} catch (oError) {
				assert.ok(oError instanceof Error, "an error is thrown");
				assert.strictEqual(Log.error.callCount, 1, "Log.error should be called once");
			}
			assert.ok(oUndoStub1.calledOnce, "Remove command 1 should be undone");
			assert.ok(oUndoStub2.calledOnce, "Remove command 2 should be undone");
			assert.ok(oUndoStub2.calledBefore(oUndoStub1), "Remove command 2 should be undone before Remove command 1");
			assert.strictEqual(this.oCompositeCommand.getCommands().length, 0, "no commands remaining");
		});

		QUnit.test("with a Command not providing a change but setCompositeId function", async function(assert) {
			const oAddLibraryCommand = await CommandFactory.getCommandFor(this.oControl1, "AddLibrary", {
				parameters: { libraries: {} }
			}, {}, "");
			this.oCompositeCommand.addCommand(oAddLibraryCommand);

			const oAddLibraryCompositeCommand = oAddLibraryCommand._sCompositeId;
			assert.ok(oAddLibraryCompositeCommand, "Composite command ID is set");
			assert.ok(oAddLibraryCompositeCommand.includes("composite"), "Composite command should include 'composite'");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});