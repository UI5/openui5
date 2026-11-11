---
name: enrich-sample-manifests
description: 'Enrich Demo Kit sample manifest.json files with AI-discoverable metadata (title, description, tags, complexity) for a given control. Use when asked to enrich/enhance sample manifests, make Demo Kit samples discoverable by AI tools, add title/description/tags/complexity to a control''s sample manifest.json, or run the sample-metadata rollout for a control. Takes a control name argument, e.g. sap.m.Select.'
argument-hint: 'A fully-qualified control name. Example: /enrich-sample-manifests sap.m.Select'
user-invocable: true
---

# Enrich Sample Manifests - add AI-discoverable metadata

Enrich the Demo Kit sample `manifest.json` files for ONE control so AI tools can discover and select samples by intent, without executing the app. Do NOT change sample code, views, or controllers - only `manifest.json`.

## Input

A fully-qualified control name as the argument (e.g. `sap.m.Select`). Derive `<library>` from it (`sap.m`) and the namespace path (`sap/m`). If no argument is given, ask which control to enrich - do not guess.

## Authoritative source: docuindex.json

Sample manifests live under `src/<library>/test/<namespace-as-path>/demokit/sample/<Folder>/manifest.json` (e.g. `src/sap.m/test/sap/m/demokit/sample/Select/manifest.json`).

Each library has `src/<library>/test/<namespace-as-path>/demokit/docuindex.json`. Its `explored.entities` array is the **authoritative** control -> sample mapping, and `explored.samples` carries a hand-written `name` and `description` per sample. A Demo Kit sample cannot exist without being listed here.

**Find the sample set from docuindex, never from folder names** - folder names mislead (e.g. `ActionSelect` and `SelectList` are different controls from `Select` despite the name).

## Steps

1. Open the library's `docuindex.json`. Find the entity in `explored.entities` whose `id` equals the control argument. Read its `samples` list and resolve each id against `explored.samples` to get `name` and `description`. That resolved set is exactly the samples to enrich.

   **Cross-library references:** If a sample ID begins with a different library prefix than the control being processed (e.g., an `sap.f.sample.*` entry when processing `sap.m.*`), skip it - that sample's manifest lives in the other library and has no file under the current library's path. Confirm by checking whether `src/<lib>/test/<ns>/demokit/sample/<folder>/manifest.json` exists.

2. For EACH sample, open its `manifest.json` and read the accompanying `*.view.xml` and `*.controller.js` to learn what it actually demonstrates. Reading the source is what makes near-twin samples distinguishable - do not skip it. For a simple single-view sample, read inline. For a multi-view routing app (several views/controllers, a `webapp/` folder), consider delegating the fact-gathering to a sub-agent so the source dumps stay out of context.

3. Add these fields to the `sap.app` block, immediately after `applicationVersion`. Add only the fields that are missing: if a manifest already carries a meaningful `title` or `description` (some do, notably in `sap.f`, sometimes alongside `type` / `_version`), keep the existing value and fill only the gaps. Never overwrite meaningful existing values, and do not restructure the manifest or add `type`/`_version` yourself.
   - `"title"`: the sample's docuindex `name`, verbatim (it is the label the Demo Kit displays).
   - `"description"`: seed from the docuindex `description`, then rewrite it specific and accurate to the view/controller. Be specific - "Select bound to a model with value states" beats "Select example". Add the concrete properties/events/patterns docuindex omits.
   - `"tags"`: an object `{ "keywords": [...] }` - the App-Descriptor-standard shape, NOT a flat array. Keywords = the control name plus scenario keywords (`data-binding`, `value-state`, `icons`, `grouping`, ...). Conventions: all keywords kebab-case; prefer real UI5 property/concept names so plain-language queries match; include the control's fully-qualified name. If the sample's actual ROOT control differs from the entity it is listed under (e.g. a `sap.f.ShellBar`-rooted sample filed under the `sap.f.FlexibleColumnLayout` entity), lead the keywords with the real root control, then also include the entity control so the sample is discoverable from both. (`title` still stays docuindex-verbatim.)
   - `"complexity"`: `"basic"` | `"intermediate"` | `"advanced"`. Use this rubric so the judgment is reproducible across runners:
       - `"basic"` - one control, one concept, a single view.
       - `"intermediate"` - 2-4 concepts, or multiple views / events / data binding combined.
       - `"advanced"` - routing, multi-column or SemanticHelper flows, or 5+ combined concepts.

     NOTE: `complexity` is not a standard App-Descriptor field; it is kept in `sap.app` deliberately for discoverability.

   **Source-grounding rule (the accuracy gate):** Any specific identifier you put in a `description` or a keyword MUST be copied verbatim from the source you read in Step 2 - never inferred from the control's general behavior, its API docs, or the docuindex prose. This covers:
   - method/API names (e.g. `showDraftSaving`, not a plausible-sounding `setSavingDraftState`),
   - aggregation / slot names (e.g. `draftIndicator`, `snappedHeading` - not `titleDraftIndicator`, `snappedTitleOnMobile`),
   - event names (only claim an event the view/controller actually wires up),
   - control / class names (e.g. `DisplayListItem` vs `StandardListItem`),
   - enumerated property values (copy the exact values set in the view),
   - counts ("ten OverflowToolbars" - count the instances; do not guess),
   - which control owns a property/feature (e.g. `isChildPage` is on `ObjectPageLayout`, not `ObjectPageHeader`),
   - features that actually belong to a *sibling* sample (do not attribute `moveForward`/`moveBackwards` to a sample that lacks them).

   If you cannot point to the thing in the view/controller, do not state it - describe only what the source shows. A vague-but-true description beats a specific-but-wrong one. This is the single most common failure mode and what reviewers catch first.

   Resulting shape:
   ```json
   "sap.app": {
       "id": "...",
       "applicationVersion": { "version": "1.0.0" },
       "title": "...",
       "description": "...",
       "tags": { "keywords": ["<control>", "..."] },
       "complexity": "basic"
   }
   ```

