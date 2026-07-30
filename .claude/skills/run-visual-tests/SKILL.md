---
name: run-visual-tests
description: Use when the user asks to run visual tests, uiveri5, image-comparison tests, screenshot tests, or check visual regressions for any OpenUI5 library. Covers chromedriver setup against modern Chrome, the detached-HEAD gotcha, and the local-baseline workflow for catching real diffs.
---

# Run Visual Tests (uiveri5)

Run any OpenUI5 library's `*.spec.js` visual suites with `@ui5/uiveri5` against the local dev server, and detect real visual regressions caused by a feature branch.

**Core workflow:** *always* bake a fresh reference set on `master` locally, then run the feature branch against those references. Never compare against any pre-existing baseline — checked-in references, prior `target/images/` runs, or remote/CI artefacts — because they encode a different OS/Chrome/theme combination than your dev machine.

**Run the Horizon theme by default.** uiveri5's built-in default theme is `belize`, which is deprecated/frozen. Pass `--browsers=chrome:::::horizon` unless the task targets another theme. Full theme syntax and gotchas: [themes.md](themes.md).

**Runs on macOS and Windows.** Almost every command below (`uiveri5`, `git`, `curl`, `npm`, `find`, `grep`, `sed`, `awk`) is identical on both. **On Windows, run them from Git Bash or WSL**, not `cmd`/PowerShell — the `sed`/`awk`/`find` one-liners are POSIX. The only genuinely OS-specific step is chromedriver setup — [chromedriver-setup.md](chromedriver-setup.md) has explicit macOS and Windows subsections. Reference-image paths also differ by OS — see [step 2](#2-run-the-feature-branch-against-the-baked-baseline).

To list libraries that ship visual tests in the current checkout:

```bash
find src -name "visual.suite.js" -path "*/test/*/visual/*" | sed 's|.*/src/||; s|/test/.*||' | sort -u
```

## Quick Reference

| Step | Command |
|---|---|
| Install once | `npm install @ui5/uiveri5 -g` |
| Verify dev server | `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/` (expect `200`) |
| Set up chromedriver | see [chromedriver-setup.md](chromedriver-setup.md) (one-time) |
| Bake baseline on master | `git checkout master && rm -rf target/images/<SpecName>/ && uiveri5 --libFilter=<lib> --specFilter=<SpecName> --browsers=chrome:::::horizon --update` |
| Compare feature branch | `git checkout <branch> && uiveri5 --libFilter=<lib> --specFilter=<SpecName> --browsers=chrome:::::horizon` |
| Run all specs of a lib | replace `--specFilter=<SpecName>` with no `--specFilter` |

`<lib>` is the dotted library namespace (matches the folder under `src/`). `--libFilter` accepts a comma-separated list. `--specFilter` matches against spec file names without `.spec.js`; naming conventions differ per library — list a library's specs with `ls src/<lib>/test/<lib-path>/visual/*.spec.js`.

Always run from the **repo root**. The resolver globs for `**/test/**/visual/visual.suite.js` from `process.cwd()`.

**The dev server must be on port 8080.** uiveri5's `--baseUrl` defaults to `http://localhost:8080` — this skill assumes that default and does not override it. Start the UI5 dev server on 8080 before running; a `connection refused` / blank-screenshot run usually means it isn't up there.

## Detached HEAD Gotcha

uiveri5 calls `git rev-parse --abbrev-ref HEAD`. On detached HEAD it errors:

```
Error: Unable to resolve git branch, seems on detached head, no default one specified
```

**Fix:** create a temporary branch before running.

```bash
git checkout -b tmp-visual-tests
# ... run uiveri5 ...
git checkout <original-ref>
git branch -D tmp-visual-tests
```

## The Workflow

Two steps:

### 1. Bake a fresh baseline on master

```bash
git checkout master
rm -rf target/images/<SpecName>/                                   # discard any stale local refs
uiveri5 --libFilter=<lib> --specFilter=<SpecName> --browsers=chrome:::::horizon --update > /tmp/baseline.log 2>&1
```

In `--update` mode every comparison still prints:

```
Expectation FAILED: Image comparison enabled but no reference image found: X, update enabled so storing current as reference
```

This is **expected**, not an error. uiveri5 reports any comparison without a pre-existing reference as a failure; with `--update` it also writes the screenshot as the new `.ref.png`.

Confirm the baseline was actually produced:

```bash
find target/images/<SpecName> -name "*.ref.png" | wc -l            # should match the number of expectations
```

If `0`, the run didn't render anything (check the log for errors) — do not proceed to step 2.

### 2. Run the feature branch against the baked baseline

```bash
git checkout <feature-branch>
uiveri5 --libFilter=<lib> --specFilter=<SpecName> --browsers=chrome:::::horizon > /tmp/branch.log 2>&1
grep "Overall expectations summary" /tmp/branch.log                # passed: N, failed with image comparison: M
grep "Image comparison failed" /tmp/branch.log | sed 's/.*reference image: //; s/, .*//' | sort -u
```

Each `Image comparison failed` line is a real visual diff against the master baseline. For each one, inspect the trio of images:

```
target/images/<SpecName>/<platform>/<res>/<browser>/<theme>/<dir>/<density>/<id>.ref.png   # from master (step 1)
target/images/<SpecName>/<platform>/<res>/<browser>/<theme>/<dir>/<density>/<id>.act.png   # from branch (step 2)
target/images/<SpecName>/<platform>/<res>/<browser>/<theme>/<dir>/<density>/<id>.diff.png  # rendered diff
```

The `<platform>` segment is OS-dependent: `mac` on macOS, `windows` on Windows. With the Horizon theme the path is typically `mac/1280x1024/chrome/horizon/ltr/cozy` (macOS) or `windows/1280x1024/chrome/horizon/ltr/cozy` (Windows).

**Caveat — unstable baselines.** If the system under test is itself flaky on master (a resize loop, an animation that hasn't settled, a race), the references you bake on master will reflect whichever frame happened to land. A real diff after the fix may then be the *intended consequence* of the fix stabilising the layout, not a regression. Look at the `.diff.png`; a layout-stabilisation diff and a bug-introduction diff look very different.

## Reading Results

The signal is the `grep "Image comparison failed"` output from [step 2](#2-run-the-feature-branch-against-the-baked-baseline). Interpret each failure type:

| Failure | Meaning |
|---|---|
| `Image comparison failed, reference image: X, difference in percentages: …` | Real diff. Compare `target/images/.../X.act.png` vs `.ref.png` vs `.diff.png`. |
| `Image comparison enabled but no reference image found: X` | No `.ref.png` was baked for the current platform/theme/resolution. **Re-run step 1.** Never treat this as a regression. |
| `Async callback was not invoked within timeout` | Spec-level timeout. |

To list what's currently baked locally for a spec:

```bash
find target/images/<SpecName>/ -name "*.ref.png" 2>/dev/null | sed 's|.*/images/||' | awk -F/ '{print $2"/"$3"/"$4"/"$5"/"$6"/"$7}' | sort -u
```

## Cleanup

`target/images/` is gitignored.

**Do NOT delete the baked images.** Never `rm -rf target/images/` (or any subtree of it) unless the user explicitly asks for it in the current turn. The `.ref.png` / `.act.png` / `.diff.png` trios are the whole point of the run — the user inspects them after the compare, and re-baking is slow. Leave them in place when done. Baking a *fresh* baseline for a spec (step 1) legitimately clears only that spec's folder — but that is part of running, not cleanup, and still requires that the run proceeds to regenerate them.

## Updating Checked-In CI References

This skill is for catching local regressions. If you need to update the references the CI uses, that is a separate, deliberate action — coordinate with whoever owns the CI baselines. Do not push `target/images/` to source control.

## Common Mistakes

- **Running from `src/<lib>/test/.../visual/`** — resolver finds no specs (`Error: No specs found`). Run from repo root.
- **Guessing the spec filter name** — `--specFilter` is the spec file basename without `.spec.js`, and naming differs per library. List the library's specs first.
- **Comparing the branch against anything other than a freshly-baked local master baseline** — checked-in refs, prior runs, or CI artefacts encode a different environment. Always re-bake on master, on this machine, in the same session.
- **Treating "no reference image found" as a regression** — it's a missing baseline. Re-run step 1.
- **Skipping step 1** — leads to reporting environmental drift as "regressions caused by your change".
- **Testing the default `belize` theme** — it's deprecated/frozen. Pass `--browsers=chrome:::::horizon` unless the task targets another theme; see [themes.md](themes.md).
- **Miscounting the `--browsers` colons** — the theme is the 6th field (`chrome:::::horizon`, five colons). Six colons pushes it into the direction slot and errors with `UI5 direction: horizon is not supported`.
- **Baking and comparing under different themes** — the `--browsers` value must be identical for step 1 and step 2, or every image reads as changed/missing.
- **Running the pipelines in `cmd`/PowerShell on Windows** — the `sed`/`awk`/`find` one-liners are POSIX. Use Git Bash or WSL. `/tmp/` log paths resolve there too.
