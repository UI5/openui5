/* eslint-disable no-console */
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const fingerprint = require("./fingerprint");

/**
 * Record the scoped lockfile fingerprint after successful bundle generation.
 * Generation must use lockfile-based dependencies (npm ci). Do not run this on old
 * bundles just to update their stamp: the fingerprint describes the build inputs.
 *
 * @param {object} config Library-specific configuration shared with verification.
 * @returns {Promise<void>} Resolves when the build information has been written.
 */
module.exports = async function record(config) {
	try {
		for (const file of Object.values(config.genFiles)) {
			if (!fs.existsSync(path.join(config.libraryRoot, config.libSrc, file))) {
				throw new Error(`Generated wrapper ${file} is missing; generate the bundles first`);
			}
		}
		const buildInfo = await fingerprint(config);
		const output = path.join(config.libraryRoot, config.libSrc, "gen", "ui5", ".build-info.json");
		fs.mkdirSync(path.dirname(output), { recursive: true });
		fs.writeFileSync(output, JSON.stringify(buildInfo, null, 2) + "\n", "utf8");
		console.info(`[record-webcomponents] Recorded scoped dependency fingerprint for ${path.basename(config.libraryRoot)}`);
	} catch (err) {
		console.error(`[record-webcomponents] ${err.message}`);
		process.exitCode = 1;
	}
};
