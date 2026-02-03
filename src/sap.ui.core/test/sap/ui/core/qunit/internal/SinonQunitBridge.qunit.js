/*!
 * ${copyright}
 */

sap.ui.define(function () {
	"use strict";
	/*global QUnit, sinon */

	// test object which is mocked in each test to ensure that verifyAndRestore must run
	const foo = {
		bar : function () {},
		baz : function () {}
	};

	function afterEach() {
		sinon.assert.pass("pass");
	}

	function beforeEach() {
		this.mock(foo).expects("bar").withExactArgs("baz").returns(42);
	}

	var oHooks = {
		beforeEach : beforeEach,
		afterEach : afterEach
	};

	function useMock(assert) {
		assert.strictEqual(foo.bar("baz"), 42, "use mock");
	}

	/**
	 * Helper to handle expected QUnit failures.
	 *
	 * Two tests check that the bridge does not stifle errors in the afterEach phase.
	 * They throw an error or reject a promise and expect that QUnit reports this as a test failure.
	 * Normally, this would be a use case for `QUnit.todo` (as `todo` expects at least one error),
	 * but our infrastructure handles `todo` like failures.
	 *
	 * Therefore, the error reporting of QUnit (`pushFailure`) is intercepted and if the expected
	 * error occurs, it is converted into a successful assertion.
	 *
	 * As a safeguard, if no failure is reported, another error is reported.
	 */
	function expectOneFailure(rExpectedMessage) {
		const current = QUnit.config.current;
		current.pushFailure.restore?.();
		const pushFailure = current.pushFailure;
		current.pushFailure = function(message) {
			// restore original
			current.pushFailure.restore();

			// convert only the expected error to a successful assertion
			if (rExpectedMessage.test(message)) {
				const oResult = {
					result: true,
					message,
					actual: message,
					expected: rExpectedMessage.source
				};
				if ( typeof this.pushResult === "function" ) {
					return this.pushResult(oResult);
				} else {
					// fallback for QUnit < 1.22.0
					return this.push(
						oResult.result,
						oResult.actual,
						oResult.expected,
						oResult.message
					);
				}
			}

			// other failures are reported as such
			return pushFailure.apply(this, arguments);
		};
		current.pushFailure.restore = function() {
			current.pushFailure = pushFailure;
			return true;
		};
	}

	// QUnit.module("nested 1", function () {});
	// QUnit.module("nested 2", {}, function () {});

	QUnit.module("no module object");

	QUnit.test("test", function (assert) {
		this.mock(foo).expects("bar").withExactArgs("baz").returns(42);

		useMock(assert);

		this.spy(foo, "baz");
		foo.baz("qux");
		sinon.assert.calledWithExactly(foo.baz, "qux");
	});

	QUnit.module("empty module object", {});

	QUnit.test("test", function (assert) {
		this.mock(foo).expects("bar").withExactArgs("baz").returns(42);

		useMock(assert);

		this.stub(foo, "baz");
		foo.baz("qux");
		sinon.assert.calledWithExactly(foo.baz, "qux");
	});

	QUnit.module("beforeEach/afterEach", oHooks);

	QUnit.test("test", useMock);

	QUnit.module("afterEach throws error", {
		beforeEach : function () {
			this.mock(foo).expects("bar").withExactArgs("baz").returns(42);
			expectOneFailure(/afterEach failed on test: afterEach failed intentionally/);
		},
		afterEach : function () {
			throw new Error("afterEach failed intentionally");
		},
		after(context) {
			// safeguard: fail if no failure was reported
			if (QUnit.config.current.pushFailure.restore?.()) {
				context.test.assert.ok(false, "no failure reported");
			}
		}
	});

	// This test MUST report the failure 'afterEach failed on test: afterEach failed intentionally'
	QUnit.test("test", useMock);

	QUnit.module("afterEach returns Promise", {
		beforeEach : function () {
			this.mock(foo).expects("bar").withExactArgs("baz").returns(42);
		},
		afterEach : function () {
			return new Promise(function (resolve) {
				setTimeout(function () {
					sinon.assert.pass("pass in Promise");
					resolve();
				}, 0);
			});
		}
	});

	QUnit.test("test", useMock);

	QUnit.module("afterEach Promise fails", {
		beforeEach : function () {
			this.mock(foo).expects("bar").withExactArgs("baz").returns(42);
			expectOneFailure(/Promise rejected after "?test"?: afterEach Promise rejected intentionally/);
		},
		afterEach : function () {
			return new Promise(function (resolve, reject) {
				setTimeout(function () {
					reject(new Error("afterEach Promise rejected intentionally"));
				}, 0);
			});
		},
		after(context) {
			// safeguard: fail if no failure was reported
			if (QUnit.config.current.pushFailure.restore?.()) {
				context.test.assert.ok(false, "no failure reported");
			}
		}
	});

	// This test MUST report the failure 'Promise rejected after "test": afterEach Promise rejected
	// intentionally'
	QUnit.test("test", useMock);

	QUnit.module("beforeEach/afterEach again", oHooks);

	QUnit.test("test1", useMock);

	QUnit.test("test2", useMock);
});