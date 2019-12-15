"use strict"

const ky = require("p-memoize")(require("ky-universal"), { maxAge: 600000 }).create({
    prefixUrl: "https://api.exchangeratesapi.io/",
})
const { convert } = require("cashify")
const day = require("dayjs")
const is = require("@sindresorhus/is")
const roundTo = require("round-to")

module.exports = async (amount, from, to, { date = "latest", precision = 2 } = {}) => {
    if (!is.number(amount)) throw new TypeError("amount is not a number!")

    if (!is.string(from)) throw new TypeError("from is not a string!")
    if (from.length !== 3) throw new ReferenceError("from must be 3 characters long!")

    if (!is.string(to)) throw new TypeError("to is not a string!")
    if (to.length !== 3) throw new ReferenceError("to must be 3 characters long!")

    if (!is.string(date) && !is.number(date) && !is.date(date) && !(date instanceof day)) throw new TypeError("date must be undefined, string, number, date or a instance of dayjs!")

    if (!is.number(precision)) throw new TypeError("precision must be a number!")

    from = from.toUpperCase()
    to = to.toUpperCase()
    if (date !== "latest") date = day(date).format("YYYY-MM-DD")

    if (date === "Invalid Date") throw new ReferenceError("Invalid date provided!")

    const { rates } = await ky(date, {
        searchParams: {
            base: from,
            symbols: to,
        },
    }).json()

    const converted = convert(amount, {
        from,
        to,
        base: from,
        rates,
    })

    return precision === Infinity ? converted : roundTo(converted, precision)
}
