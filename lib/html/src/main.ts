import { existsSync, readdirSync, rmSync } from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { main as generate } from "./generate.js";

import { generateControls } from "ui5-tooling-modules/cli/createControls.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Root the generated UI5 control wrappers are written to. The wrappers and the library.js
// end up under "<CONTROL_OUTPUT_ROOT>/sap/html" (the slash form of the "sap.html" ui5Namespace).
const CONTROL_OUTPUT_ROOT = path.join(__dirname, "..", "..", "..", "src", "sap.html", "src");
const LIBRARY_DIR = path.join(CONTROL_OUTPUT_ROOT, "sap", "html");

// Static files in the library folder that are NOT generated and must survive `clean`.
const CLEAN_KEEP = new Set([".library"]);

// Description text rendered into the library.js namespace JSDoc block (@namespace sap.html).
const LIBRARY_DESCRIPTION = [
  "The SAPUI5 library <code>sap.html</code> provides lightweight control wrappers for native HTML elements.",
  "",
  "With these controls you can use standard HTML tags (such as <code>&lt;div&gt;</code>, <code>&lt;span&gt;</code>, " +
    "<code>&lt;form&gt;</code> or <code>&lt;input&gt;</code>) directly inside XML views and freely mix native HTML " +
    "markup with regular UI5 controls, while staying within the UI5 programming model (data binding, models, event handling).",
].join("\n");

// "@since" version for the library namespace JSDoc block (the version the library first ships in).
const LIBRARY_SINCE = "1.154.0";

/**
 * Generates custom-elements.json from WebRef IDL data, then emits UI5 control wrappers
 * into the sap.html library source tree.
 */
async function build() {
  await generate();
  generateControls({
    input: path.join(__dirname, "..", "dist", "custom-elements.json"),
    output: CONTROL_OUTPUT_ROOT,
    namespace: "@ui5/html",
    ui5Namespace: "sap.html",
    stripModulePrefix: "dist",
    // Emit the OpenUI5 build-time version placeholder instead of the npm package version.
    // The tooling replaces "${version}" at build time.
    version: "${version}",
    libraryMode: true,
    libraryDescription: LIBRARY_DESCRIPTION,
    since: LIBRARY_SINCE,
    // Emit the generated sources with the UI5 code-style convention (tabs, width 4, printWidth is used to keep the number of line wraps low).
    prettierOptions: { useTabs: true, tabWidth: 4, printWidth: 200 },
  });
}

/**
 * Removes all generated control wrappers, the library.js and inlined enums from the
 * sap.html library folder, while keeping non-generated static files (e.g. ".library").
 */
function clean() {
  if (!existsSync(LIBRARY_DIR)) {
    return;
  }
  let removed = 0;
  for (const entry of readdirSync(LIBRARY_DIR)) {
    if (CLEAN_KEEP.has(entry)) {
      continue;
    }
    rmSync(path.join(LIBRARY_DIR, entry), { recursive: true, force: true });
    removed++;
  }
  console.log(`Cleaned ${removed} generated entry/entries from ${LIBRARY_DIR} (kept: ${[...CLEAN_KEEP].join(", ")})`);
}

// dispatch: "node main.js clean" cleans the library folder, otherwise (re)generate.
if (process.argv[2] === "clean") {
  clean();
} else {
  build().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
