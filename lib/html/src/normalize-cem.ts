#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";

const [,, inputFile, outputFile] = process.argv;

if (!inputFile) {
	console.error("Usage: node format-cem.js <input.json> [output.json]");
	process.exit(1);
}

const by = (key: string) => (a: Record<string, any>, b: Record<string, any>) => a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
const byModule = (a: Record<string, any>, b: Record<string, any>) => {
	if (/HTMLElement/.test(a.path) && !/HTMLElement/.test(b.path)) {
		return -1;
	}
	if (!/HTMLElement/.test(a.path) && /HTMLElement/.test(b.path)) {
		return 1;
	}
	return by("path")(a,b);
}

const cem = JSON.parse(readFileSync(inputFile, "utf8"));

cem.modules?.sort(byModule);

for (const mod of cem.modules ?? []) {
	mod.declarations?.sort(by("name"));
	for (const decl of mod.declarations ?? []) {
		decl.members?.sort(by("name"));
		decl.attributes?.sort(by("name"));
		decl.events?.sort(by("name"));
	}
}

const result = JSON.stringify(cem, null, "  ") + "\n";

if (outputFile) {
	writeFileSync(outputFile, result, "utf8");
} else {
	process.stdout.write(result);
}
