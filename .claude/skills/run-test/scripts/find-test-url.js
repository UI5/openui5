#!/usr/bin/env node
/**
 * find-test-url.js - Finds QUnit test URL for an OpenUI5 module in one shot.
 *
 * Usage: node find-test-url.js <module_name> [repo_root]
 *
 * Examples:
 *   node find-test-url.js Button
 *   node find-test-url.js sap.m.Button
 *   node find-test-url.js sap/ui/core/routing/Router
 *   node find-test-url.js BlockLayerUtils
 *   node find-test-url.js Popup
 */

const fs = require("fs");
const path = require("path");
const http = require("http");

const moduleInput = process.argv[2];
if (!moduleInput) {
	console.error("Usage: node find-test-url.js <module_name> [repo_root]");
	process.exit(1);
}
const repoRoot = toForwardSlash(process.argv[3] || process.cwd());

// --- 1. Detect dev server port ---
function checkPort(port) {
	return new Promise((resolve) => {
		const req = http.get(
			`http://localhost:${port}/resources/sap-ui-version.json`,
			{ timeout: 2000 },
			(res) => {
				if (res.statusCode !== 200) {
					res.resume();
					resolve(null);
					return;
				}
				const chunks = [];
				res.on("data", (chunk) => chunks.push(chunk));
				res.on("end", () => {
					try {
						const json = JSON.parse(Buffer.concat(chunks).toString());
						resolve(json.name === "openui5-testsuite" ? port : null);
					} catch {
						resolve(null);
					}
				});
			}
		);
		req.on("error", () => resolve(null));
		req.on("timeout", () => {
			req.destroy();
			resolve(null);
		});
	});
}

// Normalize path separators to forward slashes for cross-platform consistency
function toForwardSlash(p) {
	return p.replace(/\\/g, "/");
}

// --- 2. Recursive file search ---
// All returned paths use forward slashes. Node.js fs accepts forward slashes on all platforms.
function findFiles(dir, namePattern, opts = {}) {
	const results = [];
	if (!fs.existsSync(dir)) return results;

	function walk(d) {
		let entries;
		try {
			entries = fs.readdirSync(d, { withFileTypes: true });
		} catch {
			return;
		}
		for (const entry of entries) {
			const full = d + "/" + entry.name;
			if (entry.isDirectory()) {
				if (entry.name === "dist" || entry.name === "node_modules") continue;
				if (opts.excludeDemokit && entry.name === "demokit") continue;
				walk(full);
			} else if (entry.isFile() && namePattern.test(entry.name)) {
				if (opts.mustBeUnderQunit && !full.includes("/qunit/")) continue;
				results.push(full);
			}
		}
	}
	walk(toForwardSlash(dir));
	return results;
}

