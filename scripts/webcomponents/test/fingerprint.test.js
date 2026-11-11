"use strict";

const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const fingerprint = require("../fingerprint");

function fixture(t) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "openui5 webcomponents-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const packages = {};
	const writeJson = (file, data) => {
		fs.mkdirSync(path.dirname(file), { recursive: true });
		fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
	};
	const rootManifest = { name: "fixture", version: "1.0.0", "private": true, workspaces: ["src/*"] };
	writeJson(path.join(root, "package.json"), rootManifest);
	packages[""] = rootManifest;

	function dependency(name, dependencies = {}) {
		packages[`node_modules/${name}`] = {
			version: "1.0.0",
			resolved: `https://registry.example/${name}.tgz`,
			integrity: `sha512-${Buffer.from(name).toString("base64")}`,
			dependencies
		};
	}
	dependency("@ui5/webcomponents", { "f-helper": "^1.0.0" });
	dependency("@ui5/webcomponents-geomap", { "geomap-helper": "^1.0.0" });
	dependency("ui5-tooling-modules", { "build-helper": "^1.0.0" });
	for (const name of ["f-helper", "geomap-helper", "build-helper", "eslint"]) {
		dependency(name);
	}

	const configs = {};
	for (const [lib, name, libSrc] of [
		["sap.f", "@ui5/webcomponents", "src/sap/f"],
		["sap.ui.geomap", "@ui5/webcomponents-geomap", "src/sap/ui/geomap"]
	]) {
		const location = `src/${lib}`;
		const libraryRoot = path.join(root, location);
		const manifest = {
			name: `@openui5/${lib}`,
			version: "1.0.0",
			devDependencies: { [name]: "1.0.0", "ui5-tooling-modules": "1.0.0" }
		};
		packages[location] = manifest;
		packages[`node_modules/@openui5/${lib}`] = { resolved: location, link: true };
		writeJson(path.join(libraryRoot, "package.json"), manifest);
		const genFile = "gen/ui5/component.js";
		const config = { libraryRoot, libSrc, packages: [name], genFiles: { [name]: genFile } };
		configs[lib] = config;
		const src = path.join(libraryRoot, libSrc);
		fs.mkdirSync(path.join(src, "gen/ui5"), { recursive: true });
		fs.writeFileSync(path.join(src, ".library"), `<library><thirdparty><lib npmName="${name}" version="1.0.0" /></thirdparty></library>`);
		fs.writeFileSync(path.join(src, genFile), 'pkg["_ui5metadata"] = { version: "1.0.0" };\n');
	}

	const lock = { name: "fixture", version: "1.0.0", lockfileVersion: 3, packages };
	const save = () => writeJson(path.join(root, "package-lock.json"), lock);
	save();
	const buildInfo = (config) => path.join(config.libraryRoot, config.libSrc, "gen/ui5/.build-info.json");
	const run = (operation, config) => spawnSync(process.execPath, ["-e",
		`require(${JSON.stringify(path.resolve(__dirname, "..", operation))})(${JSON.stringify(config)});`
	], { cwd: root, encoding: "utf8" });
	return { root, configs, lock, save, writeJson, buildInfo, run };
}

function hashes(f) {
	return Promise.all(Object.values(f.configs).map(async (config) => (await fingerprint(config)).fingerprint));
}

test("fingerprints are deterministic and independent of formatting, order and checkout path", async (t) => {
	const f = fixture(t);
	const before = await hashes(f);
	f.lock.packages = Object.fromEntries(Object.entries(f.lock.packages).reverse());
	fs.writeFileSync(path.join(f.root, "package-lock.json"), JSON.stringify(f.lock));
	assert.deepEqual(await hashes(f), before);
	const other = fixture(t);
	assert.deepEqual(await hashes(other), before);
});

