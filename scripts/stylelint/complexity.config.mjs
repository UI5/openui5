import config from "../../.stylelintrc.mjs";

// Local refactoring advice only; central npm/Maven builds use the default config.
/** @type {import("stylelint").Config} */
export default {
  ...config,
  rules: {
    ...config.rules,
    "max-nesting-depth": [4,
      { message: "Please check for overly specific selector." },
      { disableFix: true }
    ],
    "selector-max-compound-selectors": [4,
      { message: "Please check for overly specific selector." },
      { disableFix: true }
    ],
  },
};
