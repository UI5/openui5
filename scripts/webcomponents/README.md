# Web Component build verification

The scripts in this directory are shared by `sap.f` and `sap.ui.geomap`. Each library's
`scripts/webcomponents.config.js` supplies its source directory, bundled package names,
and generated metadata wrappers. Both recording and verification use the same config.

## What is verified

The existing version checks remain in place:

- The direct web-component versions in `package.json` must match the `.library`
  third-party declarations.
- Generated `_ui5metadata.version` values must match their configured reference packages.
  The base wrapper in `sap.f` continues to use `@ui5/webcomponents` as its reference.

These checks validate metadata that a dependency fingerprint alone cannot check.

In addition, `fingerprint.js` uses `@npmcli/arborist.loadVirtual()` to read the nearest
ancestor `package-lock.json` (the repository root lockfile for these workspaces). It starts
at the library's configured web-component packages and `ui5-tooling-modules`, then follows
their production, optional, and peer dependencies. Dependency packages' development
dependencies and unrelated root dependencies are excluded.

The SHA-256 fingerprint covers package names, versions, integrity values, resolved sources,
and resolved dependency relationships. Roots and edges are sorted deterministically.
Traversal IDs preserve graph relationships without hashing physical hoisting paths, so
moving an otherwise identical dependency subtree does not invalidate the build.
Cycles, workspace links, nested versions, and missing optional dependencies are handled.
Missing required dependencies, invalid resolutions, and relevant manifest/lockfile drift
fail verification instead of producing a partial fingerprint.

Verification does not load the installed component dependency tree or contact the registry.
Arborist itself, like the other build tools, must be installed to run the scripts.

## Recording and regeneration

`record.js` writes `gen/ui5/.build-info.json` after successful `generate-webcomponents`.
This versioned JSON contains the scoped fingerprint and the resolved root versions for
inspection. It replaces the narrower `.tooling-version` stamp.

Use locked dependencies before regenerating:

```sh
npm ci
npm run generate-webcomponents --workspace src/sap.f
npm run generate-webcomponents --workspace src/sap.ui.geomap
```

The recorder describes the current lockfile's graph. It is not evidence that arbitrary
pre-existing `node_modules` contents matched the lockfile: generation must use an
`npm ci` installation. Do not run the recorder on old bundles simply to refresh their
fingerprint. Commit each new build-info file together with its regenerated bundles.

Verification recomputes the closure from the current lockfile, rather than checking only
previously recorded paths. A new nested dependency resolution is therefore detected.

```sh
npm run verify-webcomponents --workspace src/sap.f
npm run verify-webcomponents --workspace src/sap.ui.geomap
```

Both commands exit with status 1 for mismatches or missing/invalid build information.
Existing checkouts without `.build-info.json` must be regenerated once to establish an
honest baseline; there is no automatic fallback to the old tooling-only stamp.

| Change | Regeneration |
| --- | --- |
| Unrelated dependency update | Neither library |
| Transitive dependency used by only one library | That library |
| Shared component dependency update | All affected libraries |
| Tooling or a dependency of tooling shared by both libraries | Both libraries |
| Lockfile formatting or pure rehoisting of an unchanged graph | Neither library |

This fingerprint checks dependency drift; it is not a checksum of generated files or a
complete reproducibility guarantee for source/configuration changes.

## ESLint configuration

The local [`.eslintrc.json`](.eslintrc.json) scopes Node.js/CommonJS settings, global strict
mode, and command-line console output to JavaScript files in this directory. It inherits
the shared repository rules; these directory-specific overrides do not belong in the
top-level configuration. See the [directory-specific configuration convention](../../docs/eslint.md#directory-specific-configuration).

## Tests

```sh
node --test scripts/webcomponents/test/*.test.js
```

Tests use temporary lockfile/workspace fixtures and cover scoping, nested resolutions,
optional/peer dependencies, cycles, deterministic hashing, recording, exit codes, and the
retained metadata comparisons. They do not regenerate or stamp the real repository's bundles.
