"use strict";

const Arborist = require("@npmcli/arborist");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Fingerprint only the locked dependencies that can affect a library's bundles.
 * Verification deliberately uses loadVirtual(), never the installed dependency tree.
 *
 * @param {object} config Library-specific configuration.
 * @param {string} config.libraryRoot Absolute path to the library's package.json directory.
 * @param {string[]} config.packages Web-component packages to include.
 * @returns {Promise<object>} Versioned fingerprint and resolved root package versions.
 */
module.exports = async function fingerprint(config) {
	const libraryRoot = path.resolve(config.libraryRoot);
	let lockRoot = libraryRoot;
	while (!fs.existsSync(path.join(lockRoot, "package-lock.json"))) {
		const parent = path.dirname(lockRoot);
		if (parent === lockRoot) {
			throw new Error(`No package-lock.json found for ${libraryRoot}`);
		}
		lockRoot = parent;
	}

	const lock = JSON.parse(fs.readFileSync(path.join(lockRoot, "package-lock.json"), "utf8"));
	if (!Number.isInteger(lock.lockfileVersion) || lock.lockfileVersion < 2 || !lock.packages) {
		throw new Error("Web-component fingerprints require package-lock.json version 2 or newer");
	}

	const tree = await new Arborist({ path: lockRoot, offline: true }).loadVirtual({ subtreeOnly: true });
	const location = path.relative(lockRoot, libraryRoot).split(path.sep).join("/");
	const owner = location ? tree.inventory.get(location) : tree;
	if (!owner) {
		throw new Error(`Library ${location} is missing from package-lock.json`);
	}

	const manifest = JSON.parse(fs.readFileSync(path.join(libraryRoot, "package.json"), "utf8"));
	const rootNames = [...new Set([...config.packages, "ui5-tooling-modules"])].sort();
	const roots = [];
	const versions = {};
	const pending = [];
	const nodeIds = new Map();
	const nodes = [];
	function enqueue(node) {
		if (!nodeIds.has(node.location)) {
			nodeIds.set(node.location, nodeIds.size);
			pending.push(node);
		}
		return nodeIds.get(node.location);
	}
	for (const name of rootNames) {
		const declared = manifest.devDependencies?.[name];
		const locked = lock.packages[location]?.devDependencies?.[name];
		if (!declared || declared !== locked) {
			throw new Error(`package-lock.json is out of sync with the ${name} devDependency in ${location || "the root"}`);
		}
		const edge = owner.edgesOut.get(name);
		if (!edge?.valid || !edge.to) {
			throw new Error(`Cannot resolve locked dependency ${name} (${edge?.error || "missing"})`);
		}
		const target = edge.to.isLink ? edge.to.target : edge.to;
		roots.push({ name, to: enqueue(target) });
		versions[name] = target.version;
	}

	// Stable traversal IDs express graph relationships without encoding npm's physical
	// hoisting locations. Moving an otherwise identical subtree does not require a rebuild.
	for (let index = 0; index < pending.length; index++) {
		const node = pending[index];
		const dependencies = [];
		const entry = {
			name: node.packageName,
			version: node.version,
			integrity: node.integrity || null,
			resolved: lock.packages[node.location]?.resolved || null,
			dependencies
		};
		nodes[nodeIds.get(node.location)] = entry;
		const edges = [...node.edgesOut.values()].sort((a, b) => {
			if (a.name === b.name) {
				return 0;
			}
			return a.name < b.name ? -1 : 1;
		});
		for (const edge of edges) {
			// Dependency packages' development dependencies do not participate in the build.
			if (edge.type === "dev") {
				continue;
			}
			if (edge.error && !(edge.optional && !edge.to)) {
				throw new Error(`Cannot resolve ${edge.name} from ${node.location}: ${edge.error}`);
			}
			const target = edge.to?.isLink ? edge.to.target : edge.to;
			dependencies.push({ name: edge.name, type: edge.type, to: target ? enqueue(target) : null });
		}
	}

	// Root names and outgoing edges are sorted using locale-independent ordering.
	// Checkout paths, lockfile formatting, flags and unrelated metadata are excluded.
	const graph = { roots, nodes };
	return {
		schemaVersion: 1,
		fingerprint: crypto.createHash("sha256").update(JSON.stringify(graph)).digest("hex"),
		roots: versions
	};
};
