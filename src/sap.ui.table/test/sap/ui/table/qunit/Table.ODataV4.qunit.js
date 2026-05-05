/*global QUnit, sinon*/

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/model/odata/v4/ODataListBinding",
	"sap/ui/table/rowmodes/Fixed"
], function(
	TableQUnitUtils,
	ODataListBinding,
	FixedRowMode
) {
	"use strict";

	QUnit.module("Busy Indicator", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				...TableQUnitUtils.createSettingsForList(),
				threshold: 5,
				scrollThreshold: 10,
				enableBusyIndicator: true
			});
		},
		afterEach: function() {
			this.oTable?.destroy();
		}
	});

	QUnit.test("setBusy call", async function(assert) {
		const oTable = this.oTable;

		await oTable.qunit.whenRenderingFinished();
		await TableQUnitUtils.wait(10); // Wait for the busy state to be set to false

		const oSetBusySpy = sinon.spy(oTable, "setBusy");
		const oScrollExtension = oTable._getScrollExtension();
		const oDataRequestedSpy = sinon.spy(oTable.getBinding(), "fireDataRequested");

		assert.equal(oTable.getBusy(), false, "Table is not busy");

		oScrollExtension.scrollVertically(true, true);
		await TableQUnitUtils.nextEvent("dataRequested", oTable.getBinding());

		/* Table#setBusy will be called to ensure that it reacts to dynamic
		 * changes in case of multiple requests. In this case, it is called
		 * with false which does not impact the busy state of the table.
		 * Nevertheless, we need to wait for 10 ms because removing the
		 * busy state is done asynchronously to prevent flickering.
		 */
		await TableQUnitUtils.wait(10);

		assert.ok(oDataRequestedSpy.calledOnce, "DataRequested event fired");
		assert.ok(oSetBusySpy.called, "setBusy is called");
		assert.ok(oSetBusySpy.calledWith(false), "setBusy called with false");
		assert.notOk(oSetBusySpy.calledWith(true), "setBusy not called with true");

		oSetBusySpy.restore();
		oDataRequestedSpy.restore();
	});

	QUnit.module("Hidden table with suspended binding", {
		beforeEach: function() {
			this.fnBindingGetContextSpy = sinon.spy(ODataListBinding.prototype, "getContexts");
			this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForList({
				tableSettings: {
					rows: {suspended: true},
					visible: false
				}
			}));
		},
		afterEach: function() {
			this.oTable?.destroy();
			this.fnBindingGetContextSpy.restore();
		}
	});

	QUnit.test("Initialization", async function(assert) {
		await TableQUnitUtils.wait(100);
		assert.ok(this.fnBindingGetContextSpy.notCalled, "Binding#getContexts not called");
	});

	QUnit.test("Change visibility and suspension state", async function(assert) {
		this.fnBindingGetContextSpy.resetHistory();
		this.oTable.setVisible(true);
		this.oTable.getBinding().resume();
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(this.fnBindingGetContextSpy.called, "Show table and resume binding: Binding#getContexts called");

		this.fnBindingGetContextSpy.resetHistory();
		this.oTable.setVisible(false);
		this.oTable.getBinding().suspend();
		await TableQUnitUtils.wait(100);
		assert.ok(this.fnBindingGetContextSpy.notCalled, "Hide table and suspend binding: Binding#getContexts not called");
	});

	QUnit.module("Scroll to index", {
		afterEach: function() {
			this.oTable?.destroy();
		}
	});

    QUnit.test("scroll without binding and scroll after resume binding", async function(assert) {
        this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForList({
            tableSettings: {
                rowMode: new FixedRowMode({rowCount: 5}),
                rows: {suspended: true},
                visible: false
            }
        }));

        assert.ok(this.oTable.getBinding().getLength() === 0, "Binding length is 0");

        let bResolved = false;
        this.oTable._scrollToIndex(7).then(function() {
            bResolved = true;
        });

        await TableQUnitUtils.wait(100);

        this.oTable.setVisible(true);
        this.oTable.getBinding().resume();

		assert.ok(!bResolved, "Promise still pending");
        await this.oTable.qunit.whenBindingChange();
        await this.oTable.qunit.whenRenderingFinished();

        assert.ok(this.oTable.getBinding().getLength() > 0, "Binding length > 0");
		assert.ok(bResolved, "Promise resolved");
		assert.strictEqual(this.oTable.getFirstVisibleRow(), 7, "firstVisibleRow is 7 after promise resolved");
    });
});