// --- 3. Parse testsuite JS to extract defaults.page and test entries ---
const parseCache = new Map();
function parseTestsuite(filePath) {
	if (parseCache.has(filePath)) return parseCache.get(filePath);
	const content = fs.readFileSync(filePath, "utf8");

	// Extract defaults.page using brace-walking to handle nested objects
	// (e.g., qunit: { version: 2 }, ui5: { ... }) that appear before page:
	let defaultsPage = null;
	const defaultsStart = content.match(/defaults\s*:\s*\{/);
	if (defaultsStart) {
		let depth = 1;
		let i = defaultsStart.index + defaultsStart[0].length;
		const defaultsBody = [];
		while (i < content.length && depth > 0) {
			if (content[i] === "{") depth++;
			if (content[i] === "}") depth--;
			if (depth > 0) defaultsBody.push(content[i]);
			i++;
		}
		const defaultsText = defaultsBody.join("");
		// Find page: at the top level of defaults (depth 0 relative to defaults body)
		let pDepth = 0;
		for (const line of defaultsText.split("\n")) {
			if (pDepth <= 0) {
				const pageMatch = line.match(/page\s*:\s*["']([^"']+)["']/);
				if (pageMatch) {
					defaultsPage = pageMatch[1];
					break;
				}
			}
			let inStr = null;
			for (const ch of line) {
				if (inStr) {
					if (ch === inStr) inStr = null;
				} else if (ch === '"' || ch === "'") {
					inStr = ch;
				} else if (ch === "{") {
					pDepth++;
				} else if (ch === "}") {
					pDepth--;
				}
			}
		}
	}

	// Extract test keys and their individual page overrides
	// We look for keys inside the tests: { ... } block
	const testsBlockMatch = content.match(/tests\s*:\s*\{([\s\S]*)\}\s*;?\s*\}?\s*;?\s*\}?\s*\)?\s*;?\s*$/);
	if (!testsBlockMatch) return { defaultsPage, tests: {} };

	const testsBlock = testsBlockMatch[1];
	const tests = {};

	// Match test entries: "key": { ... } or key: { ... }
	// Use a state-machine approach to handle nested braces
	const keyPattern = /(?:["']([^"']+)["']|([A-Za-z_]\w*))\s*:\s*\{/g;
	let match;
	while ((match = keyPattern.exec(testsBlock)) !== null) {
		const key = match[1] || match[2];
		// Skip known non-test keys that appear as nested objects
		if (["qunit", "sinon", "ui5", "coverage", "loader", "paths"].includes(key)) continue;

		// Find the matching closing brace for this test entry
		let depth = 1;
		let i = match.index + match[0].length;
		while (i < testsBlock.length && depth > 0) {
			if (testsBlock[i] === "{") depth++;
			if (testsBlock[i] === "}") depth--;
			i++;
		}
		const testBody = testsBlock.substring(match.index + match[0].length, i - 1);

		// Check for individual page: override in this test's body
		// Only match top-level page: (not inside nested objects like ui5: { ... })
		let page = null;
		let pageDepth = 0;
		const lines = testBody.split("\n");
		for (const line of lines) {
			// Check for page: BEFORE counting braces on this line,
			// so that braces inside string values (e.g., {name}, {suite})
			// don't corrupt the depth check
			if (pageDepth <= 0) {
				const pageMatch = line.match(/page\s*:\s*["']([^"']+)["']/);
				if (pageMatch) {
					page = pageMatch[1];
					break;
				}
			}
			// Count braces outside of string literals
			let inStr = null;
			for (const ch of line) {
				if (inStr) {
					if (ch === inStr) inStr = null;
				} else if (ch === '"' || ch === "'") {
					inStr = ch;
				} else if (ch === "{") {
					pageDepth++;
				} else if (ch === "}") {
					pageDepth--;
				}
			}
		}

		tests[key] = { page };
	}

	const result = { defaultsPage, tests };
	parseCache.set(filePath, result);
	return result;
}

