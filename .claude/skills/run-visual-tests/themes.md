# Selecting the theme

**Default to Horizon** (`--browsers=chrome:::::horizon`). uiveri5's built-in default is `belize`, which is deprecated/frozen — testing it rarely reflects current work. Use another theme only when the task targets it.

Override the theme with `--browsers`, whose value is a `:`-separated runtime string:

```
browserName:browserVersion:platformName:platformVersion:platformResolution:ui5.theme:ui5.direction:ui5.mode
```

The **theme is the 6th field** — so five leading colons, then the theme:

```bash
uiveri5 --libFilter=<lib> --specFilter=<SpecName> --browsers=chrome:::::horizon         # Horizon (default choice)
uiveri5 --libFilter=<lib> --specFilter=<SpecName> --browsers=chrome:::::fiori_3          # Fiori 3
uiveri5 --libFilter=<lib> --specFilter=<SpecName> --browsers=chrome:::::fiori_3_dark     # Fiori 3 dark
uiveri5 --libFilter=<lib> --specFilter=<SpecName> --browsers=chrome::::::rtl             # 7th field = direction
```

Supported themes: `bluecrystal`, `belize`, `fiori_3`, `fiori_3_dark`, `horizon` (from uiveri5's `runtimeResolver.js`). The value maps to the page's `sap-ui-theme=sap_<theme>` query param, and the theme name also appears in the reference path (`.../chrome/<theme>/ltr/cozy/...`) — a quick way to confirm the override took.

**Miscount the colons and uiveri5 silently loads the wrong field.** `chrome::::::horizon` (six colons) puts `horizon` in the *direction* slot and dies with `UI5 direction: horizon is not supported`. Verify the baked ref path contains `/horizon/`, not `/belize/`, before trusting the run.

**The baseline and the compare run must use the same `--browsers` value.** A baseline baked under Horizon and compared under belize (or vice versa) produces meaningless "no reference image found" / total-diff noise.
