declare module "ui5-tooling-modules/cli/createControls.js" {

    /**
     * Processes a custom elements manifest via the WebComponentRegistry and writes
     * the UI5 package glue plus one control wrapper per described class into the
     * output folder.
     */
    export function generateControls(options: {
        /**
         * Path or file:// URL to the custom elements manifest
         */
        input: string,
        /**
         * Output folder for the generated UI5 control files
         */
        output: string,
        /**
         * npm package namespace (default: name from nearest package.json)
         */
        namespace?: string,
        /**
         * UI5 namespace used for the generated artifacts, dot or slash notation (default: the npm namespace)
         */
        ui5Namespace?: string,
        /**
         * Leading module path segment to strip from the generated names, e.g. "dist"
         */
        stripModulePrefix?: string,
        /**
         * package version (default: version from nearest package.json)
         */
        version?: string,
        /**
         * UI5 framework version for version-dependent generation (default: 2.0.0)
         */
        frameworkVersion?: string,
        /**
         * when true, generate a UI5 library.js (using Library.init) instead of a standalone package module
         */
        libraryMode?: boolean,
        /**
         * description text for the library.js namespace JSDoc block (libraryMode only; may contain newlines)
         */
        libraryDescription?: string,
        /**
         * "since" version for the library.js namespace JSDoc block (libraryMode only)
         */
        since?: string,
        /**
         * "author" for the library.js namespace JSDoc block (libraryMode only, default "SAP SE")
         */
        author?: string,
        /**
         * Additional prettier options merged on top of the defaults for the generated sources,
         * e.g. { useTabs: true, tabWidth: 4 } to follow the UI5 tab indentation convention
         */
        prettierOptions?: Record<string, unknown>
    }): void;
}