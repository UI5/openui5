# AGENTS.md - AI Coding Assistant Guide

This file provides guidance for AI coding assistants (Claude, Copilot, Cursor, etc.) when working with this repository.

## Project Overview

OpenUI5 is an enterprise-grade JavaScript UI framework implementing SAP Fiori design. It is a monorepo containing ~30 library packages under `src/`, each following the `src/{library}/src/{namespace}/` structure for sources and `src/{library}/test/{namespace}/qunit/` for tests.

**Requirements:** Node.js ^20.17.0 || >=22.9.0, npm >=8

## Running QUnit Tests for a Single Module

**Always use `/run-test` skill for single module testing. Do NOT use karma for individual modules.**

```bash
/run-test <module-name>
```

**Examples:**
```bash
/run-test BlockLayerUtils
/run-test sap.m.Button
/run-test sap/ui/core/routing/Router
```

## Determining the @since Tag for New API

When adding new properties, aggregations, associations, methods, or API, read the version field from the root package.json (e.g. "1.148.0-SNAPSHOT") and use the version without the -SNAPSHOT suffix as the @since tag (e.g. @since 1.148).

## Commit Message Format

See [commit message guidelines](docs/guidelines.md#git-guidelines).

## Code Review (Gerrit)

This repository uses **Gerrit** for code review, not GitHub pull requests. Key rules for agents:

- **Do NOT push directly to `master`** or any release branch.
- Every commit must include a `Change-Id:` trailer in the commit message. Gerrit uses this to track changes across amended pushes. The Git hook at `.git/hooks/commit-msg` generates it automatically — do not skip hooks.
- Push changes for review with: `git push origin HEAD:refs/for/master`
- Do not force-push or rewrite commits that are already under review without explicit user instruction.

## Key References

**Start here** (read these first when working on code changes):
- [Development Guidelines](docs/guidelines.md) — code formatting, naming, class creation, git conventions
- [Control Library Development](docs/controllibraries.md) — library structure, renderers, themes, tests
- [Class Example](docs/guidelines/classexample.md) — full UI5 class with proper JSDoc and AMD module

**Additional references:**
- [Development Setup & Workflow](docs/developing.md) — dev server, SDK build, testing with UI5 CLI
- [ESLint Configuration](docs/eslint.md) — lint rules and enforcement
- [JS Namespace Conventions](docs/guidelines/jsnamespaces.md) — module naming rules
- [JSDoc Best Practices](docs/guidelines/jsdoc.md) — descriptions, tags, type syntax
- [JSDoc Pitfalls](docs/guidelines/jsdocpitfalls.md) — common JSDoc mistakes to avoid
- [Translation Files](docs/guidelines/translationfiles.md) — annotation standards for .properties files
- [Self-Closing Tags Fix](docs/self_closing_tags_fix_instructions.md) — jQuery-incompatible HTML tag migration