// --- Main ---
async function main() {
	// 1. Find dev server
	let baseUrl = null;
	const portChecks = [];
	for (let port = 8080; port <= 8090; port++) {
		portChecks.push(checkPort(port));
	}
	const results = await Promise.all(portChecks);
	const foundPort = results.find((p) => p !== null);

	if (!foundPort) {
		console.log("ERROR: No dev server found on ports 8080-8090");
		console.log("HINT: Run 'npm run start' first");
		process.exit(1);
	}
	baseUrl = `http://localhost:${foundPort}`;

	// 2. Normalize module name
	const moduleNormalized = moduleInput.replace(/\./g, "/");
	const componentName = path.basename(moduleNormalized);

	// Detect library hint from fully qualified name
	let libraryHint = null;
	if (moduleNormalized.startsWith("sap/")) {
		const parts = moduleNormalized.split("/");
		for (let end = parts.length - 1; end >= 2; end--) {
			const candidate = parts.slice(0, end).join(".");
			if (fs.existsSync(path.join(repoRoot, "src", candidate))) {
				libraryHint = candidate;
				break;
			}
		}
	}

	// 3. Find test file
	const testFileName = `${componentName}.qunit.js`;
	const allTestFiles = findFiles(path.join(repoRoot, "src"), new RegExp(`^${escapeRegex(testFileName)}$`, "i"), {
		mustBeUnderQunit: true,
		excludeDemokit: true
	});

	// When we have a library hint, filter to that library's files first
	let orderedTestFiles = [...allTestFiles];
	if (libraryHint) {
		const preferred = allTestFiles.filter((f) => f.includes(`/src/${libraryHint}/`));
		const rest = allTestFiles.filter((f) => !f.includes(`/src/${libraryHint}/`));
		orderedTestFiles = [...preferred, ...rest];
	}

	// 4-6. For each candidate test file, find matching testsuite and build URL.
	// Collect ALL matches so the user can choose when ambiguous.
	const allMatches = [];

	for (const candidateFile of orderedTestFiles) {
		const libMatch = candidateFile.match(/(?:^|\/)src\/([^/]+)\/test\//);
		const lib = libMatch ? libMatch[1] : null;
		if (!lib) continue;

		const qunitDir = toForwardSlash(path.join(repoRoot, "src", lib, "test", lib.replace(/\./g, "/"), "qunit"));
		let fileKey;
		if (fs.existsSync(qunitDir) && candidateFile.startsWith(qunitDir + "/")) {
			fileKey = candidateFile.slice(qunitDir.length + 1).replace(/\.qunit\.js$/, "");
		} else {
			fileKey = componentName;
		}

		// Build candidate keys for this file
		// Testsuite keys can use slash or dot notation (e.g., "p13n/Popup" vs "p13n.Popup"),
		// so try both for each candidate.
		const candidateKeys = [fileKey];
		if (fileKey.includes("/")) {
			// Add dot-notation variant: "p13n/Popup" -> "p13n.Popup"
			candidateKeys.push(fileKey.replace(/\//g, "."));
			const parts = fileKey.split("/");
			for (let i = 1; i < parts.length; i++) {
				const suffix = parts.slice(i).join("/");
				candidateKeys.push(suffix);
				if (suffix.includes("/")) {
					candidateKeys.push(suffix.replace(/\//g, "."));
				}
			}
		}
		if (!candidateKeys.includes(componentName)) {
			candidateKeys.push(componentName);
		}

		// Search testsuites for this library
		const testDir = path.join(repoRoot, "src", lib, "test");
		const testsuiteFiles = findFiles(testDir, /^testsuite.*\.qunit\.js$/, { excludeDemokit: true });

		let found = false;
		for (const ck of candidateKeys) {
			for (const tsFile of testsuiteFiles) {
				const parsed = parseTestsuite(tsFile);
				const realKey = findKeyIgnoreCase(parsed.tests, ck);
				if (realKey) {
					allMatches.push({
						testFile: candidateFile,
						library: lib,
						foundKey: realKey,
						testsuite: tsFile,
						parsedSuite: parsed
					});
					found = true;
					break;
				}
			}
			if (found) break;
		}
	}

	// Fallback: if no matches found via file discovery, search testsuites directly
	// for the component name as a key. This handles cases like "Element" where no
	// Element.qunit.js exists but "Element" is a valid testsuite key.
	if (allMatches.length === 0) {
		// Determine which libraries to search
		const libDirs = libraryHint
			? [libraryHint]
			: fs.readdirSync(path.join(repoRoot, "src")).filter((d) => {
				const testDir = path.join(repoRoot, "src", d, "test");
				return fs.existsSync(testDir) && fs.statSync(path.join(repoRoot, "src", d)).isDirectory();
			});

		for (const lib of libDirs) {
			const testDir = path.join(repoRoot, "src", lib, "test");
			if (!fs.existsSync(testDir)) continue;
			const testsuiteFiles = findFiles(testDir, /^testsuite.*\.qunit\.js$/, { excludeDemokit: true });

			for (const tsFile of testsuiteFiles) {
				const parsed = parseTestsuite(tsFile);
				const realKey = findKeyIgnoreCase(parsed.tests, componentName);
				if (realKey) {
					allMatches.push({
						testFile: null,
						library: lib,
						foundKey: realKey,
						testsuite: tsFile,
						parsedSuite: parsed
					});
					break; // one match per library is enough
				}
			}
		}
	}

	// Filter matches when user gave a qualified name (library hint exists):
	// 1. Keep only matches from the hinted library
	// 2. Among those, if any match has foundKey === componentName exactly,
	//    pick the one whose test file path is the most direct (no subdirs)
	let finalMatches = allMatches;
	if (libraryHint && allMatches.length > 1) {
		const fromLib = allMatches.filter((m) => m.library === libraryHint);
		if (fromLib.length > 0) {
			finalMatches = fromLib;
			// Further narrow: if there are exact key matches, prefer the direct file
			const exact = fromLib.filter((m) => m.foundKey.toLowerCase() === componentName.toLowerCase());
			if (exact.length > 1) {
				const direct = exact.filter((m) => {
					if (!m.testFile) return false;
					const qDir = toForwardSlash(path.join(repoRoot, "src", m.library, "test", m.library.replace(/\./g, "/"), "qunit"));
					const relPath = m.testFile.startsWith(qDir + "/")
						? m.testFile.slice(qDir.length + 1).replace(/\.qunit\.js$/, "")
						: null;
					return relPath && relPath.toLowerCase() === componentName.toLowerCase();
				});
				if (direct.length > 0) finalMatches = direct.slice(0, 1);
			} else if (exact.length === 1) {
				finalMatches = exact;
			}
		}
	}

	if (finalMatches.length === 0) {
		console.log(`ERROR: No test found for '${moduleInput}'`);
		console.log(`SEARCHED: testsuite keys and files matching ${componentName}.qunit.js`);
		console.log(`FINDER_URL: ${baseUrl}/test.html`);
		process.exit(1);
	}

	// 7. Construct URLs for all matches
	function buildUrl(match) {
		const { foundKey, testsuite, parsedSuite, library } = match;
		const individualPage = parsedSuite.tests[foundKey]?.page;

		// Testsuite relative path: used for {suite} placeholder and test_runner fallback
		const tsRelative = testsuite
			.replace(`${repoRoot}/src/${library}/test/`, "test-resources/")
			.replace(/\.js$/, "");

		function substitutePlaceholders(url) {
			return url.replace(/\{name\}/g, foundKey).replace(/\{suite\}/g, tsRelative);
		}

		if (individualPage) {
			return { urlType: "individual_page", testUrl: `${baseUrl}/${substitutePlaceholders(individualPage)}` };
		} else if (parsedSuite.defaultsPage && (parsedSuite.defaultsPage.includes("{name}") || parsedSuite.defaultsPage.includes("{suite}"))) {
			return { urlType: "defaults_page", testUrl: `${baseUrl}/${substitutePlaceholders(parsedSuite.defaultsPage)}` };
		} else if (parsedSuite.defaultsPage) {
			return { urlType: "defaults_page_static", testUrl: `${baseUrl}/${parsedSuite.defaultsPage}` };
		} else {
			return { urlType: "test_runner", testUrl: `${baseUrl}/resources/sap/ui/test/starter/Test.qunit.html?testsuite=${tsRelative}&test=${foundKey}` };
		}
	}

	// 8. Output
	console.log(`MODULE: ${moduleInput}`);
	console.log(`BASE_URL: ${baseUrl}`);
	console.log(`MATCHES: ${finalMatches.length}`);

	finalMatches.forEach((match, idx) => {
		const { urlType, testUrl } = buildUrl(match);
		const prefix = finalMatches.length > 1 ? `MATCH_${idx + 1}_` : "";
		console.log(`${prefix}TEST_FILE: ${match.testFile}`);
		console.log(`${prefix}LIBRARY: ${match.library}`);
		console.log(`${prefix}TEST_KEY: ${match.foundKey}`);
		console.log(`${prefix}TESTSUITE: ${match.testsuite}`);
		console.log(`${prefix}URL_TYPE: ${urlType}`);
		console.log(`${prefix}TEST_URL: ${testUrl}`);
	});
}

function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Case-insensitive key lookup in an object. Returns the actual key (correct case) or null.
function findKeyIgnoreCase(obj, key) {
	const lower = key.toLowerCase();
	return Object.keys(obj).find((k) => k.toLowerCase() === lower) || null;
}

main().catch((err) => {
	console.error("UNEXPECTED ERROR:", err.message);
	process.exit(1);
});
