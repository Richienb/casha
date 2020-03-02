"use strict"

const mem = require("mem")
const ky = mem(require("ky-universal"), { maxAge: 600000 })
const { convert } = require("cashify")
const day = require("dayjs")
const { default: ow } = require("ow")
const roundTo = require("round-to")
const mapObject = require("map-obj")

const isValidDate = (date) => day(date) !== "Invalid Date"

module.exports = async (amount, from, to, { date = "latest", precision = 2, provider = "exchangeratesapi", apiKey } = {}) => {
	// `amount` must be a number
	ow(amount, ow.number)

	// `from` must be a string of length 3
	ow(from, ow.string.length(3))

	// `to` must be a string of length 3
	ow(to, ow.string.length(3))

	// `date` must be "latest" or compatible with dayjs
	ow(date, ow.any(
		ow.string.is((value) => value === "latest" || isValidDate(value))),
	ow.number.is(isValidDate),
	ow.date.is(isValidDate),
	ow.object.is(isValidDate), // Class
	)

	// `precision` must be a number
	ow(precision, ow.number)

	// `provider` must be a string
	ow(provider, ow.string.matches(/exchangeratesapi|fixer|currencylayer|openexchangerates/))

	// Convert `from` and `to` to uppercase
	from = from.toUpperCase()
	to = to.toUpperCase()

	// If `date` is not latest, parse it
	if (date !== "latest") date = day(date).format("YYYY-MM-DD")

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
		ow(apiKey, ow.string)
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
		ow(apiKey, ow.string)
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
		ow(apiKey, ow.string)
		const { rates, base } = await ky(date === "latest" ? "https://openexchangerates.org/api/latest.json" : `https://openexchangerates.org/api/historical/${date}.json`, {
			searchParams: {
				app_id: apiKey,
				symbols: [from, to],
				prettyprint: false,
			},
		}).json()
		options.rates = rates
		options.base = base
	}

	// Convert currency
	const converted = convert(amount, options)

	// Round according to precision
	return roundTo(converted, precision)
}