test("unrelated dependencies and lockfile flags do not invalidate either library", async (t) => {
	const f = fixture(t);
	const before = await hashes(f);
	f.lock.packages["node_modules/eslint"].version = "9.0.0";
	f.lock.packages["node_modules/eslint"].integrity = "sha512-changed";
	f.lock.packages["node_modules/f-helper"].dev = false;
	f.lock.packages["node_modules/f-helper"].license = "MIT";
	f.save();
	assert.deepEqual(await hashes(f), before);
});

for (const [name, index] of [["f-helper", 0], ["geomap-helper", 1]]) {
	test(`${name} version changes invalidate only the affected library`, async (t) => {
		const f = fixture(t);
		const before = await hashes(f);
		f.lock.packages[`node_modules/${name}`].version = "1.1.0";
		f.save();
		const after = await hashes(f);
		assert.notEqual(after[index], before[index]);
		assert.equal(after[1 - index], before[1 - index]);
	});
}

test("tooling transitive version and integrity changes invalidate both libraries", async (t) => {
	const f = fixture(t);
	const before = await hashes(f);
	f.lock.packages["node_modules/build-helper"].integrity = "sha512-changed";
	f.save();
	const after = await hashes(f);
	for (let i = 0; i < before.length; i++) {
		assert.notEqual(after[i], before[i]);
	}
});

test("a tooling version bump invalidates both libraries", async (t) => {
	const f = fixture(t);
	const before = await hashes(f);
	f.lock.packages["node_modules/ui5-tooling-modules"].version = "1.1.0";
	for (const [lib, config] of Object.entries(f.configs)) {
		const manifest = f.lock.packages[`src/${lib}`];
		manifest.devDependencies["ui5-tooling-modules"] = "1.1.0";
		f.writeJson(path.join(config.libraryRoot, "package.json"), manifest);
	}
	f.save();
	const after = await hashes(f);
	for (let i = 0; i < before.length; i++) {
		assert.notEqual(after[i], before[i]);
	}
});

test("a new nested resolution is detected even if the previously recorded paths are unchanged", async (t) => {
	const f = fixture(t);
	const before = await hashes(f);
	f.lock.packages["node_modules/@ui5/webcomponents/node_modules/f-helper"] = {
		...f.lock.packages["node_modules/f-helper"], version: "1.1.0"
	};
	f.save();
	const after = await hashes(f);
	assert.notEqual(after[0], before[0]);
	assert.equal(after[1], before[1]);
});

test("pure rehoisting of the same dependency graph does not require regeneration", async (t) => {
	const f = fixture(t);
	const before = await hashes(f);
	f.lock.packages["node_modules/@ui5/webcomponents/node_modules/f-helper"] = {
		...f.lock.packages["node_modules/f-helper"]
	};
	f.save();
	assert.deepEqual(await hashes(f), before);
});

test("optional and peer dependencies are included and absent optional peers are allowed", async (t) => {
	const f = fixture(t);
	const tool = f.lock.packages["node_modules/ui5-tooling-modules"];
	tool.peerDependencies = { "optional-peer": "^1.0.0" };
	tool.peerDependenciesMeta = { "optional-peer": { optional: true } };
	tool.optionalDependencies = { binary: "^1.0.0" };
	f.save();
	const before = await hashes(f);
	f.lock.packages["node_modules/optional-peer"] = { version: "1.0.0" };
	f.lock.packages["node_modules/binary"] = { version: "1.0.0" };
	f.save();
	const after = await hashes(f);
	for (let i = 0; i < before.length; i++) {
		assert.notEqual(after[i], before[i]);
	}
});

test("cyclic dependency graphs terminate and remain deterministic", async (t) => {
	const f = fixture(t);
	f.lock.packages["node_modules/build-helper"].dependencies = { cycle: "1.0.0" };
	f.lock.packages["node_modules/cycle"] = { version: "1.0.0", dependencies: { "build-helper": "1.0.0" } };
	f.save();
	assert.deepEqual(await hashes(f), await hashes(f));
});

