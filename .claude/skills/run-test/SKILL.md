---
name: run-test
description: Use when user asks to run tests, run qunit, execute unit tests, test this module, test this change, find test URL, test Button/Router/Table/Dialog/MessageBox/Input/Control, locate .qunit.html, search testsuite, can't find test file, where is qunit test, how to run UI5 module test, or needs test-resources URL for OpenUI5 modules
---

# Run Test

Finds and runs QUnit unit tests for OpenUI5 modules using a bundled script that handles
port detection, file search, testsuite parsing, and URL construction in one shot.

## Usage

```
/run-test <module_name>
```

Examples: `sap.m.Button`, `RenderManager`, `sap/ui/core/routing/Router`

## How It Works

Run the bundled script. The path is relative to this SKILL.md file's directory:

```bash
node <this-skill-dir>/scripts/find-test-url.js <module_name> <repo_root>
```

The script does everything automatically:
1. Scans ports 8080-8090 for the openui5-testsuite dev server
2. Finds all matching `.qunit.js` test files
3. Parses testsuite files to determine the correct URL type
4. Returns structured output with all matches

## Interpreting the Output

**Single match** (MATCHES: 1) — run the test using the TEST_URL (see "Running the Test" below).

**Multiple matches** (MATCHES: N) — present all options with `AskUserQuestion` so the user can pick:
- Each match has `MATCH_N_LIBRARY`, `MATCH_N_TEST_KEY`, and `MATCH_N_TEST_URL`
- The first match is the most likely (preferred library files come first)

**No dev server** (ERROR: No dev server found) — tell the user to start the server first with `npm run start`, then retry.

**Test not found** (ERROR: No test found) — relay the error. The output includes a FINDER_URL pointing to the interactive test finder page where the user can search manually.

## Running the Test

After resolving the test URL, run the test using one of the available runners.
Check which tools are available and offer the user a choice via `AskUserQuestion`
if more than one is available. If only one is available, use it directly.

### Chrome DevTools MCP

Use when `mcp__chrome-devtools__` tools are available:

```javascript
mcp__chrome-devtools__new_page({ url: testUrl })
mcp__chrome-devtools__wait_for({ text: ["tests completed"], timeout: 120000 })
mcp__chrome-devtools__take_snapshot()
```

### Playwright MCP

Use when `mcp__playwright__` tools are available:

```javascript
mcp__playwright__browser_navigate({ url: testUrl })
mcp__playwright__browser_wait_for({ text: "tests completed", timeout: 120000 })
mcp__playwright__browser_snapshot()
```

### Fallback

If no browser MCP tools are available, present the test URL to the user so they can
open it in a browser manually.

## Running the Script's Own Tests

The script has integration tests at `tests/find-test-url.test.js` (requires a running dev server):

```bash
node <this-skill-dir>/tests/find-test-url.test.js
```
