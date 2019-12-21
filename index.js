"use strict"

const ky = require("p-memoize")(require("ky-universal"), { maxAge: 600000 })
const { convert } = require("cashify")
const day = require("dayjs")
const is = require("@sindresorhus/is")
const roundTo = require("round-to")
const mapObject = require("map-obj")

module.exports = async (amount, from, to, { date = "latest", precision = 2, provider = "exchangeratesapi", apiKey } = {}) => {
    // `amount` must be a number
    if (!(is.number(amount))) throw new TypeError("amount is not a number!")

    // `from` must be a string of length 3
    if (!(is.string(from))) throw new TypeError("from is not a string!")
    if (!(from.length === 3)) throw new ReferenceError("from must be 3 characters long!")

    // `to` must be a string of length 3
    if (!(is.string(to))) throw new TypeError("to is not a string!")
    if (!(to.length === 3)) throw new ReferenceError("to must be 3 characters long!")

    // `date` must be a string, number, date or an instance of dayjs
    if (!(is.string(date) || is.number(date) || is.date(date) || date instanceof day)) throw new TypeError("date must be unspecified, a string, number, date or an instance of dayjs!")

    // `precision` must be a number
    if (!(is.number(precision))) throw new TypeError("precision must be a number!")

    // `provider` must be a string
    if (!(is.string(provider))) throw new TypeError("provider must be unspecified or a string!")

    // Convert `from` and `to` to uppercase
    from = from.toUpperCase()
    to = to.toUpperCase()

    // If `date` is not latest, parse it
    if (date !== "latest") date = day(date).format("YYYY-MM-DD")

    // `date` must be valid
    if (date === "Invalid Date") throw new ReferenceError("Invalid date provided!")

    // Conversion `options` object
    const options = {
        from,
        to,
        base: from,
        rates: {},
    }

    if (provider === "exchangeratesapi") {
        // Using api.exchangeratesapi.io
        const { rates } = await ky(`https://api.exchangeratesapi.io/${date}`, {
            searchParams: {
                base: from,
                symbols: to,
            },
        }).json()
        options.rates = rates
    } else if (provider === "fixer") {
        // Using data.fixer.io
        const { rates, base } = await ky(`http://data.fixer.io/api/${date}`, {
            searchParams: {
                access_key: apiKey,
                symbols: [from, to],
            },
        }).json()
        options.rates = rates
        options.base = base
    } else if (provider === "currencylayer") {
        // Using apilayer.net
        const { quotes: rates, source: base } = date === "latest" ? await ky("http://apilayer.net/api/live", {
            searchParams: {
                access_key: apiKey,
                currencies: [from, to],
            },
        }).json() : await ky("http://apilayer.net/api/historic", {
            searchParams: {
                access_key: apiKey,
                currencies: [from, to],
                date,
            },
        }).json()
        options.rates = mapObject(rates, (key, value) => [key.slice(3), value])
        options.base = base
    } else if (provider === "openexchangerates") {
        // Using openexchangerates.org
        const { rates, base } = await ky(date === "latest" ? "https://openexchangerates.org/api/latest.json" : `https://openexchangerates.org/api/historical/${date}.json`, {
            searchParams: {
                app_id: apiKey,
                symbols: [from, to],
                prettyprint: false,
            },
        }).json()
        options.rates = rates
        options.base = base
    } else {
        // `provider` must be valid
        throw new ReferenceError("Invalid provider provided!")
    }

    // Convert currency
    const converted = convert(amount, options)

    // Round according to precision
    return precision === Infinity ? converted : roundTo(converted, precision)
}
