export default getInterpolator;
export type JamilihPluginWithArgs = {
    args: any[];
    uuid: string;
    dynamic: () => {
        [key: string]: string;
    };
    plugin: import("../src/jml.js").JamilihPlugin;
};
/**
 * Use with `String.raw({raw: elementsAsString.split(uniqueID)}, ...args)`.
 * @returns {{
 *   args: string[],
 *   uuid: string,
 *   dynamic: (val: string) => {$_interpolator: string},
 *   plugin: import('../src/jml.js').JamilihPlugin
 * }}
 */
declare function getInterpolator(): {
    args: string[];
    uuid: string;
    dynamic: (val: string) => {
        $_interpolator: string;
    };
    plugin: import("../src/jml.js").JamilihPlugin;
};
//# sourceMappingURL=getInterpolator.d.ts.map