4. Two samples of the same control MUST have distinct title/description/tags so a tool can tell them apart. After enriching the set, compare them: if two end up with near-identical descriptions or tag sets, sharpen each to name the specific property/scenario that differs.

5. Preserve existing structure and formatting (tabs, key order); only add the four fields. Keep the JSON valid and ASCII-only (no non-ASCII characters - use `-`, not an em dash; plain quotes).

6. Validate each edited file:
   - parses as JSON,
   - contains no non-ASCII bytes,
   - `tags` is an object containing a `keywords` array.

   Do NOT rely on `npm run lint` for this: lint is ESLint (JS) + stylelint (LESS); neither validates `manifest.json`. The JSON-parse + ASCII check is the real gate, and running `npm run lint` adds no manifest coverage (so it is optional here).

   Example validation (run with `python3 -I`):
   ```python
   import json, glob
   for p in glob.glob("src/<library>/test/<ns>/demokit/sample/*/manifest.json"):
       raw = open(p, "rb").read()
       d = json.loads(raw)                        # parses
       assert not any(b > 127 for b in raw)       # ASCII-only
       app = d["sap.app"]
       assert isinstance(app["tags"]["keywords"], list)
   ```

## Deliver

- The edited `manifest.json` files (staged in the working tree; do not commit unless asked).
- A short table: sample folder -> title -> complexity -> tags, so a reviewer can sanity-check coverage and distinguishability. In a notes column, list any specific identifier a description or keyword asserts (API/slot/event/control/value/count) so the reviewer can spot-verify each against source - this is where the Source-grounding rule is checked.

## Acceptance

Given ONLY the enriched manifests (no app execution), an AI tool can pick the right sample for a plain-language request like "show me a `<control>` with value states".

## Scope notes

- This skill enriches ONE control per run (the argument). To cover a library, run it per control; the unit of review stays one control's small, coherent diff.
- **Team sweep (many controls):** Before processing, do a pre-flight scan to find which manifests already have all four fields and skip them entirely. Then group controls by library and process each group in a parallel fork - different libraries write to different directories so there is no conflict. For shared samples (same manifest ID listed under two controls), the second control to reach it will find the fields already present and skip.
- Speed vs accuracy: reading the source is the slow part and is what makes near-twin samples distinguishable. For a few controls, read thoroughly (delegate multi-view apps to a sub-agent to keep context clean). For a whole-library sweep, docuindex `description` may seed the general wording, but it may NOT supply named identifiers or counts - every specific the Source-grounding rule lists must still be verified against the view/controller, even in a sweep. The JSON + ASCII check is the only step you must run, but an ungrounded description that names a wrong API/slot/event/control/value is the failure reviewers reject, so do not trade that away for speed.
- Enforcement (a lint rule making these fields required on new samples) is a separate follow-up - this repo has no JSON/manifest linter today, so that needs net-new tooling.
