import dayjs from "dayjs"

/**
 * Convert between currencies.
 * @param amount The amount to convert.
 * @param from The currency to convert from.
 * @param to The currency to convert to.
 * @example
 * ```
 * const casha = require("casha");
 *
 * (async () => {
 *     await casha(10, "nzd", "usd")
 *     //=> 6.622414507999999
 * })()
 * ```
*/
declare function casha(amount: number, from: string, to: string, options?: {
    /**
     * The date to get the currency conversion information for.
     * @default latest
    */
    date?: dayjs.ConfigType

    /**
     * The precision to round the number to.
     * @default 2
    */
    precision?: number

    /**
     * The conversion rate provider to use.
     * @default "exchangeratesapi"
    */
    provider?: "exchangeratesapi" | "fixer" | "currencylayer" | "openexchangerates"

    /**
     * The key/token/id to pass to the API (if any).
    */
    apiKey?: string
}): Promise<number>;

export = casha;
