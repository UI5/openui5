/*global QUnit */
sap.ui.define(["sap/base/security/URLWhitelist"], function(URLWhitelist) {
	"use strict";

	// Assemble the "javascript:" scheme at runtime so the source contains no literal
	// javascript:-URL and does not trip the ESLint "no-script-url" rule.
	var SCHEME_JS = ["java", "script:"].join("");

	QUnit.module("sap/base/security/URLWhitelist.validate", {
		afterEach: URLWhitelist.clear
	});

	QUnit.test("valid url empty whitelist", function(assert) {
		var sUrl = "http://www.sap.com";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " is valid");
		sUrl = "www.sap.com";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " is valid");
	});

	QUnit.test("edge case parameters as url", function(assert) {
		assert.ok(URLWhitelist.validate(1231), "number is a valid URL");
		assert.ok(URLWhitelist.validate(null), "null is a valid URL");
		assert.ok(URLWhitelist.validate(undefined), "undefined is a valid URL");
		assert.ok(URLWhitelist.validate(""), "empty string is a valid URL");
		assert.ok(URLWhitelist.validate(false), "false is a valid URL");
		assert.ok(URLWhitelist.validate(), "no param is a valid URL");
		assert.ok(URLWhitelist.validate(":::"), "three colons is a valid URL");
		assert.ok(URLWhitelist.validate(/asd/), "regex is a valid URL");
	});

	QUnit.test("object as url", function(assert) {
		assert.notOk(URLWhitelist.validate({}), "object is not a valid URL");
	});

	QUnit.test("Unusual number of slashes in front of host", function(assert) {
		URLWhitelist.add("http", "sap.com");
		assert.notOk(URLWhitelist.validate("http:evil.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("http:/evil.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("http:\\evil.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("http:/\\evil.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("http:/\\/evil.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("http:/\\//evil.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("http:///evil.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("http:\\\\evil.com"), "URL is not valid");
	});

	QUnit.test("Whitespaces in URL with allow-list", function(assert) {
		URLWhitelist.add("http", "sap.com");

		// URL not in allow-list
		assert.notOk(URLWhitelist.validate("\rhttp://example.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("\nhttp://example.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("\thttp://example.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("\r\nhttp://example.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("\r\n\thttp://example.com"), "URL is not valid");

		assert.notOk(URLWhitelist.validate("ht\rtp://example.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("ht\ntp://example.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("ht\ttp://example.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("ht\r\ntp://example.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("ht\r\n\ttp://example.com"), "URL is not valid");

		assert.notOk(URLWhitelist.validate("http://exa\rmple.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("http://exa\nmple.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("http://exa\tmple.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("http://exa\r\nmple.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("http://exa\r\n\tmple.com"), "URL is not valid");

		assert.notOk(URLWhitelist.validate("http://example.com?some=ab\ncd"), "URL is not valid.");
		assert.notOk(URLWhitelist.validate("http://example.com?some=ab" + encodeURIComponent("\n") + "cd"), "URL is not valid.");

		// URL is in allow-list
		assert.notOk(URLWhitelist.validate("ht\rtp://sap.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("ht\ntp://sap.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("ht\ttp://sap.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("ht\r\ntp://sap.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("ht\r\n\ttp://sap.com"), "URL is not valid");

		assert.notOk(URLWhitelist.validate("http://sa\rp.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("http://sa\np.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("http://sa\tp.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("http://sa\r\np.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("http://sa\r\n\tp.com"), "URL is not valid");

		assert.notOk(URLWhitelist.validate("http://sap.com?some=ab\ncd"), "URL is not valid.");
		assert.ok(URLWhitelist.validate("http://sap.com?some=ab" + encodeURIComponent("\n") + "cd"), "URL is valid because it is on the allow-list.");
	});

	QUnit.test("Whitespaces in URL without allow-list", function(assert) {
		assert.notOk(URLWhitelist.validate("ht\rtp://example.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("ht\ntp://example.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("ht\ttp://example.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("ht\r\ntp://example.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("ht\r\n\ttp://example.com"), "URL is not valid");

		assert.notOk(URLWhitelist.validate("http://exa\rmple.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("http://exa\nmple.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("http://exa\tmple.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("http://exa\r\nmple.com"), "URL is not valid");
		assert.notOk(URLWhitelist.validate("http://exa\r\n\tmple.com"), "URL is not valid");
	});

	QUnit.test("unknown protocol", function(assert) {
		var sUrl = "httpg://www.sap.com";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid (only http/https/ftp accepted with empty allowlist)");
	});

	QUnit.test("ipv6 address", function(assert) {
		// IPv6 addresses without protocol seem not to be valid
		var sUrl = "1:2:3:4:5:6:7:8";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");
		sUrl = "2001:db8:1234:0000:0000:0000:0000:0000";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");

		sUrl = "http://2001:db8:1234:0000:0000:0000:0000:0000";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " is valid");
	});

	QUnit.test("ipv4 address", function(assert) {
		// IPv6 addresses without protocol seem to be valid
		var sUrl = "192.168.0.1";
		assert.ok(URLWhitelist.validate(undefined), sUrl + " is valid");
		sUrl = "http://192.168.1.1";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " is valid");
	});

	QUnit.test("mailto links", function(assert) {
		//Mailtolinks seem not to be valid
		var sUrl = "mailto:a@b.de,x@y.de";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");

		sUrl = "mailto://a@b.de";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");

		sUrl = "MAILTO:max@mustermann.de?subject=test";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");
	});

	QUnit.test("invalid characters in path", function(assert) {
		var sUrl = "http://www.sap.com/test/test/te^%&st.html";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");
	});

	QUnit.test("protocol match with whitelist", function(assert) {
		var sUrl = "httpg://www.sap.com";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid (only http/https/ftp accepted with empty allowlist)");

		URLWhitelist.add("httpm");
		sUrl = "httpg://www.sap.com";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");
		sUrl = "HTTPG://www.sap.com";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");

		var sUrl2 = "httpm://www.sap.com";
		assert.ok(URLWhitelist.validate(sUrl2), sUrl2 + " valid");

		var sUrl3 = "HTTPM://www.sap.com";
		assert.ok(URLWhitelist.validate(sUrl3), sUrl3 + " valid");
	});

	QUnit.test("hostname match with whitelist", function(assert) {
		//is ok with empty whitelist
		var sUrl = "http://example.com";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		URLWhitelist.add("http", "sap.com");
		sUrl = "http://example.com";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");

		sUrl = "http:/example.com";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");

		var sUrl2 = "http://sap.com";
		assert.ok(URLWhitelist.validate(sUrl2), sUrl2 + " valid");

		sUrl2 = "http:/sap.com";
		assert.ok(URLWhitelist.validate(sUrl2), sUrl2 + " valid");
	});

	QUnit.test("userinfo in URL with whitelist", function(assert) {
		//is ok with empty whitelist
		var sUrl = "http://user:password@example.com";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		URLWhitelist.add("http", "sap.com");
		sUrl = "http://user:password@example.com";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");

		sUrl = "http://:password@example.com";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");

		sUrl = "http:/:@example.com";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");

		// Test that "@" in the path-component of the URL is not treated as userinfo
		sUrl = "http://example.com/path@sap.com";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");

		sUrl = "http://example.com?path@sap.com";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");

		sUrl = "http://example.com#path@sap.com";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");
	});

	QUnit.test("chained userinfo does not confuse the host with the whitelist", function(assert) {
		URLWhitelist.add("http", "allowed.example");

		// WHATWG binds userinfo at the LAST "@" in the authority, so a browser reads the host
		// of "http://x@allowed.example:@other.example/" as "other.example". The allowed host only
		// appears in the userinfo, so the URL must not match the "allowed.example" entry. A
		// single userinfo run stopping at the first "@" would read the host as "allowed.example"
		// (the ":" ends the host group) and wrongly accept the URL.
		var sUrl = "http://x@allowed.example:@other.example/";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid (host is other.example)");

		// A non-empty password before the second "@" behaves the same way.
		sUrl = "http://x@allowed.example:password@other.example/";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid (host is other.example)");

		// The protocol-relative form resolves under the page's http-family origin, so the same
		// last-"@" host rule applies.
		sUrl = "//x@allowed.example:@other.example/";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid (host is other.example)");

		// Contrast: a single "@" with a colon-separated decoy left of it was already rejected
		// (host is other.example), and stays rejected.
		sUrl = "http://allowed.example:password@other.example/";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid (host is other.example)");

		// Contrast: a chained "@" without a colon was already rejected, and stays rejected.
		sUrl = "http://x@allowed.example@other.example/";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid (host is other.example)");

		// A legitimate "user:pass@host" URL with a single "@" and the allowed host still validates.
		sUrl = "http://user:pass@allowed.example/";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " is valid (host is allowed.example)");
	});

	QUnit.test("relative path with whitelist", function(assert) {
		// Note: It is strongly advised that consumers do not use relative URLs.
		var sUrl = "/test";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		URLWhitelist.add("http", "sap.com", undefined, "/test");
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		var sUrl2 = "/test2";
		assert.notOk(URLWhitelist.validate(sUrl2), sUrl2 + " is not valid");
	});

	QUnit.test("backslash in authority is treated as slash before host matching", function(assert) {
		URLWhitelist.add("http", "allowed.example");

		// In special schemes the whatwg spec treats "\" like "/", so a browser reads
		// the host of "http://other.example\@allowed.example" as "other.example" and
		// "@allowed.example" as path. The validator resolves the host the same way, so
		// the URL does not match the "allowed.example" entry.
		var sUrl = "http://other.example\\@allowed.example";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid (host is other.example)");

		sUrl = "http://other.example\\@allowed.example/path";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid (host is other.example)");

		// With the sides swapped, "\" becomes "/" so the host is "allowed.example" and
		// the URL matches the entry.
		sUrl = "http://allowed.example\\@other.example";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " is valid (host is allowed.example)");

		// A plain "@" is userinfo, so the host is "other.example" and the URL does not match.
		sUrl = "http://allowed.example@other.example";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid (host is other.example)");
	});

	QUnit.test("backslash normalization applies to non-lowercase special schemes", function(assert) {
		// WHATWG scheme comparison is case-insensitive and a browser lowercases the scheme,
		// so "HTTP:", "Http:", "HtTpS:", "FTP:", "WS:" are all special schemes and the same
		// backslash-in-authority normalization must apply. rSpecialSchemeURLs is matched
		// case-insensitively so the "\" is treated as "/" and the host is read the same way
		// a browser reads it, regardless of scheme case.
		URLWhitelist.add("http", "allowed.example");

		var sUrl = "HTTP://other.example\\@allowed.example";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid (host is other.example)");

		sUrl = "Http://other.example\\@allowed.example";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid (host is other.example)");

		// The legitimate control case still passes: with the allowed host left of the "\",
		// the host is "allowed.example" and the URL matches the entry.
		sUrl = "HTTP://allowed.example\\@other.example";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " is valid (host is allowed.example)");

		// A falsy-protocol entry accepts the default special schemes; the normalization must
		// still apply so the host is read after the "\".
		URLWhitelist.clear();
		URLWhitelist.add(undefined, "allowed.example");

		sUrl = "HtTpS://other.example\\@allowed.example";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid (host is other.example)");

		sUrl = "FTP://other.example\\@allowed.example";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid (host is other.example)");

		// The "ws"/"wss" schemes are special too.
		URLWhitelist.clear();
		URLWhitelist.add("ws", "allowed.example");

		sUrl = "WS://other.example\\@allowed.example";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid (host is other.example)");
	});

	QUnit.test("backslash normalization applies to the file scheme", function(assert) {
		// "file" is a WHATWG special scheme, so a browser treats "\" like "/" in the authority.
		// new URL("file:\\other.example\\@allowed.example").host === "other.example" and
		// "@allowed.example" becomes part of the path. Without normalizing the "\", rBasicUrl
		// would read "other.example\@" as userinfo and "allowed.example" as the host, so a
		// "file"/"allowed.example" entry would wrongly match. The validator must resolve the
		// host the same way a browser does.
		URLWhitelist.add("file", "allowed.example");

		var sUrl = "file:\\\\other.example\\\\@allowed.example";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid (host is other.example)");

		sUrl = "file:\\\\other.example\\\\@allowed.example/path";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid (host is other.example)");

		// Scheme comparison is case-insensitive, so the normalization applies regardless of case.
		sUrl = "FILE:\\\\other.example\\\\@allowed.example";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid (host is other.example)");

		// With the sides swapped, "\" becomes "/" so the host is "allowed.example" and the URL matches.
		sUrl = "file:\\\\allowed.example\\\\@other.example";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " is valid (host is allowed.example)");

		// A genuine file URL for the allowed host still validates. Over-rejecting these would
		// break a consumer that legitimately whitelists a file host.
		assert.ok(URLWhitelist.validate("file://allowed.example"),
			"file://allowed.example is valid (host is allowed.example)");
		assert.ok(URLWhitelist.validate("file://allowed.example/path/to/file.txt"),
			"file://allowed.example/path/to/file.txt is valid (host is allowed.example)");

		// A file URL for a foreign host is rejected.
		assert.notOk(URLWhitelist.validate("file://other.example/path"),
			"file://other.example/path is not valid (host is other.example)");
	});

	QUnit.test("special schemes still accept legitimate URLs after file was added to the gate", function(assert) {
		// Adding "file" to the special-scheme gate must not change how the other special
		// schemes (http/https/ftp/ws/wss) are normalized and matched.
		URLWhitelist.add("http", "allowed.example");
		URLWhitelist.add("https", "allowed.example");
		URLWhitelist.add("ftp", "allowed.example");
		URLWhitelist.add("ws", "allowed.example");
		URLWhitelist.add("wss", "allowed.example");

		assert.ok(URLWhitelist.validate("http://allowed.example/path"), "http host matches");
		assert.ok(URLWhitelist.validate("https://allowed.example/path"), "https host matches");
		assert.ok(URLWhitelist.validate("ftp://allowed.example"), "ftp host matches");
		assert.ok(URLWhitelist.validate("ws://allowed.example"), "ws host matches");
		assert.ok(URLWhitelist.validate("wss://allowed.example"), "wss host matches");

		// The backslash-in-authority host resolution stays correct for the other special
		// schemes: the host is read after the "\", so these do not match the entry.
		assert.notOk(URLWhitelist.validate("http://other.example\\@allowed.example"),
			"http://other.example\\@allowed.example is not valid (host is other.example)");
		assert.notOk(URLWhitelist.validate("ftp://other.example\\@allowed.example"),
			"ftp://other.example\\@allowed.example is not valid (host is other.example)");
		assert.notOk(URLWhitelist.validate("wss://other.example\\@allowed.example"),
			"wss://other.example\\@allowed.example is not valid (host is other.example)");
	});

	QUnit.test("protocol-relative authority is not treated as a relative path", function(assert) {
		URLWhitelist.add("http", "allowed.example");

		// An input starting with "//" is an authority, never a relative path. When the
		// authority defeats rBasicUrl's host sub-pattern (e.g. a colon-led userinfo with
		// several "@"), the host group is empty. A browser still resolves a foreign host
		// (here new URL(...).hostname === "0.0.0.1"), so the URL must not match the entry
		// via the relative-path branch.
		assert.notOk(URLWhitelist.validate("//:a@:a@b@@1"),
			"a // authority whose host rBasicUrl cannot parse is rejected, not treated as relative");
		assert.notOk(URLWhitelist.validate("//:80"),
			"a // authority with an empty host is rejected, not treated as relative");

		// A clean protocol-relative URL parses a host, so it is matched against the entry
		// as usual: the matching host passes, a foreign host is rejected.
		assert.ok(URLWhitelist.validate("//allowed.example"),
			"a // authority resolving to the allowed host is valid");
		assert.notOk(URLWhitelist.validate("//evil.example"),
			"a // authority resolving to a foreign host is not valid");

		// Genuine relative paths (single leading slash, no authority marker) stay valid.
		assert.ok(URLWhitelist.validate("/news"), "/news is a relative path and valid");
		assert.ok(URLWhitelist.validate("/test"), "/test is a relative path and valid");
	});

	QUnit.test("backslash in a schemeless authority is treated as slash before host matching", function(assert) {
		URLWhitelist.add("http", "allowed.example");

		// A schemeless input starting with an authority marker resolves against the page's
		// special-scheme origin, so the whatwg spec treats "\" as "/" just as it does for an
		// explicit special scheme. A browser reads the host of "//other.example\@allowed.example"
		// as "other.example" (the "\" becomes a "/", ending the authority) and of
		// "///another.example\@allowed.example" as "another.example". The validator resolves the
		// host the same way, so neither matches "allowed.example".
		assert.notOk(URLWhitelist.validate("//other.example\\@allowed.example"),
			"//other.example\\@allowed.example is not valid (host is other.example)");
		assert.notOk(URLWhitelist.validate("///another.example\\@allowed.example"),
			"///another.example\\@allowed.example is not valid (host is another.example)");

		// A leading "/\" is also an authority marker; the "\" becomes a "/" so the host is the
		// segment after it, which is foreign here.
		assert.notOk(URLWhitelist.validate("/\\other.example"),
			"/\\other.example is not valid (host is other.example)");

		// With the allowed host left of the "\", the host is "allowed.example" and the
		// URL matches the entry.
		assert.ok(URLWhitelist.validate("//allowed.example\\@other.example"),
			"//allowed.example\\@other.example is valid (host is allowed.example)");
	});

	QUnit.test("protocol-relative authority does not match a scheme-only entry for a foreign host", function(assert) {
		// A scheme-only entry allows a non-http scheme on any host. A protocol-relative
		// URL ("//host", "/\\host", "\\\\host") is not that scheme: a browser resolves it
		// under the page's special (http-family) origin to a foreign host, e.g.
		// new URL("/\\other.example\\x", "http://allowed.example/").host === "other.example".
		// Such a URL must not match the scheme-only entry through the relative-URL leniency.
		URLWhitelist.add("http", "*.trusted.com");
		URLWhitelist.add("javascript", "");

		assert.notOk(URLWhitelist.validate("//other.example/x"),
			"// authority to a foreign host does not match the javascript scheme-only entry");
		assert.notOk(URLWhitelist.validate("/\\other.example\\x"),
			"/\\ authority to a foreign host does not match the javascript scheme-only entry");
		assert.notOk(URLWhitelist.validate("\\\\other.example\\x"),
			"\\\\ authority to a foreign host does not match the javascript scheme-only entry");

		// A protocol-relative URL to a trusted host still matches the http entry.
		assert.ok(URLWhitelist.validate("//sub.trusted.com/x"),
			"// authority to a trusted host matches the http entry");
		// The scheme-only entry still matches a URL that uses its scheme.
		assert.ok(URLWhitelist.validate(SCHEME_JS + "alert(1)"),
			"a URL using the javascript scheme still matches the scheme-only entry");
		// A genuine relative path (single leading slash, no authority) stays valid.
		assert.ok(URLWhitelist.validate("/news"),
			"a relative path stays valid");
	});

	QUnit.test("protocol-relative authority does not match an exact-host entry with a non-http protocol", function(assert) {
		// The entry allows a mailto: URL for a specific host. A protocol-relative URL that
		// resolves to that same host is an http-family URL, not mailto, so it must not match.
		URLWhitelist.add("mailto", "other.example");

		assert.notOk(URLWhitelist.validate("//other.example/x"),
			"// authority to other.example does not match the mailto entry for other.example");
		assert.notOk(URLWhitelist.validate("/\\other.example\\x"),
			"/\\ authority to other.example does not match the mailto entry for other.example");
	});

	QUnit.test("empty-host entry accepting http still allows a protocol-relative URL", function(assert) {
		// An entry that allows any http host must keep accepting a protocol-relative URL,
		// which resolves under the http-family scheme. This is the accepted counterpart to
		// the scheme-only (non-http) rejection above.
		URLWhitelist.add("http", "");

		assert.ok(URLWhitelist.validate("//any.example/x"),
			"// authority matches the http any-host entry");
		assert.ok(URLWhitelist.validate("http://any.example/x"),
			"schemed http URL matches the http any-host entry");
	});

	QUnit.test("schemed URL without host does not match a host entry", function(assert) {
		URLWhitelist.add(undefined, "example.com");
		assert.notOk(URLWhitelist.validate(SCHEME_JS + "body"),
			"a schemed URL without a host does not match a host entry");
		assert.notOk(URLWhitelist.validate(SCHEME_JS.toUpperCase() + "body"),
			"scheme matching is case-insensitive");
	});

	QUnit.test("data: URL does not match a host entry", function(assert) {
		URLWhitelist.add(undefined, "example.com");
		assert.notOk(URLWhitelist.validate("data:text/plain,body"),
			"a data: URL has no host and does not match a host entry");
	});

	QUnit.test("vbscript: URL does not match a host entry", function(assert) {
		URLWhitelist.add(undefined, "example.com");
		assert.notOk(URLWhitelist.validate("vbscript:body"),
			"a vbscript: URL has no host and does not match a host entry");
	});

	QUnit.test("legitimate URLs still pass with falsy-protocol host entry", function(assert) {
		URLWhitelist.add(undefined, "example.com");
		assert.ok(URLWhitelist.validate("http://example.com"), "http://example.com valid");
		assert.ok(URLWhitelist.validate("https://example.com/path"), "https://example.com/path valid");
		assert.ok(URLWhitelist.validate("ftp://example.com"), "ftp://example.com valid");
	});

	QUnit.test("relative path matches an entry that has a host, schemed hostless URL does not", function(assert) {
		URLWhitelist.add("http", "sap.com", undefined, "/test");
		assert.ok(URLWhitelist.validate("/test"),
			"a schemeless path-only URL is host-agnostic and matches");
		assert.notOk(URLWhitelist.validate(SCHEME_JS + "body"),
			"a schemed URL without a host does not match an entry that requires a host");
	});

	QUnit.test("scheme with //host does not match a falsy-protocol host entry", function(assert) {
		URLWhitelist.add(undefined, "trusted.com");
		assert.notOk(URLWhitelist.validate(SCHEME_JS + "//trusted.com/path"),
			"a javascript: scheme with //host does not match a falsy-protocol host entry");
		assert.notOk(URLWhitelist.validate("data://trusted.com/foo"),
			"data://host does not match a falsy-protocol host entry");
		assert.notOk(URLWhitelist.validate("vbscript://trusted.com/foo"),
			"vbscript://host does not match a falsy-protocol host entry");
		assert.notOk(URLWhitelist.validate("blob://trusted.com/foo"),
			"blob://host does not match a falsy-protocol host entry");
		assert.notOk(URLWhitelist.validate("file://trusted.com/foo"),
			"file://host does not match a falsy-protocol host entry");
	});

	QUnit.test("scheme with //host does not match a falsy-protocol wildcard host entry", function(assert) {
		URLWhitelist.add(undefined, "*.example.com");
		assert.notOk(URLWhitelist.validate(SCHEME_JS + "//sub.example.com/path"),
			"a non-default scheme does not match a falsy-protocol wildcard host entry");
	});

	QUnit.test("falsy-protocol entry restricts to default-safe schemes", function(assert) {
		URLWhitelist.add(undefined, "example.com");
		assert.ok(URLWhitelist.validate("http://example.com"), "http allowed");
		assert.ok(URLWhitelist.validate("https://example.com"), "https allowed");
		assert.ok(URLWhitelist.validate("ftp://example.com"), "ftp allowed");
		assert.notOk(URLWhitelist.validate("ssh://example.com"),
			"non-default scheme rejected via falsy-protocol entry");
		assert.notOk(URLWhitelist.validate("ws://example.com"),
			"ws rejected via falsy-protocol entry (must use explicit protocol)");
		assert.notOk(URLWhitelist.validate("mailto:a@example.com"),
			"mailto rejected via falsy-protocol entry, consistent with empty-allowlist behavior");
	});

	QUnit.test("falsy-protocol entry default-safe scheme set requires a full match on https?/ftp", function(assert) {
		URLWhitelist.add(undefined, "example.com");
		// Only http, https and ftp are accepted via a falsy-protocol entry, and the
		// regex requires a full match, so a prefix like "httpg" or "ftpz" is rejected.
		assert.notOk(URLWhitelist.validate("httpg://example.com"),
			"httpg rejected via falsy-protocol entry");
		assert.notOk(URLWhitelist.validate("ftpz://example.com"),
			"ftpz rejected via falsy-protocol entry");
	});

	QUnit.test("explicit-protocol entry only matches that scheme", function(assert) {
		URLWhitelist.add("ssh", "example.com");
		assert.ok(URLWhitelist.validate("ssh://example.com"), "ssh matches its explicit entry");
		assert.notOk(URLWhitelist.validate(SCHEME_JS + "//example.com/path"),
			"a different scheme does not match an ssh-protocol entry");
		assert.notOk(URLWhitelist.validate("http://example.com"),
			"http does not match an ssh-only entry");
	});

	QUnit.test("blob: scheme requires explicit protocol entry", function(assert) {
		// A blob: URL is allowed by registering an entry with the explicit "blob"
		// protocol and no host. blob: URLs have no host component (the inner URL is
		// parsed into the path), so the host check passes for any blob: URL.
		URLWhitelist.add("blob");
		assert.ok(URLWhitelist.validate("blob:https://company.example/abc-123"),
			"blob: URL accepted via blob-only entry");
		assert.ok(URLWhitelist.validate("blob:http://localhost/xyz"),
			"blob: URL accepted via blob-only entry (any inner origin)");
		assert.notOk(URLWhitelist.validate("http://company.example/abc-123"),
			"plain http URL not accepted via blob-only entry");
	});

	QUnit.test("blob: scheme with URL restriction must use explicit protocol and path", function(assert) {
		// The second argument of #add is the URL host, not a full URL. blob: URLs have
		// no host component, so a host restriction never matches one. To restrict a
		// blob: URL, use the explicit "blob" protocol and put the inner URL into the
		// path argument. A trailing asterisk in the path matches any URL with that prefix.
		URLWhitelist.add("blob", undefined, undefined, "https://company.example/MyDataUrl");
		assert.ok(URLWhitelist.validate("blob:https://company.example/MyDataUrl"),
			"specific blob: URL accepted via explicit blob/path entry");
		assert.notOk(URLWhitelist.validate("blob:https://other.example/MyDataUrl"),
			"blob: URL with non-matching inner URL rejected");
		assert.notOk(URLWhitelist.validate(SCHEME_JS + "//company.example/path"),
			"a different scheme does not match a blob/path entry");

		// A trailing asterisk in the path matches any inner URL with the given prefix.
		URLWhitelist.clear();
		URLWhitelist.add("blob", undefined, undefined, "https://company.example/*");
		assert.ok(URLWhitelist.validate("blob:https://company.example/MyDataUrl"),
			"blob: URL accepted via prefix path");
		assert.ok(URLWhitelist.validate("blob:https://company.example/another"),
			"blob: URL accepted via prefix path");
		assert.notOk(URLWhitelist.validate("blob:https://other.example/MyDataUrl"),
			"blob: URL with non-matching prefix rejected");
	});

	QUnit.test("data: URL requires explicit data protocol entry, not falsy protocol", function(assert) {
		// The second argument of #add is the URL host, not a full URL, and a data: URL
		// has no host, so a host restriction does not apply to it. To allow a single,
		// specific data: URL, register an entry with the explicit protocol "data" and a
		// path matching the rest of the URL: everything after "data:" ends up in the path.
		var sPdfTail = "application/pdf;base64,JVBERi0xLjQKJ";
		URLWhitelist.add("data", undefined, undefined, sPdfTail);
		assert.ok(URLWhitelist.validate("data:" + sPdfTail),
			"specific data: URL accepted via explicit data entry");
		assert.notOk(URLWhitelist.validate("data:application/pdf;base64,DIFFERENT"),
			"non-matching data: URL rejected");
		assert.notOk(URLWhitelist.validate("data:text/plain,body"),
			"data: URL with a different path rejected");
		assert.notOk(URLWhitelist.validate(SCHEME_JS + "body"),
			"a different scheme is rejected even though a data entry exists");
	});

	QUnit.test("data: prefix can be allowlisted via wildcard path", function(assert) {
		// Allow any data:application/pdf;base64,... URL. A trailing asterisk in the
		// path matches any URL with the given prefix.
		URLWhitelist.add("data", undefined, undefined, "application/pdf;base64,*");
		assert.ok(URLWhitelist.validate("data:application/pdf;base64,JVBERi0xLjQ"),
			"any data:application/pdf;base64,... URL accepted");
		assert.ok(URLWhitelist.validate("data:application/pdf;base64,DIFFERENT"),
			"any data:application/pdf;base64,... URL accepted");
		assert.notOk(URLWhitelist.validate("data:text/plain,body"),
			"data: URL with a different prefix rejected, only application/pdf is allowed");
		assert.notOk(URLWhitelist.validate(SCHEME_JS + "body"),
			"a different scheme is rejected even with a broad data: entry");
	});

	QUnit.test("check the whitelist", function(assert) {

		URLWhitelist.add("http", "www.sap.com");
		URLWhitelist.add("http", "www.sap.de");
		URLWhitelist.add("http", "sap.com");
		URLWhitelist.add("http", "sap.de");
		URLWhitelist.add("", "www.ard.de");
		URLWhitelist.add("http", "www.zdf.de", "8080");
		URLWhitelist.add("https", "www.rtl.de", "", "/tv-program");
		URLWhitelist.add("https", "www.rtl.de", "", "/info*");
		URLWhitelist.add("", "*vox.de");

		var sUrl = "http://www.sap.com";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "http://de.sap.com";
		assert.ok(!URLWhitelist.validate(sUrl), sUrl + " not valid");

		sUrl = "ftp://www.sap.de";
		assert.ok(!URLWhitelist.validate(sUrl), sUrl + " not valid");

		sUrl = "http://www.sap.de/index.html";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.sap.de:1080/index.html";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.sap.com/global/images/SAPLogo.gif";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.test.de";
		assert.ok(!URLWhitelist.validate(sUrl), sUrl + " not valid");

		sUrl = "https://www.ard.de";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "ftp://www.ard.de";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.ard.de/index.html";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.zdf.de";
		assert.ok(!URLWhitelist.validate(sUrl), sUrl + " not valid");

		sUrl = "http://www.zdf.de:8080";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.rtl.de/tv-program";
		assert.ok(!URLWhitelist.validate(sUrl), sUrl + " not valid");

		sUrl = "https://www.rtl.de/tv-program";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "https://www.rtl.de/tv-program?parameter=value";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "https://www.rtl.de";
		assert.ok(!URLWhitelist.validate(sUrl), sUrl + " not valid");

		sUrl = "https://www.rtl.de/tv-program/today";
		assert.ok(!URLWhitelist.validate(sUrl), sUrl + " not valid");

		sUrl = "https://www.rtl.de/info";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "https://www.rtl.de/info/today";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "http://vox.de";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "http://info.vox.de";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");
	});

	QUnit.module("sap/base/security/URLWhitelist.add", {
		afterEach: URLWhitelist.clear
	});
	QUnit.test("check whitelist add and delete entries", function(assert) {
		URLWhitelist.add("httpm");

		assert.equal(1, URLWhitelist.entries().length, "valid");

		URLWhitelist.delete(URLWhitelist.entries()[0]);

		assert.equal(0, URLWhitelist.entries().length, "valid");
	});

	QUnit.module("sap/base/security/URLWhitelist.delete", {
		afterEach: URLWhitelist.clear
	});
	QUnit.test("check whitelist delete entries", function(assert) {

		assert.equal(0, URLWhitelist.entries().length, "empty");
		URLWhitelist.delete(URLWhitelist.entries()[0]);
		URLWhitelist.delete(null);
		URLWhitelist.delete(false);
		URLWhitelist.delete({});
		assert.equal(0, URLWhitelist.entries().length, "empty");
	});

	QUnit.module("sap/base/security/URLWhitelist.clear", {
		afterEach: URLWhitelist.clear
	});
	QUnit.test("check whitelist clearing entries", function(assert) {

		// start with an empty whitelist -> length 0
		assert.equal(0, URLWhitelist.entries().length, "empty");

		// add an entry -> length 1
		URLWhitelist.add("httpm");

		assert.equal(1, URLWhitelist.entries().length, "1 entry");

		// clear all entries -> length 0
		URLWhitelist.clear();

		assert.equal(0, URLWhitelist.entries().length, "empty after clearing");
	});

	QUnit.module("sap/base/security/URLWhitelist.entries", {
		afterEach: URLWhitelist.clear
	});
	QUnit.test("check whitelist entries copy", function(assert) {

		assert.equal(0, URLWhitelist.entries().length, "empty");
		var aEntries = URLWhitelist.entries();
		aEntries.push({});
		assert.equal(0, URLWhitelist.entries().length, "empty");
		assert.equal(1, aEntries.length, "empty");
	});

});
