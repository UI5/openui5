/* global QUnit */
sap.ui.define([
	"sap/ui/util/_URL"
], function(_URL) {
	"use strict";

	QUnit.module("isAbsolute");

	[
		{
			caption: "A full URL is absolute",
			url: window.location.href,
			expected: true
		},
		{
			caption: "A protocol-only URL is absolute",
			url: "///localhost/index.html",
			expected: true
		},
		{
			caption: "A server-absolute URL is not absolute",
			url: "/path",
			expected: false
		},
		{
			caption: "A relative URL w/o leading dot is not absolute",
			url: "path",
			expected: false
		},
		{
			caption: "A relative URL is not absolute",
			url: "./path",
			expected: false
		},
		{
			caption: "A relative URL is not absolute",
			url: "../path",
			expected: false
		}
	].forEach(({caption, url, expected}) => {
		QUnit.test(caption, function(assert) {
			const testURL = new _URL(url);

			// Act
			const isAbsolute = testURL.isAbsolute();

			// Assert
			assert.strictEqual(isAbsolute, expected,
				"isAbsolute should return the expected value");
		});
	});


	QUnit.module("relativeTo");

	[
		{
			caption: "Base is prefix of url, name only",
			base: "http://example.org/sap/opu/odata/service01/",
			url: "http://example.org/sap/opu/odata/service01/my-annotation.xml",
			expected: "my-annotation.xml"
		},
		{
			caption: "Base is prefix of url, folder + name",
			base: "http://example.org/sap/opu/odata/service01/",
			url: "http://example.org/sap/opu/odata/service01/annotations/my-annotation.xml",
			expected: "annotations/my-annotation.xml"
		},
		{
			caption: "Base is prefix of url, folder only",
			base: "http://example.org/sap/opu/odata/service01/",
			url: "http://example.org/sap/opu/odata/service01/annotations/",
			expected: "annotations/"
		},
		{
			caption: "Base is prefix of url, 2 folders + name",
			base: "http://example.org/sap/opu/odata/service01/",
			url: "http://example.org/sap/opu/odata/service01/sub/annotations/my-annotation.xml",
			expected: "sub/annotations/my-annotation.xml"
		},
		{
			caption: "Base is prefix of url, 2 folders only",
			base: "http://example.org/sap/opu/odata/service01/",
			url: "http://example.org/sap/opu/odata/service01/sub/annotations/",
			expected: "sub/annotations/"
		},
		{
			caption: "Base is root path, url is file only",
			base: "http://example.org/",
			url: "http://example.org/index.html",
			expected: "index.html"
		},
		{
			caption: "Base is root path, url is folder + file",
			base: "http://example.org/",
			url: "http://example.org/folder/index.html",
			expected: "folder/index.html"
		},
		{
			caption: "Base is root path, url is folder only",
			base: "http://example.org/",
			url: "http://example.org/folder/",
			expected: "folder/"
		},
		{
			caption: "Base is root path, url is 2 folders + file",
			base: "http://example.org/",
			url: "http://example.org/sub/folder/index.html",
			expected: "sub/folder/index.html"
		},
		{
			caption: "Base is root path, url is 2 folders",
			base: "http://example.org/",
			url: "http://example.org/sub/folder/",
			expected: "sub/folder/"
		},
		{
			caption: "Input is root path + name",
			base: "http://example.org/my/base/index.html",
			url: "http://example.org/main.html",
			expected: "../../main.html"
		},
		{
			caption: "Input is root path",
			base: "http://example.org/my/base/index.html",
			url: "http://example.org/",
			expected: "../../"
		},
		{
			caption: "Input and base are same (name only)",
			base: "http://example.org/index.html",
			url: "http://example.org/index.html",
			expected: "index.html"
		},
		{
			caption: "Input and base are same (folder + name)",
			base: "http://example.org/folder/index.html",
			url: "http://example.org/folder/index.html",
			expected: "index.html"
		},
		{
			caption: "Input and base are same (folder only)",
			base: "http://example.org/folder/",
			url: "http://example.org/folder/",
			expected: "."
		},
		{
			caption: "Input and base have different origins but the relative path is the same (folder only)",
			base: "http://otherExample.org/folder/",
			url: "folder/",
			expected: `${document.baseURI}folder/`
		}
	].forEach(({caption, base, url, expected}) => {
		QUnit.test(caption, function(assert) {
			const baseURL = new _URL(base);
			const testURL = new _URL(url);

			// Act
			const relativeHref = testURL.relativeTo(baseURL);

			// Assert
			assert.equal(relativeHref, expected,
				"calculated relative href should match the expected href");
			assert.equal(new URL(relativeHref, base).href, testURL.isAbsolute() ? url : expected,
				"resolving the relative href to the base should produce the original URL");
		});
	});
});