test("missing or invalid relevant resolutions fail instead of yielding a partial fingerprint", async (t) => {
	const f = fixture(t);
	delete f.lock.packages["node_modules/f-helper"];
	f.save();
	await assert.rejects(fingerprint(f.configs["sap.f"]), /f-helper.*MISSING/);
	f.lock.packages["node_modules/f-helper"] = { version: "2.0.0" };
	f.save();
	await assert.rejects(fingerprint(f.configs["sap.f"]), /f-helper.*INVALID/);
});

test("manifest/lockfile drift and missing lockfiles fail", async (t) => {
	const f = fixture(t);
	const config = f.configs["sap.f"];
	const manifest = JSON.parse(fs.readFileSync(path.join(config.libraryRoot, "package.json")));
	manifest.devDependencies["@ui5/webcomponents"] = "2.0.0";
	f.writeJson(path.join(config.libraryRoot, "package.json"), manifest);
	await assert.rejects(fingerprint(config), /out of sync/);
	fs.rmSync(path.join(f.root, "package-lock.json"));
	await assert.rejects(fingerprint(config), /No package-lock/);
});

test("record/verify round trip does not inspect installed component dependencies", (t) => {
	const f = fixture(t);
	const config = f.configs["sap.f"];
	assert.equal(f.run("record", config).status, 0);
	f.writeJson(path.join(f.root, "node_modules/ui5-tooling-modules/package.json"), { version: "99.0.0" });
	assert.equal(f.run("verify", config).status, 0);
	f.lock.packages["node_modules/f-helper"].version = "1.1.0";
	f.save();
	const result = f.run("verify", config);
	assert.equal(result.status, 1);
	assert.match(result.stderr, /scoped dependencies/);
});

test("metadata verification is still required even if the dependency fingerprint matches", (t) => {
	const f = fixture(t);
	const config = f.configs["sap.f"];
	assert.equal(f.run("record", config).status, 0);
	const src = path.join(config.libraryRoot, config.libSrc);
	fs.writeFileSync(path.join(src, ".library"), '<library><lib npmName="@ui5/webcomponents" version="2.0.0" /></library>');
	const result = f.run("verify", config);
	assert.equal(result.status, 1);
	assert.match(result.stderr, /\.library <thirdparty>/);
});

test("generated-wrapper version drift is not hidden by a matching fingerprint", (t) => {
	const f = fixture(t);
	const config = f.configs["sap.f"];
	assert.equal(f.run("record", config).status, 0);
	fs.writeFileSync(path.join(config.libraryRoot, config.libSrc, "gen/ui5/component.js"), 'pkg["_ui5metadata"] = { version: "2.0.0" };');
	const result = f.run("verify", config);
	assert.equal(result.status, 1);
	assert.match(result.stderr, /gen\/ui5\/component.js/);
});

test("missing, empty, invalid and old-schema build information requires regeneration", (t) => {
	const f = fixture(t);
	const config = f.configs["sap.f"];
	assert.equal(f.run("verify", config).status, 1);
	for (const content of ["", "{}", '{"schemaVersion":2,"fingerprint":"abc"}']) {
		fs.writeFileSync(f.buildInfo(config), content);
		const result = f.run("verify", config);
		assert.equal(result.status, 1);
		assert.match(result.stderr, /generate-webcomponents/);
	}
});

test("failed recording leaves previous build information unchanged", (t) => {
	const f = fixture(t);
	const config = f.configs["sap.f"];
	assert.equal(f.run("record", config).status, 0);
	const before = fs.readFileSync(f.buildInfo(config), "utf8");
	fs.rmSync(path.join(config.libraryRoot, config.libSrc, "gen/ui5/component.js"));
	assert.equal(f.run("record", config).status, 1);
	assert.equal(fs.readFileSync(f.buildInfo(config), "utf8"), before);
});
