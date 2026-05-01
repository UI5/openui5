import {fileURLToPath} from "node:url";
import {relative} from "node:path";
import {cp} from "node:fs/promises";

/* eslint-disable no-console */
async function updateJSDocTemplate() {
	const paths = [
		"ui5",
		"createIndexFiles.js",
		"transformApiJson.js"
	];

	const baseSrc = new URL("../jsdoc/", import.meta.url);
	const baseDest = new URL("./lib/processors/jsdoc/lib/", import.meta.resolve("@ui5/builder/package.json"));
	const rel = (url) => relative(process.cwd(), fileURLToPath(url));

	console.info(`Update JSDoc template in '${rel(baseDest)}' from '${rel(baseSrc)}'`);
	for (const path of paths) {
		const src = fileURLToPath(new URL(path, baseSrc));
		const dest = fileURLToPath(new URL(path, baseDest));

		await cp(src, dest, { recursive: true });
		console.info(`  copied '${path}'`);
	}
	console.info(`done.`);
}

await updateJSDocTemplate();
