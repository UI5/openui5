import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import stylelint from "stylelint";
import defaultConfig from "../../../.stylelintrc.mjs";
import complexityConfig from "../complexity.config.mjs";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const complexityConfigFile = fileURLToPath(new URL("../complexity.config.mjs", import.meta.url));
const stylelintCli = fileURLToPath(new URL("bin/stylelint.mjs", import.meta.resolve("stylelint/package.json")));
const testFile = path.join(repoRoot, "src/sap.m/src/sap/m/themes/base/StylelintTest.less");
const complexityRules = ["max-nesting-depth", "selector-max-compound-selectors"];
const complexityCode = `@mySize: 10px;
.sapMRoot {
	.sapMOne {
		.sapMTwo {
			.sapMThree {
				.sapMFour {
					.sapMFive {
						width: @mySize;
					}
				}
			}
		}
	}
}

.sapMOne .sapMTwo .sapMThree .sapMFour .sapMFive {
	color: red;
}`;

async function lint(code, config = defaultConfig, options = {}) {
	const result = await stylelint.lint({
		code,
		codeFilename: testFile,
		config,
		cwd: repoRoot,
		...options,
	});
	if (result.results.length === 0) {
		assert.equal(result.errored, false);
		return undefined;
	}
	assert.deepEqual(result.results[0].invalidOptionWarnings, []);
	assert.deepEqual(result.results[0].parseErrors, []);
	return result.results[0];
}

function runCli({ complexity = false, args = [], cwd = repoRoot, env = {} } = {}) {
	const output = spawnSync(process.execPath, [
		stylelintCli,
		"--stdin-filename", testFile,
		"--formatter", "json",
		...(complexity ? ["--config", complexityConfigFile] : []),
		...args,
	], { cwd, env: { ...process.env, ...env }, input: complexityCode, encoding: "utf8" });
	assert.ifError(output.error);
	return output;
}

test("selector-complexity checks are disabled by default", () => {
	for (const rule of complexityRules) {
		assert.equal(defaultConfig.rules[rule], null);
	}
});

test("local complexity config enables only the two non-auto-fixable checks", () => {
	const expected = structuredClone(complexityConfig);
	for (const rule of complexityRules) {
		assert.equal(complexityConfig.rules[rule][0], 4);
		assert.equal(complexityConfig.rules[rule][2].disableFix, true);
		expected.rules[rule] = null;
	}
	assert.deepEqual(expected, defaultConfig);
});

test("dedicated npm script explicitly selects the local complexity config", () => {
	const { scripts } = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
	assert.equal(scripts["lint:styles:complexity"],
		`${scripts["lint:styles"]} --config scripts/stylelint/complexity.config.mjs`);
	assert.equal(scripts["lint:styles:no-complexity"], undefined);
});

test("default runs retain LESS warnings while complexity advice is local-only", async () => {
	const normal = await lint(complexityCode);
	const local = await lint(complexityCode, complexityConfig);
	for (const rule of complexityRules) {
		assert.ok(!normal.warnings.some((warning) => warning.rule === rule), rule);
		assert.ok(local.warnings.some((warning) => warning.rule === rule), rule);
	}
	for (const rule of ["openui5/no-less-var-declaration", "openui5/no-less-var-usage"]) {
		assert.ok(normal.warnings.some((warning) => warning.rule === rule), rule);
		assert.ok(local.warnings.some((warning) => warning.rule === rule), rule);
	}
});

for (const cwd of [repoRoot, path.join(repoRoot, "src/sap.m")]) {
	for (const complexity of [false, true]) {
		test(`CLI complexity ${complexity} from ${path.relative(repoRoot, cwd) || "the root"}`, () => {
			const output = runCli({ complexity, cwd });
			assert.equal(output.status, 0, output.stderr);
			// Stylelint writes diagnostic reports to stderr, including JSON reports.
			const [result] = JSON.parse(output.stderr);
			assert.deepEqual(result.invalidOptionWarnings, []);
			assert.deepEqual(result.parseErrors, []);
			for (const rule of complexityRules) {
				assert.equal(result.warnings.some((warning) => warning.rule === rule), complexity, rule);
			}
			assert.ok(result.warnings.some((warning) => warning.rule === "openui5/no-less-var-usage"));
		});
	}
}

