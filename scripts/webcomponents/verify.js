/* eslint-disable no-console */
"use strict";

/**
 * Centralised verification logic for @ui5/webcomponents version sync.
 * Called from per-library wrapper scripts with library-specific configuration.
 *
 * @param {object} config - Library-specific configuration.
 * @param {string}   config.libraryRoot         Absolute path to the library root (e.g. .../src/sap.f)
 * @param {string}   config.libSrc              Relative path from libraryRoot to the library sources
 * @param {string[]} config.packages            npm packages tracked in devDependencies and .library
 * @param {Object.<string,string>} config.genFiles
 *                                              Map of npm package name → path relative to libSrc
 *                                              for gen wrapper files that carry _ui5metadata.version
 * @param {string}   [config.defaultRefPackage] Fallback devDependency key when a genFile key is not
 *                                              a declared devDependency itself (e.g. "@ui5/webcomponents-base"
 *                                              maps to "@ui5/webcomponents"). Defaults to packages[0].
 * @returns {Promise<void>} Resolves after reporting verification results.
 */
module.exports = async function verify(config) {
	const fs = require("node:fs");
	const path = require("node:path");
	const fingerprint = require("./fingerprint");

	const { libraryRoot, packages, genFiles } = config;
	const libSrcAbs = path.join(libraryRoot, config.libSrc);
	const refFallback = config.defaultRefPackage || packages[0];
	const libraryName = path.basename(libraryRoot);

	// -------------------------------------------------------------------------
	// Readers
	// -------------------------------------------------------------------------

	function readPackageJsonVersions(failures) {
		const pkgPath = path.join(libraryRoot, "package.json");
		let pkg;
		try {
			pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
		} catch (err) {
			failures.push(`Cannot read ${pkgPath}: ${err.message}`);
			return new Map();
		}

		const devDeps = pkg.devDependencies || {};
		const versions = new Map();

		for (const name of packages) {
			const ver = devDeps[name];
			if (!ver) {
				failures.push(`package.json devDependencies: "${name}" not found`);
			} else {
				versions.set(name, ver);
			}
		}

		const toolingVer = devDeps["ui5-tooling-modules"];
		if (!toolingVer) {
			failures.push(`package.json devDependencies: "ui5-tooling-modules" not found`);
		} else {
			versions.set("ui5-tooling-modules", toolingVer);
		}

		return versions;
	}

	function readLibraryVersions(failures) {
		const libraryPath = path.join(libSrcAbs, ".library");
		let xml;
		try {
			xml = fs.readFileSync(libraryPath, "utf8");
		} catch (err) {
			failures.push(`Cannot read ${libraryPath}: ${err.message}`);
			return new Map();
		}

		const versions = new Map();
		const libTagRe = /<lib\s[^>]*npmName="(@ui5\/webcomponents[^"]*)"[^>]*version="([^"]+)"[^>]*>/g;
		let match;
		while ((match = libTagRe.exec(xml)) !== null) {
			versions.set(match[1], match[2]);
		}
		const libTagReReversed = /<lib\s[^>]*version="([^"]+)"[^>]*npmName="(@ui5\/webcomponents[^"]*)"[^>]*>/g;
		while ((match = libTagReReversed.exec(xml)) !== null) {
			if (!versions.has(match[2])) {
				versions.set(match[2], match[1]);
			}
		}

		for (const name of packages) {
			if (!versions.has(name)) {
				failures.push(`.library <thirdparty>: no <lib npmName="${name}"> found`);
			}
		}
		return versions;
	}

	function readGenFileVersion(relPath, failures) {
		const fullPath = path.join(libSrcAbs, relPath);
		let content;
		try {
			content = fs.readFileSync(fullPath, "utf8");
		} catch (err) {
			failures.push(`Cannot read ${fullPath}: ${err.message}`);
			return null;
		}
		const match = /\bversion:\s*"([^"]+)"/.exec(content);
		if (!match) {
			failures.push(`${relPath}: no _ui5metadata.version found`);
			return null;
		}
		return match[1];
	}

	function readBuildInfo(failures) {
		const buildInfoFile = path.join(libSrcAbs, "gen", "ui5", ".build-info.json");
		try {
			const buildInfo = JSON.parse(fs.readFileSync(buildInfoFile, "utf8"));
			if (buildInfo?.schemaVersion !== 1 || typeof buildInfo.fingerprint !== "string" ||
				!/^[a-f0-9]{64}$/.test(buildInfo.fingerprint)) {
				throw new Error("Invalid or unsupported build fingerprint");
			}
			return buildInfo;
		} catch (err) {
			failures.push(`Cannot read ${buildInfoFile}: ${err.message} — run npm run generate-webcomponents`);
			return null;
		}
	}

	// -------------------------------------------------------------------------
	// Main
	// -------------------------------------------------------------------------

	console.info(`[verify-webcomponents] Checking @ui5/webcomponents version sync in ${libraryName}…`);

	const failures = [];
	const mismatches = [];

	const pkgVersions = readPackageJsonVersions(failures);
	const libVersions = readLibraryVersions(failures);

	const genVersions = new Map();
	for (const [pkgName, relPath] of Object.entries(genFiles)) {
		const ver = readGenFileVersion(relPath, failures);
		if (ver !== null) {
			genVersions.set(pkgName, ver);
		}
	}

	// 1. Compare .library versions against package.json
	for (const name of packages) {
		const pkgVer = pkgVersions.get(name);
		const libVer = libVersions.get(name);
		if (pkgVer && libVer && pkgVer !== libVer) {
			mismatches.push({ source: ".library <thirdparty>", "package": name, expected: pkgVer, found: libVer });
		}
	}

	// 2. Compare gen file versions against package.json
	for (const [genKey, genVer] of genVersions) {
		const refPackage = pkgVersions.has(genKey) ? genKey : refFallback;
		const pkgVer = pkgVersions.get(refPackage);
		if (pkgVer && genVer !== pkgVer) {
			mismatches.push({ source: genFiles[genKey], "package": genKey, expected: pkgVer, found: genVer });
		}
	}

	// 3. Recompute the complete scoped closure, including tooling and transitive dependencies.
	// Metadata comparisons above remain useful: the graph alone cannot validate .library
	// declarations or generated wrappers. The old tooling-only stamp is now redundant.
	const buildInfo = readBuildInfo(failures);
	try {
		const current = await fingerprint(config);
		if (buildInfo && buildInfo.fingerprint !== current.fingerprint) {
			mismatches.push({
				source: "gen/ui5/.build-info.json",
				"package": "scoped dependencies",
				expected: current.fingerprint,
				found: buildInfo.fingerprint
			});
		}
	} catch (err) {
		failures.push(`Cannot fingerprint locked dependencies: ${err.message}`);
	}

	// Report
	const primaryPackage = packages[0];
	if (failures.length === 0 && mismatches.length === 0) {
		const ver = pkgVersions.get(primaryPackage) || "(unknown)";
		console.info(`\n✔  ${primaryPackage} versions are in sync (${ver})\n`);
		process.exitCode = 0;
		return;
	}

	console.error(`\n✖  ${primaryPackage} version mismatch in ${libraryName}:\n`);

	if (failures.length > 0) {
		console.error("  Missing or unreadable sources:");
		for (const msg of failures) {
			console.error(`    • ${msg}`);
		}
		console.error("");
	}

	if (mismatches.length > 0) {
		const pkgVer = pkgVersions.get(primaryPackage);
		if (pkgVer) {
			console.error(`  package.json devDependencies reference: ${pkgVer}`);
		}
		console.error("");
		console.error("  Source                                   Package                               Found     Expected");
		console.error("  ──────────────────────────────────────── ───────────────────────────────────── ───────── ─────────");
		for (const m of mismatches) {
			console.error(`  ${m.source.padEnd(40)} ${m["package"].padEnd(37)} ${m.found.padEnd(9)} ${m.expected}`);
		}
		console.error("");
	}

	console.error(`  To fix:`);
	console.error(`    1. Install locked dependencies with npm ci from the repository root.`);
	console.error(`    2. Run npm run generate-webcomponents from ${path.relative(process.cwd(), libraryRoot) || libraryRoot}/`);
	console.error(`       Commit the regenerated bundles and gen/ui5/.build-info.json together.`);
	console.error(`    3. Update version="..." in ${path.join(config.libSrc, ".library")} to match`);
	console.error(`       the ${packages.join(", ")} version(s) in package.json devDependencies.\n`);

	process.exitCode = 1;
};
