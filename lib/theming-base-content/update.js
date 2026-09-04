const path = require("node:path");
const {promisify} = require("node:util");
const fsSync = require("node:fs");
const {readFile, writeFile, stat, mkdir, rm, glob} = require("node:fs/promises");
const {execFile} = require("node:child_process");
const execFileAsync = promisify(execFile);
const createWriteStream = fsSync.createWriteStream;
const {pipeline} = require("node:stream");
const streamPipeline = promisify(pipeline);
const StreamZip = require("node-stream-zip");

const configs = require("./config.js");

// See https://github.com/SAP/theming-base-content
const npmPackageName = "@sap-theming/theming-base-content";

const openui5RootDir = path.join(__dirname, "..", "..");

const tmpDir = path.join(openui5RootDir, "tmp", "update-theming-base-content");

function relativePath(p) {
	return path.relative(process.cwd(), p);
}

function makeArray(v) {
	return Array.isArray(v) ? v : [v];
}

async function exists(filePath) {
    try {
        await stat(filePath);
        return true;
    } catch (err) {
        // "File or directory does not exist"
        if (err.code === "ENOENT") {
            return false;
        } else {
            throw err;
        }
    }
}

async function readJson(filePath) {
	const content = await readFile(filePath, {encoding: "utf-8"});
	return JSON.parse(content);
}

const repoVersionPattern = /(name="@sap-theming\/theming-base-content".*version=")[^"]*(")/;

async function updateRepoFile(baseDir) {
	console.log(`\nUpdating version in .repo file ...`);

	const {sVersion: baseContentVersion} = await readJson(path.join(baseDir, "Base", ".theming"));

	const repoFilePath = path.join(__dirname, "..", "..", ".repo");

	let repoFileContent = await readFile(repoFilePath, {encoding: "utf-8"});

	if (!repoVersionPattern.test(repoFileContent)) {
		throw new Error("Unable to find @sap-theming/theming-base-content version in .repo file");
	}

	repoFileContent = repoFileContent.replace(repoVersionPattern, `$1${baseContentVersion}$2`);

	await writeFile(repoFilePath, repoFileContent);

	console.log(`Updated version in .repo file to ${baseContentVersion}`);
	console.log(`Please make sure to re-generate relevant files by executing the thirdparty-metadata-tool`);
	console.log(`See <SAPWIKI>/wiki/display/SAPUI5/Maintaining+Third-Party+Software+Metadata`);
}

async function download(url, targetPath) {
	const response = await fetch(url);
	if (!response.ok){
		throw new Error(`unexpected response ${response.statusText}`);
	}
	await mkdir(path.dirname(targetPath), {recursive: true});
	await streamPipeline(response.body, createWriteStream(targetPath));
}

// Extracts the theming-base-content archives, which use the store/deflate
// methods supported by node-stream-zip.
async function extractZip(zipFilePath, targetDir) {
	// eslint-disable-next-line new-cap -- "async" is node-stream-zip's promise-based API
	const zip = new StreamZip.async({file: zipFilePath});
	try {
		await mkdir(targetDir, {recursive: true});
		// A "null" entry means: extract the whole archive into targetDir.
		await zip.extract(null, targetDir);
	} finally {
		await zip.close();
	}
}

async function downloadZip(url) {
	const targetZipFile = path.join(tmpDir, "content.zip");
	const targetDir = path.join(tmpDir, "zip");

	console.log(`Downloading ${url} to ${relativePath(targetZipFile)}...\n`);
	await download(url, targetZipFile);

	console.log(`Extracting ${relativePath(targetZipFile)} to ${relativePath(targetDir)}...\n`);
	await extractZip(targetZipFile, targetDir);

	// Handle different variations of zip files
	if (await exists(path.join(targetDir, "content"))) {
		return path.join(targetDir, "content");
	} else {
		return targetDir;
	}
}

async function extractNpmPackage(version) {
	const npmSpec = `${npmPackageName}@${version}`;
	const projectDir = path.join(tmpDir, "npm-package");

	console.log(`Installing ${npmSpec} to ${relativePath(projectDir)}...\n`);

	// Install the package into an isolated, empty project via the installed npm
	// CLI, letting npm fetch and unpack the tarball. "npm install" needs a
	// package.json to act as the project root; without one here npm would walk
	// up and install into the surrounding OpenUI5 workspace.
	await mkdir(projectDir, {recursive: true});
	await writeFile(
		path.join(projectDir, "package.json"),
		JSON.stringify({name: "theming-base-content-download", version: "0.0.0", "private": true})
	);

	await execFileAsync(
		"npm",
		["install", npmSpec, "--no-save", "--no-audit", "--no-fund", "--no-package-lock", "--ignore-scripts"],
		{cwd: projectDir}
	);

	return path.join(projectDir, "node_modules", npmPackageName, "content");
}

async function main({versionOrUrl}) {
	if (!versionOrUrl) {
		throw new Error("Missing required argument: version or url");
	}

	console.log(`\nCleaning tmp folder ...\n`);
	await rm(tmpDir, {recursive: true, force: true});

	let baseDir;
	if (/^https?:\/\//.test(versionOrUrl)) {
		baseDir = await downloadZip(versionOrUrl);
	} else {
		baseDir = await extractNpmPackage(versionOrUrl);
	}

	console.log(`\nCopying files ...\n`);

	for (const entry of configs) {
		await processConfigEntry(entry);
	}

	await updateRepoFile(baseDir);

	async function globFiles({patterns, cwd}) {
		const globResults = await Promise.all(
			patterns.map(async (pattern) => {
				const matches = [];
				for await (const match of glob(pattern, {cwd})) {
					matches.push(match);
				}
				return matches;
			})
		);
		return Array.prototype.concat.apply([], globResults);
	}

	async function processConfigEntry({src, target, append, rename, processContent, encoding}) {
		target = makeArray(target);
		encoding = encoding || "utf-8";

		const srcFiles = await globFiles({
			patterns: makeArray(src),
			cwd: baseDir
		});

		if (!srcFiles.length) {
			console.log(`[ERROR] Pattern(s) did not match any file: ${src}`);
		}

		if (rename && srcFiles.length > 1) {
			console.log(`[ERROR] "rename" (${rename}) can't be used with multiple src files: ${srcFiles.join(", ")}`);
			return;
		}

		async function copyFiles({srcFiles, targetDir}) {
			await Promise.all(srcFiles.map(async (srcFile) => {
				const srcFilePath = path.join(baseDir, srcFile);
				const targetFileName = rename ? rename : path.basename(srcFile);
				const targetFilePath = path.join(openui5RootDir, targetDir, targetFileName);
				let content = await readFile(srcFilePath, {encoding});
				if (typeof processContent === "function") {
					content = processContent(content);
				} else if (Array.isArray(processContent)) {
					content = processContent.reduce((content, fn) => {
						return fn(content);
					}, content);
				}
				if (append === true) {
					content = await readFile(targetFilePath, {encoding}) + content;
				}
				console.log(`Copying from ${relativePath(srcFilePath)} to ${relativePath(targetFilePath)}`);
				await writeFile(targetFilePath, content, {encoding});
			}));
		}

		for (const targetDir of target) {
			await copyFiles({srcFiles, targetDir});
		}

	}
}

main({
	versionOrUrl: process.argv[2]
}).catch((err) => {
	console.error(err);
	process.exit(1);
});
