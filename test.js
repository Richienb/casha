const casha = require(".")
const test = require("ava")
const is = require("@sindresorhus/is")

test("main", async (t) => {
	t.true(is.number(await casha(10, "nzd", "usd")))
	t.true(is.number(await casha(10, "nzd", "usd", { date: "2019-11-12" })))
})