test("central environment and former switches cannot enable default complexity checks", () => {
	const output = runCli({ env: {
		CI: "true",
		JENKINS_URL: "https://jenkins.example.invalid/",
		GERRIT_NEWREV: "synthetic-revision",
		GERRIT_PATCHSET_REVISION: "synthetic-revision",
		STYLELINT_BUILD: "false",
		STYLELINT_DISABLE_COMPLEXITY_WARNINGS: "false",
	} });
	assert.equal(output.status, 0, output.stderr);
	const [result] = JSON.parse(output.stderr);
	for (const rule of complexityRules) {
		assert.ok(!result.warnings.some((warning) => warning.rule === rule), rule);
	}
	assert.ok(result.warnings.some((warning) => warning.rule === "openui5/no-less-var-usage"));
});

test("local command supports additional CLI options", () => {
	const output = runCli({ complexity: true, args: ["--quiet"] });
	assert.equal(output.status, 0, output.stderr);
	const [result] = JSON.parse(output.stderr);
	assert.deepEqual(result.warnings, []);
});

test("local command retains Stylelint failure exit codes", () => {
	const output = runCli({ complexity: true, args: ["--max-warnings", "0"] });
	assert.equal(output.status, 2, output.stderr);
});

for (const functionName of ["saturate", "desaturate"]) {
	test(`${functionName} is reported as a disallowed LESS color function`, async () => {
		const result = await lint(`.sapMBtn { color: ${functionName}(@sapUiBrand, 10%); }`);
		assert.ok(result.warnings.some((warning) =>
			warning.rule === "function-disallowed-list" && warning.text.includes(functionName)
		));
	});
}

test("CSS-compatible ampersand nesting is allowed", async () => {
	const result = await lint(`.sapMBtn {
	&:hover {
		opacity: 0.8;
	}

	&.sapMBtnActive {
		color: red;
	}
}`);
	assert.ok(!result.warnings.some((warning) => warning.rule.startsWith("openui5/")));
	assert.equal(defaultConfig.overrides[0].rules["openui5/no-parent-selector"], undefined);
});

test("per-library severity overrides still work with complexity warnings disabled", async () => {
	const config = structuredClone(defaultConfig);
	config.overrides.push({
		files: ["**/*.less"],
		rules: { "openui5/no-less-var-declaration": [true, { severity: "error" }] },
	});
	const result = await lint("@mySize: 10px;", config);
	assert.ok(result.warnings.some((warning) =>
		warning.rule === "openui5/no-less-var-declaration" && warning.severity === "error"
	));
});

const legacyThemes = ["sap_bluecrystal", "sap_belize", "sap_belize_base", "sap_belize_plus",
	"sap_belize_hcb", "sap_belize_hcw", "sap_hcb"];

for (const cwd of [repoRoot, path.join(repoRoot, "src/sap.m")]) {
	test(`legacy themes are ignored when linting from ${path.relative(repoRoot, cwd) || "the root"}`, async () => {
		for (const theme of legacyThemes) {
			const result = await lint(".sapMBtn { color: red; }", defaultConfig, {
				cwd,
				codeFilename: path.join(repoRoot, `src/sap.m/src/sap/m/themes/${theme}/StylelintTest.less`),
			});
			assert.equal(result, undefined, theme);
		}
		for (const theme of ["base", "sap_horizon", "sap_fiori_3"]) {
			const result = await lint(".sapMBtn { color: red; }", defaultConfig, {
				cwd,
				codeFilename: path.join(repoRoot, `src/sap.m/src/sap/m/themes/${theme}/StylelintTest.less`),
			});
			assert.notEqual(result, undefined, theme);
		}
	});
}

test("library-local ignore files stay in sync with root exclusions", () => {
	const rootPatterns = fs.readFileSync(path.join(repoRoot, ".stylelintignore"), "utf8")
		.split("\n").filter((line) => line && !line.startsWith("#"))
		.map((line) => line.replace(/^src\//, ""));
	for (const library of fs.readdirSync(path.join(repoRoot, "src"))) {
		const ignorePath = path.join(repoRoot, "src", library, ".stylelintignore");
		if (!fs.existsSync(ignorePath)) {
			continue;
		}
		const patterns = fs.readFileSync(ignorePath, "utf8")
			.split("\n").filter((line) => line && !line.startsWith("#"));
		assert.deepEqual(patterns, rootPatterns, library);
	}
});
