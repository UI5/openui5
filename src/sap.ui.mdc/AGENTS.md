# AGENTS.md - AI Coding Assistant Guide for Metadata-Driven Controls (MDC)

This file provides guidance for AI coding assistants (Claude, Copilot, Cursor, etc.) when working with this repository and Metadata-Driven Controls (sap.ui.mdc) library.

## Core Principle: Protocol Independence

MDC controls are **completely protocol-agnostic**. They work with any SAPUI5 model (OData V4, OData V2, JSON, custom REST) through delegate implementations.

- Never import or reference OData modules (`sap/ui/model/odata/*`) in core control files
- All protocol-specific logic lives exclusively in delegates (e.g., `odata/v4/`)
- Controls are orchestrators — data-access is the delegate's responsibility

## Architecture

### Delegate Pattern

Every MDC control delegates data-access and model-specific logic to a replaceable delegate module, configured via the `delegate` property:

```javascript
delegate: { name: "sap/ui/mdc/odata/v4/TableDelegate", payload: { /* app config */ } }
```

**Delegate hierarchy:**
```
BaseDelegate
  └── AggregationBaseDelegate (Table, Chart, FilterBar)
        ├── TableDelegate (protocol-agnostic base)
        │     └── odata/v4/TableDelegate
        ├── ChartDelegate
        │     └── odata/v4/ChartDelegate, odata/v4/vizChart/ChartDelegate
        └── FilterBarDelegate
  └── ValueHelpDelegate
        └── odata/v4/ValueHelpDelegate
  └── FieldBaseDelegate
  └── LinkDelegate
```

**Key delegate methods:**
- `fetchProperties()` — Retrieve PropertyInfo metadata
- `addItem()` / `removeItem()` — Create/destroy control items (columns, filter fields)
- `updateBindingInfo()` — Modify binding before data request

Delegates are loaded asynchronously via `DelegateMixin`. Use `awaitControlDelegate()` before accessing.

### PropertyInfo

Standardized metadata objects that describe available data properties for a control.

- **Required:** `key`, `label`, `dataType`
- **Optional:** `groupable`, `aggregatable`, `sortable`, `filterable`, `maxConditions`, `path`
- Stable for the control's lifecycle — do NOT mutate after `fetchProperties()` resolves
- Protocol-specific extensions (e.g., `extension.technicallyGroupable`) belong in delegate-specific typedefs only

### Personalization (p13n)

- User customization (columns, sorting, filtering, grouping) via subcontrollers in `p13n/subcontroller/`
- Changes persisted as SAPUI5 flexibility changes (`flexibility/` directory)
- `StateUtil` provides API for reading/applying personalization state

### Mixins

Shared behaviors applied to MDC controls via `mixin/`:
- `DelegateMixin` — Async delegate loading and initialization
- `PropertyHelperMixin` — PropertyHelper lifecycle management
- `AdaptationMixin` — p13n engine access
- `FilterIntegrationMixin` — Filter bar integration for controls

## Controls

| Control | Purpose | Key files |
|---------|---------|-----------|
| **Table** | Tabular data with personalization (sort, filter, group, columns). Types: Grid, Tree, Responsive | `Table.js`, `table/` |
| **FilterBar** | Filter UI for queries; creates FilterFields from metadata | `FilterBar.js`, `filterbar/` |
| **Field** | Single value binding; auto-renders inner controls (Input, DatePicker, etc.) based on data type | `Field.js`, `field/` |
| **FilterField** | Specialized field for filter conditions within FilterBar | `FilterField.js` |
| **MultiValueField** | Multiple value input with conditions | `MultiValueField.js` |
| **Chart** | Data visualization wrapper; framework-agnostic (can wrap VizChart or alternatives) | `Chart.js`, `chart/` |
| **ValueHelp** | Value help dialogs/popovers for field value selection | `ValueHelp.js`, `valuehelp/` |
| **Link** | Navigation with single or multiple targets (direct or via Popover) | `Link.js`, `link/` |
| **ActionToolbar** | Toolbar with action alignment and positioning | `ActionToolbar.js`, `actiontoolbar/` |
| **Geomap** | Geospatial visualization | `Geomap.js`, `geomap/` |

## Source Structure

```
src/sap.ui.mdc/src/sap/ui/mdc/
  ├── Table.js, Chart.js, ...        # Top-level controls
  ├── TableDelegate.js, ...          # Protocol-agnostic base delegates
  ├── BaseDelegate.js                # Root delegate class
  ├── AggregationBaseDelegate.js     # Base for aggregation-based controls
  ├── table/                         # Table internals (types, columns, PropertyHelper)
  ├── field/                         # Field internals (FieldBase, content renderers)
  ├── filterbar/                     # FilterBar internals (layouts, PropertyHelper)
  ├── chart/                         # Chart internals (items, breadcrumbs)
  ├── valuehelp/                     # ValueHelp containers (Dialog, Popover) and content types
  ├── link/                          # Link panel, items, semantic objects
  ├── condition/                     # Condition model, operators, filter converter
  ├── p13n/                          # Personalization (StateUtil, subcontrollers)
  ├── flexibility/                   # SAPUI5 flexibility change handlers
  ├── mixin/                         # Reusable mixins
  ├── util/                          # Utilities (PropertyHelper, FilterUtil, DateUtil)
  ├── odata/                         # OData-specific code (ONLY place for protocol logic)
  │     ├── TypeMap.js               # OData-generic type mapping
  │     └── v4/                      # OData V4 delegates and utilities
  ├── enums/                         # Enum types for control configuration
  └── designtime/                    # Design-time metadata

test/sap/ui/mdc/
  ├── qunit/                         # QUnit tests (mirrors source structure)
  ├── delegates/                     # Test delegate implementations
  └── integration/                   # Integration tests
```

## Where to Put New Code

| What | Where |
|------|-------|
| Protocol-specific data access | `odata/v4/` as delegate extension |
| New protocol-agnostic delegate hook | Base delegate at root (e.g., `TableDelegate.js`) |
| New personalization feature | `p13n/subcontroller/` + `flexibility/` |
| New table type or column feature | `table/` |
| New ValueHelp content type | `valuehelp/content/` |
| New condition operator | `condition/` |
| Utility function | `util/` |
| New mixin | `mixin/` |
| Tests | `test/sap/ui/mdc/qunit/{module}/` mirroring source |

## Do NOT

- Import OData modules (`sap/ui/model/odata/v4/*`) in core control files
- Add protocol-specific branching (`if OData then...`) in controls or base delegates
- Bypass the delegate pattern for data access — always go through delegate hooks
- Mutate PropertyInfo objects after `fetchProperties()` has resolved
- Create framework-specific subclasses of controls — use delegates for specialization
- Put visualization library code (VizFrame, sap.chart) in core Chart control — use the delegate

## Testing

- QUnit tests mirror the source structure under `test/sap/ui/mdc/qunit/`
- Test delegates for QUnit live in `test/sap/ui/mdc/delegates/`
- Use `/run-test <module>` to run individual test files
- When adding a delegate method, test at both the base delegate level and protocol-specific level

## Conventions

- Module format: AMD (`sap.ui.define`) with arrow functions
- Class creation: `ControlBase.extend("sap.ui.mdc.ControlName", { metadata: {...} })`
- Delegates are plain objects: `Object.assign({}, ParentDelegate, { /* overrides */ })`
- Async patterns: delegates return Promises; use `awaitControlDelegate()` before access
- JSDoc visibility: `@public`, `@private`, `@ui5-restricted`
- `@since` tag: version from root `package.json` without `-SNAPSHOT`
