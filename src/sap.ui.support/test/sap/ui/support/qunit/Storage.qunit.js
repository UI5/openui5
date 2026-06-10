/*global QUnit*/
sap.ui.define(['sap/ui/support/supportRules/Storage'],
	function(Storage) {
		'use strict';

	var createValidRule = function (id) {
		return {
			id: id,
			check: function () { },
			title: 'title',
			description: 'desc',
			resolution: 'res',
			audiences: ['Control'],
			categories: ['Performance']
		};
	};

	QUnit.module('Storage API test', {
		beforeEach: function () {
			this.storage = Storage;
		},
		afterEach: function () {
			Storage.removeAllData();
		}
	});

	QUnit.test('Get & Set selected rules in Storage', function(assert) {

		var selectedRules = this.storage.getSelectedRules();

		localStorage.removeItem('support-assistant-selected-rules');

		selectedRules = this.storage.getSelectedRules();

		assert.equal(selectedRules, null, 'Retrieved selected rules successfully from Storage !');

		this.storage.setSelectedRules([createValidRule('test')]);
		selectedRules = this.storage.getSelectedRules();

		assert.ok(selectedRules instanceof Array, 'Retrieved data is of type Array !');

		assert.ok(selectedRules[0] instanceof Object, 'Rule is of type Object!');

		assert.equal(selectedRules[0].id, 'test', 'Selected rule has been retrieved successfully !');
	});

	QUnit.test('Persistance cookie functionality', function(assert) {
		this.storage.deletePersistenceCookie('persistance-cookie-test');
		var cookie = this.storage.readPersistenceCookie('persistance-cookie-test');

		assert.equal(cookie, '', 'Persistance cookie has been removed successfully !');

		this.storage.createPersistenceCookie('persistance-cookie-test', true);

		cookie = this.storage.readPersistenceCookie('persistance-cookie-test');

		assert.ok(cookie, 'Persistance cookie has been created & read successfully !');

		this.storage.deletePersistenceCookie('persistance-cookie-test');
	});
});