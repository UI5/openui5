/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe("sap.m.Switch", function() {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Switch';

	it('should load test page',function(){
		expect(takeScreenshot(element(by.id('switch_page')))).toLookAs('initial');
	});

	// verify regular switch
	it('should click on regular switch', function() {
		expect(takeScreenshot(element(by.id('switch_regular')))).toLookAs('switch_regular_before_click');
		element(by.id('switch_regular')).click();
		expect(takeScreenshot(element(by.id('switch_regular')))).toLookAs('switch_regular_after_click');
	});

	// verify disabled switch
	it('should click on disabled switch', function() {
		expect(takeScreenshot(element(by.id('switch_disabled')))).toLookAs('switch_disabled_before_click');
		element(by.id('switch_disabled')).click();
		expect(takeScreenshot(element(by.id('switch_disabled')))).toLookAs('switch_disabled_before_click');
	});

	// verify read-only switch
	it('should click on read-only switch', function() {
		expect(takeScreenshot(element(by.id('switch_readonly')))).toLookAs('switch_readonly_off');
		element(by.id('switch_readonly')).click();
		expect(takeScreenshot(element(by.id('switch_readonly')))).toLookAs('switch_readonly_off');
	});

	// verify read-only switch in On state
	it('should click on read-only switch (on state)', function() {
		expect(takeScreenshot(element(by.id('switch_readonly_on')))).toLookAs('switch_readonly_on');
		element(by.id('switch_readonly_on')).click();
		expect(takeScreenshot(element(by.id('switch_readonly_on')))).toLookAs('switch_readonly_on');
	});

	// verify read-only semantic switch
	it('should click on read-only semantic switch', function() {
		expect(takeScreenshot(element(by.id('switch_readonly_semantic')))).toLookAs('switch_readonly_semantic_off');
		element(by.id('switch_readonly_semantic')).click();
		expect(takeScreenshot(element(by.id('switch_readonly_semantic')))).toLookAs('switch_readonly_semantic_off');
	});

	// verify read-only semantic switch in On state
	it('should click on read-only semantic switch (on state)', function() {
		expect(takeScreenshot(element(by.id('switch_readonly_semantic_on')))).toLookAs('switch_readonly_semantic_on');
		element(by.id('switch_readonly_semantic_on')).click();
		expect(takeScreenshot(element(by.id('switch_readonly_semantic_on')))).toLookAs('switch_readonly_semantic_on');
	});

	// verify switch with no text
	it('should click on no-text switch', function() {
		expect(takeScreenshot(element(by.id('switch_notext')))).toLookAs('switch_notext_before_click');
		element(by.id('switch_notext')).click();
		expect(takeScreenshot(element(by.id('switch_notext')))).toLookAs('switch_notext_after_click');
	});

	// verify semantic switch
	it('should click on semantic switch', function() {
		expect(takeScreenshot(element(by.id('switch_semantic')))).toLookAs('switch_semantic_before_click');
		element(by.id('switch_semantic')).click();
		expect(takeScreenshot(element(by.id('switch_semantic')))).toLookAs('switch_semantic_after_click');
	});

	// verify switch in "bare" vBox
	it('should click on bare_vbox switch', function() {
		expect(takeScreenshot(element(by.id('switch_vbox')))).toLookAs('switch_bare_vbox_before_click');
		element(by.id('switch_vbox')).click();
		expect(takeScreenshot(element(by.id('switch_vbox')))).toLookAs('switch_bare_vbox_after_click');
	});
});
