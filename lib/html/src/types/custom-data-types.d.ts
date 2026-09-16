declare module "@vscode/web-custom-data/data/browsers.html-data.json" {
    // Type definitions for HTML data that are specific to VSCode web custom data
    export type Attribute = {
        name: string,
        description: { kind: string; value: string },
        valueSet?: string
    }

    export type Tag = {
        name: string,
        description: { kind: string; value: string },
        attributes?: Attribute[],
        // VSCode custom data marks void HTML elements (e.g. <br>, <img>) with "void": true.
        void?: boolean
    }

    export type ValueSetValue = {
        name: string,
        description?: string
    }

    export type ValueSet = {
        name: string,
        description?: string,
        values: Array<ValueSetValue>
    }

    export type HtmlData = {
        globalAttributes?: Attribute[],
        tags?: Tag[]
        valueSets?: ValueSet[]
    }

    const _default: HtmlData;
    export default _default;
}